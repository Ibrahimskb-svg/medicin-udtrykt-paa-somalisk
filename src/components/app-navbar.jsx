"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getStoredLanguage, notifyLanguageChange, subscribeToLanguageChange } from "../lib/language";
import { getLanguageName, languages, languageThemes, uiText, pickerAccent } from "../lib/site";

// Sørger for at labels matcher modal-titlerne i SiteIndex
const NAV_LABELS = {
  da: { aboutMe:"Om mig", aboutSite:"Om Somalimed", faq:"Ofte stillede spørgsmål", feedback:"Feedback", contact:"Kontakt", tpi:"Inhalationsteknik", mylist:"Min medicin", findPharmacy:"Find apotek", counterCards:"Skranke-kort" },
  en: { aboutMe:"About me", aboutSite:"About Somalimed", faq:"FAQ", feedback:"Feedback", contact:"Contact", tpi:"Inhaler technique", mylist:"My medicine", findPharmacy:"Find a pharmacy", counterCards:"Counter cards" },
  so: { aboutMe:"Ku saabsan aniga", aboutSite:"Ku saabsan Somalimed", faq:"Su'aalaha", feedback:"Faallo", contact:"Xiriir", tpi:"Farsamada buufinta", mylist:"Daawooyinkayga", findPharmacy:"Raadi farmashiye", counterCards:"Kaararka Su'aalaha Farmashiyaha" },
  ar: { aboutMe:"نبذة عني", aboutSite:"حول Somalimed", faq:"الأسئلة الشائعة", feedback:"ملاحظات", contact:"تواصل", tpi:"تقنية الاستنشاق", mylist:"أدويتي", findPharmacy:"ابحث عن صيدلية", counterCards:"بطاقات الصيدلية" },
};

// Kortere labels til mobil bottom-nav
const NAV_LABELS_SHORT = {
  da: { me:"Om mig",   site:"Om siden",   faq:"Spørgsmål", contact:"Kontakt",  mylist:"Min medicin", findPharmacy:"Apotek", counterCards:"Kort" },
  en: { me:"About",    site:"About",      faq:"FAQ",      contact:"Contact",  mylist:"My meds", findPharmacy:"Pharmacy", counterCards:"Cards" },
  so: { me:"Aniga",    site:"Somalimed",  faq:"Su'aalo",  contact:"Xiriir",   mylist:"Daawo", findPharmacy:"Raadi farmashiye", counterCards:"Kaararka" },
  ar: { me:"عني",      site:"حول",        faq:"الأسئلة",  contact:"تواصل",    mylist:"أدويتي", findPharmacy:"صيدلية", counterCards:"البطاقات" },
};

// Korte bogstavkoder til sprogvælgeren ved den smalleste desktop-bredde
// (1024px), hvor der ikke er plads til de fulde oversatte sprognavne
// sammen med de øvrige menupunkter. Fra 1280px og op vises fulde navne.
const LANGUAGE_SHORT_CODES = { so: "SO", da: "DA", en: "EN", ar: "AR" };

