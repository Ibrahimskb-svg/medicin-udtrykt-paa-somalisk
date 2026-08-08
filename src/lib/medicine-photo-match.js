// Matcher OCR-tekst fra et foto af en medicinæske mod sitets kendte 25
// lægemidler. Bevidst kun mod en lille, kendt liste (ikke fri tekstgenkendelse)
// — det gør matchingen både sikrere (aldrig et gæt på noget forkert) og meget
// mere robust end generel OCR-tolkning ville være.
//
// Hvert opslag har det danske generiske navn (fra slug'en) plus kendte
// handelsnavne, der faktisk står trykt på danske medicinpakninger — fx
// "Imozop" for zopiclon, eller det latinske navn i parentes for Eliquis/Xarelto.
export const MEDICINE_ALIASES = {
  amlodipin: ["amlodipin"],
  atorvastatin: ["atorvastatin"],
  diclofenac: ["diclofenac", "voltaren"],
  eliquis: ["eliquis", "apixaban"],
  enalapril: ["enalapril"],
  hjertemagnyl: ["hjertemagnyl", "magnyl"],
  ibuprofen: ["ibuprofen", "ipren"],
  insulin: ["insulin"],
  lamotrigin: ["lamotrigin", "lamictal"],
  losartan: ["losartan", "cozaar"],
  marevan: ["marevan", "warfarin"],
  melatonin: ["melatonin", "circadin"],
  metformin: ["metformin"],
  metoprolol: ["metoprolol", "selo-zok", "seloken"],
  morfin_tablet: ["morfin", "dolcontin", "malfin"],
  morfin_injektion: ["morfin injektion", "morfin inj"],
  naproxen: ["naproxen", "naprosyn"],
  pantoprazol: ["pantoprazol", "pantoloc"],
  paracetamol: ["paracetamol", "pinex", "panodil"],
  quetiapin: ["quetiapin", "seroquel"],
  sertralin: ["sertralin", "zoloft"],
  symbicort: ["symbicort"],
  ventoline: ["ventoline", "salbutamol"],
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
