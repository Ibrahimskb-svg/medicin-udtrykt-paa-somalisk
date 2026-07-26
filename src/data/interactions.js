// Manually verified against Lægemiddelstyrelsens Interaktionsdatabase (interaktionsdatabasen.dk).
// Each entry below was looked up individually on the date shown — this is a small, growing
// list, not full coverage. Key = the two medicine slugs sorted alphabetically, joined by "|".
export const CHECKED_DATE = "2026-07-26";

export const knownInteractions = {
  "amlodipin|atorvastatin": {
    level: "green",
    sourceUrl: "https://interaktionsdatabasen.dk/SearchResult.aspx?pids=28104881411,28105722916",
  },
  "ibuprofen|marevan": {
    level: "red",
    sourceUrl:
      "https://interaktionsdatabasen.dk/SearchResult.aspx?pids=6ffed40b-fbad-4c7f-a9ce-a4bd88668338,429d2ab4-bc0f-4fe4-ad40-b2a16e874bc6",
  },
  "quetiapin|sertralin": {
    level: "green",
    sourceUrl:
      "https://interaktionsdatabasen.dk/SearchResult.aspx?pids=eba3344c-2539-44a3-80e1-3f72226ee65b,67495c66-229c-4f93-bb83-dd73bc0494ec",
  },
  "marevan|paracetamol": {
    level: "orange",
    sourceUrl:
      "https://interaktionsdatabasen.dk/SearchResult.aspx?pids=d18ead6e-0d17-4d7a-b5c5-e27efabfbc5a,429d2ab4-bc0f-4fe4-ad40-b2a16e874bc6",
  },
};

export function pairKey(slugA, slugB) {
  return [slugA, slugB].sort().join("|");
}
