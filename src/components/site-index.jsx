"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LanguageSelect } from "./language-select";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import { applyLanguageToDocument } from "../lib/language";
import { getIndexData, uiText } from "../lib/site";

const indexData = getIndexData();

// Icons from /public/icons/ — Next.js serves as /icons/filename
const ICON_BASE = "/icons/";

// Icons from /public/ root — Next.js serves as /filename
// school.png, work.png, education.png, pills.png are all in /public/
const P = {
  school:    "/school.png",
  work:      "/work.png",
  education: "/education.png",
  pills:     "/pills.png",
};

// ── Translated display names ───────────────────────────────────────────────
const SLUG_DISPLAY_NAMES = {
  amlodipin: { da: "Amlodipin", en: "Amlodipine", ar: "أملوديبين", so: "Amlodipin" },
  hjertemagnyl: {
    da: "Hjertemagnyl (Acetylsalicylsyre, ASA)",
    en: "Aspirin (Acetylsalicylic acid, ASA)",
    ar: "أسبرين (حمض أسيتيل الساليسيليك، ASA)",
    so: "Hjertemagnyl (Acetylsalicylsyre, ASA)",
  },
  zopiclon: { da: "Imozop (Zopiclon)", en: "Imovane (Zopiclone)", ar: "إيموفان (زوبيكلون)", so: "Imozop (Zopiclon)" },
  lamotrigin: { da: "Lamotrigin", en: "Lamotrigine", ar: "لاموتريجين", so: "Lamotrigin" },
  pantoprazol: { da: "Pantoprazol", en: "Pantoprazole", ar: "بانتوبرازول", so: "Pantoprazol" },
  quetiapin: { da: "Quetiapin", en: "Quetiapine", ar: "كويتيابين", so: "Quetiapin" },
  sertralin: { da: "Sertralin", en: "Sertraline", ar: "سيرترالين", so: "Sertralin" },
  ventoline: { da: "Ventoline (Salbutamol)", en: "Ventolin (Salbutamol)", ar: "فنتولين (سالبوتامول)", so: "Ventoline (Salbutamol)" },
  morfin_injektion: { da: "Morfin (injektion)", en: "Morphine (injection)", ar: "مورفين (حقن)", so: "Morfin (irbad)" },
  morfin_tablet: { da: "Morfin (tablet)", en: "Morphine (tablet)", ar: "مورفين (قرص)", so: "Morfin (kiniin)" },
};

function getDisplayName(slug, language, fallback) {
  const t = SLUG_DISPLAY_NAMES[slug];
  if (!t) return fallback;
  return t[language] ?? t.so ?? fallback;
}

// ── Nav tab labels ─────────────────────────────────────────────────────────
const NAV_LABELS = {
  da: { aboutMe: "Om mig", aboutSite: "Om Somalimed" },
  en: { aboutMe: "About me", aboutSite: "About Somalimed" },
  so: { aboutMe: "Ku saabsan aniga", aboutSite: "Ku saabsan Somalimed" },
  ar: { aboutMe: "نبذة عني", aboutSite: "نبذة عن Somalimed" },
};

// ── Color themes per language ──────────────────────────────────────────────
// Each language gets its own accent palette for the modal bullets
// so = teal/green, da = blue, en = brown/reddish, ar = orange
const LANG_THEME = {
  so: { primary: "#0D9488", soft: "#F0FDFA", border: "#99f6e4", tagBg: "linear-gradient(135deg,#f0fdfa,#e0f2fe)" },
  da: { primary: "#2563EB", soft: "#EFF6FF", border: "#bfdbfe", tagBg: "linear-gradient(135deg,#eff6ff,#dbeafe)" },
  en: { primary: "#92400E", soft: "#FEF3C7", border: "#fcd34d", tagBg: "linear-gradient(135deg,#fef3c7,#fde68a)" },
  ar: { primary: "#D97706", soft: "#FFFBEB", border: "#fde68a", tagBg: "linear-gradient(135deg,#fffbeb,#fef3c7)" },
};

