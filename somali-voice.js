(function () {
  let playerWrap = null;
  let audioEl = null;

  function getCurrentLang() {
    const select = document.getElementById("langSelect");
    if (select && select.value) return select.value;

    const params = new URLSearchParams(window.location.search);
    return params.get("lang") || document.documentElement.lang || "so";
  }

  function getPageBaseName() {
    const path = window.location.pathname.split("/").pop() || "";
    return path.replace(/\.(html?|php)$/i, "");
  }

  function getAudioSrc() {
    const page = getPageBaseName();
    if (!page) return "";
    return "audio/" + page + "-so.mp3";
  }

  function injectStyles() {
    if (document.getElementById("somaliVoiceStyles")) return;

    const style = document.createElement("style");
    style.id = "somaliVoiceStyles";
    style.textContent = `
      .somali-voice-reader{
        position: fixed;
        right: 18px;
        bottom: 18px;
        display: none;
        gap: 8px;
        align-items: center;
        z-index: 9999;
        flex-wrap: wrap;
      }

      .somali-voice-reader button{
        border: none;
        border-radius: 999px;
        padding: 11px 14px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.18);
        transition: transform .18s ease, opacity .18s ease, background-color .2s ease;
      }

      .somali-voice-reader button:hover{
        transform: translateY(-1px);
        opacity: .96;
      }

      .somali-voice-reader .play-btn{
        background: #00a676;
        color: #fff;
      }

      .somali-voice-reader .stop-btn{
        background: #ffffff;
        color: #123047;
        border: 1px solid #d0d7e2;
      }

      html[dir="rtl"] .somali-voice-reader{
        right: auto;
        left: 18px;
      }

      @media (max-width: 600px){
        .somali-voice-reader{
          right: 12px;
          bottom: 12px;
          left: 12px;
        }
        html[dir="rtl"] .somali-voice-reader{
          left: 12px;
          right: 12px;
        }
        .somali-voice-reader button{
          flex: 1 1 auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function buildPlayer() {
    if (playerWrap) return;

    playerWrap = document.createElement("div");
    playerWrap.className = "somali-voice-reader";
    playerWrap.setAttribute("aria-label", "Somali audio controls");

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "play-btn";
    playBtn.textContent = "🔊 Dhageyso codka af-Soomaaliga";

    const stopBtn = document.createElement("button");
    stopBtn.type = "button";
    stopBtn.className = "stop-btn";
    stopBtn.textContent = "■ Jooji";

    audioEl = document.createElement("audio");
    audioEl.preload = "none";

    playBtn.addEventListener("click", function () {
      if (!audioEl || !audioEl.src) return;
      audioEl.play().catch(function () {});
    });

    stopBtn.addEventListener("click", function () {
      if (!audioEl) return;
      audioEl.pause();
      audioEl.currentTime = 0;
    });

    playerWrap.appendChild(playBtn);
    playerWrap.appendChild(stopBtn);
    playerWrap.appendChild(audioEl);
    document.body.appendChild(playerWrap);
  }

  async function audioExists(src) {
    try {
      const res = await fetch(src, { cache: "no-store" });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async function refreshPlayer() {
    if (!playerWrap || !audioEl) return;

    const lang = getCurrentLang();
    const src = getAudioSrc();

    if (lang !== "so" || !src) {
      playerWrap.style.display = "none";
      audioEl.pause();
      audioEl.removeAttribute("src");
      audioEl.load();
      return;
    }

    const exists = await audioExists(src);
    if (!exists) {
      playerWrap.style.display = "none";
      audioEl.pause();
      audioEl.removeAttribute("src");
      audioEl.load();
      return;
    }

    if (audioEl.getAttribute("src") !== src) {
      audioEl.pause();
      audioEl.currentTime = 0;
      audioEl.setAttribute("src", src);
      audioEl.load();
    }

    playerWrap.style.display = "flex";
  }

  function bindLangWatcher() {
    const select = document.getElementById("langSelect");
    if (!select) return;

    select.addEventListener("change", function () {
      setTimeout(refreshPlayer, 50);
    });
  }

  function init() {
    injectStyles();
    buildPlayer();
    bindLangWatcher();
    refreshPlayer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
