const MONTHS = {
  da: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  so: ["Janaayo", "Febraayo", "Maarso", "Abriil", "May", "Juun", "Juulay", "Ogosto", "Sebtembar", "Oktoobar", "Nofembar", "Disembar"],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
};

export function formatRevisedDate(isoDate, lang) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const monthName = (MONTHS[lang] ?? MONTHS.da)[month - 1];
  const dayNum = parseInt(day, 10);
  if (lang === "en") return `${monthName} ${dayNum}, ${year}`;
  if (lang === "ar") return `${dayNum} ${monthName} ${year}`;
  if (lang === "so") return `${dayNum} ${monthName} ${year}`;
  return `${dayNum}. ${monthName} ${year}`;
}
