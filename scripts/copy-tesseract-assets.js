// Kører automatisk før hver build/dev (se package.json). Kopierer Tesseracts
// egne, uændrede worker- og WASM-motor-filer fra node_modules til /public,
// så de serveres som statiske filer i stedet for at blive pakket af
// Turbopack/webpack — bundleren pakkede workeren forkert og gav runtime-fejlen
// "Error attempting to read image" for enhver, der brugte foto-scan-funktionen.
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const DEST_DIR = path.join(REPO_ROOT, "public", "tesseract");

const FILES = [
  { from: "tesseract.js/dist/worker.min.js", to: "worker.min.js" },
  { from: "tesseract.js-core/tesseract-core-simd-lstm.wasm.js", to: "tesseract-core-simd-lstm.wasm.js" },
  { from: "tesseract.js-core/tesseract-core-simd-lstm.wasm", to: "tesseract-core-simd-lstm.wasm" },
];

fs.mkdirSync(DEST_DIR, { recursive: true });

for (const { from, to } of FILES) {
  fs.copyFileSync(path.join(REPO_ROOT, "node_modules", from), path.join(DEST_DIR, to));
}

console.log(`Tesseract-assets kopieret til public/tesseract (${FILES.length} filer).`);