// bullet colors cycle per language
const BULLET_PALETTES = {
  so: [
    { color: "#0D9488", bg: "#F0FDFA" },
    { color: "#059669", bg: "#ECFDF5" },
    { color: "#0F766E", bg: "#CCFBF1" },
    { color: "#0284C7", bg: "#F0F9FF" },
  ],
  da: [
    { color: "#2563EB", bg: "#EFF6FF" },
    { color: "#1D4ED8", bg: "#DBEAFE" },
    { color: "#3B82F6", bg: "#EFF6FF" },
    { color: "#0284C7", bg: "#F0F9FF" },
  ],
  en: [
    { color: "#92400E", bg: "#FEF3C7" },
    { color: "#B45309", bg: "#FEF9EE" },
    { color: "#C2410C", bg: "#FFF7ED" },
    { color: "#DC2626", bg: "#FEF2F2" },
  ],
  ar: [
    { color: "#D97706", bg: "#FFFBEB" },
    { color: "#B45309", bg: "#FEF3C7" },
    { color: "#EA580C", bg: "#FFF7ED" },
    { color: "#F59E0B", bg: "#FFFBEB" },
  ],
};

// ── About Me data — precise, grammatically correct per language ────────────
// Icons: education.png (degree), work.png (job), pills.png (pharmacy/bridge), blood-pressure.png (passion)
// ALL four icons live in /public/ root: school.png, work.png, education.png, pills.png
const ABOUT_ME_BULLETS = {
  da: [
    { icon: "education.png", text: "Bachelor i Kemi og Medicinalbiologi samt uddannet Farmakonom" },
    { icon: "work.png",      text: "Daglig praksis på privatapotek og vagtapotek" },
    { icon: "pills.png",     text: "Brobygger mellem faglig viden og mennesker med forskellig baggrund" },
    { icon: "school.png",    text: "Brænder for klar, tryg og tilgængelig lægemiddelinformation" },
  ],
  en: [
    { icon: "education.png", text: "Bachelor's degree in Chemistry & Medicinal Biology, trained Pharmaconomist" },
    { icon: "work.png",      text: "Daily practice in both community pharmacy and emergency pharmacy" },
    { icon: "pills.png",     text: "Bridge-builder between professional knowledge and diverse communities" },
    { icon: "school.png",    text: "Passionate about clear, trustworthy and accessible medicine information" },
  ],
  so: [
    { icon: "education.png", text: "Shahaadada koowaad ee Kimistari iyo Bayoolajiga Dawooyinka, oo sidoo kale ah farmashiiste dhameystiray tababarkiisa" },
    { icon: "work.png",      text: "Shaqo maalinleh oo ku saabsan farmashiyaha bulshada iyo farmashiyaha xaaladaha degdega ah" },
    { icon: "pills.png",     text: "Xiriir dhexdhexaadiye u dhexeeya aqoonta xirfadeed iyo bulshooyinka asalkoodu kala duwan yahay" },
    { icon: "school.png",    text: "Xiise weyn u qabo macluumaadka daawooyinka ee cad, la aamin karo oo dhammaanba u sahlan" },
  ],
  ar: [
    { icon: "education.png", text: "بكالوريوس في الكيمياء وعلم الأحياء الدوائي، وحاصل على تأهيل فارماكونوم" },
    { icon: "work.png",      text: "ممارسة يومية في الصيدلية الخاصة وصيدلية المناوبة" },
    { icon: "pills.png",     text: "جسر بين المعرفة المتخصصة والمجتمعات ذات الخلفيات المتنوعة" },
    { icon: "school.png",    text: "شغف حقيقي بتقديم معلومات دوائية واضحة وموثوقة وسهلة الوصول للجميع" },
  ],
};

const ABOUT_ME_META = {
  da: { name: "Ibrahim Dahir Hanaf", title: "Farmakonom & naturvidenskabelig formidler" },
  en: { name: "Ibrahim Dahir Hanaf", title: "Pharmaconomist & science communicator" },
  so: { name: "Ibraahim Dahir Xanaf", title: "Farmashiiste & xog-ogaal caafimaad" },
  ar: { name: "إبراهيم ظاهر حنف",    title: "فارماكونوم ومتخصص في التواصل العلمي" },
};

// ── About Somalimed data ───────────────────────────────────────────────────
const ABOUT_SITE_TAGLINE = {
  da: "Lægemiddelinformation på dit eget sprog",
  en: "Medicine information in your own language",
  so: "Macluumaadka daawooyinka ee luqaddaada hooyo",
  ar: "معلومات الدواء بلغتك الأم",
};

