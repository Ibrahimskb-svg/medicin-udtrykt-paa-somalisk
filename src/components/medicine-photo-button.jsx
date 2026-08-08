"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { matchMedicineFromText } from "../lib/medicine-photo-match";

function CameraIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

// Logger et OCR-scan uden match til samme GA4-event som "søgning uden
// resultat" (site-index.jsx) — så et fotograferet, ukendt lægemiddel dukker op
// i det samme live-panel på dashboardet, og fodrer den samme prioriterings-liste
// over hvad der bør tilføjes næste gang.
function reportNoMatch(ocrText) {
  const term = (ocrText || "").trim().slice(0, 60).toLowerCase();
  if (!term) return;
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "search_no_results", { search_term: `📷 ${term}` });
  }
}

export function MedicinePhotoButton({ language, text = {} }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | processing | not-found | error
  const isRtl = language === "ar";

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setStatus("processing");
    try {
      // Tesseract's worker fails to decode a raw File in some environments
      // ("Error attempting to read image") — a data URL is the input format
      // it handles reliably everywhere.
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Selv-hostede worker/core-filer i stedet for bundlerens auto-pakkede
      // udgave — Turbopack pakkede Tesseracts worker forkert ("Error
      // attempting to read image"), så vi peger direkte på de officielle,
      // uændrede filer fra pakken (kopieret til /public/tesseract i build).
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(dataUrl, "eng", {
        workerPath: "/tesseract/worker.min.js",
        corePath: "/tesseract/tesseract-core-simd-lstm.wasm.js",
      });
      const match = matchMedicineFromText(data.text);

      if (match) {
        router.push(`/${match.slug}?lang=${language}`);
        setStatus("idle");
      } else {
        reportNoMatch(data.text);
        setStatus("not-found");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "processing"}
        aria-label={text.photoLabel}
        title={text.photoLabel}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:scale-95 disabled:cursor-wait"
        style={{
          background: status === "processing" ? "var(--accent)" : "var(--bg)",
          color: status === "processing" ? "#fff" : "var(--accent)",
          boxShadow: status === "processing" ? "0 2px 12px color-mix(in srgb, var(--accent) 45%, transparent)" : "none",
        }}
      >
        {status === "processing" ? (
          <span
            aria-hidden="true"
            className="block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
            style={{ animation: "sm-photo-spin 0.7s linear infinite" }}
          />
        ) : (
          <CameraIcon />
        )}
      </button>

      {status === "not-found" && (
        <div
          role="status"
          dir={isRtl ? "rtl" : "ltr"}
          className="absolute top-11 z-30 w-64 rounded-2xl border bg-white p-3.5 shadow-xl"
          style={{ borderColor: "var(--accent)", ...(isRtl ? { left: 0 } : { right: 0 }) }}
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs" style={{ background: "var(--bg)", color: "var(--accent)" }}>
              📷
            </span>
            <p className="text-[13px] font-bold leading-tight" style={{ color: "var(--text)" }}>
              {text.photoNotFoundTitle}
            </p>
          </div>
          <p className="text-[12px] leading-snug" style={{ color: "var(--text-muted)" }}>
            {text.photoNotFoundBody}
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-2.5 text-[11.5px] font-bold uppercase tracking-wide"
            style={{ color: "var(--accent)" }}
          >
            {text.clearFilters}
          </button>
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          dir={isRtl ? "rtl" : "ltr"}
          className="absolute top-11 z-30 w-max max-w-[220px] rounded-lg px-3 py-2 text-xs font-medium leading-snug shadow-lg"
          style={{ background: "#1a1a1a", color: "#fff", ...(isRtl ? { left: 0 } : { right: 0 }) }}
        >
          {text.photoErrorGeneric}
        </div>
      )}

      <style>{`
        @keyframes sm-photo-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
