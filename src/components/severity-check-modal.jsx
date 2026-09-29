"use client";
import { useMemo, useState } from "react";
import { getIndexData, getMedicine, getDisplayName } from "../lib/site";
import { ModalShell, LANG_THEME } from "./modal-shell";

const indexData = getIndexData();

// Samme farvesprog som isku-dar-tjekket i Min medicinliste (grøn/orange/rød),
// genbrugt her så sitet føles ét sammenhængende system, ikke to forskellige.
const LEVEL_COLORS = {
  green: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", ring: "#16a34a" },
  orange: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", ring: "#ea580c" },
  red: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", ring: "#dc2626" },
};

const TEXTS = {
  da: {
    title: "Er dette alvorligt?",
    intro: "Skriv det du mærker, så viser jeg om det står nævnt som en almindelig bivirkning eller en advarsel for nogen af de 25 medicin på sitet — uanset om du har tilføjet dem til din liste.",
    introScoped: (name) => `Skriv det du mærker, så viser jeg om det står nævnt som en almindelig bivirkning eller en advarsel for ${name}.`,
    placeholder: "Skriv et symptom…",
    emergencyTitle: "Ring 112 med det samme hvis du oplever:",
    emergencyItems: [
      "Åndenød eller svær vejrtrækning",
      "Smerter eller tryk i brystet",
      "Pludselig hævelse i ansigt, læber, tunge eller hals",
      "Bevidstløshed eller besvimelse",
      "Kraftig blødning der ikke stopper",
    ],
    sideLabel: "Almindelig bivirkning",
    warnLabel: "Advarsel — kontakt læge/apotek",
    noMatch: "Ikke fundet i vores tekster — det betyder IKKE at det er ufarligt. Kontakt altid apoteket eller lægen, hvis du er bekymret.",
    disclaimer: "Dette er ikke en diagnose eller en akut-vurdering — brug det som udgangspunkt for en samtale med apoteket eller lægen. Ved tvivl om noget akut: ring altid 112.",
    close: "Luk",
  },
  en: {
    title: "Is this serious?",
    intro: "Type what you're feeling, and I'll show whether it's mentioned as a common side effect or a warning for any of the 25 medicines on the site — whether or not you've added them to your list.",
    introScoped: (name) => `Type what you're feeling, and I'll show whether it's mentioned as a common side effect or a warning for ${name}.`,
    placeholder: "Type a symptom…",
    emergencyTitle: "Call 112 immediately if you experience:",
    emergencyItems: [
      "Shortness of breath or severe difficulty breathing",
      "Pain or pressure in the chest",
      "Sudden swelling of the face, lips, tongue, or throat",
      "Loss of consciousness or fainting",
      "Heavy bleeding that won't stop",
    ],
    sideLabel: "Common side effect",
    warnLabel: "Warning — contact doctor/pharmacy",
    noMatch: "Not found in our texts — this does NOT mean it's harmless. Always contact the pharmacy or doctor if you're worried.",
    disclaimer: "This is not a diagnosis or an emergency assessment — use it as a starting point for a conversation with the pharmacy or doctor. If in doubt about an emergency: always call 112.",
    close: "Close",
  },
  so: {
    title: "Tani ma halis ah?",
    intro: "Qor waxa aad dareemayso, waxaan ku tusi doonaa haddii ay ku qoran tahay sidii waxyeello caadi ah ama digniin la xiriirta mid ka mid ah 25-ka daawo ee bogga — xitaa haddii aanad liiskaaga ku darin.",
    introScoped: (name) => `Qor waxa aad dareemayso, waxaan ku tusi doonaa haddii ay ku qoran tahay sidii waxyeello caadi ah ama digniin la xiriirta ${name}.`,
    placeholder: "Qor calaamad…",
    emergencyTitle: "Isla markiiba wac 112 haddii aad qabto:",
    emergencyItems: [
      "Neefta oo ku adkaata ama aan si fiican u neefsan karin",
      "Xanuun ama cadaadis laabta ah",
      "Barar kedis ah oo ka yimaada wejiga, bushimaha, carrabka ama cunaha",
      "Miyir-beel ama suuxid",
      "Dhiig-bax xoog leh oo aan joogsan",
    ],
    sideLabel: "Waxyeello caadi ah",
    warnLabel: "Digniin — la xiriir dhakhtar/farmashiye",
    noMatch: "Kuma qorna qoraalladayada — taasi ma micnayneyso inaanay khatar lahayn. Had iyo jeer la xiriir farmashiyaha ama dhakhtarka haddii aad walaacsan tahay.",
    disclaimer: "Tani ma aha ogaanshaha cudur ama qiimayn degdeg ah — u isticmaal sidii bilow wax looga hadlayo farmashiyaha ama dhakhtarka. Haddii aad shaki qabto in ay tahay xaalad degdeg ah: had iyo jeer wac 112.",
    close: "Xir",
  },
  ar: {
    title: "هل هذا خطير؟",
    intro: "اكتب ما تشعر به، وسأوضح لك إن كان مذكورًا كعرض جانبي شائع أو تحذير لأي من الأدوية الـ25 على الموقع — سواء أضفتها إلى قائمتك أم لا.",
    introScoped: (name) => `اكتب ما تشعر به، وسأوضح لك إن كان مذكورًا كعرض جانبي شائع أو تحذير لـ${name}.`,
    placeholder: "اكتب عرضًا…",
    emergencyTitle: "اتصل بالرقم 112 فورًا إذا شعرت بـ:",
    emergencyItems: [
      "ضيق في التنفس أو صعوبة شديدة في التنفس",
      "ألم أو ضغط في الصدر",
      "تورم مفاجئ في الوجه أو الشفتين أو اللسان أو الحلق",
      "فقدان الوعي أو الإغماء",
      "نزيف شديد لا يتوقف",
    ],
    sideLabel: "عرض جانبي شائع",
    warnLabel: "تحذير — تواصل مع الطبيب/الصيدلية",
    noMatch: "لم يُذكر في نصوصنا — هذا لا يعني أنه غير خطير. تواصل دائمًا مع الصيدلية أو الطبيب إذا كنت قلقًا.",
    disclaimer: "هذا ليس تشخيصًا ولا تقييمًا للطوارئ — استخدمه كنقطة بداية للحديث مع الصيدلية أو الطبيب. عند الشك في وجود حالة طارئة: اتصل دائمًا بالرقم 112.",
    close: "إغلاق",
  },
};

