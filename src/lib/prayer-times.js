// Selvstændig, offline bønnetids-beregning (Muslim World League-metoden: Fajr=18°,
// Isha=17°), baseret på de samme solposition-formler som praytimes.org og verificeret
// minut-for-minut mod Aladhan API (api.aladhan.com) for både sommer og vinter i Danmark.
//
// Bruges IKKE en ekstern API ved kørsel (ingen netværksafhængighed/nedetid), og bruges
// IKKE MyMasjid/my-masjid.com — deres data for danske moskeer viste sig at være
// upålidelig (0 ud af 132 undersøgte moskeer havde egne verificerede tider, og
// nabomoskeer i samme postnummer viste solnedgangstider der spredte sig over en time).
//
// Ved høje breddegrader (som Danmark) når solen om sommeren aldrig 18°/17° under
// horisonten ("lyse nætter") — her bruges "Angle-Based"-metoden (samme fallback som
// Aladhan selv bruger), hvor Fajr/Isha i stedet placeres som en vinkel-andel af natten.

function julianDate(year, month, day) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

const dtr = (d) => (d * Math.PI) / 180;
const rtd = (r) => (r * 180) / Math.PI;
const dsin = (d) => Math.sin(dtr(d));
const dcos = (d) => Math.cos(dtr(d));
const darcsin = (x) => rtd(Math.asin(x));
const darccos = (x) => rtd(Math.acos(x));
const darctan2 = (y, x) => rtd(Math.atan2(y, x));

function fixAngle(a) {
  a -= 360 * Math.floor(a / 360);
  return a < 0 ? a + 360 : a;
}
function fixHour(a) {
  a -= 24 * Math.floor(a / 24);
  return a < 0 ? a + 24 : a;
}

