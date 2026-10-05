"use client";
import { useEffect, useId, useRef, useState } from "react";
import { ModalShell } from "./modal-shell";
import { TESTIMONIALS } from "../data/testimonials";

// Somalisk og arabisk er et førsteudkast, endnu ikke gennemgået ord for ord
// af Ibrahim (samme forbehold som i src/data/counter-cards.js) — dansk og
// engelsk er den endelige tekst.
const TEXT = {
  da: {
    eyebrow: "Rigtige oplevelser",
    title: "Hvad siger brugerne?",
    subtitle: "Korte beskeder fra somaliere, der har brugt Somalimed.",
    emptyTitle: "Bliv den første til at skrive en besked!",
    emptyBody: "Har Somalimed hjulpet dig eller din familie? Fortæl os om det.",
    writeBtn: "Skriv din egen besked",
    formTitle: "Del din oplevelse",
    formIntro: "Udfyld navn, by og e-mail herunder — så kan du skrive din besked.",
    nameLabel: "Navn",
    cityLabel: "By",
    emailLabel: "E-mail",
    messageLabel: "Din besked",
    messagePlaceholder: "Fortæl kort, hvordan Somalimed har hjulpet dig …",
    messageLockedHint: "Udfyld navn, by og e-mail ovenfor, så kan du skrive din besked.",
    consentNote: "Din besked, dit navn og din by kan blive vist på hjemmesiden, hvis Ibrahim godkender den. Din e-mail bruges kun til at kontakte dig og vises aldrig offentligt.",
    requiredHint: "Udfyld venligst alle felter.",
    sendBtn: "Send til godkendelse",
    sentTitle: "Tak for din besked! 🙏",
    sentBody: "Ibrahim læser den og lægger den op på siden, hvis den godkendes.",
    prevLabel: "Forrige",
    nextLabel: "Næste",
  },
  en: {
    eyebrow: "Real experiences",
    title: "What users say",
    subtitle: "Short messages from Somalis who've used Somalimed.",
    emptyTitle: "Be the first to write a message!",
    emptyBody: "Has Somalimed helped you or your family? Tell us about it.",
    writeBtn: "Write your own message",
    formTitle: "Share your experience",
    formIntro: "Fill in your name, city and email below — then you can write your message.",
    nameLabel: "Name",
    cityLabel: "City",
    emailLabel: "Email",
    messageLabel: "Your message",
    messagePlaceholder: "Briefly tell us how Somalimed has helped you …",
    messageLockedHint: "Fill in name, city and email above, then you can write your message.",
    consentNote: "Your message, name and city may be shown on the website if Ibrahim approves it. Your email is only used to contact you and is never shown publicly.",
    requiredHint: "Please fill in all fields.",
    sendBtn: "Send for approval",
    sentTitle: "Thank you for your message! 🙏",
    sentBody: "Ibrahim will read it and publish it on the site if approved.",
    prevLabel: "Previous",
    nextLabel: "Next",
  },
  so: {
    eyebrow: "Khibradaha dhabta ah",
    title: "Maxay dadku ka yiraahdaan?",
    subtitle: "Fariimo gaagaaban oo ka yimid dad Soomaali ah oo isticmaalay Somalimed.",
    emptyTitle: "Noqo qofka ugu horreeya ee fariin qora!",
    emptyBody: "Somalimed ma ku caawisay adiga ama qoyskaaga? Noo sheeg.",
    writeBtn: "Qor fariintaada",
    formTitle: "Nala wadaag khibraddaada",
    formIntro: "Hoos buuxi magacaaga, magaaladaada iyo email-kaaga — kadibna waad qori kartaa fariintaada.",
    nameLabel: "Magaca",
    cityLabel: "Magaalada",
    emailLabel: "Email",
    messageLabel: "Fariintaada",
    messagePlaceholder: "Si kooban noo sheeg sida Somalimed kuugu caawisay …",
    messageLockedHint: "Buuxi magaca, magaalada iyo email-ka kor ku yaal, kadibna waad qori kartaa fariintaada.",
    consentNote: "Fariintaada, magacaaga iyo magaaladaada waxaa laga yaabaa in lagu soo bandhigo bogga internetka, haddii Ibrahim ansixiyo. Email-kaaga waxaa loo isticmaalaa oo keliya si lagula soo xiriiro, mana muuqan goob dadweyne ah weligeed.",
    requiredHint: "Fadlan buuxi dhammaan goobaha.",
    sendBtn: "U dir si loo ansixiyo",
    sentTitle: "Waad ku mahadsan tahay! 🙏",
    sentBody: "Ibrahim ayaa akhrin doona, wuxuuna ku soo dhejin doonaa bogga haddii la ansixiyo.",
    prevLabel: "Hore",
    nextLabel: "Xiga",
  },
  ar: {
    eyebrow: "تجارب حقيقية",
    title: "ماذا يقول المستخدمون؟",
    subtitle: "رسائل قصيرة من صوماليين استخدموا Somalimed.",
    emptyTitle: "كن أول من يكتب رسالة!",
    emptyBody: "هل ساعدك Somalimed أو ساعد عائلتك؟ أخبرنا بذلك.",
    writeBtn: "اكتب رسالتك",
    formTitle: "شاركنا تجربتك",
    formIntro: "املأ اسمك ومدينتك وبريدك الإلكتروني أدناه — ثم يمكنك كتابة رسالتك.",
    nameLabel: "الاسم",
    cityLabel: "المدينة",
    emailLabel: "البريد الإلكتروني",
    messageLabel: "رسالتك",
    messagePlaceholder: "أخبرنا باختصار كيف ساعدك Somalimed …",
    messageLockedHint: "املأ الاسم والمدينة والبريد الإلكتروني أعلاه، ثم يمكنك كتابة رسالتك.",
    consentNote: "قد تُعرض رسالتك واسمك ومدينتك على الموقع إذا وافق إبراهيم عليها. يُستخدم بريدك الإلكتروني فقط للتواصل معك ولا يُعرض علنًا أبدًا.",
    requiredHint: "يرجى تعبئة جميع الحقول.",
    sendBtn: "إرسال للموافقة",
    sentTitle: "شكرًا على رسالتك! 🙏",
    sentBody: "سيقرأها إبراهيم وينشرها على الموقع إذا تمت الموافقة عليها.",
    prevLabel: "السابق",
    nextLabel: "التالي",
  },
};

