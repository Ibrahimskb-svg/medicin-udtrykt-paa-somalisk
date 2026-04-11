"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredLanguage, subscribeToLanguageChange } from "../lib/language";
import { uiText } from "../lib/site";

const NAV_LABELS = {
  da: { aboutMe:"Om mig", aboutSite:"Om Somalimed", faq:"FAQ", feedback:"Ris & Ros", contact:"Kontakt" },
  en: { aboutMe:"About me", aboutSite:"About Somalimed", faq:"FAQ", feedback:"Feedback", contact:"Contact" },
  so: { aboutMe:"Ku saabsan aniga", aboutSite:"Ku saabsan Somalimed", faq:"Su'aalaha", feedback:"Faallo", contact:"Xiriir" },
  ar: { aboutMe:"نبذة عني", aboutSite:"نبذة عن Somalimed", faq:"الأسئلة الشائعة", feedback:"آراء وملاحظات", contact:"تواصل معي" },
};

const NAV_ICON_COLORS = {
  so: { faq:"#0D9488", feedback:"#059669", contact:"#0F766E" },
  da: { faq:"#2563EB", feedback:"#1D4ED8", contact:"#0284C7" },
  en: { faq:"#92400E", feedback:"#B45309", contact:"#C2410C" },
  ar: { faq:"#D97706", feedback:"#B45309", contact:"#EA580C" },
};

const P = {
  school:    "/icons/school.png",
  work:      "/icons/work.png",
};

function MailIcon({size=15,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);}
function StarIcon({size=15,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>);}

export function AppNavbar() {
  const [language, setLanguage] = useState("so");
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLanguage(params.get("lang") || getStoredLanguage() || "so");
    return subscribeToLanguageChange(setLanguage);
  }, []);

  const text = uiText[language] || uiText.so;
  const navLabels = NAV_LABELS[language] ?? NAV_LABELS.so;
  const iconColors = NAV_ICON_COLORS[language] ?? NAV_ICON_COLORS.so;

  const navTabs = [
    { key:"me",       iconEl:<img src={P.school} alt="" style={{width:15,height:15,objectFit:"contain"}}/>, label:navLabels.aboutMe },
    { key:"site",     iconEl:<img src={P.work}   alt="" style={{width:15,height:15,objectFit:"contain"}}/>, label:navLabels.aboutSite },
    { key:"faq",      iconEl:<svg width="22" height="15" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="13" height="10" rx="3" fill={iconColors.faq}/><path d="M2 10 L2 13 L6 10Z" fill={iconColors.faq}/><text x="6.5" y="7.5" fontFamily="-apple-system,sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">Q</text><rect x="8" y="5" width="13" height="10" rx="3" fill={iconColors.faq} opacity="0.65"/><path d="M19 15 L19 18 L15 15Z" fill={iconColors.faq} opacity="0.65"/><text x="14.5" y="12.5" fontFamily="-apple-system,sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">A</text></svg>, label:navLabels.faq },
    { key:"feedback", iconEl:<StarIcon size={15} color={iconColors.feedback}/>, label:navLabels.feedback },
    { key:"contact",  iconEl:<MailIcon size={15} color={iconColors.contact}/>, label:navLabels.contact },
  ];

  // Dispatch custom event so site-index.jsx can open the correct modal
  const handleTabClick = (key) => {
    setActiveTab(activeTab === key ? null : key);
    window.dispatchEvent(new CustomEvent("somalimed-tab", { detail: key }));
  };

  return (
    <header className="sticky top-0 z-[110]">
      <nav className="bg-white/90 backdrop-blur-md" style={{ borderBottom: "1px solid rgba(13,148,136,0.13)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

          {/* Logo */}
          <Link
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85 flex-shrink-0"
            href={{ pathname: "/", query: { lang: language } }}
          >
            <Image
              src="/somalimed-icon.svg"
              alt="somalimed logo"
              width={36}
              height={36}
              className="rounded-xl"
              priority
            />
            <span
              className="text-[25px] font-extrabold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #0A7A73 0%, #0D9488 50%, #0E7FC0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {text.navbarTitle}
            </span>
          </Link>

          {/* Nav tabs — to the right */}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", justifyContent:"flex-end", alignItems:"center" }}>
            {navTabs.map(({ key, iconEl, label }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTabClick(key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "7px 13px",
                    borderRadius: "999px",
                    border: "1.5px solid",
                    borderColor: active ? "var(--accent,#0d9488)" : "#e2e8f0",
                    background: active ? "var(--accent,#0d9488)" : "#fff",
                    color: active ? "#fff" : "#334155",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    boxShadow: active ? "0 2px 12px rgba(13,148,136,0.28)" : "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <span style={{ display:"flex", alignItems:"center" }}>{iconEl}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      {/* Gradient accent line */}
      <div style={{ height: "2px", background: "linear-gradient(to right, #0D9488, #0284C7, #7C3AED)" }} />
    </header>
  );
}
