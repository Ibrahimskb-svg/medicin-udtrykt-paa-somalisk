"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { resolveInitialLanguage, subscribeToLanguageChange } from "../lib/language";

// Tidligere version var en rå JavaScript-streng i app/layout.jsx, der selv
// skulle gætte sig til sprogskift (ved at polle localStorage under et forkert
// nøglenavn og forsøge at opsnappe Next.js' router udefra) og selv regne sig
// frem til om cookiebanneret var i vejen. Begge dele gik galt i praksis. Som
// almindelig React-komponent får den i stedet sproget direkte fra appens egen
// kilde til sandhed (samme metode som TextZoomControl bruger) og genrenderer
// automatisk, når det ændrer sig — uden polling, uden DOM-gæt.
const DISMISS_KEY = "sm_bubble_dismissed_until";
const DISMISS_DAYS = 14;
const SHOW_DELAY_MS = 3000;
const AUTO_HIDE_MS = 45000;
const COOKIE_BANNER_RETRY_MS = 1500;

const MESSAGES = {
  so: "Su'aal ma qabtaa? La sheekeyso Ibraahim.",
  da: "Har du et spørgsmål? Chat med Ibrahim.",
  en: "Do you have a question? Chat with Ibrahim.",
  ar: "هل لديك سؤال؟ تحدث مع إبراهيم.",
};
const NAMES = { so: "Ibraahim", da: "Ibrahim", en: "Ibrahim", ar: "إبراهيم" };
const COLORS = {
  so: { bg: "linear-gradient(135deg,#0D9488,#0F766E)", tail: "#0F766E", shadow: "rgba(13,148,136,0.45)" },
  da: { bg: "linear-gradient(135deg,#2563EB,#1D4ED8)", tail: "#1D4ED8", shadow: "rgba(37,99,235,0.45)" },
  en: { bg: "linear-gradient(135deg,#92400E,#B45309)", tail: "#B45309", shadow: "rgba(146,64,14,0.45)" },
  ar: { bg: "linear-gradient(135deg,#D97706,#B45309)", tail: "#B45309", shadow: "rgba(217,119,6,0.45)" },
};

function isDismissed() {
  try {
    const until = parseInt(window.localStorage.getItem(DISMISS_KEY) || "0", 10);
    return Date.now() < until;
  } catch (e) {
    return false;
  }
}

function markDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000));
  } catch (e) {}
}

// ConsentManager (consent-manager.jsx) skriver selv denne nøgle, så snart
// besøgende har taget stilling til cookiebanneret — den er den autoritative
// kilde til om banneret er synligt, i stedet for at lede efter det i DOM'en.
function cookieConsentDecided() {
  try {
    return window.localStorage.getItem("cookieConsent") !== null;
  } catch (e) {
    return true;
  }
}

function crispWidgetPresent() {
  try {
    return !!document.querySelector(
      '.crisp-client, [class*="crisp-client"], #crisp-chatbox, iframe[src*="crisp"], crisp-chat-app, crisp-client'
    );
  } catch (e) {
    return false;
  }
}

function openCrispChat() {
  try {
    if (window.$crisp) {
      window.$crisp.push(["do", "chat:open"]);
      return true;
    }
  } catch (e) {}
  return false;
}

