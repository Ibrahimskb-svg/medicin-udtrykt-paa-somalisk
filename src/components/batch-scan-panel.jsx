"use client";
import { useRef, useState } from "react";
import { getIndexData, getDisplayName } from "../lib/site";
import { addToMyList } from "../lib/my-list";
import { recognizeMedicineFromFile, reportNoMatch } from "../lib/medicine-ocr";
import { LANG_THEME } from "./modal-shell";

const MAX_SCANS = 5;
const indexData = getIndexData();

const TEXTS = {
  da: {
    startTitle: "Scan flere æsker på én gang",
    startIntro: "Tag billeder af dine æsker én efter én — hver genkendt æske bliver automatisk tilføjet til listen, i den rækkefølge du scanner dem.",
    step: (n, max) => `Æske ${n} af ${max}`,
    captureBtn: "Tag foto",
    nextBtn: "Scan næste æske",
    processing: "Læser æsken…",
    foundSuffix: "— tilføjet til listen",
    notFound: "Ikke genkendt — gå videre til næste",
    error: "Kunne ikke læse billedet — gå videre til næste",
    doneBtn: "Færdig",
    maxReached: "Du har nået grænsen på 5 æsker for én omgang.",
    summary: (n) => `${n} ${n === 1 ? "æske" : "æsker"} tilføjet til listen.`,
  },
  en: {
    startTitle: "Scan multiple boxes at once",
    startIntro: "Take photos of your boxes one at a time — each recognized box is added to the list automatically, in the order you scan them.",
    step: (n, max) => `Box ${n} of ${max}`,
    captureBtn: "Take photo",
    nextBtn: "Scan next box",
    processing: "Reading the box…",
    foundSuffix: "— added to the list",
    notFound: "Not recognized — continue to the next one",
    error: "Couldn't read the photo — continue to the next one",
    doneBtn: "Done",
    maxReached: "You've reached the limit of 5 boxes per round.",
    summary: (n) => `${n} ${n === 1 ? "box" : "boxes"} added to the list.`,
  },
  so: {
    startTitle: "Sawir dhowr baakadood oo daawo mar keliya",
    startIntro: "Sawir baakadaha midba mid — baakad kasta oo la aqoonsado waxaa si toos ah loogu darayaa liiska, sida aad u sawirto.",
    step: (n, max) => `Baakad ${n} ee ${max}`,
    captureBtn: "Qaado sawir",
    nextBtn: "Sawir baakadda xigta",
    processing: "Baakadda waa la akhrinayaa…",
    foundSuffix: "— waa lagu daray liiska",
    notFound: "Lama aqoonsan — sii wad tan xigta",
    error: "Sawirka lama akhrin karin — sii wad tan xigta",
    doneBtn: "Dhammayso",
    maxReached: "Waxaad gaartay xadka 5 baakadood ee hal wareeg.",
    summary: (n) => `${n} baakadood ayaa lagu daray liiska.`,
  },
  ar: {
    startTitle: "مسح عدة علب دفعة واحدة",
    startIntro: "التقط صورًا لعلبك واحدة تلو الأخرى — تُضاف كل علبة يتم التعرف عليها تلقائيًا إلى القائمة، بحسب ترتيب التصوير.",
    step: (n, max) => `العلبة ${n} من ${max}`,
    captureBtn: "التقاط صورة",
    nextBtn: "تصوير العلبة التالية",
    processing: "جارٍ قراءة العلبة…",
    foundSuffix: "— أُضيفت إلى القائمة",
    notFound: "لم يتم التعرف عليها — الانتقال إلى التالية",
    error: "تعذّرت قراءة الصورة — الانتقال إلى التالية",
    doneBtn: "إنهاء",
    maxReached: "بلغت الحد الأقصى وهو 5 علب لكل جولة.",
    summary: (n) => `تمت إضافة ${n} ${n === 1 ? "علبة" : "علب"} إلى القائمة.`,
  },
};

function StatusIcon({ status }) {
  if (status === "processing") {
    return <span aria-hidden="true" className="batch-scan-spinner" style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", border: "2px solid #cbd5e1", borderTopColor: "#0D9488", animation: "sm-batch-spin 0.7s linear infinite", flexShrink: 0 }} />;
  }
  if (status === "found") return <span aria-hidden="true" style={{ flexShrink: 0 }}>✅</span>;
  if (status === "not-found") return <span aria-hidden="true" style={{ flexShrink: 0 }}>➖</span>;
  return <span aria-hidden="true" style={{ flexShrink: 0 }}>⚠️</span>;
}