function sunPosition(jd) {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * dsin(g) + 0.02 * dsin(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = fixHour(darctan2(dcos(e) * dsin(L), dcos(L)) / 15);
  const eqt = q / 15 - RA;
  const declination = darcsin(dsin(e) * dsin(L));
  return { declination, eqt };
}

function computeTime(jd, lat, lng, timeFraction, angle, isSunset) {
  const { declination, eqt } = sunPosition(jd + timeFraction);
  const noon = fixHour(12 - lng / 15 - eqt);
  const arg = (-dsin(angle) - dsin(lat) * dsin(declination)) / (dcos(lat) * dcos(declination));
  if (arg < -1 || arg > 1) return null; // solen når aldrig denne vinkel (høj breddegrad, sommer)
  const T = (1 / 15) * darccos(arg);
  return noon + (isSunset ? T : -T);
}

function highLatitudeFallback(sunrise, sunset, isFajr, angle) {
  let nightLen = sunrise - sunset;
  if (nightLen < 0) nightLen += 24;
  const portion = (nightLen * angle) / 60;
  return isFajr ? fixHour(sunrise - portion) : fixHour(sunset + portion);
}

/**
 * Beregner Fajr/solopgang/Maghrib/Isha for en given dato, position og UTC-offset (timer).
 * @returns {{fajr:number, sunrise:number, dhuhr:number, maghrib:number, isha:number}} som decimaltimer (0-24)
 */
function calcDayTimesDecimal(year, month, day, lat, lng, tzOffsetHours, fajrAngle = 18, ishaAngle = 17) {
  const jd = julianDate(year, month, day) - lng / (15 * 24);
  let times = { fajr: 5, sunrise: 6, dhuhr: 12, sunset: 18, isha: 18 };
  for (let iter = 0; iter < 2; iter += 1) {
    const sunriseT = computeTime(jd, lat, lng, times.sunrise / 24, 0.833, false);
    const sunsetT = computeTime(jd, lat, lng, times.sunset / 24, 0.833, true);
    let fajrT = computeTime(jd, lat, lng, times.fajr / 24, fajrAngle, false);
    let ishaT = computeTime(jd, lat, lng, times.isha / 24, ishaAngle, true);
    if (fajrT === null) fajrT = highLatitudeFallback(sunriseT, sunsetT, true, fajrAngle);
    if (ishaT === null) ishaT = highLatitudeFallback(sunriseT, sunsetT, false, ishaAngle);
    times = {
      fajr: fajrT,
      sunrise: sunriseT,
      dhuhr: fixHour(12 - lng / 15 - sunPosition(jd + times.dhuhr / 24).eqt),
      sunset: sunsetT,
      isha: ishaT,
    };
  }
  const adjust = (t) => fixHour(t + tzOffsetHours);
  return {
    fajr: adjust(times.fajr),
    sunrise: adjust(times.sunrise),
    dhuhr: adjust(times.dhuhr),
    maghrib: adjust(times.sunset),
    isha: adjust(times.isha),
  };
}

function decimalToHM(t) {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return m === 60 ? { h: (h + 1) % 24, m: 0 } : { h, m };
}

// Danmarks sommertid (CEST, UTC+2) løber fra sidste søndag i marts til sidste søndag i
// oktober — beregnes her i stedet for at antage en fast offset, så tidspunkterne er
// korrekte året rundt.
function isDanishSummerTime(date) {
  const year = date.getUTCFullYear();
  const lastSundayOfMonth = (month) => {
    const d = new Date(Date.UTC(year, month + 1, 0, 1, 0, 0));
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d;
  };
  const dstStart = lastSundayOfMonth(2); // marts
  const dstEnd = lastSundayOfMonth(9); // oktober
  return date >= dstStart && date < dstEnd;
}

/**
 * Beregner dagens bønnetider for en by på en given dato.
 * @param {Date} date
 * @param {{lat:number, lng:number}} location
 * @returns {{fajr:string, sunrise:string, dhuhr:string, maghrib:string, isha:string}}
 */
export function getPrayerTimesForDate(date, location) {
  const tzOffset = isDanishSummerTime(date) ? 2 : 1;
  const decimals = calcDayTimesDecimal(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    location.lat,
    location.lng,
    tzOffset
  );
  const fmt = (t) => {
    const { h, m } = decimalToHM(t);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  return {
    fajr: fmt(decimals.fajr),
    sunrise: fmt(decimals.sunrise),
    dhuhr: fmt(decimals.dhuhr),
    maghrib: fmt(decimals.maghrib),
    isha: fmt(decimals.isha),
  };
}

// Danske byer med verificerede koordinater (ikke fra MyMasjid's egen, upålidelige
// by-søgning) — dækker de største byer og de områder, hvor den somaliske diaspora i
// Danmark primært bor.
export const DANISH_CITIES = [
  { id: "kobenhavn", name: "København", lat: 55.6761, lng: 12.5683 },
  { id: "aarhus", name: "Aarhus", lat: 56.1629, lng: 10.2039 },
  { id: "odense", name: "Odense", lat: 55.4038, lng: 10.4024 },
  { id: "aalborg", name: "Aalborg", lat: 57.0488, lng: 9.9217 },
  { id: "esbjerg", name: "Esbjerg", lat: 55.4761, lng: 8.4594 },
  { id: "randers", name: "Randers", lat: 56.4607, lng: 10.0369 },
  { id: "kolding", name: "Kolding", lat: 55.4904, lng: 9.4721 },
  { id: "horsens", name: "Horsens", lat: 55.8607, lng: 9.8503 },
  { id: "vejle", name: "Vejle", lat: 55.7093, lng: 9.5357 },
  { id: "roskilde", name: "Roskilde", lat: 55.6415, lng: 12.0803 },
  { id: "herning", name: "Herning", lat: 56.1362, lng: 8.9738 },
  { id: "silkeborg", name: "Silkeborg", lat: 56.1697, lng: 9.5451 },
  { id: "naestved", name: "Næstved", lat: 55.2297, lng: 11.7607 },
  { id: "fredericia", name: "Fredericia", lat: 55.5658, lng: 9.7517 },
  { id: "viborg", name: "Viborg", lat: 56.4527, lng: 9.4028 },
  { id: "koge", name: "Køge", lat: 55.4578, lng: 12.1817 },
  { id: "holstebro", name: "Holstebro", lat: 56.3606, lng: 8.6152 },
  { id: "slagelse", name: "Slagelse", lat: 55.4056, lng: 11.3527 },
  { id: "hillerod", name: "Hillerød", lat: 55.9264, lng: 12.3086 },
  { id: "sonderborg", name: "Sønderborg", lat: 54.9092, lng: 9.7926 },
  { id: "svendborg", name: "Svendborg", lat: 55.0605, lng: 10.6106 },
  { id: "hjorring", name: "Hjørring", lat: 57.4649, lng: 9.98 },
  { id: "frederikshavn", name: "Frederikshavn", lat: 57.4407, lng: 10.5468 },
  { id: "skive", name: "Skive", lat: 56.5665, lng: 9.0286 },
  { id: "ringsted", name: "Ringsted", lat: 55.4419, lng: 11.7903 },
  { id: "haderslev", name: "Haderslev", lat: 55.25, lng: 9.4914 },
  { id: "holbaek", name: "Holbæk", lat: 55.7167, lng: 11.7167 },
  { id: "nykobing_falster", name: "Nykøbing Falster", lat: 54.9667, lng: 11.8667 },
  { id: "helsingor", name: "Helsingør", lat: 56.0361, lng: 12.6136 },
  { id: "taastrup", name: "Taastrup", lat: 55.6522, lng: 12.3006 },
];
