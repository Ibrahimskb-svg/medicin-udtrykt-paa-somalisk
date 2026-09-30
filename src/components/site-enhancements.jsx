"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";

import { notifyLanguageChange, subscribeToLanguageChange } from "../lib/language";

const LOGO = "data:image/webp;base64,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";
const QR = {
  tiktok: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKUAAAClCAIAAACySaqNAAAC+0lEQVR42u3dS27EIBBF0TjK/rfcmWdgidSHMj532lE34apKT8bA9fl8vvAavk0B3+AbfINv8A2+wTf4Rio/9x9f19Uzjj+P+e5/N/LHS0SGsTTIuplU3/o5+AbfOD2vJWafxChUN8jEgDZkJtW3fg6+wTdeltciSaHuRbn7b0587LX0VUv/b9tMqm/9HHyDb7wsr9URSUZt65KRgKa+wTf4Bt94eF6ri35/SEyC6ht8g2/wjXl5bVdgSXxklriIGZmNtplU3/o5+AbfOD2vtW1yjASluk+XYuPSW3XqG3yDb/CN/+a1IUt+ba+k1b0KN2Qm1bd+Dr7BN57HFdlcOSRkJTLzkVmiI/Wtn4Nv8I3T81pd6Fj63Znn5bbFt8g8q2/9HHyDb7w7r9UtFw65ZqHtoLe6bQ/qWz8H3+Abz2Pb/QaJa3yJGwzqjs9dCoZ1S8nqWz8H3+Abz6NwPXTmC2u7XsGru4Bq6ZvVt34OvsE33p3X6l7Wf+LN6nXRLzIq9a2fg2/wjeexdp5H4gmxdTer1738lbhampjI3PcOvsE33zicq26dLjFGReLMUozadZRb2zyrb/0cfINvnJ7X6kLHkBXPIUu6dRbUt34OvsE3jstrdfsNhlylXnfoSGLGTDxvTn3r5+AbfOO4vJYYduqi0MxB1mW9SNRV3/o5+AbfeFleyxxH3llmu7LekGeC8hr45ht84zR+6qJBJKBFElkdQ+4PtT8UfINv8C2vJSWyxOyzNIzEGwxm3imlvsE3+Abf8tp/E0pbfFtKVXXBcIm6rabqG3yDb77x7ryWmBTaIknkd9vWNBPTq/M8wDf45hvyWlK62XXtQNu2zcTod/+7nq+Bb/ANvuW1ASTuD41EzrqV1raTh9W3fg6+wTfktXnsOuN3KUXu2mqqvvVz8A2+8bK8tuvstrZUdR+jIsujkUFG0pz61s/BN/jG6Xmtbbto4ulskeM9EgNpXYq03wB8g2++cThT7jeA+gbf4Bt8g2/wzTf4Bt94Ir/RojJN6i+yVQAAAABJRU5ErkJggg==",
  instagram: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKUAAAClCAIAAACySaqNAAADEUlEQVR42u3d226kMBBF0RD1//9y572loFTqYgxrv86kMWxV6cjY5ni/3194DN8eAd/gG3yDb/ANvsE3+EYpr/N/Po5jZhzn03wfwwjNCWZu4eNC5z8VuoVVT1J96+fgG3zjdnktlAVChPJLKDf1hZ3C21/1JNW3fg6+wTfuntcKM9dYyDofc2YGLTPdtupJqm/9HHyDbzwsr41R+D70PHP1vZZV3+AbfINv3DqvFYa785mszJvWLdKc+tbPwTf4xsPyWl8kyWSu0JgvEtDGwp361s/BN/jG3fPa2CbHvgiWeT3a92pVfYNv8A2+8Xtu2GIRVuF0W2GMyuQ19Q2+wTf4xl+Jnb+WWY5fuPUyFMEKE1nmfi8S7tS3fg6+wTdOz2t9802Fx2xkQlYmkfXtDy3c06q+9XPwDb7xeFYmGoztl8zMoI29Wg09c2EiC/2z+tbPwTf4xnF5bSxkhcjExrGZrL4jf0ODo771c/ANviGv/Td0jE3VFc7NhZ5qzxSpvvVz8A2+8Twq169l4kzfbspH7PEci2/qWz8H3+Abx+W1zOFlhQvH7trUuefgZO6rvvVz8A2+cVxe2+RLAmPTT5lLjU3GZS6lvvVz8A2+cVxeK9xr2Xe8R+gnZJJRX5ob+4HqWz8H3+Abx+W1UDQYO/isML/0nb/Wd4pvJlSqb/0cfINvnJ7XMu8WCz/rWbiFIDPNV/gTMsNu/Rr4Bt9843DW2MGtY5tJ+7JP37EiYye7qW/9HHyDbzyPxv2hoStXRtCpPRKFc3OZfGr9GvgG33zjcNbYKWmF0W+T+bVNluCpb/ANvvnG4cTm18b++a6PfhYGtMJXnL5HBf0cfINvea0oKRQmo7vWvo29pe1bCai+wTff4Bsvy2t9caZwzqjwGNu+16N9J8rZHwq+wTffkNdGMlfhlfvO5Bg72c36NfANvsE3ivJaH4/4ttNYuCv8vepbPwff4Bvy2kiMKjxs9q4dr6GAVphe1bd+Dr7BN16W1zb5JmZfmssko9BD9n3BXn3r5+AbfOPxrLGEkskvY7Fxk/PXMvd1ngf45ht842V5DeobfINv8A2+wTf4Bt/gGxf8AiIxJlO2aCcPAAAAAElFTkSuQmCC",
  facebook: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKUAAAClCAIAAACySaqNAAADEklEQVR42u3dS26EMBBF0TjK/rfcmWeAVKkPxpw7TQS0r6r0ZGyzPp/PF17DtyHgG3yDb/ANvsE3+AbfKOXn+s9rrZnnuJ7mu36M0BThn0tl7lv4E8ZGUn3r5+AbfOO4vJZJRpkkeFdAu75R6JmvbzQ2kupbPwff4Bsvy2uZpNAXlDL3zYSswimzvpFU3/o5+AbfeHde24RM2MlM1RXGKPUNvsE3+MbT8tr1tFffWrCxVWbqG3yDb/CNkbzWN6NU+PJ0LOvtOZLqWz8H3+AbL8trY2Ens0kgE5RCWS/017tGUn3r5+AbfOP0vHbXmqzCZWVjV95zJNW3fg6+wTdOz2t9802Fx2xkQlYmkfXtDy3c06q+9XPwDb7xeFYmGoztl8zMoI29Wg09c2EiC/2z+tbPwTf4xnF5bSxkhcjExrGZrL4jf0ODo771c/ANviGv/Td0jE3VFc7NhZ5qzxSpvvVz8A2+8Twq169l4kzfbspH7PEci2/qWz8H3+Abx+W1zOFlhQvH7trUuefgZO6rvvVz8A2+cVxe2+RLAmPTT5lLjU3GZS6lvvVz8A2+cVxeK9xr2Xe8R+gnZJJRX5ob+4HqWz8H3+Abx+W1UDQYO/isML/0nb/Wd4pvJlSqb/0cfINvnJ7XMu8WCz/rWbiFIDPNV/gTMsNu/Rr4Bt9843DW2MGtY5tJ+7JP37EiYye7qW/9HHyDbzyPxv2hoStXRtCpPRKFc3OZfGr9GvgG33zjcNbYKWmF0W+T+bVNluCpb/ANvvnG4cTm18b++a6PfhYGtMJXnL5HBf0cfINvea0oKRQmo7vWvo29pe1bCai+wTff4Bsvy2t9caZwzqjwGNu+16N9J8rZHwq+wTffkNdGMlfhlfvO5Bg72c36NfANvsE3ivJaH4/4ttNYuCv8vepbPwff4Bvy2kiMKjxs9q4dr6GAVphe1bd+Dr7BN16W1zb5JmZfmssko9BD9n3BXn3r5+AbfOPxrLGEkskvY7Fxk/PXMvd1ngf45ht842V5DeobfINv8A2+wTf4Bt/gGxf8AiIxJlO2aCcPAAAAAElFTkSuQmCC"
};

