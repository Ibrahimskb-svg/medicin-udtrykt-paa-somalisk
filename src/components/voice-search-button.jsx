"use client";
import { useEffect, useRef, useState } from "react";

const LANG_CODES = { so: "so-SO", da: "da-DK", en: "en-GB", ar: "ar-SA" };

function MicIcon({ listening }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill={listening ? "currentColor" : "none"} />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export function VoiceSearchButton({ language, onResult, text = {} }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const recognitionRef = useRef(null);
  const errorTimerRef = useRef(null);
  const isRtl = language === "ar";

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
    return () => {
      recognitionRef.current?.abort?.();
      clearTimeout(errorTimerRef.current);
    };
  }, []);

  function flashError(msg) {
    if (!msg) return;
    setErrorMsg(msg);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(""), 3500);
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = LANG_CODES[language] || "da-DK";
    // Interim results give near-instant feedback in the search field instead of
    // waiting for the whole utterance to finish, which is what made it feel slow.
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const chunk = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) finalTranscript += chunk;
        else interim += chunk;
      }
      const current = (finalTranscript || interim).trim();
      if (current) onResult(current);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") flashError(text.voiceErrorNoSpeech);
      else if (event.error === "not-allowed" || event.error === "service-not-allowed") flashError(text.voiceErrorDenied);
      else if (event.error !== "aborted") flashError(text.voiceErrorGeneric);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setErrorMsg("");
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function toggleListen() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    startListening();
  }

  if (!supported) return null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={toggleListen}
        aria-pressed={listening}
        aria-label={listening ? text.voiceListening : text.voiceLabel}
        title={text.voiceLabel}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{
          background: listening ? "#dc2626" : "var(--bg)",
          color: listening ? "#fff" : "var(--accent)",
          boxShadow: listening ? "0 2px 10px rgba(220,38,38,0.35)" : "none",
        }}
      >
        {listening && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-xl"
            style={{ animation: "mic-pulse-ring 1.4s ease-out infinite", border: "2px solid #dc2626" }}
          />
        )}
        <MicIcon listening={listening} />
      </button>

      {errorMsg && (
        <div
          role="alert"
          dir={isRtl ? "rtl" : "ltr"}
          className="absolute top-11 z-20 w-max max-w-[220px] rounded-lg px-3 py-2 text-xs font-medium leading-snug shadow-lg"
          style={{
            background: "#1a1a1a",
            color: "#fff",
            ...(isRtl ? { left: 0 } : { right: 0 }),
          }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}
