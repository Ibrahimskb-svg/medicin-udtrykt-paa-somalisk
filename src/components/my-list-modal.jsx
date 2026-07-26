"use client";
import { useEffect, useMemo, useState } from "react";
import { getIndexData, getDisplayName, getMedicine } from "../lib/site";
import { getMyList, addToMyList, removeFromMyList, subscribeMyList } from "../lib/my-list";
import { ModalShell, LANG_THEME } from "./modal-shell";
import { knownInteractions, pairKey, CHECKED_DATE } from "../data/interactions";

const indexData = getIndexData();

const TEXTS = {
  da: {
    title: "Min medicinliste",
    intro: "Tilføj den medicin, du tager, og vis listen til apotekspersonalet — så er du sikker på, at I taler om det samme.",
    searchPlaceholder: "Søg medicin…",
    yourListTitle: "Din liste",
    empty: "Du har endnu ikke tilføjet nogen medicin.",
    printBtn: "Print / vis til personalet",
    printedOn: "Udskrevet fra Somalimed.dk",
    disclaimer: "Listen bygger på dine egne valg og er ikke en officiel medicinliste. Brug den som udgangspunkt for en samtale med personalet.",
    remove: "Fjern",
    interactionsTitle: "Interaktioner og advarsler for din liste",
    interactionsIntro: "Her er interaktions- og advarselspunkterne for hver medicin på din liste, samlet ét sted — brug det som udgangspunkt for en samtale med apoteket eller lægen.",
    interactionsEmpty: "Ingen interaktions- eller advarselsoplysninger fundet for denne medicin.",
    interactLabel: "Interaktioner",
    warnLabel: "Advarsler",
    officialCheckLabel: "Tjek din kombination på Lægemiddelstyrelsens officielle Interaktionsdatabase ↗",
    pairCheckTitle: "Kombinationstjek",
    pairCheckIntro: "Disse specifikke kombinationer er slået op direkte i Lægemiddelstyrelsens Interaktionsdatabase:",
    levelGreen: "Kan bruges sammen",
    levelOrange: "Kan bruges med forsigtighed",
    levelRed: "Bør undgås sammen",
    pairSourceLabel: "Kilde: Interaktionsdatabasen.dk",
    pairViewSource: "Se opslaget ↗",
    symptomTitle: "Er det en bivirkning?",
    symptomIntro: "Skriv det du mærker (f.eks. \"kvalme\" eller \"svimmelhed\"), så tjekker vi om det allerede står som en kendt bivirkning på et af dine gemte medicin.",
    symptomPlaceholder: "Skriv et symptom…",
    symptomNoMatch: "Ingen af dine gemte medicin nævner det som en bivirkning — men kontakt altid apoteket eller lægen, hvis du er bekymret.",
    symptomMatchIntro: "Det står nævnt som en mulig bivirkning her:",
    symptomDisclaimer: "Dette er ikke en diagnose — brug det som udgangspunkt for en samtale med apoteket eller lægen.",
  },
  en: {
    title: "My medicine list",
    intro: "Add the medicine you take, and show the list to the pharmacy staff — so you're both talking about the same thing.",
    searchPlaceholder: "Search medicine…",
    yourListTitle: "Your list",
    empty: "You haven't added any medicine yet.",
    printBtn: "Print / show to staff",
    printedOn: "Printed from Somalimed.dk",
    disclaimer: "This list is based on your own choices and is not an official medicine list. Use it as a starting point for a conversation with staff.",
    remove: "Remove",
    interactionsTitle: "Interactions and warnings for your list",
    interactionsIntro: "Here are the interaction and warning notes for each medicine on your list, gathered in one place — use it as a starting point for a conversation with the pharmacy or doctor.",
    interactionsEmpty: "No interaction or warning information found for this medicine.",
    interactLabel: "Interactions",
    warnLabel: "Warnings",
    officialCheckLabel: "Check your combination on the Danish Medicines Agency's official Interaction Database ↗",
    pairCheckTitle: "Combination check",
    pairCheckIntro: "These specific combinations have been looked up directly in the Danish Medicines Agency's Interaction Database:",
    levelGreen: "Can be used together",
    levelOrange: "Can be used with caution",
    levelRed: "Should be avoided together",
    pairSourceLabel: "Source: Interaktionsdatabasen.dk",
    pairViewSource: "View the lookup ↗",
    symptomTitle: "Is this a side effect?",
    symptomIntro: "Type what you're feeling (e.g. \"nausea\" or \"dizziness\"), and we'll check if it's already listed as a known side effect of one of your saved medicines.",
    symptomPlaceholder: "Type a symptom…",
    symptomNoMatch: "None of your saved medicines mention that as a side effect — but always contact the pharmacy or doctor if you're worried.",
    symptomMatchIntro: "It's mentioned as a possible side effect here:",
    symptomDisclaimer: "This is not a diagnosis — use it as a starting point for a conversation with the pharmacy or doctor.",
  },
  so: {
    title: "Liiska daawooyinkayga",
    intro: "Ku dar daawooyinka aad qaadanayso, kadibna tus liiska shaqaalaha farmashiyaha — si aad labaduba isla wax ka hadlaysaan.",
    searchPlaceholder: "Raadi daawo…",
    yourListTitle: "Liiskaaga",
    empty: "Wali lama darin daawo liiska.",
    printBtn: "Daabac / tus shaqaalaha",
    printedOn: "Waxaa laga daabacay Somalimed.dk",
    disclaimer: "Liiskani wuxuu ku salaysan yahay doorashadaada gaarka ah, mana aha liis daawooyin oo rasmi ah. U isticmaal si aad wax uga hadasho shaqaalaha.",
    remove: "Ka saar",
    interactionsTitle: "Isdhexgalka iyo digniinaha liiskaaga",
    interactionsIntro: "Halkan waxaa ku yaal qoraallada isdhexgalka iyo digniinaha ee daawo kasta oo ku jirta liiskaaga, oo la isku soo ururiyay meel — u isticmaal si aad wax uga hadasho farmashiga ama dhakhtarka.",
    interactionsEmpty: "Lama helin macluumaad isdhexgal ama digniin ah oo ku saabsan daawadan.",
    interactLabel: "Isdhexgalka",
    warnLabel: "Digniinaha",
    officialCheckLabel: "Ku hubi isdhexgalka daawooyinkaaga bogga rasmiga ah ee Interaktionsdatabasen ↗",
    pairCheckTitle: "Hubinta Isku-darka",
    pairCheckIntro: "Isku-darrada hoos ku qoran waxaa si toos ah looga hubiyay bogga rasmiga ah ee Interaktionsdatabasen:",
    levelGreen: "Waa la isticmaali karaa labadaba",
    levelOrange: "Waa la isticmaali karaa si taxadar leh",
    levelRed: "Waa in laga fogaado isku-darkooda",
    pairSourceLabel: "Isha: Interaktionsdatabasen.dk",
    pairViewSource: "Eeg raadinta ↗",
    symptomTitle: "Waxyeello ma tahay?",
    symptomIntro: "Qor waxa aad dareemayso (tusaale: \"lallabo\" ama \"madax wareer\"), oo aan hubino haddii ay horey ugu qoran tahay sidii waxyeello la yaqaan oo ku socota mid ka mid ah daawooyinka aad ku darsatay liiskaaga.",
    symptomPlaceholder: "Qor calaamad…",
    symptomNoMatch: "Midna kama mid aha daawooyinka aad liiska ku darsatay lama sheegin sidaas — laakiin had iyo jeer la xiriir farmashiga ama dhakhtarka haddii aad walaacsan tahay.",
    symptomMatchIntro: "Waxaa lagu sheegay sidii waxyeello suurtagal ah halkan:",
    symptomDisclaimer: "Tani ma aha ogaanshaha cudur — u isticmaal sidii bilow wax looga hadlayo farmashiga ama dhakhtarka.",
  },
  ar: {
    title: "قائمة أدويتي",
    intro: "أضف الأدوية التي تتناولها، وأظهر القائمة لموظفي الصيدلية — لتكونا على دراية بنفس المعلومات.",
    searchPlaceholder: "البحث عن دواء…",
    yourListTitle: "قائمتك",
    empty: "لم تُضِف أي دواء إلى القائمة بعد.",
    printBtn: "طباعة / إظهار للموظفين",
    printedOn: "تمت الطباعة من Somalimed.dk",
    disclaimer: "تعتمد هذه القائمة على اختيارك الخاص وليست قائمة أدوية رسمية. استخدمها كنقطة بداية للحديث مع الموظفين.",
    remove: "إزالة",
    interactionsTitle: "التفاعلات والتحذيرات لقائمتك",
    interactionsIntro: "فيما يلي ملاحظات التفاعلات والتحذيرات لكل دواء في قائمتك، مجمّعة في مكان واحد — استخدمها كنقطة بداية للحديث مع الصيدلية أو الطبيب.",
    interactionsEmpty: "لم يتم العثور على معلومات تفاعل أو تحذير لهذا الدواء.",
    interactLabel: "التفاعلات",
    warnLabel: "التحذيرات",
    officialCheckLabel: "تحقّق من مجموعتك الدوائية على قاعدة بيانات التفاعلات الدوائية الرسمية التابعة لهيئة الأدوية الدنماركية ↗",
    pairCheckTitle: "فحص التوليفة",
    pairCheckIntro: "تم البحث عن هذه التوليفات المحددة مباشرة في قاعدة بيانات التفاعلات الدوائية التابعة لهيئة الأدوية الدنماركية:",
    levelGreen: "يمكن استخدامهما معًا",
    levelOrange: "يمكن استخدامهما بحذر",
    levelRed: "يجب تجنب الجمع بينهما",
    pairSourceLabel: "المصدر: Interaktionsdatabasen.dk",
    pairViewSource: "عرض نتيجة البحث ↗",
    symptomTitle: "هل هذا عرض جانبي؟",
    symptomIntro: "اكتب ما تشعر به (مثلاً \"غثيان\" أو \"دوخة\")، وسنتحقق مما إذا كان مذكورًا بالفعل كعرض جانبي معروف لأحد أدويتك المحفوظة.",
    symptomPlaceholder: "اكتب عرضًا…",
    symptomNoMatch: "لا يذكر أي من أدويتك المحفوظة ذلك كعرض جانبي — لكن تواصل دائمًا مع الصيدلية أو الطبيب إذا كنت قلقًا.",
    symptomMatchIntro: "مذكور كعرض جانبي محتمل هنا:",
    symptomDisclaimer: "هذا ليس تشخيصًا — استخدمه كنقطة بداية للحديث مع الصيدلية أو الطبيب.",
  },
};

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7.5" /><path d="m20 20-4.2-4.2" />
    </svg>
  );
}

function ListIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" />
      <path d="M4.5 6h.01" /><path d="M4.5 12h.01" /><path d="M4.5 18h.01" />
    </svg>
  );
}

function TrashIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function CheckIcon({ size = 14, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function initialsBadge(name, theme) {
  const letter = name.trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden="true"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 34, height: 34, borderRadius: "10px", flexShrink: 0,
        background: theme.soft, border: `1.5px solid ${theme.border}`,
        color: theme.primary, fontWeight: 800, fontSize: "14px",
      }}
    >
      {letter}
    </span>
  );
}

export function MyListModal({ language, onClose }) {
  const isRtl = language === "ar";
  const theme = LANG_THEME[language] ?? LANG_THEME.so;
  const t = TEXTS[language] ?? TEXTS.so;
  const [list, setList] = useState(() => getMyList());
  const [query, setQuery] = useState("");
  const [openSlug, setOpenSlug] = useState(null);
  const [symptomQuery, setSymptomQuery] = useState("");

  useEffect(() => subscribeMyList(setList), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return indexData.items;
    return indexData.items.filter((item) => {
      const displayName = getDisplayName(item.slug, language, item.name);
      return displayName.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    });
  }, [query, language]);

  const selectedItems = useMemo(
    () => list.map((slug) => indexData.items.find((i) => i.slug === slug)).filter(Boolean),
    [list]
  );

  const pairChecks = useMemo(() => {
    const results = [];
    for (let i = 0; i < selectedItems.length; i++) {
      for (let j = i + 1; j < selectedItems.length; j++) {
        const a = selectedItems[i];
        const b = selectedItems[j];
        const known = knownInteractions[pairKey(a.slug, b.slug)];
        if (known) results.push({ a, b, ...known });
      }
    }
    return results;
  }, [selectedItems]);

  const interactionNotes = useMemo(() => {
    return selectedItems.map((item) => {
      const medicine = getMedicine(item.slug);
      const data = medicine?.translations?.[language] || medicine?.translations?.so;
      const groupFor = (variant) => {
        const sections = (medicine?.sections || []).filter((s) => s.variant === variant);
        const bullets = sections.flatMap((s) => data?.[s.listKey] || []);
        const title = sections.map((s) => data?.[s.titleKey]).find(Boolean);
        return { title, bullets };
      };
      return {
        slug: item.slug,
        name: item.name,
        dose: groupFor("dose"),
        interact: groupFor("interact"),
        warn: groupFor("warn"),
        side: groupFor("side"),
      };
    });
  }, [selectedItems, language]);

  const symptomMatches = useMemo(() => {
    const q = symptomQuery.trim().toLowerCase();
    if (!q) return null;
    return interactionNotes
      .map(({ slug, name, side }) => ({
        slug,
        name,
        hits: side.bullets.filter((b) => b.toLowerCase().includes(q)),
      }))
      .filter((entry) => entry.hits.length > 0);
  }, [symptomQuery, interactionNotes]);

  function toggle(slug) {
    if (list.includes(slug)) removeFromMyList(slug);
    else addToMyList(slug);
  }

  function printList() {
    const win = window.open("", "_blank", "width=420,height=640");
    if (!win) return;

    const escapeHtml = (s) =>
      String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const rows = selectedItems
      .map((item) => {
        const danish = item.name;
        const local = getDisplayName(item.slug, language, item.name);
        const notes = interactionNotes.find((n) => n.slug === item.slug);
        const doseBullets = notes?.dose?.bullets || [];
        const doseHtml = doseBullets.length
          ? `<ul class="dose">${doseBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
          : "";
        return `<li><strong>${escapeHtml(danish)}</strong>${local !== danish ? `<br><span>${escapeHtml(local)}</span>` : ""}${doseHtml}</li>`;
      })
      .join("");
    win.document.write(`
      <html><head><title>${t.title}</title>
      <meta charset="utf-8">
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:28px;color:#0f172a;direction:${isRtl ? "rtl" : "ltr"};}
        h1{font-size:19px;margin:0 0 4px;color:#0D9488;}
        p.sub{font-size:12px;color:#64748b;margin:0 0 22px;}
        ul{list-style:none;padding:0;margin:0;}
        li{padding:13px 0;border-bottom:1px solid #e2e8f0;font-size:16px;}
        li span{display:block;font-size:13px;color:#64748b;margin-top:3px;}
        ul.dose{list-style:disc;padding:${isRtl ? "0 18px 0 0" : "0 0 0 18px"};margin-top:8px;}
        ul.dose li{padding:2px 0;border-bottom:none;font-size:13px;color:#334155;}
        footer{margin-top:28px;font-size:11px;color:#94a3b8;}
      </style>
      </head><body>
        <h1>${t.title}</h1>
        <p class="sub">${t.printedOn}</p>
        <ul>${rows}</ul>
        <footer>Somalimed.dk</footer>
        <script>window.onload=function(){window.print();};</script>
      </body></html>
    `);
    win.document.close();
  }

  const iconEl = <ListIcon size={22} color="rgba(255,255,255,0.95)" />;

  return (
    <ModalShell title={t.title} iconEl={iconEl} onClose={onClose} isRtl={isRtl}>
      <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.7, margin: "0 0 22px", textAlign: isRtl ? "right" : "left" }}>
        {t.intro}
      </p>

      {/* ── Søgning ────────────────────────────────────────────────────── */}
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
          placeholder={t.searchPlaceholder}
          style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", background: "transparent", color: "#0f172a" }}
        />
      </div>

      {/* ── Checkliste ─────────────────────────────────────────────────── */}
      <ul
        style={{
          listStyle: "none", margin: "0 0 24px", padding: 0,
          display: "flex", flexDirection: "column", gap: "8px",
          maxHeight: "280px", overflowY: "auto",
        }}
      >
        {filtered.map((item) => {
          const checked = list.includes(item.slug);
          const local = getDisplayName(item.slug, language, item.name);
          return (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() => toggle(item.slug)}
                aria-pressed={checked}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 12px", borderRadius: "14px", cursor: "pointer",
                  border: checked ? `1.5px solid ${theme.primary}` : "1.5px solid #e5e7eb",
                  background: checked ? `${theme.primary}0d` : "#fff",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {initialsBadge(item.name, theme)}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 700, fontSize: "14.5px", color: "#0f172a" }}>{item.name}</span>
                  {local !== item.name && (
                    <span style={{ display: "block", fontSize: "12.5px", color: "#64748b", marginTop: "1px" }}>{local}</span>
                  )}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 24, height: 24, borderRadius: "8px", flexShrink: 0,
                    border: checked ? "none" : "1.5px solid #cbd5e1",
                    background: checked ? theme.primary : "transparent",
                  }}
                >
                  {checked && <CheckIcon />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <hr style={{ border: "none", borderTop: "1.5px solid #e2e8f0", margin: "0 0 22px" }} />

      {/* ── Din liste ──────────────────────────────────────────────────── */}
      <p style={{ fontWeight: 700, fontSize: "13px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px", textAlign: isRtl ? "right" : "left" }}>
        {t.yourListTitle} {selectedItems.length > 0 && `(${selectedItems.length})`}
      </p>

      {selectedItems.length === 0 ? (
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 22px" }}>{t.empty}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {selectedItems.map((item) => {
            const local = getDisplayName(item.slug, language, item.name);
            return (
              <li
                key={item.slug}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 12px", borderRadius: "14px",
                  background: theme.tagBg, border: `1.5px solid ${theme.border}`,
                }}
              >
                {initialsBadge(item.name, theme)}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 700, fontSize: "14.5px", color: "#0f172a" }}>{item.name}</span>
                  {local !== item.name && (
                    <span style={{ display: "block", fontSize: "12.5px", color: "#64748b", marginTop: "1px" }}>{local}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromMyList(item.slug)}
                  aria-label={t.remove}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 34, height: 34, borderRadius: "10px", flexShrink: 0,
                    border: "1.5px solid #fecaca", background: "#fff", color: "#dc2626", cursor: "pointer",
                  }}
                >
                  <TrashIcon />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selectedItems.length >= 2 && (
        <div style={{ marginBottom: "22px" }}>
          <p style={{ fontWeight: 700, fontSize: "13px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px", textAlign: isRtl ? "right" : "left" }}>
            {t.interactionsTitle}
          </p>
          <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: 1.6, margin: "0 0 14px", textAlign: isRtl ? "right" : "left" }}>
            {t.interactionsIntro}
          </p>

          {pairChecks.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <p style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a", margin: "0 0 6px", textAlign: isRtl ? "right" : "left" }}>
                {t.pairCheckTitle}
              </p>
              <p style={{ fontSize: "12.5px", color: "#475569", lineHeight: 1.5, margin: "0 0 10px", textAlign: isRtl ? "right" : "left" }}>
                {t.pairCheckIntro}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {pairChecks.map(({ a, b, level, sourceUrl }) => {
                  const colors = {
                    green: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", dot: "#16a34a", emoji: "🟢" },
                    orange: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", dot: "#ea580c", emoji: "🟠" },
                    red: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", dot: "#dc2626", emoji: "🔴" },
                  }[level];
                  const levelLabel = { green: t.levelGreen, orange: t.levelOrange, red: t.levelRed }[level];
                  return (
                    <div
                      key={`${a.slug}-${b.slug}`}
                      style={{ borderRadius: "12px", border: `1.5px solid ${colors.border}`, background: colors.bg, padding: "10px 12px", textAlign: isRtl ? "right" : "left" }}
                    >
                      <p style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a", margin: "0 0 4px" }}>
                        {a.name} + {b.name}
                      </p>
                      <p style={{ fontSize: "12.5px", fontWeight: 700, color: colors.text, margin: "0 0 6px" }}>
                        {colors.emoji} {levelLabel}
                      </p>
                      <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
                        {t.pairSourceLabel} ({CHECKED_DATE}) ·{" "}
                        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, fontWeight: 700 }}>
                          {t.pairViewSource}
                        </a>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <a
            href="https://interaktionsdatabasen.dk/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              borderRadius: "14px", border: `1.5px solid ${theme.border}`, background: theme.soft,
              padding: "12px 14px", marginBottom: "14px", textDecoration: "none",
              fontSize: "13px", fontWeight: 700, color: theme.primary, lineHeight: 1.5,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            🔗 {t.officialCheckLabel}
          </a>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {interactionNotes.map(({ slug, name, interact, warn }) => {
              const hasAny = interact.bullets.length > 0 || warn.bullets.length > 0;
              const isOpen = openSlug === slug;
              return (
                <div
                  key={slug}
                  style={{
                    borderRadius: "14px", border: "1.5px solid #e2e8f0", background: "#fff",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenSlug(isOpen ? null : slug)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "10px",
                      padding: "12px 14px", background: "transparent", border: "none", cursor: "pointer",
                      textAlign: isRtl ? "right" : "left",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", flex: 1 }}>{name}</span>
                    {warn.bullets.length > 0 && (
                      <span
                        aria-hidden="true"
                        style={{ width: 9, height: 9, borderRadius: "50%", background: "#dc2626", flexShrink: 0 }}
                      />
                    )}
                    {interact.bullets.length > 0 && (
                      <span
                        aria-hidden="true"
                        style={{ width: 9, height: 9, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.15s ease", color: "#94a3b8", fontSize: "12px",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ padding: "0 14px 14px", textAlign: isRtl ? "right" : "left" }}>
                      {!hasAny && <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>{t.interactionsEmpty}</p>}

                      {warn.bullets.length > 0 && (
                        <div style={{ borderRadius: "10px", border: "1.5px solid #fecaca", background: "#fef2f2", padding: "9px 11px", marginBottom: interact.bullets.length > 0 ? "8px" : 0 }}>
                          <p style={{ fontWeight: 700, fontSize: "12px", color: "#991b1b", margin: "0 0 5px" }}>⚠️ {warn.title || t.warnLabel}</p>
                          <ul style={{ margin: 0, padding: isRtl ? 0 : "0 0 0 16px", paddingRight: isRtl ? "16px" : 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                            {warn.bullets.map((bullet, i) => (
                              <li key={i} style={{ fontSize: "12.5px", color: "#334155", lineHeight: 1.5 }}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {interact.bullets.length > 0 && (
                        <div style={{ borderRadius: "10px", border: "1.5px solid #bbf7d0", background: "#f0fdf4", padding: "9px 11px" }}>
                          <p style={{ fontWeight: 700, fontSize: "12px", color: "#166534", margin: "0 0 5px" }}>🟢 {interact.title || t.interactLabel}</p>
                          <ul style={{ margin: 0, padding: isRtl ? 0 : "0 0 0 16px", paddingRight: isRtl ? "16px" : 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                            {interact.bullets.map((bullet, i) => (
                              <li key={i} style={{ fontSize: "12.5px", color: "#334155", lineHeight: 1.5 }}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedItems.length >= 1 && (
        <div style={{ marginBottom: "22px" }}>
          <p style={{ fontWeight: 700, fontSize: "13px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px", textAlign: isRtl ? "right" : "left" }}>
            {t.symptomTitle}
          </p>
          <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: 1.6, margin: "0 0 12px", textAlign: isRtl ? "right" : "left" }}>
            {t.symptomIntro}
          </p>

          <div
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              borderRadius: "14px", border: "1.5px solid #e2e8f0", background: "#fff",
              padding: "11px 14px", marginBottom: "12px",
            }}
          >
            <span style={{ color: "#94a3b8", display: "flex" }}><SearchIcon /></span>
            <input
              value={symptomQuery}
              onChange={(e) => setSymptomQuery(e.target.value)}
              placeholder={t.symptomPlaceholder}
              style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", background: "transparent", color: "#0f172a" }}
            />
          </div>

          {symptomMatches !== null && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {symptomMatches.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, textAlign: isRtl ? "right" : "left" }}>{t.symptomNoMatch}</p>
              ) : (
                symptomMatches.map(({ slug, name, hits }) => (
                  <div
                    key={slug}
                    style={{ borderRadius: "10px", border: "1.5px solid #fed7aa", background: "#fff7ed", padding: "9px 11px", textAlign: isRtl ? "right" : "left" }}
                  >
                    <p style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a", margin: "0 0 4px" }}>{name}</p>
                    <p style={{ fontSize: "11.5px", color: "#9a3412", fontWeight: 600, margin: "0 0 5px" }}>🟠 {t.symptomMatchIntro}</p>
                    <ul style={{ margin: 0, padding: isRtl ? 0 : "0 0 0 16px", paddingRight: isRtl ? "16px" : 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                      {hits.map((bullet, i) => (
                        <li key={i} style={{ fontSize: "12.5px", color: "#334155", lineHeight: 1.5 }}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
              <p style={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.5, margin: 0, textAlign: isRtl ? "right" : "left" }}>
                {t.symptomDisclaimer}
              </p>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={printList}
        disabled={selectedItems.length === 0}
        style={{
          width: "100%", padding: "14px 20px", borderRadius: "14px", border: "none",
          background: selectedItems.length === 0 ? "#cbd5e1" : theme.primary,
          color: "#fff", fontWeight: 700, fontSize: "15px",
          cursor: selectedItems.length === 0 ? "not-allowed" : "pointer",
          marginBottom: "18px",
        }}
      >
        {t.printBtn}
      </button>

      <p style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.6, margin: 0, textAlign: isRtl ? "right" : "left" }}>
        {t.disclaimer}
      </p>
    </ModalShell>
  );
}