// Hvert vidnesbyrd får sin egen farve fra denne palette (går i ring), så
// væggen føles levende og hvert menneske bag en besked skiller sig visuelt
// ud — ikke bare en ensfarvet liste.
const ACCENT_PALETTE = [
  { bg: "#F0FDFA", border: "#5EEAD4", text: "#0F766E" },
  { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E" },
  { bg: "#FCE7F3", border: "#F9A8D4", text: "#9D174D" },
  { bg: "#E0E7FF", border: "#A5B4FC", text: "#3730A3" },
  { bg: "#FFEDD5", border: "#FDBA74", text: "#9A3412" },
  { bg: "#DCFCE7", border: "#86EFAC", text: "#166534" },
];

const AUTO_ROTATE_MS = 6500;

function QuoteIcon({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M7.5 6C4.9 6 3 8.1 3 10.7c0 2.4 1.8 4.4 4.1 4.6-.3 1.6-1.4 2.9-3.1 3.6v1.9c3.4-.6 5.8-3.2 5.8-7V10.7C9.8 8.1 7.9 6 7.5 6Zm9.3 0c-2.6 0-4.5 2.1-4.5 4.7 0 2.4 1.8 4.4 4.1 4.6-.3 1.6-1.4 2.9-3.1 3.6v1.9c3.4-.6 5.8-3.2 5.8-7V10.7c0-2.6-1.9-4.7-2.3-4.7Z" />
    </svg>
  );
}
function ChevronIcon({ size = 18, color = "currentColor", flip }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function TestimonialCard({ item, accent, isRtl }) {
  const cardIsRtl = item.lang === "ar";
  const initial = item.name.trim().charAt(0).toUpperCase();
  return (
    <div
      dir={cardIsRtl ? "rtl" : "ltr"}
      style={{
        position: "relative", overflow: "hidden",
        borderRadius: "22px", border: `1.5px solid ${accent.border}`, background: accent.bg,
        padding: "24px 26px", minHeight: "160px", display: "flex", flexDirection: "column", gap: "14px",
        boxShadow: `0 10px 28px -14px ${accent.text}55`,
        transition: "background 0.4s ease, border-color 0.4s ease",
      }}
    >
      {/* Stort, dæmpet citationstegn i baggrunden — rent dekorativt, for et mere "designrigt" udtryk */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute", top: "-14px", [cardIsRtl ? "left" : "right"]: "6px",
          opacity: 0.12, pointerEvents: "none",
        }}
      >
        <QuoteIcon size={90} color={accent.text} />
      </span>

      <p style={{ margin: 0, fontSize: "16px", lineHeight: 1.75, color: "#0f172a", fontWeight: 500, textAlign: cardIsRtl ? "right" : "left", position: "relative" }}>
        {item.message}
      </p>

      <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: `1px solid ${accent.border}`, display: "flex", alignItems: "center", gap: "12px", flexDirection: cardIsRtl ? "row-reverse" : "row" }}>
        <span
          aria-hidden="true"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            width: 42, height: 42, borderRadius: "50%", background: accent.text, color: "#fff",
            fontWeight: 800, fontSize: "16px", boxShadow: `0 3px 10px ${accent.text}50`,
          }}
        >
          {initial}
        </span>
        <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 800, color: accent.text, textAlign: cardIsRtl ? "right" : "left" }}>
          {item.name}{item.city ? ` — ${item.city}` : ""}
        </p>
      </div>
    </div>
  );
}