// Serie-scan: brugeren tager billeder ét ad gangen, i rækkefølge — hvert
// resultat (fundet/ikke fundet/fejl) dukker op med det samme i den
// kronologiske liste nedenfor, og et fundet lægemiddel tilføjes til "Min
// medicinliste" (addToMyList) i samme øjeblik det genkendes, ikke først når
// hele serien er færdig. Da MyListModal allerede lytter på listen via
// subscribeMyList, opdateres "Din liste" og interaktionstjekket automatisk og
// løbende, efterhånden som æsker scannes — uden noget separat "kør tjek"-trin.
export function BatchScanPanel({ language }) {
  const isRtl = language === "ar";
  const theme = LANG_THEME[language] ?? LANG_THEME.so;
  const t = TEXTS[language] ?? TEXTS.so;
  const inputRef = useRef(null);
  const [active, setActive] = useState(false);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);

  const addedCount = results.filter((r) => r.status === "found").length;
  const reachedMax = results.length >= MAX_SCANS;
  const stepNumber = busy ? results.length : Math.min(results.length + 1, MAX_SCANS);

  function start() {
    setActive(true);
    setResults([]);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || busy || reachedMax) return;

    const entryId = results.length;
    setResults((prev) => [...prev, { id: entryId, status: "processing" }]);
    setBusy(true);

    try {
      const { match, text } = await recognizeMedicineFromFile(file);
      if (match) {
        addToMyList(match.slug);
        const item = indexData.items.find((i) => i.slug === match.slug);
        const name = item ? getDisplayName(match.slug, language, item.name) : match.slug;
        setResults((prev) => prev.map((r) => (r.id === entryId ? { ...r, status: "found", name } : r)));
      } else {
        reportNoMatch(text);
        setResults((prev) => prev.map((r) => (r.id === entryId ? { ...r, status: "not-found" } : r)));
      }
    } catch {
      setResults((prev) => prev.map((r) => (r.id === entryId ? { ...r, status: "error" } : r)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginBottom: "22px" }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />

      {!active ? (
        <button
          type="button"
          onClick={start}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px",
            padding: "13px 16px", borderRadius: "14px", border: "1.5px dashed #94a3b8",
            background: "#f8fafc", cursor: "pointer", textAlign: isRtl ? "right" : "left",
          }}
        >
          <span aria-hidden="true" style={{ fontSize: "18px", flexShrink: 0 }}>📷</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>{t.startTitle}</span>
            <span style={{ display: "block", fontSize: "12.5px", color: "#64748b", marginTop: "2px", lineHeight: 1.5 }}>{t.startIntro}</span>
          </span>
        </button>
      ) : (
        <div style={{ borderRadius: "14px", border: `1.5px solid ${theme.border}`, background: theme.soft, padding: "14px" }}>
          <p style={{ fontWeight: 700, fontSize: "13px", color: theme.primary, margin: "0 0 10px", textAlign: isRtl ? "right" : "left" }}>
            {reachedMax ? t.maxReached : t.step(stepNumber, MAX_SCANS)}
          </p>

          {results.length > 0 && (
            <ul style={{ listStyle: "none", margin: "0 0 12px", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {results.map((r, i) => (
                <li key={r.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155", textAlign: isRtl ? "right" : "left" }}>
                  <span style={{ width: 16, flexShrink: 0, color: "#94a3b8", fontSize: "11.5px", fontWeight: 700 }}>{i + 1}.</span>
                  <StatusIcon status={r.status} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    {r.status === "processing" && t.processing}
                    {r.status === "found" && (
                      <>
                        <strong>{r.name}</strong> {t.foundSuffix}
                      </>
                    )}
                    {r.status === "not-found" && t.notFound}
                    {r.status === "error" && t.error}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            {!reachedMax && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                style={{
                  flex: 1, padding: "11px 14px", borderRadius: "12px", border: "none",
                  background: busy ? "#cbd5e1" : theme.primary, color: "#fff",
                  fontWeight: 700, fontSize: "13.5px", cursor: busy ? "wait" : "pointer",
                }}
              >
                {busy ? t.processing : results.length === 0 ? t.captureBtn : t.nextBtn}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActive(false)}
              disabled={busy}
              style={{
                padding: "11px 14px", borderRadius: "12px", border: "1.5px solid #cbd5e1",
                background: "#fff", color: "#475569", fontWeight: 700, fontSize: "13.5px",
                cursor: busy ? "wait" : "pointer",
              }}
            >
              {t.doneBtn}
            </button>
          </div>

          {addedCount > 0 && (
            <p style={{ fontSize: "12px", color: theme.primary, fontWeight: 700, margin: "10px 0 0", textAlign: isRtl ? "right" : "left" }}>
              {t.summary(addedCount)}
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes sm-batch-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
