#!/usr/bin/env node
// Retter automatisk de "sikre fund" fra check-translation-consistency.js:
// steder hvor nøjagtig samme danske sætning er oversat forskelligt til
// somali/arabisk forskellige steder på sitet. Løsningen er at vælge den
// oversættelse, der allerede bruges FLEST steder (flertal), og bruge den alle
// steder i stedet — ikke opfinde ny tekst, kun samle det, der allerede findes
// og er godkendt, til ét ensartet valg.
//
// Ved uafgjort (lige mange steder for hver variant) vælges den variant, der
// står tidligst i data-filen, som et deterministisk (ikke tilfældigt) valg.
//
// Skriver KUN til src/data/site-data.js — og kun ved en eksakt, talt tekst-
// erstatning: for hver "forkerte" variant tælles hvor mange gange den
// nøjagtige tekst optræder i filen, og det tal skal matche det antal steder,
// scriptet selv har fundet den — ellers springes den erstatning over og
// flages, i stedet for at gætte og risikere at ramme et sted, den ikke burde.
//
// Brug: node scripts/fix-translation-duplicates.js

const fs = require("fs");
const path = require("path");
const { collectEntries, checkExactDuplicates, ROOT } = require("./check-translation-consistency");

function jsonLit(value) {
  return JSON.stringify(value ?? "");
}

function pickCanonical(group, field) {
  const counts = new Map();
  const firstIndexOf = new Map();
  group.forEach((entry, i) => {
    const val = (entry[field] || "").trim();
    counts.set(val, (counts.get(val) || 0) + 1);
    if (!firstIndexOf.has(val)) firstIndexOf.set(val, i);
  });
  let best = null;
  for (const [val, count] of counts) {
    if (
      best === null ||
      count > best.count ||
      (count === best.count && firstIndexOf.get(val) < firstIndexOf.get(best.val))
    ) {
      best = { val, count };
    }
  }
  return best.val;
}

// Finder start/slut i filteksten for hver medicins eget JSON-blok (fra
// "{ "slug": "..." til lige før næste medicins "{ "slug": "..."). En
// erstatning afgrænset til én medicins egen blok kan aldrig ved et uheld
// ramme en helt anden, urelateret medicin, der tilfældigvis bruger samme
// korte frase et andet sted i filen (fx en generisk sætning som "sikker
// og kort" brugt som badge-tekst for flere forskellige medicin).
function getMedicineBlocks(src) {
  const re = /\n {4}\{\n {6}"slug": "([a-z0-9_]+)"/g;
  const blocks = [];
  let m;
  while ((m = re.exec(src))) blocks.push({ slug: m[1], start: m.index });
  for (let i = 0; i < blocks.length; i++) {
    blocks[i].end = i + 1 < blocks.length ? blocks[i + 1].start : src.length;
  }
  return blocks;
}

function main() {
  const { entries } = collectEntries();
  const findings = checkExactDuplicates(entries);

  const filePath = path.join(ROOT, "src/data/site-data.js");
  const src = fs.readFileSync(filePath, "utf8");
  const blocks = getMedicineBlocks(src);
  const blockTextBySlug = new Map(blocks.map((b) => [b.slug, src.slice(b.start, b.end)]));

  const applied = [];
  const skipped = [];

  for (const f of findings) {
    for (const field of ["so", "ar"]) {
      const canonical = pickCanonical(f.group, field);
      for (const entry of f.group) {
        const current = (entry[field] || "").trim();
        if (current === canonical || !current) continue;

        const slug = entry.source.split(" › ")[0];
        if (!blockTextBySlug.has(slug)) {
          skipped.push({ source: entry.source, field, current, reason: "ukendt kilde (ikke en medicin-blok)" });
          continue;
        }

        const oldLit = jsonLit(current);
        const newLit = jsonLit(canonical);
        const blockText = blockTextBySlug.get(slug);
        const occurrences = blockText.split(oldLit).length - 1;
        // Inden for ÉN medicins egen blok skal denne præcise tekst kun stå
        // ét sted for dette felt — står den der 0 eller 2+ gange, er noget
        // uventet, og erstatningen springes over frem for at gætte.
        if (occurrences !== 1) {
          skipped.push({ source: entry.source, field, current, reason: `fandt ${occurrences} forekomster i ${slug}s egen blok, forventede 1` });
          continue;
        }
        blockTextBySlug.set(slug, blockText.split(oldLit).join(newLit));
        applied.push({ source: entry.source, field, from: current, to: canonical });
      }
    }
  }

  const newSrc = src.slice(0, blocks[0].start) + blocks.map((b) => blockTextBySlug.get(b.slug)).join("") + src.slice(blocks[blocks.length - 1].end);
  fs.writeFileSync(filePath, newSrc, "utf8");

  console.log(`${applied.length} rettelser anvendt i src/data/site-data.js.\n`);
  for (const a of applied) {
    if (a.from === a.to) continue;
    console.log(`  ${a.source} (${a.field.toUpperCase()})`);
    console.log(`    FØR: ${a.from}`);
    console.log(`    NU:  ${a.to}`);
    console.log("");
  }

  if (skipped.length > 0) {
    console.log(`${skipped.length} sprunget over (skal tjekkes manuelt):\n`);
    for (const s of skipped) {
      console.log(`  ${s.source} (${s.field.toUpperCase()}) — ${s.reason}`);
      console.log(`    ${s.current}`);
    }
  }
}

main();
