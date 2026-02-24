/* theme.js — fælles tema for index + alle lægemiddel-sider */
(function () {
  const RTL = new Set(["ar", "fa", "ur", "prs", "ps"]);

  // Vælg tydeligt forskellige farver pr. sprog (blå til dansk, pink til arabisk osv.)
  const THEME = {
    so:  { c1:"#0066cc", c2:"#00a676", accent:"#00a676", flash:"#eef9f3" }, // Somali: blå→grøn
    da:  { c1:"#0b5ed7", c2:"#38bdf8", accent:"#0b5ed7", flash:"#edf4ff" }, // Dansk: BLÅ
    en:  { c1:"#7c2d12", c2:"#f97316", accent:"#f97316", flash:"#fff1e8" }, // Engelsk: brun→orange
    ar:  { c1:"#7c3aed", c2:"#ec4899", accent:"#ec4899", flash:"#fde7f3" }, // Arabisk: lilla→pink
    tr:  { c1:"#b91c1c", c2:"#fb7185", accent:"#b91c1c", flash:"#fff0f2" }, // Tyrkisk: rød→rose
    ur:  { c1:"#0f766e", c2:"#22c55e", accent:"#0f766e", flash:"#eefaf4" }, // Urdu: teal→grøn
    fa:  { c1:"#0284c7", c2:"#06b6d4", accent:"#06b6d4", flash:"#e9fbff" }, // Persisk: blå→cyan
    prs: { c1:"#4338ca", c2:"#a855f7", accent:"#4338ca", flash:"#f3e8ff" }, // Dari: indigo→violet
    ps:  { c1:"#92400e", c2:"#f59e0b", accent:"#92400e", flash:"#fff7ed" }  // Pashto: brun→amber
  };

  function getLangFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("lang") || "so";
  }

  function setDirAndLangAttr(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.has(lang) ? "rtl" : "ltr";
  }

  function applyCssVars(lang) {
    const th = THEME[lang] || THEME.so;

    document.documentElement.style.setProperty("--c1", th.c1);
    document.documentElement.style.setProperty("--c2", th.c2);
    document.documentElement.style.setProperty("--accent", th.accent);
    document.documentElement.style.setProperty("--flash", th.flash);

    // Hvis en side stadig har “hardcoded” grøn i header el.lign.,
    // så tvinger vi header til at bruge variablerne.
    const header = document.querySelector("header");
    if (header) {
      header.style.background = `linear-gradient(135deg, ${th.c1}, ${th.c2})`;
      header.style.transition = "background 260ms ease";
    }

    // Valgfrit: gør “drug-icon” farvet efter accent, hvis den har svg strokes
    const iconSvg = document.querySelector(".drug-icon svg");
    if (iconSvg) {
      iconSvg.querySelectorAll("[stroke]").forEach(el => el.setAttribute("stroke", th.accent));
    }
  }

  // Sørger for at alle links bevarer ?lang=xx når man klikker videre
  function patchLinks(lang) {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("http://") || href.startsWith("https://")) return;

      const base = href.split("?")[0];
      a.setAttribute("href", base + "?lang=" + encodeURIComponent(lang));
    });
  }

  // Eksempel: hvis der findes en sprog-dropdown, så hooker vi den automatisk
  function hookLanguageSelect() {
    const sel = document.getElementById("langSelect");
    if (!sel) return;

    // Set initial dropdown korrekt
    const start = getLangFromUrl();
    if (sel.value !== start) sel.value = start;

    sel.addEventListener("change", function () {
      const lang = this.value || "so";

      // Opdater URL uden reload
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      history.replaceState({}, "", url.toString());

      // Opdater tema + retning + links
      setDirAndLangAttr(lang);
      applyCssVars(lang);
      patchLinks(lang);

      // Hvis siden har sin egen applyLang(lang), så kald den også
      if (typeof window.applyLang === "function") {
        try { window.applyLang(lang); } catch (e) {}
      }
    });
  }

  function init() {
    const lang = getLangFromUrl();
    setDirAndLangAttr(lang);
    applyCssVars(lang);
    patchLinks(lang);
    hookLanguageSelect();
  }

  // Kør når DOM er klar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Gør funktioner tilgængelige hvis du vil bruge dem manuelt
  window.__THEME__ = { THEME };
})();