const ABOUT_SITE_BULLETS = {
  da: [
    { icon: "pills.png",     text: "25 nøje udvalgte lægemidler fra den daglige apotekspraksis" },
    { icon: "school.png",    text: "Tilgængelig på dansk, engelsk, somali og arabisk" },
    { icon: "education.png", text: "Fagligt funderet — skrevet af en uddannet Farmakonom" },
    { icon: "work.png",      text: "Løbende udvidelse: antibiotika, antivirale midler, antihistaminer m.m." },
  ],
  en: [
    { icon: "pills.png",     text: "25 carefully selected medicines from everyday pharmacy practice" },
    { icon: "school.png",    text: "Available in Danish, English, Somali and Arabic" },
    { icon: "education.png", text: "Professionally grounded — written by a trained Pharmaconomist" },
    { icon: "work.png",      text: "Continuously expanding: antibiotics, antivirals, antihistamines and more" },
  ],
  so: [
    { icon: "pills.png",     text: "25 daawo oo si taxaddar leh loo xushay shaqada maalinlaha ah ee farmashiyaha" },
    { icon: "school.png",    text: "Ku heli kartaa af-Soomaali, Ingiriisi, Dansk iyo Carabi" },
    { icon: "education.png", text: "Aasaas xirfadeed ah — oo qoray farmashiiste si buuxda u tababaran" },
    { icon: "work.png",      text: "Kor u qaadista joogtada ah: antibiyootikada, daawooyinka fayraska, antihistamiinnada iwm." },
  ],
  ar: [
    { icon: "pills.png",     text: "25 دواءً مختاراً بعناية من الممارسة اليومية في الصيدلية" },
    { icon: "school.png",    text: "متاح باللغات الدنماركية والإنجليزية والصومالية والعربية" },
    { icon: "education.png", text: "أساس مهني متين — بقلم فارماكونوم مؤهل تأهيلاً كاملاً" },
    { icon: "work.png",      text: "توسع مستمر: المضادات الحيوية، مضادات الفيروسات، مضادات الهيستامين وغيرها" },
  ],
};

// ── Medicine card icon/style maps ──────────────────────────────────────────
const SLUG_ICON = {
  amlodipin: "blood-pressure.png", enalapril: "blood-pressure.png", losartan: "blood-pressure.png",
  metoprolol: "blood-pressure.png", eliquis: "line.png", marevan: "line.png", xarelto: "line.png",
  hjertemagnyl: "line.png", atorvastatin: "cholesterol.png", metformin: "blood-test.png",
  insulin: "blood-test.png", ventoline: "lungs.png", symbicort: "lungs.png",
  sertralin: "mental-health.png", quetiapin: "mental-health.png", lamotrigin: "brain.png",
  melatonin: "nighttime.png", zopiclon: "nighttime.png", paracetamol: "download.png",
  ibuprofen: "download.png", diclofenac: "download.png", naproxen: "download.png",
  morfin_tablet: "download.png", morfin_injektion: "download.png", pantoprazol: "stomach.png",
};

const SLUG_STYLE = {
  amlodipin: { color: "#DC2626", bg: "#FEF2F2" }, enalapril: { color: "#DC2626", bg: "#FEF2F2" },
  losartan: { color: "#DC2626", bg: "#FEF2F2" }, metoprolol: { color: "#E11D48", bg: "#FFF1F2" },
  eliquis: { color: "#7C3AED", bg: "#F5F3FF" }, marevan: { color: "#7C3AED", bg: "#F5F3FF" },
  xarelto: { color: "#7C3AED", bg: "#F5F3FF" }, hjertemagnyl: { color: "#6D28D9", bg: "#EDE9FE" },
  atorvastatin: { color: "#D97706", bg: "#FFFBEB" }, metformin: { color: "#0284C7", bg: "#F0F9FF" },
  insulin: { color: "#0284C7", bg: "#F0F9FF" }, ventoline: { color: "#0D9488", bg: "#F0FDFA" },
  symbicort: { color: "#0D9488", bg: "#F0FDFA" }, sertralin: { color: "#8B5CF6", bg: "#F5F3FF" },
  quetiapin: { color: "#A855F7", bg: "#FAF5FF" }, lamotrigin: { color: "#7C3AED", bg: "#F5F3FF" },
  melatonin: { color: "#4F46E5", bg: "#EEF2FF" }, zopiclon: { color: "#6366F1", bg: "#EEF2FF" },
  paracetamol: { color: "#F59E0B", bg: "#FFFBEB" }, ibuprofen: { color: "#EF4444", bg: "#FEF2F2" },
  diclofenac: { color: "#EF4444", bg: "#FEF2F2" }, naproxen: { color: "#EF4444", bg: "#FEF2F2" },
  morfin_tablet: { color: "#059669", bg: "#ECFDF5" }, morfin_injektion: { color: "#059669", bg: "#ECFDF5" },
  pantoprazol: { color: "#10B981", bg: "#ECFDF5" },
};