function TestimonialFormModal({ language, isRtl, onClose }) {
  const t = TEXT[language] ?? TEXT.so;
  const nameId = useId();
  const cityId = useId();
  const emailId = useId();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const emailLooksValid = /\S+@\S+\.\S+/.test(email);
  const unlocked = name.trim() && city.trim() && emailLooksValid;

  function handleSend() {
    if (!unlocked || !message.trim()) { setShowErrors(true); return; }
    const subject = encodeURIComponent(`[Somalimed Tak-væg] ${name}`);
    const body = encodeURIComponent(
      [`${t.nameLabel}: ${name}`, `${t.cityLabel}: ${city}`, `${t.emailLabel}: ${email}`, "", message].join("\n")
    );
    window.open(`mailto:Ibrahim_skb@live.dk?subject=${subject}&body=${body}`);
    setSent(true);
  }

  const inputStyle = (missing) => ({
    padding: "12px 14px", borderRadius: "14px", fontSize: "16px", outline: "none", fontFamily: "inherit",
    border: `1.5px solid ${missing && showErrors ? "#ef4444" : "#e2e8f0"}`,
    direction: isRtl ? "rtl" : "ltr", minHeight: "48px", width: "100%", boxSizing: "border-box",
  });

  return (
    <ModalShell title={t.formTitle} iconEl={<QuoteIcon size={20} color="rgba(255,255,255,0.95)" />} onClose={onClose} isRtl={isRtl}>
      {sent ? (
        <div style={{ textAlign: "center", padding: "26px 0" }}>
          <p style={{ fontWeight: 800, fontSize: "17px", color: "#0f172a", margin: "0 0 8px" }}>{t.sentTitle}</p>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>{t.sentBody}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 2px", textAlign: isRtl ? "right" : "left" }}>{t.formIntro}</p>
          <div>
            <label htmlFor={nameId} style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "5px", textAlign: isRtl ? "right" : "left" }}>
              {t.nameLabel} <span style={{ color: "#cb3a3a" }}>*</span>
            </label>
            <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} style={inputStyle(!name.trim())} />
          </div>
          <div>
            <label htmlFor={cityId} style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "5px", textAlign: isRtl ? "right" : "left" }}>
              {t.cityLabel} <span style={{ color: "#cb3a3a" }}>*</span>
            </label>
            <input id={cityId} value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle(!city.trim())} />
          </div>
          <div>
            <label htmlFor={emailId} style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "5px", textAlign: isRtl ? "right" : "left" }}>
              {t.emailLabel} <span style={{ color: "#cb3a3a" }}>*</span>
            </label>
            <input id={emailId} type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle(!emailLooksValid)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "5px", textAlign: isRtl ? "right" : "left" }}>
              {t.messageLabel} <span style={{ color: "#cb3a3a" }}>*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={unlocked ? t.messagePlaceholder : t.messageLockedHint}
              disabled={!unlocked}
              rows={6}
              maxLength={1200}
              style={{ ...inputStyle(showErrors && !message.trim()), resize: "vertical", background: unlocked ? "#fff" : "#f1f5f9", color: unlocked ? "#0f172a" : "#94a3b8", cursor: unlocked ? "text" : "not-allowed" }}
            />
          </div>
          {showErrors && (!unlocked || !message.trim()) && (
            <p style={{ fontSize: "12.5px", color: "#cb3a3a", margin: 0, textAlign: isRtl ? "right" : "left" }}>{t.requiredHint}</p>
          )}
          <p style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.6, margin: "2px 0 0", textAlign: isRtl ? "right" : "left" }}>{t.consentNote}</p>
          <button
            type="button"
            className="hover-lift"
            onClick={handleSend}
            style={{ padding: "15px", borderRadius: "14px", background: "#0F766E", color: "#fff", fontWeight: 700, fontSize: "16px", border: "none", cursor: "pointer", minHeight: "52px" }}
          >
            {t.sendBtn}
          </button>
        </div>
      )}
    </ModalShell>
  );
}

