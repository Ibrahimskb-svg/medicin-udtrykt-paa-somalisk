#!/usr/bin/env node
// Oversættelses-konsistenstjek: scanner ALT tekstindhold på tværs af
// medicinsider, Skranke-kort og ordlisten, og finder steder hvor samme
// danske tekst er oversat forskelligt til somali/arabisk andre steder på
// sitet — eller hvor et af ordlistens godkendte fagudtryk optræder på dansk
// uden at den tilsvarende godkendte oversættelse ses i den somaliske/
// arabiske tekst ved siden af.
//
// Retter INTET automatisk — det er stadig kun et menneske, der kender den
// rigtige oversættelse. Scriptet finder bare de steder, det er værd at kigge
// på, så man ikke skal huske/lede manuelt gennem alt indhold selv.
//
// Brug: node scripts/check-translation-consistency.js

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// site-data.js, counter-cards.js og pharmacy-glossary.js er alle almindelige
// ES-modul-filer (export const ...) og kan ikke bare require()'es direkte af
// et almindeligt CommonJS-script. I stedet læses filen som tekst, og selve
// objekt-/array-literalet efter "export const NAVN = " udtrækkes ved at
// tælle balancerede { }/[ ] (og springe over citerede strenge), hvorefter
// det evalueres som et almindeligt JS-udtryk. Ingen import/require af selve
// filen er nødvendig, og filens indhold ændres aldrig.
function loadExportedValue(relativePath, exportName) {
  const filePath = path.join(ROOT, relativePath);
  const src = fs.readFileSync(filePath, "utf8");
  const marker = `export const ${exportName}`;
  const markerIndex = src.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Fandt ikke "${marker}" i ${relativePath}`);
  }
  let i = markerIndex + marker.length;
  while (/\s|=/.test(src[i])) i++;

  const openChar = src[i];
  const closeChar = openChar === "{" ? "}" : openChar === "[" ? "]" : null;
  if (!closeChar) {
    throw new Error(`Forventede et objekt- eller array-literal efter "${marker}" i ${relativePath}`);
  }

  let depth = 0;
  let inString = null;
  let escaped = false;
  let end = -1;
  for (let j = i; j < src.length; j++) {
    const ch = src[j];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inString = ch; continue; }
    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) { end = j + 1; break; }
    }
  }
  if (end === -1) throw new Error(`Ubalanceret literal for "${exportName}" i ${relativePath}`);

  const literalText = src.slice(i, end);
  return new Function(`"use strict"; return (${literalText});`)();
}

function collectEntries() {
  const entries = [];
  const structuralIssues = [];

  const siteData = loadExportedValue("src/data/site-data.js", "siteData");
  for (const med of siteData.medicines || []) {
    const t = med.translations || {};
    for (const key of Object.keys(t.da || {})) {
      const daVal = t.da[key];
      if (typeof daVal === "string") {
        entries.push({
          source: `${med.slug} › translations.${key}`,
          da: daVal, so: t.so?.[key], en: t.en?.[key], ar: t.ar?.[key],
        });
      } else if (Array.isArray(daVal)) {
        const soArr = t.so?.[key] || [];
        const enArr = t.en?.[key] || [];
        const arArr = t.ar?.[key] || [];
        if (soArr.length !== daVal.length || arArr.length !== daVal.length) {
          structuralIssues.push(
            `${med.slug} › ${key}: da har ${daVal.length} punkter, so har ${soArr.length}, ar har ${arArr.length}`
          );
        }
        daVal.forEach((item, i) => {
          if (typeof item !== "string") return;
          entries.push({
            source: `${med.slug} › translations.${key}[${i}]`,
            da: item, so: soArr[i], en: enArr[i], ar: arArr[i],
          });
        });
      }
    }

    const dp = med.dosagePictogram || {};
    (dp.da || []).forEach((chip, i) => {
      entries.push({
        source: `${med.slug} › dosagePictogram[${i}]`,
        da: chip.text, so: dp.so?.[i]?.text, en: dp.en?.[i]?.text, ar: dp.ar?.[i]?.text,
      });
    });
  }

  const categories = loadExportedValue("src/data/counter-cards.js", "COUNTER_CARD_CATEGORIES");
  for (const cat of categories) {
    entries.push({
      source: `Skranke-kort › ${cat.id} › label`,
      da: cat.label.da, so: cat.label.so, en: cat.label.en, ar: cat.label.ar,
    });
    (cat.phrases || []).forEach((ph, i) => {
      entries.push({
        source: `Skranke-kort › ${cat.id} › phrases[${i}]`,
        da: ph.da, so: ph.so, en: ph.en, ar: ph.ar,
      });
    });
  }

  const glossary = loadExportedValue("src/data/pharmacy-glossary.js", "pharmacyGlossary");
  for (const g of glossary) {
    entries.push({ source: `Ordliste › ${g.id} › term`, da: g.term.da, so: g.term.so, en: g.term.en, ar: g.term.ar });
    entries.push({
      source: `Ordliste › ${g.id} › explanation`,
      da: g.explanation.da, so: g.explanation.so, en: g.explanation.en, ar: g.explanation.ar,
    });
  }

  return { entries, glossary, structuralIssues };
}

// Check 1: samme danske sætning brugt flere steder — er so/ar-oversættelsen
// identisk hver gang? Høj sikkerhed, ingen gæt: det er bogstaveligt samme
// kildetekst, så en afvigelse er enten en reel inkonsistens eller en bevidst
// rettelse et sted, der er glemt et andet sted.
function checkExactDuplicates(entries) {
  const bySource = new Map();
  for (const e of entries) {
    if (!e.da || typeof e.da !== "string") continue;
    const key = e.da.trim();
    if (key.length < 8) continue; // spring meget korte/trivielle strenge over (fx enkeltord-labels)
    if (!bySource.has(key)) bySource.set(key, []);
    bySource.get(key).push(e);
  }
  const findings = [];
  for (const [daText, group] of bySource) {
    if (group.length < 2) continue;
    const soSet = new Set(group.map((g) => (g.so || "").trim()));
    const arSet = new Set(group.map((g) => (g.ar || "").trim()));
    if (soSet.size > 1 || arSet.size > 1) findings.push({ daText, group });
  }
  return findings;
}

// Matcher kun hvis "stem" optræder som starten af et selvstændigt ord i
// teksten — ikke midt inde i et sammensat ord. JS' indbyggede \b er
// ASCII-only og kender ikke æøå som "bogstav", så det tjekkes manuelt i
// stedet: er tegnet lige før forekomsten IKKE et bogstav (eller start af
// strengen)? Det forhindrer fx "Tilskud" i fejlagtigt at matche inde i
// "kosttilskud" eller "kaliumtilskud" (kosttilskud = et helt andet begreb
// end den finansielle medicintilskudsordning, glossariet mener).
const LETTER_RE = /[a-zæøåàáâãäåèéêëìíîïòóôõöùúûü]/i;
function hasWordStartMatch(text, stem) {
  const lowerText = text.toLowerCase();
  const lowerStem = stem.toLowerCase();
  let fromIndex = 0;
  for (;;) {
    const idx = lowerText.indexOf(lowerStem, fromIndex);
    if (idx === -1) return false;
    const prevChar = idx === 0 ? "" : lowerText[idx - 1];
    if (!LETTER_RE.test(prevChar)) return true;
    fromIndex = idx + 1;
  }
}

// Check 2: ordlistens godkendte fagudtryk — optræder det danske udtryk i en
// tekst, uden at den godkendte so/ar-oversættelse ses i teksten ved siden
// af? Heuristik (ordstart-match), kan give enkelte falske positiver ved
// meget anderledes omskrivninger — vises derfor som "mulige", ikke sikre, fund.
function checkGlossaryUsage(entries, glossary) {
  const findings = [];
  for (const g of glossary) {
    const daStem = (g.term.da || "").toLowerCase().split("(")[0].trim();
    if (daStem.length < 4) continue;
    const soTerm = (g.term.so || "").toLowerCase();
    const arTerm = (g.term.ar || "").toLowerCase();
    for (const e of entries) {
      if (!e.da || !hasWordStartMatch(e.da, daStem)) continue;
      const soLower = (e.so || "").toLowerCase();
      const arLower = (e.ar || "").toLowerCase();
      const soOk = !soTerm || soLower.includes(soTerm);
      const arOk = !arTerm || arLower.includes(arTerm);
      if (!soOk || !arOk) {
        findings.push({ term: g.term.da, canonicalSo: g.term.so, canonicalAr: g.term.ar, entry: e, soOk, arOk });
      }
    }
  }
  return findings;
}

function truncate(text, max = 90) {
  if (!text) return "(mangler)";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function main() {
  const { entries, glossary, structuralIssues } = collectEntries();
  console.log(`Gennemgik ${entries.length} tekststrenge på tværs af medicinsider, Skranke-kort og ordlisten.\n`);

  if (structuralIssues.length > 0) {
    console.log("=== Strukturelle afvigelser (forskelligt antal punkter pr. sprog) ===\n");
    for (const issue of structuralIssues) console.log("  ⚠ " + issue);
    console.log("");
  }

  const dupFindings = checkExactDuplicates(entries);
  console.log(`=== Sikre fund: samme danske sætning, forskellig oversættelse (${dupFindings.length}) ===\n`);
  if (dupFindings.length === 0) {
    console.log("  Ingen fundet — al genbrugt dansk tekst er oversat ens hver gang.\n");
  } else {
    for (const f of dupFindings) {
      console.log(`  DA: "${truncate(f.daText, 120)}"`);
      for (const g of f.group) {
        console.log(`    - ${g.source}`);
        console.log(`        SO: ${truncate(g.so)}`);
        console.log(`        AR: ${truncate(g.ar)}`);
      }
      console.log("");
    }
  }

  const glossaryFindings = checkGlossaryUsage(entries, glossary);
  console.log(`=== Mulige fund: ordliste-udtryk uden godkendt oversættelse i nærheden (${glossaryFindings.length}) ===\n`);
  if (glossaryFindings.length === 0) {
    console.log("  Ingen fundet.\n");
  } else {
    for (const f of glossaryFindings) {
      const missing = [!f.soOk ? "SO" : null, !f.arOk ? "AR" : null].filter(Boolean).join(" + ");
      console.log(`  Udtryk: "${f.term}" (godkendt: SO "${f.canonicalSo}" / AR "${f.canonicalAr}") — mangler i ${missing}`);
      console.log(`    - ${f.entry.source}`);
      console.log(`        DA: ${truncate(f.entry.da)}`);
      console.log(`        SO: ${truncate(f.entry.so)}`);
      console.log(`        AR: ${truncate(f.entry.ar)}`);
      console.log("");
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { loadExportedValue, collectEntries, checkExactDuplicates, checkGlossaryUsage, ROOT };