const DEFAULT_STYLE = { color: "#0D9488", bg: "#F0FDFA" };

const CATEGORY_PILL_ICON = {
  "forhøjet blodtryk": { icon: "blood-pressure.png", color: "#DC2626", bg: "#FEF2F2" },
  "blodtryk & hjertebanken": { icon: "blood-pressure.png", color: "#E11D48", bg: "#FFF1F2" },
  "blodfortyndende": { icon: "line.png", color: "#7C3AED", bg: "#F5F3FF" },
  "blodpropforebyggelse": { icon: "line.png", color: "#6D28D9", bg: "#EDE9FE" },
  "kolesterol": { icon: "cholesterol.png", color: "#D97706", bg: "#FFFBEB" },
  "diabetes": { icon: "blood-test.png", color: "#0284C7", bg: "#F0F9FF" },
  "astma": { icon: "lungs.png", color: "#0D9488", bg: "#F0FDFA" },
  "depression & angst": { icon: "mental-health.png", color: "#8B5CF6", bg: "#F5F3FF" },
  "psykose & bipolar": { icon: "mental-health.png", color: "#A855F7", bg: "#FAF5FF" },
  "epilepsi & bipolar": { icon: "brain.png", color: "#7C3AED", bg: "#F5F3FF" },
  "søvn": { icon: "nighttime.png", color: "#4F46E5", bg: "#EEF2FF" },
  "søvnløshed": { icon: "nighttime.png", color: "#6366F1", bg: "#EEF2FF" },
  "smertestillende": { icon: "download.png", color: "#059669", bg: "#ECFDF5" },
  "smerter og feber": { icon: "download.png", color: "#F59E0B", bg: "#FFFBEB" },
  "smerter og betændelse": { icon: "download.png", color: "#EF4444", bg: "#FEF2F2" },
  "mavesyre og halsbrand": { icon: "stomach.png", color: "#10B981", bg: "#ECFDF5" },
  "dhiig-karka": { icon: "blood-pressure.png", color: "#DC2626", bg: "#FEF2F2" },
  "dhiig-karka & wadne garaac": { icon: "blood-pressure.png", color: "#E11D48", bg: "#FFF1F2" },
  "dhiig-khafiifiye": { icon: "line.png", color: "#7C3AED", bg: "#F5F3FF" },
  "dhiig-xinjir ka hortag": { icon: "line.png", color: "#6D28D9", bg: "#EDE9FE" },
  "kolestarool": { icon: "cholesterol.png", color: "#D97706", bg: "#FFFBEB" },
  "sonkoroow": { icon: "blood-test.png", color: "#0284C7", bg: "#F0F9FF" },
  "neef-mareenka": { icon: "lungs.png", color: "#0D9488", bg: "#F0FDFA" },
  "niyad-jab & welwel": { icon: "mental-health.png", color: "#8B5CF6", bg: "#F5F3FF" },
  "cilad dhimirka & laba-cirifood": { icon: "mental-health.png", color: "#A855F7", bg: "#FAF5FF" },
  "suuxdin & laba-cirifood": { icon: "brain.png", color: "#7C3AED", bg: "#F5F3FF" },
  "hurdo": { icon: "nighttime.png", color: "#4F46E5", bg: "#EEF2FF" },
  "hurdo la'aan": { icon: "nighttime.png", color: "#6366F1", bg: "#EEF2FF" },
  "xanuun baabi'iye": { icon: "download.png", color: "#059669", bg: "#ECFDF5" },
  "xanuun & qandho": { icon: "download.png", color: "#F59E0B", bg: "#FFFBEB" },
  "xanuun & barar": { icon: "download.png", color: "#EF4444", bg: "#FEF2F2" },
  "gaastriga iyo laab-jeexa": { icon: "stomach.png", color: "#10B981", bg: "#ECFDF5" },
  "high blood pressure": { icon: "blood-pressure.png", color: "#DC2626", bg: "#FEF2F2" },
  "blood pressure & palpitations": { icon: "blood-pressure.png", color: "#E11D48", bg: "#FFF1F2" },
  "blood thinner": { icon: "line.png", color: "#7C3AED", bg: "#F5F3FF" },
  "blood clot prevention": { icon: "line.png", color: "#6D28D9", bg: "#EDE9FE" },
  "cholesterol": { icon: "cholesterol.png", color: "#D97706", bg: "#FFFBEB" },
  "asthma": { icon: "lungs.png", color: "#0D9488", bg: "#F0FDFA" },
  "depression & anxiety": { icon: "mental-health.png", color: "#8B5CF6", bg: "#F5F3FF" },
  "psychosis & bipolar": { icon: "mental-health.png", color: "#A855F7", bg: "#FAF5FF" },
  "epilepsy & bipolar": { icon: "brain.png", color: "#7C3AED", bg: "#F5F3FF" },
  "sleep": { icon: "nighttime.png", color: "#4F46E5", bg: "#EEF2FF" },
  "insomnia": { icon: "nighttime.png", color: "#6366F1", bg: "#EEF2FF" },
  "pain relief": { icon: "download.png", color: "#059669", bg: "#ECFDF5" },
  "pain and fever": { icon: "download.png", color: "#F59E0B", bg: "#FFFBEB" },
  "pain and inflammation": { icon: "download.png", color: "#EF4444", bg: "#FEF2F2" },
  "stomach acid and heartburn": { icon: "stomach.png", color: "#10B981", bg: "#ECFDF5" },
  "ارتفاع ضغط الدم": { icon: "blood-pressure.png", color: "#DC2626", bg: "#FEF2F2" },
  "ضغط الدم وخفقان القلب": { icon: "blood-pressure.png", color: "#E11D48", bg: "#FFF1F2" },
  "مميع للدم": { icon: "line.png", color: "#7C3AED", bg: "#F5F3FF" },
  "الوقاية من الجلطات": { icon: "line.png", color: "#6D28D9", bg: "#EDE9FE" },
  "الكوليسترول": { icon: "cholesterol.png", color: "#D97706", bg: "#FFFBEB" },
  "السكري": { icon: "blood-test.png", color: "#0284C7", bg: "#F0F9FF" },
  "الربو": { icon: "lungs.png", color: "#0D9488", bg: "#F0FDFA" },
  "الاكتئاب والقلق": { icon: "mental-health.png", color: "#8B5CF6", bg: "#F5F3FF" },
  "الذهان وثنائي القطب": { icon: "mental-health.png", color: "#A855F7", bg: "#FAF5FF" },
  "الصرع وثنائي القطب": { icon: "brain.png", color: "#7C3AED", bg: "#F5F3FF" },
  "النوم": { icon: "nighttime.png", color: "#4F46E5", bg: "#EEF2FF" },
  "الأرق": { icon: "nighttime.png", color: "#6366F1", bg: "#EEF2FF" },
  "مسكن ألم": { icon: "download.png", color: "#059669", bg: "#ECFDF5" },
  "ألم وحمى": { icon: "download.png", color: "#F59E0B", bg: "#FFFBEB" },
  "ألم والتهاب": { icon: "download.png", color: "#EF4444", bg: "#FEF2F2" },
  "حموضة المعدة وحرقة المعدة": { icon: "stomach.png", color: "#10B981", bg: "#ECFDF5" },
};

