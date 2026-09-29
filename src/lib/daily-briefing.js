import { TIME_SLOTS } from "./dose-schedule";
import { knownInteractions, pairKey } from "../data/interactions";

const BASE = "/audio/briefing";

function clip(language, key) {
  return `${BASE}/${language}/${key}.mp3`;
}

// Somme sprog understøttes ikke af briefingen (kun so/ar har lyd-narration
// på sitet i forvejen, jf. per-medicin-lydknappen på selve medicinsiden).
export function isBriefingSupported(language) {
  return language === "so" || language === "ar";
}

// Bygger den ordnede liste af lydklip der skal afspilles for "Dhegayso
// maalintaada" — tidspunkt for tidspunkt (morgen→nat), ikke medicin for
// medicin, så det svarer til "hvad skal jeg tage lige nu" i stedet for en
// opremsning af hver medicins fulde skema.
export function buildBriefingSequence({ language, list, schedule }) {
  if (!isBriefingSupported(language)) return [];

  if (!list.length) {
    return [{ key: "empty_list", src: clip(language, "empty_list") }];
  }

  const scheduledSlugs = list.filter((slug) => (schedule[slug] || []).length > 0);
  if (!scheduledSlugs.length) {
    return [{ key: "empty_schedule", src: clip(language, "empty_schedule") }];
  }

  const sequence = [{ key: "intro", src: clip(language, "intro") }];

  for (const slot of TIME_SLOTS) {
    const slugsAtSlot = scheduledSlugs.filter((slug) => schedule[slug].includes(slot));
    if (!slugsAtSlot.length) continue;

    sequence.push({ key: `time_${slot}`, src: clip(language, `time_${slot}`) });
    slugsAtSlot.forEach((slug, i) => {
      if (i > 0) sequence.push({ key: "and", src: clip(language, "and") });
      sequence.push({ key: `name_${slug}`, src: clip(language, `name_${slug}`) });
    });
  }

  // Kun rød/orange advares om her — grønne (bekræftet uproblematiske)
  // kombinationer ville bare gøre en kort briefing unødigt lang.
  const seen = new Set();
  for (let i = 0; i < scheduledSlugs.length; i++) {
    for (let j = i + 1; j < scheduledSlugs.length; j++) {
      const a = scheduledSlugs[i];
      const b = scheduledSlugs[j];
      const known = knownInteractions[pairKey(a, b)];
      if (known && (known.level === "red" || known.level === "orange")) {
        const key = pairKey(a, b);
        if (seen.has(key)) continue;
        seen.add(key);
        sequence.push({ key: "warning_intro", src: clip(language, "warning_intro") });
        sequence.push({ key: `name_${a}`, src: clip(language, `name_${a}`) });
        sequence.push({ key: "and", src: clip(language, "and") });
        sequence.push({ key: `name_${b}`, src: clip(language, `name_${b}`) });
      }
    }
  }

  sequence.push({ key: "outro", src: clip(language, "outro") });
  return sequence;
}
