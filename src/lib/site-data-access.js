// Alt herinde rører siteMedicines (494KB, alle 25 medicin × 4 sprog) eller
// siteIndex — udskilt fra site.js, som ellers trak hele dette datasæt ind i
// HVER sides klient-bundle, bare fordi fx AppNavbar importerede en helt
// anden, sprog-tema-relateret funktion fra samme fil. Importér herfra kun i
// de komponenter, der rent faktisk slår medicin op (fx "min liste",
// alvorligheds-tjekket, doseringsskemaet) — ikke i komponenter der blot
// skal vise sprog-temaer, UI-tekster eller statiske ikoner (dem er i
// site.js, som IKKE importerer denne fil eller site-data.js).
import { siteIndex, siteMedicines } from "../data/site-data";
import { TIME_SLOTS } from "./dose-schedule";
import { hasDoctorDependentDoseNote } from "./site";

export function getIndexData() {
  return siteIndex;
}

// Korte, allerede-oversatte "hvad er det"-sætninger pr. medicin (samme tekst
// som toppen af selve medicinsiden) — genbruges som forhåndsvisning i
// medicinlisten, så man kan se lidt info før man åbner hele siden.
export const MEDICINE_INTRO_BOX = Object.fromEntries(
  siteMedicines.map((medicine) => [
    medicine.slug,
    {
      so: medicine.translations?.so?.introBox ?? "",
      da: medicine.translations?.da?.introBox ?? "",
      en: medicine.translations?.en?.introBox ?? "",
      ar: medicine.translations?.ar?.introBox ?? "",
    },
  ]),
);

export function getMedicine(slug) {
  return siteMedicines.find((item) => item.slug === slug) ?? null;
}

export function getMedicineSlugs() {
  return siteMedicines.map((item) => item.slug);
}

// Genbruger doseringspiktogrammet, der allerede vises på medicinsiden (fx
// "Hal jeer maalintii — Subax ama fiid" for Amlodipin) — samme kilde bruges
// i doseringsskemaet og skranke-kortene, så det aldrig kan afvige.
export function getUsualDosingHint(slug, language) {
  const medicine = getMedicine(slug);
  const pictogram = medicine?.dosagePictogram?.[language] || medicine?.dosagePictogram?.so;
  if (!pictogram || pictogram.length === 0) return null;
  return pictogram.map((p) => p.text).join(" — ");
}

// Standard-fordeling når vi kun kender ANTALLET af gange dagligt, ikke et
// specifikt tidspunkt — samme opdeling som en doseringsæske bruger som
// udgangspunkt: 1x → morgen, 2x → morgen+aften, osv. Ved et interval (fx
// "1–2 gange dagligt") bruges det HØJESTE tal (se extractDailyCount
// nedenfor) — skemaet skal hellere foreslå for mange end for få.
const DEFAULT_SLOTS_FOR_COUNT = {
  1: ["morning"],
  2: ["morning", "evening"],
  3: ["morning", "noon", "evening"],
  4: ["morning", "noon", "evening", "night"],
};

// Dansk skrevet med bogstaver ("en eller to gange dagligt") i stedet for
// tal — nødvendigt fordi kilden herunder er almindelig, flydende tekst,
// ikke en fast skabelon.
const DA_NUMBER_WORDS = { en: 1, "én": 1, to: 2, tre: 3, fire: 4 };
function parseDaNumber(token) {
  if (!token) return null;
  const word = DA_NUMBER_WORDS[token.toLowerCase()];
  if (word != null) return word;
  const n = parseInt(token, 10);
  return Number.isFinite(n) ? n : null;
}

function stripHtml(text) {
  return String(text).replace(/<[^>]+>/g, "");
}