function getPillMeta(label) {
  return CATEGORY_PILL_ICON[label] || { icon: "download.png", color: "#0D9488", bg: "#F0FDFA" };
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildCategoryPills(language) {
  const seen = new Set();
  const pills = [];
  for (const item of indexData.items) {
    const label = indexData.subtitles[item.slug]?.[language] || indexData.subtitles[item.slug]?.so || "";
    if (!label || seen.has(label)) continue;
    seen.add(label);
    pills.push({ label, language });
  }
  return pills;
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7.5" /><path d="m20 20-4.2-4.2" />
    </svg>
  );
}

function ShieldInfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z" />
      <path d="M12 8v4" /><path d="M12 16h.01" />
    </svg>
  );
}

// ── Bullet row component ───────────────────────────────────────────────────
function BulletRow({ bullet, palette }) {
  return (
    <li style={{
      display: "flex", alignItems: "center", gap: "14px",
      background: "#fff", borderRadius: "16px", padding: "13px 16px",
      border: `1.5px solid ${palette.color}22`,
      boxShadow: `0 2px 8px ${palette.color}10`,
    }}>
      <span style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 46, height: 46, borderRadius: "13px", flexShrink: 0,
        background: palette.bg,
        border: `1.5px solid ${palette.color}30`,
        boxShadow: `0 2px 8px ${palette.color}20`,
      }}>
        <img
          src={P[bullet.icon.replace(".png","")]}
          alt=""
          style={{ width: 28, height: 28, objectFit: "contain" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </span>
      <span style={{ fontSize: "15px", color: "#1e293b", lineHeight: 1.6, fontWeight: 500 }}>
        {bullet.text}
      </span>
    </li>
  );
}

