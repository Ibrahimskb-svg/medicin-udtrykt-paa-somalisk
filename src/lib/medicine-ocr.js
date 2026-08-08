// Fælles OCR-pipeline for både enkelt-scan (medicine-photo-button.jsx) og
// serie-scan (batch-scan-panel.jsx) — samme forbehandling, samme
// Tesseract-opsætning og samme matching, ét sted, så de to indgangspunkter
// aldrig kan gå ud af trit med hinanden (denne pipeline har allerede haft to
// rigtige rettelser undervejs — Turbopack-workaround og Panadol-aliasset).
import { matchMedicineFromText } from "./medicine-photo-match";

const MAX_DIM = 1600;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Rigtige foto af medicinæsker (genskin, vinkler, små skrifttyper, logoer) er
// langt sværere for OCR at læse end en ren, plan tekstplakat. Gråtoner +
// kontrastforstærkning før genkendelsen er en veldokumenteret måde at forbedre
// Tesseracts nøjagtighed på den slags "rigtige" billeder — samt at skalere
// meget store mobilfotos ned, hvilket både er hurtigere og ofte mere præcist,
// end at lade OCR'en arbejde på fulde 12MP-billeder.
async function preprocessForOCR(dataUrl) {
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const px = imageData.data;

  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < gray.length; i += 1) {
    const o = i * 4;
    gray[i] = 0.299 * px[o] + 0.587 * px[o + 1] + 0.114 * px[o + 2];
  }

  let min = 255;
  let max = 0;
  for (let i = 0; i < gray.length; i += 1) {
    if (gray[i] < min) min = gray[i];
    if (gray[i] > max) max = gray[i];
  }
  const range = max - min || 1;

  for (let i = 0; i < gray.length; i += 1) {
    const stretched = ((gray[i] - min) / range) * 255;
    const o = i * 4;
    px[o] = stretched;
    px[o + 1] = stretched;
    px[o + 2] = stretched;
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL("image/png");
}

// Tager en billed-File (fra <input type="file" capture="environment">) og
// returnerer { match, text } — match er { slug, alias } eller null.
export async function recognizeMedicineFromFile(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const processedDataUrl = await preprocessForOCR(dataUrl);

  // Selv-hostede worker/core-filer i stedet for bundlerens auto-pakkede
  // udgave — Turbopack pakkede Tesseracts worker forkert ("Error attempting
  // to read image"), så vi peger direkte på de officielle, uændrede filer fra
  // pakken (kopieret til /public/tesseract i build).
  const Tesseract = (await import("tesseract.js")).default;
  const { data } = await Tesseract.recognize(processedDataUrl, "eng", {
    workerPath: "/tesseract/worker.min.js",
    corePath: "/tesseract/tesseract-core-simd-lstm.wasm.js",
  });

  return { match: matchMedicineFromText(data.text), text: data.text };
}

// Logger et OCR-scan uden match til samme GA4-event som "søgning uden
// resultat" (site-index.jsx) — så et fotograferet, ukendt lægemiddel dukker op
// i det samme live-panel på dashboardet, uanset om det kom fra enkelt- eller
// serie-scan.
export function reportNoMatch(ocrText) {
  const term = (ocrText || "").trim().slice(0, 60).toLowerCase();
  console.info("[medicine-photo] Intet match. OCR læste:", JSON.stringify(ocrText));
  if (!term) return;
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "search_no_results", { search_term: `📷 ${term}` });
  }
}
