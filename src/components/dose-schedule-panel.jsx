"use client";
import { useEffect, useState } from "react";
import { getSchedule, toggleScheduleSlot, subscribeSchedule, TIME_SLOTS } from "../lib/dose-schedule";
import { getUsualDosingHint, getSuggestedDoseSlots, hasDoctorDependentDoseNote } from "../lib/site";
import { LANG_THEME } from "./modal-shell";

const USUAL_DOSING_LABEL = {
  da: "Sædvanligvis (fra medicinens egen side)",
  en: "Usually (from the medicine's own page)",
  so: "Sida caadiga ah (ka socota bogga daawada)",
  ar: "عادة (من صفحة الدواء نفسها)",
};

// Vises kun under et FORESLÅET (endnu ikke bekræftet) tidspunkt for de få
// lægemidler, hvor Ibrahim selv har bekræftet "1-2 gange dagligt" som det
// typiske mønster, selvom medicinens egen tekst kun siger "individuel
// dosis"/"som ordineret af lægen" — se hasDoctorDependentDoseNote i
// src/lib/site.js. Arabisk er et førsteudkast, endnu ikke gennemgået af en
// modersmålstalende (samme forbehold som i src/data/counter-cards.js).
const DOCTOR_DEPENDENT_NOTE = {
  da: "Afhænger af, hvad din læge har ordineret eller aftalt med dig.",
  en: "Depends on what your doctor has prescribed or agreed with you.",
  so: "Waxay ku xiran tahay waxa dhakhtarkaagu kuu qoray ama aad ku heshiiseen.",
  ar: "يعتمد ذلك على ما وصفه لك طبيبك أو ما اتفقتما عليه.",
};

const TIME_LABELS = {
  da: { morning: "Morgen", noon: "Middag", evening: "Aften", night: "Nat" },
  en: { morning: "Morning", noon: "Noon", evening: "Evening", night: "Night" },
  so: { morning: "Subaxdii", noon: "Duhurkii", evening: "Fiidkii", night: "Habeenkii" },
  ar: { morning: "الصباح", noon: "الظهر", evening: "المساء", night: "الليل" },
};

// Hvert tidspunkt får sin egen farve og ikon — matcher dagens gang
// (solopgang → sol → solnedgang → måne), så skemaet er hurtigt at aflæse
// visuelt, ikke kun ved at læse teksten.
const TIME_SLOT_STYLE = {
  morning: { color: "#B45309", bg: "#FEF3C7", ring: "#FDE68A" },
  noon: { color: "#C2410C", bg: "#FFEDD5", ring: "#FED7AA" },
  evening: { color: "#BE185D", bg: "#FCE7F3", ring: "#FBCFE8" },
  night: { color: "#4338CA", bg: "#E0E7FF", ring: "#C7D2FE" },
};

// RGB-udgave af hver farve, brugt til den pulserende glød omkring et
// FORESLÅET (endnu ikke bekræftet) tidspunkt — kan ikke skrives som en
// fast CSS-farve i @keyframes, fordi farven skal variere pr. tidspunkt.
function hexToRgbTriplet(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : "15, 23, 42";
}
for (const slot of Object.keys(TIME_SLOT_STYLE)) {
  TIME_SLOT_STYLE[slot].rgb = hexToRgbTriplet(TIME_SLOT_STYLE[slot].color);
}

function SunriseIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v5" /><path d="m4.93 10.93 1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" />
      <path d="m19.07 10.93-1.41 1.41" /><path d="M22 22H2" /><path d="m8 6 4-4 4 4" /><path d="M16 18a4 4 0 0 0-8 0" />
    </svg>
  );
}

function SunIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5" /><path d="M12 19.5V22" /><path d="m4.2 4.2 1.8 1.8" /><path d="m18 18 1.8 1.8" />
      <path d="M2 12h2.5" /><path d="M19.5 12H22" /><path d="m4.2 19.8 1.8-1.8" /><path d="m18 6 1.8-1.8" />
    </svg>
  );
}

function SunsetIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10V2" /><path d="m4.93 10.93 1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" />
      <path d="m19.07 10.93-1.41 1.41" /><path d="M22 22H2" /><path d="m16 6-4 4-4-4" /><path d="M16 18a4 4 0 0 0-8 0" />
    </svg>
  );
}

function MoonIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

const TIME_SLOT_ICON = { morning: SunriseIcon, noon: SunIcon, evening: SunsetIcon, night: MoonIcon };

const TEXTS = {
  da: {
    title: "Doseringsskema",
    intro: "Sæt flueben ved de tidspunkter, du tager hver medicin — så får du et skema at printe og hænge op, ligesom en doseringsæske.",
    hint: "Tryk på morgen, middag, aften eller nat for den medicin, det gælder.",
    empty: "Sæt mindst ét tidspunkt ved en medicin herover for at lave dit skema.",
    freqColumnLabel: "Hvor tit",
    printBtn: "Print skema",
    pdfBtn: "Gem skema som PDF",
    printedOn: "Doseringsskema fra Somalimed.dk",
    disclaimer: "Tidspunkterne er dem, du selv har valgt — følg altid den nøjagtige anvisning fra din læge eller apoteket. Skemaet er en huskeseddel, ikke en lægefaglig anbefaling.",
  },
  en: {
    title: "Dosage schedule",
    intro: "Tick the times you take each medicine — you'll get a schedule to print and put up, just like a dosette box.",
    hint: "Tap morning, noon, evening or night for the medicine it applies to.",
    empty: "Tick at least one time for a medicine above to build your schedule.",
    freqColumnLabel: "How often",
    printBtn: "Print schedule",
    pdfBtn: "Save schedule as PDF",
    printedOn: "Dosage schedule from Somalimed.dk",
    disclaimer: "These times are the ones you've chosen yourself — always follow the exact instructions from your doctor or pharmacy. This schedule is a memory aid, not medical advice.",
  },
  so: {
    title: "Jadwalka qaadashada daawada",
    intro: "Calaamadi waqtiyada aad daawo kasta qaadato — waxaad heli doontaa jadwal aad daabici karto oo aad ku dhejin karto, sida sanduuqa doosaha daawada.",
    hint: "Riix aroor, duhur, fiid ama habeen ee daawada khuseeya.",
    empty: "Ugu yaraan calaamadi hal waqti oo daawo sare ah si aad jadwalkaaga u sameyso.",
    freqColumnLabel: "Immisa jeer",
    printBtn: "Daabac jadwalka",
    pdfBtn: "Keyd jadwalka sida PDF",
    printedOn: "Jadwalka qaadashada daawada — Somalimed.dk",
    disclaimer: "Waqtiyadan waa kuwa aad adigu doortay — had iyo jeer raac tilmaanta saxda ah ee dhakhtarkaaga ama farmashiyaha. Jadwalkani waa qalab xasuusin ah, mana aha talo caafimaad oo rasmi ah.",
  },
  ar: {
    title: "جدول الجرعات",
    intro: "ضع علامة على الأوقات التي تتناول فيها كل دواء — لتحصل على جدول يمكنك طباعته وتعليقه، تمامًا مثل علبة الجرعات.",
    hint: "اضغط على الصباح أو الظهر أو المساء أو الليل للدواء المعني.",
    empty: "ضع علامة على وقت واحد على الأقل لأحد الأدوية أعلاه لإنشاء جدولك.",
    freqColumnLabel: "عدد المرات",
    printBtn: "طباعة الجدول",
    pdfBtn: "احفظ الجدول كملف PDF",
    printedOn: "جدول الجرعات من Somalimed.dk",
    disclaimer: "هذه الأوقات هي التي اخترتها بنفسك — اتبع دائمًا التعليمات الدقيقة من طبيبك أو الصيدلية. هذا الجدول أداة مساعدة للتذكر، وليس نصيحة طبية.",
  },
};