// ── About Modal ────────────────────────────────────────────────────────────
function AboutModal({ tab, language, onClose }) {
  const isRtl = language === "ar";
  const navLabels = NAV_LABELS[language] ?? NAV_LABELS.so;
  const theme = LANG_THEME[language] ?? LANG_THEME.so;
  const palette = BULLET_PALETTES[language] ?? BULLET_PALETTES.so;
  const meMeta = ABOUT_ME_META[language] ?? ABOUT_ME_META.so;
  const meBullets = ABOUT_ME_BULLETS[language] ?? ABOUT_ME_BULLETS.so;
  const siteBullets = ABOUT_SITE_BULLETS[language] ?? ABOUT_SITE_BULLETS.da;
  const siteTagline = ABOUT_SITE_TAGLINE[language] ?? ABOUT_SITE_TAGLINE.so;
  const bullets = tab === "me" ? meBullets : siteBullets;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", background: "rgba(0,0,0,0.52)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#f8fafc", borderRadius: "28px",
        width: "100%", maxWidth: "540px", maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 40px 100px rgba(0,0,0,0.28)",
        direction: isRtl ? "rtl" : "ltr",
      }}>
        {/* Gradient header */}
        <div style={{
          background: "var(--heroBg)", borderRadius: "28px 28px 0 0",
          padding: "22px 24px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={tab === "me" ? P.education : P.pills}
              alt=""
              style={{ width: 26, height: 26, objectFit: "contain", filter: "brightness(0) invert(1)" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <span style={{ color: "#fff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.01em" }}>
              {tab === "me" ? navLabels.aboutMe : navLabels.aboutSite}
            </span>
          </div>
          <button type="button" onClick={onClose} aria-label="Luk" style={{
            background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%",
            width: 36, height: 36, cursor: "pointer", color: "#fff",
            fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
          }}>✕</button>
        </div>

        <div style={{ padding: "24px 24px 28px" }}>
          {/* Photo card — Om mig only */}
          {tab === "me" && (
            <div style={{
              display: "flex", alignItems: "center", gap: "16px",
              marginBottom: "20px", background: "#fff", borderRadius: "20px",
              padding: "16px 18px",
              border: `1.5px solid ${theme.border}`,
              boxShadow: `0 4px 16px ${theme.primary}15`,
            }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  position: "absolute", inset: "-4px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #14b8a6, #38bdf8, #818cf8)",
                  opacity: 0.9, filter: "blur(2px)",
                }} />
                <img src="/Ibrahim.png" alt={meMeta.name} style={{
                  position: "relative", width: 76, height: 76,
                  borderRadius: "50%", objectFit: "cover",
                  border: "4px solid white", boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }} />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: "19px", color: "#0f172a", margin: 0 }}>{meMeta.name}</p>
                <p style={{ fontSize: "13px", color: theme.primary, margin: "4px 0 0", fontWeight: 600 }}>{meMeta.title}</p>
              </div>
            </div>
          )}

          {/* Tagline — Om Somalimed only */}
          {tab === "site" && (
            <div style={{
              background: theme.tagBg, borderRadius: "16px",
              padding: "16px 20px", marginBottom: "20px",
              border: `1.5px solid ${theme.border}`,
            }}>
              <p style={{ fontWeight: 700, fontSize: "16px", color: theme.primary, margin: 0, textAlign: isRtl ? "right" : "left" }}>
                {siteTagline}
              </p>
            </div>
          )}

          {/* Bullet list — colors cycle per language */}
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {bullets.map((b, i) => (
              <BulletRow key={i} bullet={b} palette={palette[i % palette.length]} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function SiteIndex({ initialLang }) {
  const { language, updateLanguage } = useLanguageRouting({ initialLanguage: initialLang });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [modalTab, setModalTab] = useState(null);

  const text = useMemo(() => indexData.translations[language] || indexData.translations.so, [language]);
  const chromeText = useMemo(() => uiText[language] || uiText.so, [language]);
  const navLabels = useMemo(() => NAV_LABELS[language] ?? NAV_LABELS.so, [language]);

  useEffect(() => { applyLanguageToDocument(language, text.pageTitle); }, [language, text.pageTitle]);
  useEffect(() => { setActiveCategory("all"); }, [language]);

  const categoryPills = useMemo(() => buildCategoryPills(language), [language]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return indexData.items.filter((item) => {
      const subtitle = indexData.subtitles[item.slug]?.[language] || indexData.subtitles[item.slug]?.so || "";
      const matchesCat = activeCategory === "all" || subtitle === activeCategory;
      const displayName = getDisplayName(item.slug, language, item.name);
      const matchSearch = !query || displayName.toLowerCase().includes(query) || item.name.toLowerCase().includes(query) || subtitle.toLowerCase().includes(query);
      return matchesCat && matchSearch;
    });
  }, [activeCategory, language, searchTerm]);

  useScrollReveal([language, activeCategory, searchTerm]);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }} className="min-h-screen">

      {/* ── Sticky top nav ─────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: "72rem", margin: "0 auto", padding: "0 1rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "58px",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "10px", background: "var(--heroBg)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src={P.pills} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "17px", color: "var(--accent, #0d9488)", letterSpacing: "-0.02em" }}>
              Somalimed
            </span>
          </div>

          {/* Tab buttons — right side only */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { key: "me",   icon: P.education, label: navLabels.aboutMe },
              { key: "site", icon: P.work,      label: navLabels.aboutSite },
            ].map(({ key, icon, label }) => {
              const active = modalTab === key;
              return (
                <button key={key} type="button" onClick={() => setModalTab(active ? null : key)} style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  padding: "8px 16px", borderRadius: "999px", border: "1.5px solid",
                  borderColor: active ? "var(--accent, #0d9488)" : "#e2e8f0",
                  background: active ? "var(--accent, #0d9488)" : "#fff",
                  color: active ? "#fff" : "#334155",
                  fontWeight: 600, fontSize: "14px", cursor: "pointer",
                  transition: "all 0.2s", whiteSpace: "nowrap",
                  boxShadow: active ? "0 2px 12px rgba(13,148,136,0.28)" : "0 1px 3px rgba(0,0,0,0.06)",
                }}>
                  <img
                    src={icon} alt=""
                    style={{ width: 18, height: 18, objectFit: "contain" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────── */}
      {modalTab && <AboutModal tab={modalTab} language={language} onClose={() => setModalTab(null)} />}

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--heroBg)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white/90">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" />
            </svg>
            {chromeText.heroEyebrow}
          </div>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl" style={{ lineHeight: 1.1 }}>
            {text.hdrTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{text.hdrSubtitle}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><span className="text-lg font-black text-white">{indexData.items.length}</span>{chromeText.medicinesStat}</span>
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1.5"><span className="text-lg font-black text-white">4</span>{chromeText.languagesStat}</span>
            <span className="text-white/40">·</span>
            <span>{chromeText.heroFormatValue}</span>
          </div>
        </div>
      </div>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="reveal-on-scroll">
          <LanguageSelect label={text.langLabel} onChange={updateLanguage} value={language} />
        </div>

        {/* Search */}
        <div className="reveal-on-scroll mb-6">
          <label htmlFor="medSearch" className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{chromeText.searchLabel}</span>
            <div className="group flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm transition duration-200 focus-within:-translate-y-0.5 focus-within:shadow-xl" style={{ borderColor: "var(--border)" }}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--bg)", color: "var(--accent)" }}>
                <SearchIcon />
              </span>
              <input id="medSearch" className="flex-1 bg-transparent text-base outline-none placeholder:text-slate-400" style={{ color: "var(--text)" }} onChange={(e) => setSearchTerm(e.target.value)} placeholder={chromeText.searchPlaceholder} value={searchTerm} />
              {searchTerm ? (
                <button type="button" className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-90" style={{ background: "var(--bg)", color: "var(--text-muted)" }} onClick={() => setSearchTerm("")}>{chromeText.clearFilters}</button>
              ) : null}
            </div>
          </label>
        </div>

        {/* Category pills */}
        <div className="reveal-on-scroll mb-7">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{chromeText.categoryLabel}</span>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={() => setActiveCategory("all")} style={{
              display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "999px", border: "1.5px solid",
              padding: "8px 18px", fontSize: "14px", fontWeight: 600, lineHeight: 1, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
              ...(activeCategory === "all"
                ? { background: "#1a1a1a", color: "#ffffff", borderColor: "#1a1a1a", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }
                : { background: "var(--surface,#fff)", color: "var(--text)", borderColor: "var(--border)" }),
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", display: "inline-block", flexShrink: 0, background: activeCategory === "all" ? "#fff" : "#888" }} />
              {capitalize(chromeText.allCategories)}
            </button>
            {categoryPills.map(({ label }) => {
              const isActive = activeCategory === label;
              const meta = getPillMeta(label);
              return (
                <button key={label} type="button" onClick={() => setActiveCategory(isActive ? "all" : label)} style={{
                  display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "999px", border: "1.5px solid",
                  padding: "8px 18px", fontSize: "14px", fontWeight: 600, lineHeight: 1, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                  ...(isActive
                    ? { background: meta.color, color: "#ffffff", borderColor: meta.color, boxShadow: `0 2px 12px ${meta.color}50` }
                    : { background: meta.bg, color: meta.color, borderColor: `${meta.color}40` }),
                }}>
                  <img src={`${ICON_BASE}${meta.icon}`} alt="" style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0, filter: isActive ? "brightness(0) invert(1)" : "none", mixBlendMode: isActive ? "normal" : "multiply" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  {capitalize(label)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section heading */}
        <div className="reveal-on-scroll mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{chromeText.libraryEyebrow}</p>
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--text)" }}>{text.pickTitle}</h2>
          </div>
          {filteredItems.length > 0 && (
            <span className="shrink-0 text-sm" style={{ color: "var(--text-muted)" }}>
              {filteredItems.length} {chromeText.medicinesStat.toLowerCase()}
            </span>
          )}
        </div>

        {/* Medicine cards */}
        {filteredItems.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => {
              const subtitle = indexData.subtitles[item.slug]?.[language] || indexData.subtitles[item.slug]?.so || "";
              const style = SLUG_STYLE[item.slug] || DEFAULT_STYLE;
              const iconFile = SLUG_ICON[item.slug] || "download.png";
              const displayName = getDisplayName(item.slug, language, item.name);
              return (
                <li className="reveal-on-scroll" key={item.slug} style={{ transitionDelay: `${Math.min(index * 40, 200)}ms` }}>
                  <Link className="group flex h-full overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: "var(--border)" }} href={{ pathname: `/${item.href}`, query: { lang: language } }}>
                    <div className="w-1.5 shrink-0" style={{ background: style.color }} />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex shrink-0 items-center justify-center rounded-2xl border shadow-[0_10px_24px_rgba(15,23,42,0.08)]" style={{ width: 64, height: 64, background: style.bg, borderColor: `${style.color}22` }}>
                          <img src={`${ICON_BASE}${iconFile}`} alt="" style={{ width: 44, height: 44, objectFit: "contain", mixBlendMode: "multiply" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        </span>
                        <span className="rounded-full font-semibold" style={{ background: style.bg, color: style.color, fontSize: "15px", padding: "7px 15px" }}>
                          {capitalize(subtitle) || capitalize(chromeText.medicinePill)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-bold" style={{ color: "var(--text)" }}>{displayName}</h3>
                      <div className="mt-auto flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--border)", marginTop: "1rem" }}>
                        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{chromeText.openDetails}</span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-white transition duration-300 group-hover:scale-110" style={{ background: style.color }}>→</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <section className="reveal-on-scroll rounded-2xl border bg-white px-8 py-12 text-center" style={{ borderColor: "var(--border)" }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--bg)" }}><SearchIcon /></div>
            <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>{chromeText.noResultsTitle}</h3>
            <p className="mt-2" style={{ color: "var(--text-muted)" }}>{chromeText.noResultsBody}</p>
          </section>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="mx-auto max-w-6xl px-4 pb-14 pt-4">
        <div className="rounded-3xl border bg-white px-6 py-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-start gap-4">
            <div style={{ marginTop: "2px", display: "flex", height: 48, width: 48, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: "14px", background: "var(--bg)", color: "var(--accent)" }}>
              <ShieldInfoIcon />
            </div>
            <div className="min-w-0">
              <strong style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>{text.footerStrong}</strong>
              {text.footer1 && <p style={{ marginTop: "10px", fontSize: "15px", lineHeight: "1.75", color: "var(--text-muted)" }}>{text.footer1}</p>}
              {text.footer3 && <p style={{ marginTop: "10px", fontSize: "15px", lineHeight: "1.75", color: "var(--text-muted)" }}>{text.footer3}</p>}
              {text.footer2 && <p style={{ marginTop: "14px", fontSize: "15px", fontWeight: 600, color: "var(--text-muted)" }}>{text.footer2}</p>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
