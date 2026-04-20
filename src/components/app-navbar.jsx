"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredLanguage, subscribeToLanguageChange } from "../lib/language";
import { uiText } from "../lib/site";

// Sørger for at labels matcher modal-titlerne i SiteIndex
const NAV_LABELS = {
  da: { aboutMe:"Om mig", aboutSite:"Om Somalimed", faq:"FAQ", feedback:"Feedback", contact:"Kontakt", tpi:"Inhalationsteknik" },
  en: { aboutMe:"About me", aboutSite:"About Somalimed", faq:"FAQ", feedback:"Feedback", contact:"Contact", tpi:"Inhaler technique" },
  so: { aboutMe:"Ku saabsan aniga", aboutSite:"Ku saabsan Somalimed", faq:"Su'aalaha", feedback:"Faallo", contact:"Xiriir", tpi:"Farsamada buufinta" },
  ar: { aboutMe:"نبذة عني", aboutSite:"حول Somalimed", faq:"الأسئلة الشائعة", feedback:"ملاحظات", contact:"تواصل", tpi:"تقنية الاستنشاق" },
};

// Kortere labels til mobil bottom-nav
const NAV_LABELS_SHORT = {
  da: { me:"Om mig",   site:"Om siden",   faq:"FAQ",      contact:"Kontakt" },
  en: { me:"About",    site:"About",      faq:"FAQ",      contact:"Contact" },
  so: { me:"Aniga",    site:"Somalimed",  faq:"Su'aalo",  contact:"Xiriir"  },
  ar: { me:"عني",      site:"حول",        faq:"FAQ",      contact:"تواصل"   },
};

const NAV_ICON_COLORS = {
  so: { faq:"#0D9488", feedback:"#059669", contact:"#0F766E" },
  da: { faq:"#2563EB", feedback:"#1D4ED8", contact:"#0284C7" },
  en: { faq:"#92400E", feedback:"#B45309", contact:"#C2410C" },
  ar: { faq:"#D97706", feedback:"#B45309", contact:"#EA580C" },
};

const P = {
  school: "/icons/school.png",
  work:   "/icons/work.png",
};

// Ikoner (Ligesom i SiteIndex for visuel sammenhæng)
function MailIcon({ size=15, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function StarIcon({ size=15, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  );
}

function LungsIcon({ size=15, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v4"/><path d="M6 8c-1.5 0-4 1.5-4 6 0 3 2 5 4 5 1.3 0 2.4-.5 3.2-1.4"/><path d="M18 8c1.5 0 4 1.5 4 6 0 3-2 5-4 5-1.3 0-2.4-.5-3.2-1.4"/><path d="M12 8c-2 0-3 1-3 3v6"/><path d="M12 8c2 0 3 1 3 3v6"/>
    </svg>
  );
}

export function AppNavbar() {
  const [language, setLanguage] = useState("so");
  const [activeTab, setActiveTab] = useState(null);

  // Lyt efter om modaler lukkes udefra (så knappen i navbaren ikke lyser når modalen er lukket)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLanguage(params.get("lang") || getStoredLanguage() || "so");

    // Hvis man klikker på krydset i SiteIndex, skal Navbaren vide det
    const handleTabEvent = (e) => setActiveTab(e.detail);
    window.addEventListener("somalimed-tab", handleTabEvent);

    const unsubscribeLanguage = subscribeToLanguageChange(setLanguage);

    return () => {
      window.removeEventListener("somalimed-tab", handleTabEvent);
      unsubscribeLanguage();
    };
  }, []);

  const isRtl = language === "ar";
  const text = uiText[language] || uiText.so;
  const navLabels = NAV_LABELS[language] ?? NAV_LABELS.so;
  const navLabelsShort = NAV_LABELS_SHORT[language] ?? NAV_LABELS_SHORT.so;
  const iconColors = NAV_ICON_COLORS[language] ?? NAV_ICON_COLORS.so;

  const navTabs = [
    { key: "me", iconEl: <img src={P.school} alt="" style={{ width:15, height:15 }}/>, label: navLabels.aboutMe },
    { key: "site", iconEl: <img src={P.work} alt="" style={{ width:15, height:15 }}/>, label: navLabels.aboutSite },
    { 
      key: "faq", 
      iconEl: (
        <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
          <rect x="0" y="0" width="13" height="10" rx="3" fill={iconColors.faq}/>
          <text x="6.5" y="7.5" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">Q</text>
          <rect x="8" y="5" width="13" height="10" rx="3" fill={iconColors.faq} opacity="0.65"/>
          <text x="14.5" y="12.5" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">A</text>
        </svg>
      ), 
      label: navLabels.faq 
    },
    
    { key: "contact", iconEl: <MailIcon size={16} color={iconColors.contact}/>, label: navLabels.contact },
  ];

  const handleTabClick = (key) => {
    const newTab = activeTab === key ? null : key;
    setActiveTab(newTab);
    // Dette sender signalet til SiteIndex filen:
    window.dispatchEvent(new CustomEvent("somalimed-tab", { detail: newTab }));
  };

  return (
    <>
      {/* Desktop Navbar */}
      <header className="sticky top-0 z-[110] hidden sm:block">
        <nav className="bg-white/90 backdrop-blur-md border-b border-teal-500/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link className="flex items-center gap-2.5" href={{ pathname: "/", query: { lang: language } }}>
              <Image src="/somalimed-icon.svg" alt="logo" width={36} height={36} className="rounded-xl" priority />
              <span className="text-[25px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-600">
                {text.navbarTitle}
              </span>
            </Link>

            <div className="flex gap-1.5">
              {navTabs.map(({ key, iconEl, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-1.5 transition-all text-[13px] font-semibold ${
                    activeTab === key ? "bg-teal-600 border-teal-600 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:border-teal-200"
                  }`}
                >
                  {iconEl} {label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-[110] block sm:hidden bg-white/90 backdrop-blur-md border-b border-teal-500/10">
        <div className="flex items-center justify-between px-4 h-14" dir={isRtl ? "rtl" : "ltr"}>
          <Link className="flex items-center gap-2" href={{ pathname: "/", query: { lang: language } }}>
            <Image src="/somalimed-icon.svg" alt="logo" width={30} height={30} className="rounded-xl" priority />
            <span className="text-[19px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-600">
              {text.navbarTitle}
            </span>
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav
        className="block sm:hidden fixed bottom-0 inset-x-0 z-[110] bg-white/95 backdrop-blur-md border-t border-slate-100"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex">
          {navTabs.map(({ key, iconEl }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleTabClick(key)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
                style={{
                  minHeight: 56,
                  color: isActive ? "var(--accent)" : "#94a3b8",
                  background: isActive ? "var(--flash)" : "transparent",
                }}
              >
                <span style={{ transform: "scale(1.25)", display: "flex", alignItems: "center" }}>
                  {iconEl}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.2, textAlign: "center" }}>
                  {navLabelsShort[key]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
