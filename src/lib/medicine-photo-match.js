// Matcher OCR-tekst fra et foto af en medicinæske mod sitets kendte 25
// lægemidler. Bevidst kun mod en lille, kendt liste (ikke fri tekstgenkendelse)
// — det gør matchingen både sikrere (aldrig et gæt på noget forkert) og meget
// mere robust end generel OCR-tolkning ville være.
//
// Hvert opslag har det danske generiske navn (fra slug'en) plus kendte
// handelsnavne, der faktisk står trykt på danske medicinpakninger — fx
// "Imozop" for zopiclon, eller det latinske navn i parentes for Eliquis/Xarelto.
// Både danske OG internationale handelsnavne — mange brugere har medicin
// købt eller sendt fra udlandet (fx Panadol i stedet for det danske Panodil),
// ikke kun fra et dansk apotek. Kun navne vi er helt sikre på reelt refererer
// til netop dette virkestof er med — en forkert alias er værre end en manglende,
// fordi den ville sende nogen hen til information om det forkerte lægemiddel.
export const MEDICINE_ALIASES = {
  amlodipin: ["amlodipin", "norvasc"],
  atorvastatin: ["atorvastatin", "lipitor"],
  diclofenac: ["diclofenac", "voltaren", "cataflam"],
  eliquis: ["eliquis", "apixaban"],
  enalapril: ["enalapril", "renitec", "vasotec"],
  hjertemagnyl: ["hjertemagnyl", "magnyl"],
  ibuprofen: ["ibuprofen", "ipren", "nurofen", "advil", "brufen"],
  insulin: ["insulin"],
  lamotrigin: ["lamotrigin", "lamictal"],
  losartan: ["losartan", "cozaar"],
  marevan: ["marevan", "warfarin", "coumadin"],
  melatonin: ["melatonin", "circadin"],
  metformin: ["metformin", "glucophage"],
  metoprolol: ["metoprolol", "selo-zok", "seloken", "lopressor", "toprol"],
  morfin_tablet: ["morfin", "dolcontin", "malfin"],
  morfin_injektion: ["morfin injektion", "morfin inj"],
  naproxen: ["naproxen", "naprosyn", "aleve"],
  pantoprazol: ["pantoprazol", "pantoloc", "protonix"],
  paracetamol: ["paracetamol", "pinex", "panodil", "panadol", "tylenol", "acetaminophen"],
  quetiapin: ["quetiapin", "seroquel"],
  sertralin: ["sertralin", "zoloft"],
  symbicort: ["symbicort"],
  ventoline: ["ventoline", "salbutamol", "albuterol", "ventolin"],
  xarelto: ["xarelto", "rivaroxaban"],
  zopiclon: ["zopiclon", "imozop", "zopiclone"],
};

// Fjerner accenter/diakritiske tegn og alt andet end bogstaver/tal/mellemrum,
// så "Diclofénac" og "DICLOFENAC®" begge normaliserer til samme streng — OCR
// på et foto giver ofte variation i store/små bogstaver og støj fra logoer.
function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Kun ét ord-grænse-match tæller (ikke en delstreng midt i et andet ord) —
// ellers ville fx "insulin" fejlagtigt matche inde i et helt andet OCR-ord.
function containsWholeWord(haystack, needle) {
  if (!needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(haystack);
}

// Returnerer { slug, alias } for det første kendte lægemiddel, hvis navn eller
// handelsnavn findes i den OCR'ede tekst — eller null hvis intet sikkert match.
// Morfin tablet/injektion deler samme generiske navn ("morfin"); et OCR-fund af
// blot "morfin" antages at være tabletformen, da det er langt den almindeligste
// form en patient selv håndterer derhjemme (injektion gives typisk klinisk).
export function matchMedicineFromText(ocrText) {
  const normalized = normalize(ocrText);
  if (!normalized) return null;

  for (const [slug, aliases] of Object.entries(MEDICINE_ALIASES)) {
    for (const alias of aliases) {
      if (containsWholeWord(normalized, normalize(alias))) {
        return { slug, alias };
      }
    }
  }
  return null;
}