// Den fulde "Sådan tages medicinen"-tekst fra selve medicinsiden — langt
// mere udførlig end det korte doseringspiktogram, og stedet hvor Ibrahim
// selv skriver hele forklaringen i almindelige sætninger (fx Sertralin:
// "Medicinen tages som regel én gang dagligt.").
function getDoseInstructionText(medicine) {
  const t = medicine?.translations?.da;
  if (!t) return "";
  if (Array.isArray(t.doseList)) return t.doseList.map(stripHtml).join(" ");
  for (let i = 0; i < 12; i++) {
    const title = t[`sec${i}Title`];
    if (title && /sådan tages|dosering|dosis/i.test(title) && Array.isArray(t[`sec${i}`])) {
      return t[`sec${i}`].map(stripHtml).join(" ");
    }
  }
  return "";
}

const DOSE_NUMBER = "(\\d+|en|én|to|tre|fire)";
const FREQUENCY_PATTERNS = [
  new RegExp(`${DOSE_NUMBER}\\s*(?:(?:[–-]|til|eller)\\s*${DOSE_NUMBER}\\s*)?gang(?:e)?\\s+dagligt`, "gi"),
  new RegExp(`(?:ikke mere end|maks\\.?|max\\.?)\\s*${DOSE_NUMBER}\\s*dos(?:er|is)?\\s*(?:i\\s*døgnet|dagligt|om\\s*dagen)`, "gi"),
];

// Doseringsteksten er flydende sprog, ikke en skabelon, så der ledes efter
// ALLE forekomster af et antal gange dagligt i hele teksten, og det
// HØJESTE tal, der nævnes, bruges (fx Pantoprazol nævner både "én gang
// dagligt" og "to gange dagligt" for forskellige patienter — her bruges
// 2) — skemaet skal hellere foreslå for mange tidspunkter end for få.
function extractDailyCount(text) {
  let best = null;
  for (const pattern of FREQUENCY_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const count = Math.max(parseDaNumber(match[1]) || 0, parseDaNumber(match[2]) || 0);
      if (count > 0 && (best === null || count > best)) best = count;
    }
  }
  return best;
}

// Nogle medicinsiders doseringspiktogram har selv et "morning"/"evening"
// element (fx Amlodipin: "Subax ama fiid") — det er data, Ibrahim har
// skrevet pr. medicin, ikke noget appen gætter. Findes det, bruges det i
// doseringsskemaet til at FORESLÅ det tidspunkt, før brugeren selv har
// valgt noget — brugeren bekræfter eller vælger selv et andet.
//
// Findes der intet specifikt tidspunkt, udledes antallet af gange dagligt
// fra selve "Sådan tages medicinen"-teksten på medicinens egen side (se
// extractDailyCount ovenfor) — stadig tal, Ibrahim selv har skrevet, ikke
// noget nyt opfundet. Nævner teksten i stedet, at den er "tæt knyttet til
// måltider" (fx Insulin), regnes det som 3 gange dagligt (morgen/middag/
// aften). For de lægemidler hvor Ibrahim selv har bekræftet 1-2 gange
// dagligt afhængig af lægens ordination (se hasDoctorDependentDoseNote i
// site.js) bruges det (med bemærkningen om, at det afhænger af lægen). Alt
// andet uden noget af dette (fx "gives af sundhedspersonale", eller kun en
// "efter behov"-tekst uden et konkret antal) forbliver bevidst uden forslag.
export function getSuggestedDoseSlots(slug) {
  const medicine = getMedicine(slug);
  const pictogram = medicine?.dosagePictogram?.so || [];
  const explicitSlots = pictogram.map((p) => p.type).filter((type) => TIME_SLOTS.includes(type));
  if (explicitSlots.length > 0) return explicitSlots;

  const doseText = getDoseInstructionText(medicine);
  const count = extractDailyCount(doseText);
  if (count) return DEFAULT_SLOTS_FOR_COUNT[Math.min(count, 4)] || [];
  if (/knyttet til målti/i.test(doseText)) return DEFAULT_SLOTS_FOR_COUNT[3];
  if (hasDoctorDependentDoseNote(slug)) return DEFAULT_SLOTS_FOR_COUNT[2];
  return [];
}
