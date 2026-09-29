"use client";
import { useEffect, useRef, useState } from "react";
import { getMyList, subscribeMyList } from "../lib/my-list";
import { getSchedule, subscribeSchedule } from "../lib/dose-schedule";
import { buildBriefingSequence, isBriefingSupported } from "../lib/daily-briefing";
import { LANG_THEME } from "./modal-shell";

const TEXTS = {
  so: {
    play: "Dhegayso maalintaada",
    stop: "Jooji",
    playing: "Waa la dhegaysanayaa maalintaada…",
  },
  ar: {
    play: "استمع ليومك",
    stop: "إيقاف",
    playing: "جارٍ تشغيل يومك…",
  },
};

function SpeakerIcon({ size = 18, color = "currentColor", animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4 9 8 9 12 5 12 19 8 15 4 15 4 9" />
      <path d="M16 8a5 5 0 0 1 0 8" opacity={animated ? 1 : 0.55}>
        {animated && <animate attributeName="opacity" values="0.35;1;0.35" dur="1.1s" repeatCount="indefinite" />}
      </path>
      <path d="M19 5a9 9 0 0 1 0 14" opacity={animated ? 1 : 0.35}>
        {animated && <animate attributeName="opacity" values="0.2;1;0.2" dur="1.1s" begin="0.2s" repeatCount="indefinite" />}
      </path>
    </svg>
  );
}

function StopIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  );
}

export function DailyBriefingButton({ language, variant = "pill" }) {
  const [list, setList] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(-1);
  const audioRef = useRef(null);
  const sequenceRef = useRef([]);

  useEffect(() => {
    setList(getMyList());
    setSchedule(getSchedule());
    const unsubList = subscribeMyList(setList);
    const unsubSchedule = subscribeSchedule(setSchedule);
    return () => {
      unsubList();
      unsubSchedule();
    };
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (!isBriefingSupported(language)) return null;

  const t = TEXTS[language] ?? TEXTS.so;

  function stop() {
    audioRef.current?.pause();
    setPlaying(false);
    setIndex(-1);
  }

  function playFrom(i) {
    const seq = sequenceRef.current;
    if (i >= seq.length) {
      stop();
      return;
    }
    setIndex(i);
    const audio = audioRef.current;
    audio.src = seq[i].src;
    audio.play().catch(() => stop());
  }

  function start() {
    const seq = buildBriefingSequence({ language, list, schedule });
    if (!seq.length) return;
    sequenceRef.current = seq;
    setPlaying(true);
    playFrom(0);
  }

  function handleEnded() {
    playFrom(index + 1);
  }

  function toggle() {
    if (playing) stop();
    else start();
  }

  const theme = LANG_THEME[language] ?? LANG_THEME.so;
  const onColor = variant === "onColor";
  const btnBg = playing ? "#B91C1C" : onColor ? "#ffffff" : theme.primary;
  const btnColor = playing ? "#ffffff" : onColor ? theme.primary : "#ffffff";

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className={`hover-lift inline-flex items-center gap-2 rounded-full font-bold transition ${onColor ? "px-5 py-3 text-[15px] shadow-lg" : "px-4 py-2.5 text-sm"}`}
        style={{ background: btnBg, color: btnColor }}
        aria-pressed={playing}
      >
        {playing ? <StopIcon size={onColor ? 18 : 16} color={btnColor} /> : <SpeakerIcon size={onColor ? 19 : 17} color={btnColor} animated={false} />}
        {playing ? t.stop : t.play}
      </button>

      <audio ref={audioRef} onEnded={handleEnded} preload="none" />

      <span role="status" aria-live="polite" className="sr-only">
        {playing ? t.playing : ""}
      </span>
    </div>
  );
}