export function TestimonialWall({ language, isRtl }) {
  const t = TEXT[language] ?? TEXT.so;
  const [index, setIndex] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const timerRef = useRef(null);

  const items = TESTIMONIALS;
  const hasItems = items.length > 0;

  useEffect(() => {
    if (!hasItems || items.length < 2) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timerRef.current);
  }, [hasItems, items.length]);

  function goTo(next) {
    clearInterval(timerRef.current);
    setIndex(next);
  }

  return (
    <section id="tak-vaeg" className="mx-auto max-w-6xl px-4 pt-10" style={{ scrollMarginTop: "90px" }}>
      <div className="reveal-on-scroll rounded-3xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }} dir={isRtl ? "rtl" : "ltr"}>
        <div className="px-5 pt-6 pb-5 sm:px-8 sm:pt-7">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{t.eyebrow}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl" style={{ color: "var(--text)" }}>{t.title}</h2>
              <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-muted)" }}>{t.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="hover-lift rounded-full px-5 py-2.5 text-sm font-bold text-white whitespace-nowrap"
              style={{ background: "#0F766E" }}
            >
              {t.writeBtn}
            </button>
          </div>

          <div className="mt-5">
            {hasItems ? (
              <div style={{ display: "flex", alignItems: "stretch", gap: "10px" }}>
                {items.length > 1 && (
                  <button type="button" aria-label={t.prevLabel} onClick={() => goTo((index - 1 + items.length) % items.length)} className="hover-lift" style={{ flexShrink: 0, width: 40, borderRadius: "14px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer" }}>
                    <ChevronIcon flip={!isRtl} color="#64748b" />
                  </button>
                )}
                <div style={{ flex: 1 }}>
                  <TestimonialCard item={items[index]} accent={ACCENT_PALETTE[index % ACCENT_PALETTE.length]} isRtl={isRtl} />
                </div>
                {items.length > 1 && (
                  <button type="button" aria-label={t.nextLabel} onClick={() => goTo((index + 1) % items.length)} className="hover-lift" style={{ flexShrink: 0, width: 40, borderRadius: "14px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer" }}>
                    <ChevronIcon flip={isRtl} color="#64748b" />
                  </button>
                )}
              </div>
            ) : (
              <div style={{ borderRadius: "20px", border: "1.5px dashed var(--border)", padding: "26px 24px", textAlign: "center" }}>
                <p style={{ margin: "0 0 6px", fontWeight: 800, fontSize: "15.5px", color: "var(--text)" }}>{t.emptyTitle}</p>
                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-muted)" }}>{t.emptyBody}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {formOpen && <TestimonialFormModal language={language} isRtl={isRtl} onClose={() => setFormOpen(false)} />}
    </section>
  );
}