const SOCIALS = [
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@hoyga_afka", accent: "#111827" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/hoyga_afka/", accent: "#A21CAF" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/HoygaAfka/", accent: "#2563EB" },
];

const COPY = {
  so: {
    eyebrow: "BARASHADA AF-SOOMAALIGA",
    title: "Ma rabtaa inaad barato ama horumariso Af-Soomaaliga?",
    body: "La soco Hoyga Afka — casharro, erayo iyo agab kaa caawinaya inaad Af-Soomaaliga si kalsooni leh u barato.",
    follow: "Nagala soco baraha bulshada",
    qr: "Ku sawir QR-ka telefoonkaaga",
  },
  da: {
    eyebrow: "LÆR SOMALISK",
    title: "Vil du lære eller blive bedre til somalisk?",
    body: "Følg Hoyga Afka for undervisning, ordforråd og læringsindhold, der gør det lettere at lære somalisk trin for trin.",
    follow: "Følg Hoyga Afka",
    qr: "Scan med din telefon",
  },
  en: {
    eyebrow: "LEARN SOMALI",
    title: "Want to learn Somali or improve your skills?",
    body: "Follow Hoyga Afka for lessons, vocabulary and practical learning content that helps you build confidence in Somali.",
    follow: "Follow Hoyga Afka",
    qr: "Scan with your phone",
  },
  ar: {
    eyebrow: "تعلّم اللغة الصومالية",
    title: "هل ترغب في تعلّم الصومالية أو تطوير مستواك؟",
    body: "تابع Hoyga Afka للحصول على دروس ومفردات ومحتوى تعليمي عملي يساعدك على تعلّم الصومالية بثقة.",
    follow: "تابع Hoyga Afka",
    qr: "امسح الرمز بهاتفك",
  },
};

