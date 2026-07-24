import { LAST_REVISED_ISO } from "../data/last-revised.generated";

const MONTHS = {
  da: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  so: ["Janaayo", "Febraayo", "Maarso", "Abriil", "Maajo", "Juun", "Luulyo", "Ogost", "Sebtembar", "Oktoobar", "Nofembar", "Diseembar"],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
};

const PREFIX = {
  da: "Sidst revideret",
  en: "Last revised",
  so: "La cusbooneysiiyay",
  ar: "آخر مراجعة",
};

function formatDate(language) {
  const [year, month, day] = LAST_REVISED_ISO.split("-").map(Number);
  const monthName = (MONTHS[language] ?? MONTHS.so)[month - 1];
  if (language === "da") return `${day}. ${monthName} ${year}`;
  if (language === "ar") return `${day} ${monthName} ${year}`;
  return `${day} ${monthName} ${year}`;
}

export function getLastRevisedText(language) {
  const prefix = PREFIX[language] ?? PREFIX.so;
  return `${prefix}: ${formatDate(language)}`;
}