// Gør antallet af gange dagligt eksplicit i almindeligt sprog — så et
// fejltryk eller en misforståelse (fx alle 4 tider valgt for en medicin,
// der kun tages morgen og aften) er synlig med det samme, i stedet for kun
// at kunne aflæses ved at tælle farvede ikoner.
const FREQUENCY_PHRASE = {
  da: (n) => (n === 1 ? "1 gang dagligt" : `${n} gange dagligt`),
  en: (n) => (n === 1 ? "Once daily" : n === 2 ? "Twice daily" : `${n} times daily`),
  so: (n) => (n === 1 ? "1 jeer maalintii" : `${n} jeer maalintii`),
  ar: (n) => (n === 1 ? "مرة واحدة يوميًا" : n === 2 ? "مرتين يوميًا" : `${n} مرات يوميًا`),
};

const LIST_JOIN = {
  da: { sep: ", ", and: " og " },
  en: { sep: ", ", and: " and " },
  so: { sep: ", ", and: " iyo " },
  ar: { sep: "، ", and: " و " },
};

function formatScheduleSummary(language, active, timeLabels) {
  const orderedSlots = TIME_SLOTS.filter((slot) => active.includes(slot));
  if (orderedSlots.length === 0) return null;
  const names = orderedSlots.map((slot) => timeLabels[slot]);
  const { sep, and } = LIST_JOIN[language] ?? LIST_JOIN.so;
  const list = names.length === 1 ? names[0] : names.slice(0, -1).join(sep) + and + names[names.length - 1];
  const freq = (FREQUENCY_PHRASE[language] ?? FREQUENCY_PHRASE.so)(orderedSlots.length);
  return `${freq}: ${list}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function DoseSchedulePanel({ language, isRtl, items }) {
  const theme = LANG_THEME[language] ?? LANG_THEME.so;
  const t = TEXTS[language] ?? TEXTS.so;
  const timeLabels = TIME_LABELS[language] ?? TIME_LABELS.so;
  const [schedule, setSchedule] = useState(() => getSchedule());

  useEffect(() => subscribeSchedule(setSchedule), []);

  const scheduledItems = items.filter((item) => (schedule[item.slug] || []).length > 0);

  function printSchedule() {
    const win = window.open("", "_blank", "width=520,height=640");
    if (!win) return;

    // Krydset markeres med TEKSTFARVE, ikke baggrundsfarve — browsere udelader
    // som standard baggrundsfarver ved print/gem-som-PDF (medmindre brugeren selv
    // slår "Baggrundsgrafik" til), så et farvet kryds er det eneste, der er
    // garanteret at kunne ses, uanset printerindstillinger.
    const rows = scheduledItems
      .map((item) => {
        const active = schedule[item.slug] || [];
        const cells = TIME_SLOTS.map((slot) => {
          const style = TIME_SLOT_STYLE[slot];
          const on = active.includes(slot);
          return `<td>${on ? `<span class="mark" style="color:${style.color}">X</span>` : ""}</td>`;
        }).join("");
        const summary = formatScheduleSummary(language, active, timeLabels) || "";
        return `<tr><th>${escapeHtml(item.name)}</th>${cells}<td class="freq">${escapeHtml(summary)}</td></tr>`;
      })
      .join("");
    const headerCells = TIME_SLOTS.map((slot) => {
      const style = TIME_SLOT_STYLE[slot];
      return `<th style="color:${style.color}">${escapeHtml(timeLabels[slot])}</th>`;
    }).join("") + `<th>${escapeHtml(t.freqColumnLabel)}</th>`;

    win.document.write(`
      <html><head><title>${t.title}</title>
      <meta charset="utf-8">
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:28px;color:#0f172a;direction:${isRtl ? "rtl" : "ltr"};}
        h1{font-size:23px;margin:0 0 4px;color:${theme.primary};}
        p.sub{font-size:13px;color:#64748b;margin:0 0 24px;}
        table{width:100%;border-collapse:collapse;}
        th,td{border:2px solid #cbd5e1;padding:16px 10px;text-align:center;font-size:16px;}
        th:first-child{text-align:${isRtl ? "right" : "left"};font-size:17px;font-weight:800;color:#0f172a;}
        thead th{font-weight:800;font-size:16px;border-bottom:3px solid #cbd5e1;}
        .mark{font-weight:900;font-size:32px;line-height:1;}
        .freq{font-size:13.5px;font-weight:700;color:${theme.primary};text-align:${isRtl ? "right" : "left"};}
        th:last-child{color:#0f172a;}
        footer{margin-top:22px;font-size:11px;color:#5B6B80;line-height:1.6;}
        @media print{ body{-webkit-print-color-adjust:exact;print-color-adjust:exact;} }
      </style>
      </head><body>
        <h1>${t.title}</h1>
        <p class="sub">${t.printedOn}</p>
        <table>
          <thead><tr><th></th>${headerCells}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <footer>${escapeHtml(t.disclaimer)}</footer>
        <script>window.onload=function(){window.print();};</script>
      </body></html>
    `);
    win.document.close();
  }

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [15, 23, 42];
  }

  async function saveSchedulePdf() {
    const { default: jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 40;
    const align = isRtl ? "right" : "left";
    const primaryRgb = hexToRgb(theme.primary);
    const softRgb = hexToRgb(theme.soft);

    pdf.setFillColor(...softRgb);
    pdf.rect(0, 0, pageWidth, 76, "F");
    pdf.setTextColor(...primaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.text(t.title, isRtl ? pageWidth - margin : margin, 40, { align });
    pdf.setTextColor(100, 116, 139);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(t.printedOn, isRtl ? pageWidth - margin : margin, 58, { align });

    const tableTop = 100;
    const nameColWidth = 160;
    const tableWidth = pageWidth - margin * 2;
    const slotColWidth = (tableWidth - nameColWidth) / TIME_SLOTS.length;
    const headerRowHeight = 40;
    const rowHeight = 58; // højere end header-rækken, så navn + "hvor tit"-linje begge er der plads til, og i stor skrift
    const nameColX = isRtl ? pageWidth - margin - nameColWidth : margin;
    const slotsStartX = isRtl ? margin : margin + nameColWidth;

    // Header row — hver kolonne får sin egen tidspunkt-farve (samme som knapperne i UI'en)
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1.2);
    pdf.rect(margin, tableTop, tableWidth, headerRowHeight, "S");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13.5);
    TIME_SLOTS.forEach((slot, i) => {
      const colX = isRtl ? slotsStartX + tableWidth - nameColWidth - (i + 1) * slotColWidth : slotsStartX + i * slotColWidth;
      const slotRgb = hexToRgb(TIME_SLOT_STYLE[slot].bg);
      const slotTextRgb = hexToRgb(TIME_SLOT_STYLE[slot].color);
      pdf.setFillColor(...slotRgb);
      pdf.rect(colX, tableTop, slotColWidth, headerRowHeight, "F");
      pdf.setTextColor(...slotTextRgb);
      pdf.text(timeLabels[slot], colX + slotColWidth / 2, tableTop + headerRowHeight / 2 + 5, { align: "center" });
    });

    let y = tableTop + headerRowHeight;
    scheduledItems.forEach((item, rowIndex) => {
      const active = schedule[item.slug] || [];
      pdf.setFillColor(rowIndex % 2 === 0 ? 255 : 250, rowIndex % 2 === 0 ? 255 : 250, rowIndex % 2 === 0 ? 255 : 251);
      pdf.rect(margin, y, tableWidth, rowHeight, "F");
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(margin, y, tableWidth, rowHeight, "S");

      pdf.setTextColor(15, 23, 42);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14.5);
      const nameLines = pdf.splitTextToSize(item.name, nameColWidth - 16);
      pdf.text(nameLines[0], isRtl ? nameColX + nameColWidth - 8 : nameColX + 8, y + rowHeight / 2 - 6, { align });

      // "Hvor tit"-linje — samme tekst som under vælgeren på selve siden, så
      // antallet af gange dagligt aldrig kun kan aflæses ved at tælle X'er.
      // Ingen rød advarsel her — nogle medicin (fx Paracetamol) er helt
      // normalt 4x dagligt, andre ikke, og det kan appen ikke sikkert
      // vurdere pr. medicin, så teksten forbliver neutral for alle antal.
      const freqText = (FREQUENCY_PHRASE[language] ?? FREQUENCY_PHRASE.so)(active.length);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(freqText, isRtl ? nameColX + nameColWidth - 8 : nameColX + 8, y + rowHeight / 2 + 16, { align });

      TIME_SLOTS.forEach((slot, i) => {
        const colX = isRtl ? slotsStartX + tableWidth - nameColWidth - (i + 1) * slotColWidth : slotsStartX + i * slotColWidth;
        pdf.setDrawColor(226, 232, 240);
        pdf.line(colX, y, colX, y + rowHeight);
        if (active.includes(slot)) {
          // Almindeligt "X" i stedet for et checkmark-symbol — jsPDF's
          // standardskrifttype understøtter ikke ✓/✕ korrekt (viser tilfældige
          // tegn i stedet), men et almindeligt bogstav er altid pålideligt.
          const slotRgb = hexToRgb(TIME_SLOT_STYLE[slot].color);
          pdf.setTextColor(...slotRgb);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(22);
          pdf.text("X", colX + slotColWidth / 2, y + rowHeight / 2 + 8, { align: "center" });
        }
      });

      y += rowHeight;
    });

    y += 20;
    pdf.setTextColor(148, 163, 184);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    const disclaimerLines = pdf.splitTextToSize(t.disclaimer, pageWidth - margin * 2);
    pdf.text(disclaimerLines, isRtl ? pageWidth - margin : margin, y, { align });

    pdf.save("Somalimed-doseringsskema.pdf");
  }

  return (
    <div style={{ marginBottom: "22px" }}>
      <p style={{ fontWeight: 700, fontSize: "13px", color: "#5B6B80", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px", textAlign: isRtl ? "right" : "left" }}>
        {t.title}
      </p>
      <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: 1.6, margin: "0 0 14px", textAlign: isRtl ? "right" : "left" }}>
        {t.intro}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
        {items.map((item) => {
          const active = schedule[item.slug] || [];
          // Kun foreslå et tidspunkt, før brugeren selv har valgt noget for
          // denne medicin — så snart brugeren har valgt mindst ét, vises kun
          // det, uden forslag ved siden af.
          const suggested = active.length === 0 ? getSuggestedDoseSlots(item.slug) : [];
          return (
            <div
              key={item.slug}
              style={{
                padding: "16px 16px", borderRadius: "18px", border: "1.5px solid #e2e8f0", background: "#fff",
              }}
            >
              <span style={{ display: "block", fontWeight: 800, fontSize: "16px", color: "#0f172a", marginBottom: "4px", textAlign: isRtl ? "right" : "left" }}>
                {item.name}
              </span>
              {(() => {
                const hint = getUsualDosingHint(item.slug, language);
                if (!hint) return null;
                return (
                  <p style={{ margin: "0 0 12px", fontSize: "12px", lineHeight: 1.5, color: "#64748b", textAlign: isRtl ? "right" : "left" }}>
                    <span style={{ fontWeight: 700 }}>{USUAL_DOSING_LABEL[language] ?? USUAL_DOSING_LABEL.so}:</span> {hint}
                  </p>
                );
              })()}
              <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
                {TIME_SLOTS.map((slot) => {
                  const on = active.includes(slot);
                  // Et "foreslået" tidspunkt kommer direkte fra medicinens
                  // egen doseringstekst ovenfor (fx "tages som regel én gang
                  // dagligt") — ikke et gæt. Det skal fange blikket ligesom
                  // et bekræftet valg (samme mættede farve), men en stiplet
                  // kant + en blid pulserende glød viser tydeligt, at det er
                  // et forslag, brugeren selv skal bekræfte med et tryk.
                  const suggestedHere = !on && suggested.includes(slot);
                  const style = TIME_SLOT_STYLE[slot];
                  const Icon = TIME_SLOT_ICON[slot];
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleScheduleSlot(item.slug, slot)}
                      aria-pressed={on}
                      className="hover-lift"
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                        flex: 1, padding: "10px 4px 8px", borderRadius: "16px",
                        border: suggestedHere ? `2px dashed ${style.color}` : "none",
                        background: on || suggestedHere ? style.bg : "transparent",
                        boxShadow: on ? `inset 0 0 0 2px ${style.ring}` : "none",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 52, height: 52, borderRadius: "50%",
                          background: on || suggestedHere ? style.color : "#f1f5f9",
                          border: on || suggestedHere ? "none" : "1.5px solid #e2e8f0",
                          color: "#fff",
                          transition: "all 0.15s ease",
                          ...(suggestedHere
                            ? { "--sm-pulse-rgb": style.rgb, animation: "smDoseSuggestPulse 1.7s ease-in-out infinite" }
                            : {}),
                        }}
                      >
                        <Icon size={26} color={on || suggestedHere ? "#fff" : "#94a3b8"} />
                      </span>
                      <span style={{ fontSize: "13.5px", fontWeight: 800, color: on || suggestedHere ? style.color : "#5B6B80" }}>
                        {timeLabels[slot]}
                      </span>
                    </button>
                  );
                })}
              </div>
              {active.length === 0 && suggested.length > 0 && hasDoctorDependentDoseNote(item.slug) && (
                <p style={{ margin: "8px 0 0", fontSize: "11.5px", fontStyle: "italic", color: "#94a3b8", textAlign: isRtl ? "right" : "left" }}>
                  {DOCTOR_DEPENDENT_NOTE[language] ?? DOCTOR_DEPENDENT_NOTE.so}
                </p>
              )}
              {(() => {
                // Ingen automatisk "for mange gange"-advarsel her — nogle
                // medicin (fx Paracetamol, op til 4x dagligt) er helt normalt
                // valgt 4 gange, andre (fx blodtryksmedicin) er det ikke. Det
                // kan appen ikke sikkert vurdere pr. medicin, så teksten viser
                // altid bare tydeligt hvad brugeren selv har valgt, neutralt.
                const summary = formatScheduleSummary(language, active, timeLabels);
                if (!summary) return null;
                return (
                  <p
                    style={{
                      margin: "10px 0 0", fontSize: "12.5px", fontWeight: 700,
                      color: theme.primary,
                      textAlign: isRtl ? "right" : "left",
                    }}
                  >
                    {`→ ${summary}`}
                  </p>
                );
              })()}
            </div>
          );
        })}
      </div>

      {scheduledItems.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#5B6B80", margin: "0 0 14px", textAlign: isRtl ? "right" : "left" }}>{t.empty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
          <button
            type="button"
            onClick={printSchedule}
            className="hover-lift"
            style={{
              width: "100%", padding: "13px 18px", borderRadius: "14px", border: "none",
              background: theme.primary, color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer",
            }}
          >
            {t.printBtn}
          </button>
          <button
            type="button"
            onClick={saveSchedulePdf}
            className="hover-lift"
            style={{
              width: "100%", padding: "13px 18px", borderRadius: "14px",
              border: `1.5px solid ${theme.primary}`, background: "#fff", color: theme.primary,
              fontWeight: 700, fontSize: "14px", cursor: "pointer",
            }}
          >
            {t.pdfBtn}
          </button>
        </div>
      )}

      <p style={{ fontSize: "11px", color: "#5B6B80", lineHeight: 1.6, margin: 0, textAlign: isRtl ? "right" : "left" }}>
        {t.disclaimer}
      </p>

      <style>{`
        @keyframes smDoseSuggestPulse {
          0%   { box-shadow: 0 0 0 0 rgba(var(--sm-pulse-rgb), 0.5); }
          70%  { box-shadow: 0 0 0 9px rgba(var(--sm-pulse-rgb), 0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--sm-pulse-rgb), 0); }
        }
      `}</style>
    </div>
  );
}
