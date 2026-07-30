// Kører automatisk før hver build (se "prebuild" i package.json) og før hver
// "npm run dev". Skriver dagens dato til en genereret fil, så "Sidst
// revideret"-badgen altid matcher hvornår siden sidst blev bygget/deployet —
// uden at nogen skal huske at opdatere den manuelt.
//
// Brugte tidligere "git log" til at finde datoen for sidste ændring af en
// bestemt kildefil, men det viste sig upålideligt i Vercels build-miljø
// (formentlig for lidt git-historik i et shallow clone), så den deployede
// side viste en forkert, fastfrosset dato i stedet for at følge med. Løsningen
// er simpelthen at bruge byggedatoen direkte — den kan ikke fejle, uanset om
// git er tilgængeligt i miljøet der bygger siden.
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
// Bruger dagens dato i København-tid frem for UTC — Vercels build-servere kører
// i UTC, så en ren "toISOString()" kunne i et par timer omkring midnat vise
// gårsdagens dato for danske læsere.
const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Copenhagen" }).format(new Date());

// ── Medicinsk indhold (bruges i JSON-LD "lastReviewed" på lægemiddelsider) ──
fs.writeFileSync(
  path.join(REPO_ROOT, "src", "data", "last-revised.generated.js"),
  `// Auto-genereret af scripts/generate-last-revised.js — rediger ikke manuelt.\nexport const LAST_REVISED_ISO = ${JSON.stringify(TODAY)};\n`
);

// ── Juridiske sider (Cookiepolitik + Persondatapolitik) ─────────────────────
fs.writeFileSync(
  path.join(REPO_ROOT, "src", "data", "legal-revised.generated.js"),
  `// Auto-genereret af scripts/generate-last-revised.js — rediger ikke manuelt.\nexport const COOKIE_REVISED_ISO = ${JSON.stringify(TODAY)};\nexport const PRIVACY_REVISED_ISO = ${JSON.stringify(TODAY)};\n`
);

console.log(`Sidst revideret-dato genereret: ${TODAY}`);