export default function ChatBubble() {
  const pathname = usePathname();
  const [language, setLanguage] = useState("so");
  const [visible, setVisible] = useState(false);
  const [avatarOk, setAvatarOk] = useState(null);
  const timers = useRef([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLanguage(resolveInitialLanguage(null, params.get("lang")));
    const unsubscribe = subscribeToLanguageChange(setLanguage);
    // Nem måde at se boblen igen uden udviklerværktøjer: tilføj ?showbubble=1
    // til adressen, så glemmer browseren, at den tidligere er lukket.
    try {
      if (params.get("showbubble") === "1") window.localStorage.removeItem(DISMISS_KEY);
    } catch (e) {}
    return unsubscribe;
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setAvatarOk(true);
    img.onerror = () => setAvatarOk(false);
    img.src = "/Ibrahim-avatar.jpg";
  }, []);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setVisible(false);

    if (pathname?.startsWith("/dashboard")) return undefined;
    if (isDismissed()) return undefined;

    function attemptShow() {
      if (isDismissed()) return;
      if (!cookieConsentDecided()) {
        timers.current.push(setTimeout(attemptShow, COOKIE_BANNER_RETRY_MS));
        return;
      }
      setVisible(true);
      timers.current.push(setTimeout(() => setVisible(false), AUTO_HIDE_MS));
    }
    timers.current.push(setTimeout(attemptShow, SHOW_DELAY_MS));

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // Genkør hver gang sproget reelt skifter (React-prop, ikke polling) eller
    // man navigerer til en ny side.
  }, [language, pathname]);

  if (!visible) return null;

  const lang = MESSAGES[language] ? language : "so";
  const isRtl = lang === "ar";
  const color = COLORS[lang];

  function handleClose(e) {
    e.stopPropagation();
    markDismissed();
    setVisible(false);
  }

  function handleBubbleClick() {
    markDismissed();
    const opened = openCrispChat();
    if (!opened) {
      // Crisp er ikke indlæst (fx cookies ikke accepteret endnu) — gå direkte til mailto.
      window.location.href = "mailto:Ibrahim_skb@live.dk";
      return;
    }
    // Crisp er indlæst, men widget'en kan stadig fejle at vise sig (fx pga.
    // konto-opsætning) — fald tilbage til mailto hvis den aldrig dukker op.
    setTimeout(() => {
      if (!crispWidgetPresent()) {
        window.location.href = "mailto:Ibrahim_skb@live.dk";
      }
    }, 2500);
  }

  return (
    <>
      <style>{`
        #sm-bubble {
          position: fixed;
          bottom: 86px;
          right: 16px;
          z-index: 500;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 12px 14px 12px 12px;
          border-radius: 18px 18px 4px 18px;
          max-width: 220px;
          line-height: 1.45;
          cursor: pointer;
          animation: smPop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards,
                     smFloat 3s ease-in-out 0.5s infinite;
          border: none;
        }
        #sm-bubble::after {
          content: "";
          position: absolute;
          bottom: -7px;
          right: 22px;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 0 solid transparent;
          border-top: 7px solid ${color.tail};
        }
        #sm-bubble-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.5);
          flex-shrink: 0;
          margin-top: 1px;
        }
        #sm-bubble-avatar-fallback {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 14px;
        }
        #sm-bubble-text { flex: 1; }
        #sm-bubble-name {
          font-size: 11px;
          font-weight: 700;
          opacity: 0.85;
          margin-bottom: 2px;
          letter-spacing: 0.02em;
        }
        #sm-bubble-msg {
          font-size: 13px;
          font-weight: 600;
          line-height: 1.4;
        }
        #sm-bubble-close {
          position: absolute;
          top: -7px;
          right: -7px;
          width: 20px;
          height: 20px;
          background: #475569;
          border-radius: 50%;
          color: #fff;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid #fff;
          line-height: 1;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        @keyframes smPop {
          from { opacity: 0; transform: scale(0.6) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes smFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @media (max-width: 640px) {
          #sm-bubble { right: 12px; bottom: calc(68px + env(safe-area-inset-bottom, 0px)); max-width: 195px; font-size: 12px; padding: 10px 12px 10px 10px; }
        }
      `}</style>
      <div
        id="sm-bubble"
        dir={isRtl ? "rtl" : "ltr"}
        style={{ background: color.bg, boxShadow: `0 8px 28px ${color.shadow}, 0 2px 8px rgba(0,0,0,0.12)` }}
        onClick={handleBubbleClick}
      >
        <button id="sm-bubble-close" aria-label="Luk" onClick={handleClose}>
          ✕
        </button>
        {avatarOk ? (
          <img id="sm-bubble-avatar" src="/Ibrahim-avatar.jpg" alt={NAMES[lang]} />
        ) : (
          <div id="sm-bubble-avatar-fallback">💬</div>
        )}
        <div id="sm-bubble-text">
          <div id="sm-bubble-name">{NAMES[lang]}</div>
          <div id="sm-bubble-msg">{MESSAGES[lang]}</div>
        </div>
      </div>
    </>
  );
}