function LevelBadge({ level, size = 34 }) {
  const c = LEVEL_COLORS[level];
  const symbol = level === "red" ? "!" : level === "orange" ? "⚠" : "✓";
  return (
    <span
      aria-hidden="true"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: c.ring, color: "#fff", fontWeight: 800, fontSize: size * 0.5,
        boxShadow: `0 2px 8px ${c.ring}66`,
      }}
    >
      {symbol}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

export function SeverityCheckModal({ language, onClose, scopeSlug, scopeName }) {
  const isRtl = language === "ar";
  const theme = LANG_THEME[language] ?? LANG_THEME.so;
  const t = TEXTS[language] ?? TEXTS.so;
  const [query, setQuery] = useState("");

  const severityIndex = useMemo(() => {
    const items = scopeSlug ? indexData.items.filter((i) => i.slug === scopeSlug) : indexData.items;
    return items.map((item) => {
      const medicine = getMedicine(item.slug);
      const data = medicine?.translations?.[language] || medicine?.translations?.so;
      const bulletsFor = (variant) =>
        (medicine?.sections || [])
          .filter((s) => s.variant === variant)
          .flatMap((s) => data?.[s.listKey] || []);
      return {
        slug: item.slug,
        name: getDisplayName(item.slug, language, item.name),
        side: bulletsFor("side"),
        warn: bulletsFor("warn"),
      };
    });
  }, [language, scopeSlug]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return severityIndex
      .map(({ slug, name, side, warn }) => ({
        slug,
        name,
        warnHits: warn.filter((b) => b.toLowerCase().includes(q)),
        sideHits: side.filter((b) => b.toLowerCase().includes(q)),
      }))
      .filter((r) => r.warnHits.length > 0 || r.sideHits.length > 0);
  }, [query, severityIndex]);

  const iconEl = <LevelBadge level="red" size={26} />;

  return (
    <ModalShell title={t.title} iconEl={iconEl} onClose={onClose} isRtl={isRtl} closeLabel={t.close}>
      <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.7, margin: "0 0 18px", textAlign: isRtl ? "right" : "left" }}>
        {scopeName ? t.introScoped(scopeName) : t.intro}
      </p>

      {/* Altid synlig, uafhængig af søgning — ikke et forsøg på at klassificere
          brugerens tekst (upålideligt), men en fast, universel sikkerhedsregel. */}
      <div
        style={{
          borderRadius: "16px", border: `1.5px solid ${LEVEL_COLORS.red.border}`, background: LEVEL_COLORS.red.bg,
          padding: "14px 16px", marginBottom: "20px", textAlign: isRtl ? "right" : "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <LevelBadge level="red" size={30} />
          <p style={{ fontWeight: 800, fontSize: "14px", color: LEVEL_COLORS.red.text, margin: 0 }}>{t.emergencyTitle}</p>
        </div>
        <ul style={{ margin: 0, padding: isRtl ? 0 : "0 0 0 20px", paddingRight: isRtl ? "20px" : 0, display: "flex", flexDirection: "column", gap: "4px" }}>
          {t.emergencyItems.map((line, i) => (
            <li key={i} style={{ fontSize: "13px", color: LEVEL_COLORS.red.text, lineHeight: 1.6, fontWeight: 600 }}>{line}</li>
          ))}
        </ul>
      </div>

      <div
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          borderRadius: "14px", border: "1.5px solid #e2e8f0", background: "#fff",
          padding: "11px 14px", marginBottom: "14px",
        }}
      >
        <span style={{ color: "#94a3b8", display: "flex" }}><SearchIcon /></span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", background: "transparent", color: "#0f172a" }}
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>

      {results !== null && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "8px" }}>
          {results.length === 0 ? (
            <p style={{ fontSize: "13.5px", color: "#64748b", fontWeight: 600, margin: 0, textAlign: isRtl ? "right" : "left" }}>{t.noMatch}</p>
          ) : (
            results.map(({ slug, name, warnHits, sideHits }) => (
              <div
                key={slug}
                style={{ borderRadius: "14px", border: `1.5px solid ${theme.border}`, background: "#fff", padding: "12px 14px", textAlign: isRtl ? "right" : "left" }}
              >
                <p style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a", margin: "0 0 8px" }}>{name}</p>

                {warnHits.length > 0 && (
                  <div style={{ borderRadius: "10px", background: LEVEL_COLORS.orange.bg, border: `1px solid ${LEVEL_COLORS.orange.border}`, padding: "8px 10px", marginBottom: sideHits.length > 0 ? "8px" : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <LevelBadge level="orange" size={20} />
                      <p style={{ fontSize: "11.5px", fontWeight: 800, color: LEVEL_COLORS.orange.text, margin: 0 }}>{t.warnLabel}</p>
                    </div>
                    <ul style={{ margin: 0, padding: isRtl ? 0 : "0 0 0 16px", paddingRight: isRtl ? "16px" : 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                      {warnHits.map((bullet, i) => (
                        <li key={i} style={{ fontSize: "12.5px", color: "#334155", lineHeight: 1.5 }}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {sideHits.length > 0 && (
                  <div style={{ borderRadius: "10px", background: LEVEL_COLORS.green.bg, border: `1px solid ${LEVEL_COLORS.green.border}`, padding: "8px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <LevelBadge level="green" size={20} />
                      <p style={{ fontSize: "11.5px", fontWeight: 800, color: LEVEL_COLORS.green.text, margin: 0 }}>{t.sideLabel}</p>
                    </div>
                    <ul style={{ margin: 0, padding: isRtl ? 0 : "0 0 0 16px", paddingRight: isRtl ? "16px" : 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                      {sideHits.map((bullet, i) => (
                        <li key={i} style={{ fontSize: "12.5px", color: "#334155", lineHeight: 1.5 }}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <p style={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.6, margin: "10px 0 0", textAlign: isRtl ? "right" : "left" }}>
        {t.disclaimer}
      </p>
    </ModalShell>
  );
}
