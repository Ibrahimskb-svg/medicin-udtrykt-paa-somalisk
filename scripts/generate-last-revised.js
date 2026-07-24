// Kører automatisk før hver build (se "prebuild" i package.json).
// Finder datoen for sidste git-commit der rørte ved src/data/site-data.js
// (den faktiske medicinske indhold), og skriver den til en genereret fil,
// så "Sidst revideret"-datoen på siden altid matcher virkeligheden uden
// at nogen skal huske at opdatere den manuelt.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getLastRevisedDate() {
  try {
    const out = execSync(
      'git log -1 --format=%cd --date=short -- src/data/site-data.js',
      { cwd: path.join(__dirname, ".."), encoding: "utf8" }
    ).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch (e) {
    // git ikke tilgængelig (fx nogle CI-miljøer) — falder tilbage nedenfor
  }
  return new Date().toISOString().slice(0, 10);
}

const isoDate = getLastRevisedDate();
const outPath = path.join(__dirname, "..", "src", "data", "last-revised.generated.js");
fs.writeFileSync(
  outPath,
  `// Auto-genereret af scripts/generate-last-revised.js — rediger ikke manuelt.\nexport const LAST_REVISED_ISO = ${JSON.stringify(isoDate)};\n`
);
console.log(`Sidst revideret-dato genereret: ${isoDate}`);
