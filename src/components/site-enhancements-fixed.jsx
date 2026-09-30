"use client";

import { useEffect } from "react";
import QRCode from "qrcode";

import { SiteEnhancements } from "./site-enhancements";

const SOCIALS = [
  {
    key: "tiktok",
    href: "https://www.tiktok.com/@hoyga_afka",
    selector: 'a[href*="tiktok.com/@hoyga_afka"]',
    gradient: "linear-gradient(135deg,#111827 0%,#0f172a 55%,#1f2937 100%)",
    border: "rgba(37,244,238,0.34)",
    glow: "rgba(37,244,238,0.16)",
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/hoyga_afka/",
    selector: 'a[href*="instagram.com/hoyga_afka"]',
    gradient: "linear-gradient(135deg,#F58529 0%,#DD2A7B 42%,#8134AF 72%,#515BD4 100%)",
    border: "rgba(193,53,132,0.30)",
    glow: "rgba(193,53,132,0.16)",
  },
  {
    key: "facebook",
    href: "https://www.facebook.com/HoygaAfka/",
    selector: 'a[href*="facebook.com/HoygaAfka"]',
    gradient: "linear-gradient(135deg,#60A5FA 0%,#2563EB 55%,#1D4ED8 100%)",
    border: "rgba(24,119,242,0.30)",
    glow: "rgba(24,119,242,0.14)",
  },
];

const STYLE_ID = "hoyga-afka-social-polish";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes hoygaSocialFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    #hoyga-afka-promo-root a[data-hoyga-social="true"] {
      position: relative;
      overflow: hidden;
      transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
      animation: hoygaSocialFloat 5s ease-in-out infinite;
    }

    #hoyga-afka-promo-root a[data-hoyga-social="true"]::before {
      content: "";
      position: absolute;
      inset: 0 0 auto 0;
      height: 5px;
      background: var(--hoyga-gradient);
      opacity: .95;
    }

    #hoyga-afka-promo-root a[data-hoyga-social="true"]:hover {
      transform: translateY(-6px) scale(1.015);
    }

    #hoyga-afka-promo-root a[data-hoyga-social="true"] img[data-hoyga-qr="true"] {
      width: 116px !important;
      height: 116px !important;
      padding: 7px !important;
      border-radius: 18px !important;
      border: 1px solid rgba(148,163,184,.22) !important;
      background: #fff !important;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.85), 0 8px 22px rgba(15,23,42,.08) !important;
      object-fit: contain !important;
    }

    @media (prefers-reduced-motion: reduce) {
      #hoyga-afka-promo-root a[data-hoyga-social="true"] {
        animation: none;
      }
    }
  `;
  document.head.appendChild(style);
}

async function repairSocialCards() {
  const root = document.getElementById("hoyga-afka-promo-root");
  if (!root) return false;

  ensureStyles();

  await Promise.all(
    SOCIALS.map(async (social, index) => {
      const card = root.querySelector(social.selector);
      if (!card) return;

      card.dataset.hoygaSocial = "true";
      card.style.setProperty("--hoyga-gradient", social.gradient);
      card.style.borderColor = social.border;
      card.style.boxShadow = `0 14px 34px ${social.glow}`;
      card.style.animationDelay = `${index * 0.45}s`;

      const qrImage = card.querySelector("img");
      if (!qrImage || qrImage.dataset.hoygaQrReady === social.href) return;

      try {
        const qrSrc = await QRCode.toDataURL(social.href, {
          width: 320,
          margin: 2,
          errorCorrectionLevel: "H",
          color: { dark: "#000000", light: "#FFFFFF" },
        });

        qrImage.src = qrSrc;
        qrImage.dataset.hoygaQr = "true";
        qrImage.dataset.hoygaQrReady = social.href;
        qrImage.removeAttribute("aria-hidden");
        qrImage.alt = `${social.key} QR code`;
      } catch (error) {
        console.error(`Could not generate ${social.key} QR code`, error);
      }
    })
  );

  return true;
}

export function SiteEnhancementsFixed() {
  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    const runRepair = async () => {
      if (cancelled) return;
      const repaired = await repairSocialCards();
      if (!repaired && !cancelled) {
        timeoutId = window.setTimeout(runRepair, 100);
      }
    };

    runRepair();

    const observer = new MutationObserver(() => {
      if (!cancelled) repairSocialCards();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return <SiteEnhancements />;
}