const NAV_ICON_COLORS = {
  so: { faq:"#0D9488", feedback:"#059669", contact:"#0F766E", mylist:"#0F766E", findPharmacy:"#0F766E", counterCards:"#BE123C" },
  da: { faq:"#2563EB", feedback:"#1D4ED8", contact:"#0284C7", mylist:"#0284C7", findPharmacy:"#0284C7", counterCards:"#BE123C" },
  en: { faq:"#92400E", feedback:"#B45309", contact:"#C2410C", mylist:"#C2410C", findPharmacy:"#C2410C", counterCards:"#BE123C" },
  ar: { faq:"#D97706", feedback:"#B45309", contact:"#EA580C", mylist:"#EA580C", findPharmacy:"#EA580C", counterCards:"#BE123C" },
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

function ListIcon({ size=15, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><path d="M4.5 6h.01"/><path d="M4.5 12h.01"/><path d="M4.5 18h.01"/>
    </svg>
  );
}

function PinIcon({ size=15, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function CardsIcon({ size=15, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/>
    </svg>
  );
}

function ChevronDownIcon({ size=13, color="currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

export function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguage] = useState("so");
  const [activeTab, setActiveTab] = useState(null);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const contactMenuRef = useRef(null);

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

  // Luk Kontakt/Apotek-dropdown ved klik udenfor
  useEffect(() => {
    if (!contactMenuOpen) return;
    const handleClickOutside = (e) => {
      if (contactMenuRef.current && !contactMenuRef.current.contains(e.target)) {
        setContactMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contactMenuOpen]);

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
    { key: "mylist", iconEl: <ListIcon size={16} color={iconColors.mylist}/>, label: navLabels.mylist },
    { key: "findPharmacy", iconEl: <PinIcon size={16} color={iconColors.findPharmacy}/>, label: navLabels.findPharmacy },
    { key: "counterCards", iconEl: <CardsIcon size={16} color={iconColors.counterCards}/>, label: navLabels.counterCards },
  ];

  const handleTabClick = (key) => {
    const newTab = activeTab === key ? null : key;
    setActiveTab(newTab);
    setContactMenuOpen(false);
    // Dette sender signalet til SiteIndex filen:
    window.dispatchEvent(new CustomEvent("somalimed-tab", { detail: newTab }));
  };

  // Desktop: Xiriir + Raadi farmashiye samles i 1 dropdown for at give plads i toppen
  const desktopNavTabs = navTabs.filter(({ key }) => key !== "contact" && key !== "findPharmacy" && key !== "counterCards");
  const isContactGroupActive = activeTab === "contact" || activeTab === "findPharmacy" || activeTab === "counterCards";

  const handleLanguageSelect = (code) => {
    if (code === language) return;
    setLanguage(code);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", code);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    notifyLanguageChange(code);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <header className="sticky top-3 z-[110] hidden px-4 lg:block">
        <nav
          className="mx-auto max-w-6xl rounded-full shadow-lg shadow-teal-900/10 transition-all duration-300"
          style={{ background: "var(--heroBg, linear-gradient(135deg, #0A7A73 0%, #0D9488 50%, #0E7FC0 100%))" }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <Link className="hover-lift flex items-center gap-2.5" href={{ pathname: "/", query: { lang: "so" } }}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Image src="/somalimed-icon.svg" alt="" width={22} height={22} className="rounded-md" priority />
              </span>
              <span className="text-[19px] font-extrabold text-white">
                {text.navbarTitle}
              </span>
            </Link>

            <div className="flex gap-0.5 items-center">
              {desktopNavTabs.map(({ key, iconEl, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
                  aria-pressed={activeTab === key}
                  className={`hover-lift flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 rounded-full transition-all duration-200 text-[13px] font-semibold ${
                    activeTab === key ? "bg-white text-teal-700 shadow-md" : "text-white/90 hover:bg-white/12"
                  }`}
                >
                  {iconEl} {label}
                </button>
              ))}

              {/* Sprogvalg — navnene oversættes til det aktuelt valgte sprog
                  (fx "Af-Deenish" når sitet vises på somali), ikke nationalflag:
                  arabisk tales officielt i 20+ lande, så ethvert enkelt
                  landeflag ville favorisere ét land fremfor resten. Hvert
                  sprog har sin egen farve, også når det ikke er aktivt. */}
              <div className="flex items-center gap-0.5 rounded-full bg-white/12 p-1">
                {languages.map((code) => {
                  const isActive = code === language;
                  const theme = languageThemes[code] ?? languageThemes.so;
                  const accent = pickerAccent(code, theme);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleLanguageSelect(code)}
                      title={getLanguageName(language, code)}
                      aria-label={getLanguageName(language, code)}
                      aria-pressed={isActive}
                      className="hover-lift rounded-full transition-all duration-200"
                      style={{
                        padding: "6px 8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        background: isActive ? "#ffffff" : `${accent}33`,
                        border: isActive ? "none" : `1px solid ${accent}80`,
                        color: isActive ? accent : "#ffffff",
                        boxShadow: isActive ? `0 2px 8px ${accent}55` : "none",
                      }}
                    >
                      <span className="hidden xl:inline">{getLanguageName(language, code)}</span>
                      <span className="xl:hidden">{LANGUAGE_SHORT_CODES[code]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Kontakt + Raadi farmashiye samlet i 1 dropdown */}
              <div className="relative" ref={contactMenuRef}>
                <button
                  onClick={() => setContactMenuOpen((open) => !open)}
                  aria-expanded={contactMenuOpen}
                  className={`hover-lift flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 rounded-full transition-all duration-200 text-[13px] font-semibold ${
                    isContactGroupActive || contactMenuOpen ? "bg-white text-teal-700 shadow-md" : "text-white/90 hover:bg-white/12"
                  }`}
                >
                  <MailIcon size={16} color={isContactGroupActive || contactMenuOpen ? "#0f766e" : "#ffffff"} />
                  {navLabels.contact}
                  <ChevronDownIcon size={13} color={isContactGroupActive || contactMenuOpen ? "#0f766e" : "rgba(255,255,255,0.8)"} />
                </button>

                {contactMenuOpen && (
                  <div
                    className="absolute mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden z-[500]"
                    style={isRtl ? { left: 0 } : { right: 0 }}
                    dir={isRtl ? "rtl" : "ltr"}
                  >
                    <button
                      onClick={() => handleTabClick("contact")}
                      className={`hover-lift flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-colors ${
                        activeTab === "contact" ? "bg-teal-50 text-teal-700" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <MailIcon size={15} color={iconColors.contact} /> {navLabels.contact}
                    </button>
                    <button
                      onClick={() => handleTabClick("findPharmacy")}
                      className={`hover-lift flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-colors border-t border-slate-100 ${
                        activeTab === "findPharmacy" ? "bg-teal-50 text-teal-700" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <PinIcon size={15} color={iconColors.findPharmacy} /> {navLabels.findPharmacy}
                    </button>
                    <button
                      onClick={() => handleTabClick("counterCards")}
                      className={`hover-lift flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-colors border-t border-slate-100 ${
                        activeTab === "counterCards" ? "bg-teal-50 text-teal-700" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <CardsIcon size={15} color={iconColors.counterCards} /> {navLabels.counterCards}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-[110] block lg:hidden bg-white/90 backdrop-blur-md border-b border-teal-500/10">
        <div className="flex items-center justify-between px-4 h-14" dir={isRtl ? "rtl" : "ltr"}>
          <Link className="flex items-center gap-2" href={{ pathname: "/", query: { lang: "so" } }}>
            <Image src="/somalimed-icon.svg" alt="Somalimed logo" width={30} height={30} className="rounded-xl" priority />
            <span className="text-[19px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-600">
              {text.navbarTitle}
            </span>
          </Link>

          {/* Sprogvalg — tekst på hvert sprogs eget navn (ikke flag: arabisk
              tales i 20+ lande, så et enkelt landeflag ville favorisere ét
              land fremfor resten). Teal-tonet baggrund matcher sitets egen
              farveidentitet i stedet for at se ud som en generisk UI-widget. */}
          <div
            className="flex items-center gap-0.5 rounded-full p-0.5"
            style={{
              border: "1px solid rgba(13,148,136,0.16)",
              background: "linear-gradient(135deg,#F0FDFA,#ECFEFF)",
              boxShadow: "0 2px 10px rgba(13,148,136,0.10)",
            }}
          >
            {languages.map((code) => {
              const isActive = code === language;
              const theme = languageThemes[code] ?? languageThemes.so;
              const accent = pickerAccent(code, theme);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleLanguageSelect(code)}
                  title={getLanguageName(language, code)}
                  aria-label={getLanguageName(language, code)}
                  aria-pressed={isActive}
                  className="hover-lift rounded-full transition-all"
                  style={{
                    padding: "5px 7px",
                    fontSize: "10px",
                    fontWeight: 700,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    background: isActive ? accent : `${accent}18`,
                    color: isActive ? "#ffffff" : accent,
                    boxShadow: isActive ? `0 2px 6px ${accent}80` : "none",
                  }}
                >
                  {getLanguageName(language, code)}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav
        className="block lg:hidden fixed bottom-0 inset-x-0 z-[110] bg-white/95 backdrop-blur-md border-t border-slate-100"
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
                aria-pressed={isActive}
                className="hover-lift flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
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
