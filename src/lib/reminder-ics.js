// Delt mellem medicine-page.jsx (medicin-specifik påmindelse) og site-index.jsx
// (generel Suhoor/Iftar-påmindelse fra forsidens hero) — samme .ics-generator,
// oprindeligt kun i medicine-page.jsx, udtrukket hertil for at undgå to kopier.
const PRAYER_PERIOD_LABEL = {
  suhoor: { da: "Sahur", en: "Suhoor", so: "Sahuur", ar: "السحور" },
  iftar: { da: "Iftar", en: "Iftar", so: "Iftar", ar: "الإفطار" },
};

// customTimes (valgfri): [{hour, minute, period: "suhoor"|"iftar"}] — bruges til at
// generere flere begivenheder aligned med bønnetider i stedet for det faste kl. 08:00.
export function downloadReminderICS(medicineName, language, customTimes) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const stampStr =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const summaryByLang = {
    da: `Tag din medicin: ${medicineName}`,
    en: `Take your medicine: ${medicineName}`,
    so: `Qaado daawadaada: ${medicineName}`,
    ar: `تناول دواءك: ${medicineName}`,
  };
  const descByLang = {
    da: "Daglig påmindelse fra Somalimed.dk. Du kan ændre klokkeslættet i din kalender-app.",
    en: "Daily reminder from Somalimed.dk. You can change the time in your calendar app.",
    so: "Xasuusin maalinle ah oo ka timid Somalimed.dk. Waxaad ka bedeli kartaa saacadda app-kaaga jadwalka.",
    ar: "تذكير يومي من Somalimed.dk. يمكنك تغيير الوقت في تطبيق التقويم الخاص بك.",
  };
  const baseSummary = summaryByLang[language] || summaryByLang.da;
  const description = descByLang[language] || descByLang.da;

  const events = (customTimes?.length ? customTimes : [{ hour: 8, minute: 0, period: null }]).map((entry, i) => {
    const start = `${pad(entry.hour)}${pad(entry.minute)}00`;
    const endMinute = entry.minute + 15;
    const end = `${pad(entry.hour + Math.floor(endMinute / 60))}${pad(endMinute % 60)}00`;
    const periodLabel = entry.period ? PRAYER_PERIOD_LABEL[entry.period]?.[language] : null;
    const summary = periodLabel ? `${periodLabel} – ${baseSummary}` : baseSummary;
    return [
      "BEGIN:VEVENT",
      `UID:somalimed-${Date.now()}-${i}@somalimed.dk`,
      `DTSTAMP:${stampStr}`,
      `DTSTART;TZID=Europe/Copenhagen:${todayStr}T${start}`,
      `DTEND;TZID=Europe/Copenhagen:${todayStr}T${end}`,
      "RRULE:FREQ=DAILY",
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Somalimed//Medicine Reminder//DA", ...events, "END:VCALENDAR"].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Somalimed-paamindelse-${medicineName.replace(/\s+/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
