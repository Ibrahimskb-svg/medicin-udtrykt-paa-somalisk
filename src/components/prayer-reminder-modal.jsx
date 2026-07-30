"use client";
import { useEffect, useMemo, useState } from "react";
import { DANISH_CITIES, getPrayerTimesForDate } from "../lib/prayer-times";

const LABELS = {
  da: {
    title: "Bønnetider",
    subtitle: "Vælg din by for at tilpasse påmindelsen til Suhoor og Iftar",
    cityLabel: "By",
    suhoorLabel: "Suhoor (før Fajr)",
    suhoorDesc: "Sidste tidspunkt for morgenmad før fasten begynder",
    iftarLabel: "Iftar (Maghrib)",
    iftarDesc: "Tidspunkt for at bryde fasten",
    confirm: "Brug disse tidspunkter",
    cancel: "Annuller",
    disclaimer:
      "Beregnet ud fra solens position for den valgte by (Muslim World League-metoden) — ikke en specifik moskés officielle skema.",
    close: "Luk",
  },
  en: {
    title: "Prayer times",
    subtitle: "Choose your city to align the reminder with Suhoor and Iftar",
    cityLabel: "City",
    suhoorLabel: "Suhoor (before Fajr)",
    suhoorDesc: "Last time to eat before the fast begins",
    iftarLabel: "Iftar (Maghrib)",
    iftarDesc: "Time to break the fast",
    confirm: "Use these times",
    cancel: "Cancel",
    disclaimer:
      "Calculated from the sun's position for the chosen city (Muslim World League method) — not a specific mosque's official schedule.",
    close: "Close",
  },
  so: {
    title: "Waqtiyada salaadda",
    subtitle: "Dooro magaaladaada si aad ugu habayso xasuusinta Sahuur iyo Iftar",
    cityLabel: "Magaalada",
    suhoorLabel: "Sahuur (ka hor Subax)",
    suhoorDesc: "Waqtiga ugu dambeeya ee wax lagu cuni karo ka hor inta soonku bilaabmin",
    iftarLabel: "Iftar (Maghrib)",
    iftarDesc: "Waqtiga soonka lagu furo",
    confirm: "Isticmaal waqtiyadan",
    cancel: "Jooji",
    disclaimer:
      "Waxaa lagu xisaabiyay meesha qorraxdu ka muuqato ee magaalada la doortay (habka Muslim World League) — mana aha jadwalka rasmiga ah ee masaajid gaar ah.",
    close: "Xir",
  },
  ar: {
    title: "أوقات الصلاة",
    subtitle: "اختر مدينتك لمواءمة التذكير مع السحور والإفطار",
    cityLabel: "المدينة",
    suhoorLabel: "السحور (قبل الفجر)",
    suhoorDesc: "آخر وقت للأكل قبل بدء الصيام",
    iftarLabel: "الإفطار (المغرب)",
    iftarDesc: "وقت كسر الصيام",
    confirm: "استخدم هذه الأوقات",
    cancel: "إلغاء",
    disclaimer:
      "محسوبة بناءً على موضع الشمس للمدينة المختارة (طريقة رابطة العالم الإسلامي) — وليست الجدول الرسمي لمسجد معين.",
    close: "إغلاق",
  },
};

const LAST_CITY_KEY = "somalimed-prayer-city";

export function PrayerReminderModal({ language, isRtl, onClose, onConfirm }) {
  const t = LABELS[language] || LABELS.da;
  const [cityId, setCityId] = useState(DANISH_CITIES[0].id);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(LAST_CITY_KEY) : null;
    if (stored && DANISH_CITIES.some((c) => c.id === stored)) setCityId(stored);
  }, []);

  const city = useMemo(() => DANISH_CITIES.find((c) => c.id === cityId) || DANISH_CITIES[0], [cityId]);
  const times = useMemo(() => getPrayerTimesForDate(new Date(), city), [city]);

  function handleConfirm() {
    window.localStorage.setItem(LAST_CITY_KEY, cityId);
    onConfirm({ fajr: times.fajr, maghrib: times.maghrib, cityName: city.name });
  }

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      className="sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#f8fafc", borderRadius: "28px 28px 0 0", width: "100%", maxWidth: "440px", direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}
        className="sm:rounded-[28px] shadow-2xl"
      >
        <div style={{ background: "linear-gradient(135deg,#166534,#16a34a)", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "white", fontWeight: 800, fontSize: "18px" }}>{t.title}</span>
          <button onClick={onClose} aria-label={t.close} style={{ color: "white", background: "rgba(255,255,255,0.2)", border: "none", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontWeight: "bold", flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: "24px" }}>
          <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, margin: "0 0 18px" }}>{t.subtitle}</p>

          <label className="block" style={{ marginBottom: "18px" }}>
            <span style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: "6px" }}>{t.cityLabel}</span>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#fff", fontSize: "15px", fontWeight: 600, color: "#0f172a" }}
            >
              {DANISH_CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 16px", borderRadius: "14px", background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#166534" }}>{t.suhoorLabel}</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#4d7c0f" }}>{t.suhoorDesc}</p>
              </div>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#166534", flexShrink: 0 }}>{times.fajr}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 16px", borderRadius: "14px", background: "#fff7ed", border: "1.5px solid #fed7aa" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#9a3412" }}>{t.iftarLabel}</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#c2410c" }}>{t.iftarDesc}</p>
              </div>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#9a3412", flexShrink: 0 }}>{times.maghrib}</span>
            </div>
          </div>

          <p style={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.6, margin: "0 0 20px" }}>{t.disclaimer}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={handleConfirm}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px", borderRadius: "12px", border: "none", background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              {t.confirm}
            </button>
            <button
              onClick={onClose}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px", borderRadius: "12px", border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
