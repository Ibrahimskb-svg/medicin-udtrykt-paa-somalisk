// Kører automatisk før hver build (se "prebuild" i package.json) og før hver
// "npm run dev". Finder datoen for sidste ændring af hver kildefil og skriver
// den til en genereret fil, så "Sidst revideret"-datoen på siderne altid
// matcher virkeligheden uden at nogen skal huske at opdatere den manuelt.
//
// Hvis filen har ikke-committede ændringer (git status viser den som
// modified/untracked), bruges dagens dato — så en redigering du laver nu med
// det samme afspejles, selvom du endnu ikke har committet den.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const TODAY = new Date().toISOString().slice(0, 10);

function hasUncommittedChanges(relPath) {
  try {
    const out = execSync(`git status --porcelain -- ${JSON.stringify(relPath)}`, {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).trim();
    return out.length > 0;
  } catch (e) {
    return false;
  }
}

function getLastRevisedDate(relPath) {
  if (hasUncommittedChanges(relPath)) return TODAY;
  try {
    const out = execSync(
      `git log -1 --format=%cd --date=short -- ${JSON.stringify(relPath)}`,
      { cwd: REPO_ROOT, encoding: "utf8" }
    ).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch (e) {
    // git ikke tilgængelig (fx nogle CI-miljøer) — falder tilbage nedenfor
  }
  return TODAY;
}

// ── Medicinsk indhold (bruges i JSON-LD "lastReviewed" på lægemiddelsider) ──
const medicineDate = getLastRevisedDate("src/data/site-data.js");
fs.writeFileSync(
  path.join(REPO_ROOT, "src", "data", "last-revised.generated.js"),
  `// Auto-genereret af scripts/generate-last-revised.js — rediger ikke manuelt.\nexport const LAST_REVISED_ISO = ${JSON.stringify(medicineDate)};\n`
);

// ── Juridiske sider (Cookiepolitik + Persondatapolitik) ─────────────────────
const cookieDate = getLastRevisedDate("app/cookiepolitik/page.jsx");
const privacyDate = getLastRevisedDate("app/persondatapolitik/page.jsx");
fs.writeFileSync(
  path.join(REPO_ROOT, "src", "data", "legal-revised.generated.js"),
  `// Auto-genereret af scripts/generate-last-revised.js — rediger ikke manuelt.\nexport const COOKIE_REVISED_ISO = ${JSON.stringify(cookieDate)};\nexport const PRIVACY_REVISED_ISO = ${JSON.stringify(privacyDate)};\n`
);

console.log(`Sidst revideret-datoer genereret: medicin=${medicineDate}, cookiepolitik=${cookieDate}, persondatapolitik=${privacyDate}`);