function SocialIcon({ type }) {
  if (type === "instagram") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
      </svg>
    );
  }
  if (type === "facebook") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.7 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5H17V3.6c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v1.9H7v3.1h3V21h3.7Z"/>
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.2 3c.4 2.1 1.6 3.4 3.8 3.6v2.8c-1.5 0-2.8-.4-3.8-1.1v5.2c0 4.5-4.9 6.7-8 4.1-2-1.7-2.4-4.7-.9-6.8 1.4-1.9 3.8-2.6 5.9-1.7v3c-1.4-.5-3 .2-3.4 1.6-.4 1.3.4 2.7 1.7 3 1.5.4 3-.7 3-2.2V3h1.7Z"/>
    </svg>
  );
}

function HoygaAfkaPromo({ language }) {
  const text = COPY[language] || COPY.so;
  const rtl = language === "ar";

  return (
    <section
      aria-label="Hoyga Afka"
      className="mx-auto max-w-6xl px-4 pb-3 pt-2 sm:pb-5"
      dir={rtl ? "rtl" : "ltr"}
    >
      <div
        className="relative overflow-hidden rounded-[28px] border px-5 py-6 shadow-xl sm:px-7 sm:py-7 lg:px-8"
        style={{
          borderColor: "rgba(120, 19, 21, 0.18)",
          background: "linear-gradient(135deg,#FFFCF8 0%,#FFF7F3 42%,#F0FDFA 100%)",
          boxShadow: "0 18px 55px rgba(15,118,110,0.10), 0 8px 28px rgba(120,19,21,0.08)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-16 h-44 w-44 rounded-full blur-3xl"
          style={{ background: "rgba(120,19,21,0.10)" }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full blur-3xl"
          style={{ background: "rgba(13,148,136,0.12)" }}
        />

        <div className="relative grid gap-6 lg:grid-cols-[1.45fr_1fr] lg:items-center">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex min-h-[76px] min-w-[154px] items-center justify-center rounded-2xl border bg-white px-3 py-2 shadow-sm"
                style={{ borderColor: "rgba(120,19,21,0.12)" }}>
                <img src={LOGO} alt="Hoyga Afka" className="h-[58px] w-auto object-contain" />
              </div>
              <span
                className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-extrabold tracking-[0.14em]"
                style={{ color: "#0F766E", background: "#CCFBF1", border: "1px solid #99F6E4" }}
              >
                {text.eyebrow}
              </span>
            </div>

            <h2 className="max-w-2xl text-[22px] font-extrabold leading-tight text-slate-900 sm:text-[27px]">
              {text.title}
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-7 text-slate-600 sm:text-[15px]">
              {text.body}
            </p>

            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{text.follow}</p>
              <div className="flex flex-wrap gap-2.5">
                {SOCIALS.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover-lift inline-flex min-h-11 items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: `${social.accent}25`, color: social.accent }}
                  >
                    <SocialIcon type={social.key} />
                    {social.label}
                    <span aria-hidden="true" className="text-base opacity-60">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden grid-cols-3 gap-3 sm:grid">
            {SOCIALS.map((social) => (
              <a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border bg-white p-3 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: `${social.accent}22` }}
                aria-label={`${social.label} — ${text.qr}`}
              >
                <div className="mx-auto mb-2 flex h-8 items-center justify-center gap-1.5 text-xs font-extrabold" style={{ color: social.accent }}>
                  <SocialIcon type={social.key} />
                  <span>{social.label}</span>
                </div>
                <img
                  src={QR[social.key]}
                  alt=""
                  aria-hidden="true"
                  className="mx-auto h-[92px] w-[92px] rounded-xl border border-slate-100 bg-white p-1"
                />
                <span className="mt-2 block text-[10px] font-semibold text-slate-400">{text.qr}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteEnhancements() {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguage] = useState("so");
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLanguage = params.get("lang");
    const stored = window.localStorage.getItem("selectedLanguage");
    setLanguage(["so", "da", "en", "ar"].includes(urlLanguage) ? urlLanguage : (["so", "da", "en", "ar"].includes(stored) ? stored : "so"));

    const unsubscribe = subscribeToLanguageChange(setLanguage);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleLogoClick = (event) => {
      const anchor = event.target.closest?.("a");
      if (!anchor) return;
      const logo = anchor.querySelector?.('img[src*="somalimed-icon"]');
      if (!logo) return;

      event.preventDefault();
      window.localStorage.setItem("selectedLanguage", "so");
      setLanguage("so");
      notifyLanguageChange("so");
      router.push("/");
    };

    document.addEventListener("click", handleLogoClick, true);
    return () => document.removeEventListener("click", handleLogoClick, true);
  }, [router]);

  useEffect(() => {
    if (pathname !== "/") {
      setPortalTarget(null);
      return;
    }

    const footer = document.querySelector("footer");
    if (!footer?.parentNode) return;

    let mount = document.getElementById("hoyga-afka-promo-root");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "hoyga-afka-promo-root";
      footer.parentNode.insertBefore(mount, footer);
    }
    setPortalTarget(mount);

    return () => {
      setPortalTarget(null);
      if (mount?.parentNode) mount.parentNode.removeChild(mount);
    };
  }, [pathname]);

  if (pathname !== "/" || !portalTarget) return null;
  return createPortal(<HoygaAfkaPromo language={language} />, portalTarget);
}
