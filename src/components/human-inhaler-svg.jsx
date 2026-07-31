"use client";

export const TWIST_LABEL = { da: "↺ DREJ", en: "↺ TURN", so: "↺ LEEXI", ar: "↺ أدر" };

const HOLD_LABEL = {
  so: "✓ Neefta hayso", da: "✓ Hold vejret", en: "✓ Hold your breath", ar: "✓ احبس أنفاسك",
};

/**
 * Realistisk(ere) halv-krop illustration af en person der bruger en
 * inhalator, trin for trin. Bygget til at gøre helt tydeligt at
 * mundstykket rent faktisk sidder mellem læberne under indånding —
 * ikke bare svæve i nærheden — og med en naturlig arm-vinkel op til
 * munden i stedet for at hænge ned langs siden.
 */
export function HumanInhalerSVG({ step, type = "ventoline", language = "da" }) {
  const isPrep      = step === 0; // shake (ventoline) / load (symbicort)
  const isExhale1   = step === 1; // breathe out, away from device
  const isSeal      = step === 2; // lips sealed around mouthpiece, not yet breathing
  const isInhale    = step === 3; // breathing in through the device
  const isHold      = step === 4; // holding breath, device lowered
  const isFinal     = step === 5; // ventoline: exhale slowly · symbicort: rinse mouth

  const atMouth   = isSeal || isInhale;           // device held up to the lips
  const armDown   = isPrep || isExhale1 || isHold || isFinal; // resting / lowered arm
  const isVent    = type === "ventoline";

  const lungOpacity = isHold ? 0.75 : isInhale ? 0.55 : isExhale1 || (isFinal && isVent) ? 0.08 : 0.2;
  const lungBeatScale = isHold ? 1.14 : isInhale ? 1.1 : isExhale1 || (isFinal && isVent) ? 1.02 : 1.06;
  const chestScale = isHold ? 1.055 : 1;
  const chestAnim =
    isInhale ? "hiBreatheIn 1.6s ease-in-out infinite alternate"
    : (isExhale1 || (isFinal && isVent)) ? "hiBreatheOut 1.6s ease-in-out infinite alternate"
    : "none";

  const accent = isVent ? "#0284C7" : "#EA580C";

  return (
    <div style={{ width: 300, height: 365, margin: "0 auto", position: "relative" }}>
      <style>{`
        @keyframes hiBreatheIn   { from { transform: scale(1,1); } to { transform: scale(1.06,1.05); } }
        @keyframes hiBreatheOut  { from { transform: scale(1.05,1.04); } to { transform: scale(0.95,0.97); } }
        @keyframes hiShake       { 0%,100% { transform: rotate(-8deg); } 25% { transform: rotate(9deg); } 50% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
        @keyframes hiTwistL      { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-38deg); } }
        @keyframes hiPuffOut     { 0% { opacity:0.85; transform:translate(0,0) scale(1); } 100% { opacity:0; transform:translate(-58px,-22px) scale(0.25); } }
        @keyframes hiSprayIn     { 0% { opacity:0; transform:translateY(0) scale(0.4); } 30% { opacity:1; } 100% { opacity:0; transform:translateY(-26px) scale(0.1); } }
        @keyframes hiGlow        { 0%,100% { opacity:0.55; } 50% { opacity:0.9; } }
        @keyframes hiPulseRing   { 0% { r:14; opacity:0.75; } 100% { r:30; opacity:0; } }
        @keyframes hiDrop        { 0% { opacity:0.9; transform:translateY(-8px); } 100% { opacity:0; transform:translateY(20px); } }
        @keyframes hiClick       { 0%,80%,100% { opacity:0; } 85%,95% { opacity:1; } }
        @keyframes hiLungBeat    { 0%,100% { transform: scale(1); } 50% { transform: scale(var(--lb, 1.06)); } }
      `}</style>

      <svg viewBox="0 0 280 340" width="300" height="365">
        <defs>
          <linearGradient id="hiSkin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD9C6" />
            <stop offset="100%" stopColor="#F3B48F" />
          </linearGradient>
          <radialGradient id="hiCheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9A8B" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FF9A8B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hiHair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5C3A24" />
            <stop offset="100%" stopColor="#3A2210" />
          </linearGradient>
          <linearGradient id="hiShirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isVent ? "#3B82F6" : "#38BDF8"} />
            <stop offset="100%" stopColor={isVent ? "#1D4ED8" : "#0284C7"} />
          </linearGradient>
          <linearGradient id="hiVentBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="hiSymbBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="100%" stopColor="#FED7AA" />
          </linearGradient>
        </defs>

        {/* ── TORSO / SHIRT ── */}
        <path
          d="M46 190 Q70 158 118 152 L140 178 L162 152 Q210 158 234 190 L242 322 Q140 336 38 322 Z"
          fill="url(#hiShirt)" stroke="#1E3A8A" strokeWidth="1.2"
        />
        <path d="M118 152 L140 180 L162 152" fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="0.9" />

        {/* ── LUNGS (visible through shirt while breathing) ──
            Rigtige lungeformede kurver (ikke bare ovaler) + luftrør + to
            bronkier, ligesom den gamle, ubrugte Lungs()-komponent i
            inhaler-guide.jsx — genskabt her fordi den "bankede" på en måde
            der blev bekræftet som god. Positionen er bagt direkte ind i
            "d"-koordinaterne (ingen omsluttende translate), så CSS-pulsen
            nedenfor er den ENESTE transform på gruppen — det er netop det,
            der gør den robust: sæt man en statisk translate OG en CSS-
            animation på samme <g>, vinder animationens transform og hele
            figuren springer til canvas-hjørnet (ramt tidligere i denne fil). */}
        <g
          style={{
            transformOrigin: "140px 232px",
            transform: `scale(${chestScale})`,
            transition: "transform 0.5s ease-out",
            animation: chestAnim,
            mixBlendMode: "screen",
          }}
        >
          <g
            style={{
              "--lb": lungBeatScale,
              animation: "hiLungBeat 1.85s ease-in-out infinite",
              transformBox: "fill-box",
              transformOrigin: "140px 246px",
              transition: "opacity 0.7s ease",
              opacity: lungOpacity,
            }}
          >
            <path d="M102 214 C84 214 70 228 70 252 C70 272 79 288 94 292 C105 295 112 287 112 278 L112 225 C112 219 108 214 102 214Z" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.6" />
            <path d="M178 214 C196 214 210 228 210 252 C210 272 201 288 186 292 C175 295 168 287 168 278 L168 225 C168 219 172 214 178 214Z" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.6" />
            <rect x="132" y="190" width="16" height="32" rx="8" fill="#7DD3FC" stroke="#60A5FA" strokeWidth="1.4" />
            <path d="M132 216 C120 223 112 225 112 230" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M148 216 C160 223 168 225 168 230" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          {(isInhale || isHold) && [
            [90, 229], [102, 243], [90, 259], [106, 267], [96, 277],
            [168, 229], [180, 243], [168, 259], [182, 267], [172, 277],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3" fill="#DBEAFE" opacity="0.85"
              style={{ animation: `hiGlow 1.3s ${i * 0.1}s ease-in-out infinite` }} />
          ))}
        </g>

        {/* breath-hold pulse rings */}
        {isHold && <>
          <circle cx="140" cy="230" r="14" fill="none" stroke="#22C55E" strokeWidth="2.5" style={{ animation: "hiPulseRing 1.5s ease-out infinite" }} />
          <circle cx="140" cy="230" r="14" fill="none" stroke="#22C55E" strokeWidth="2" style={{ animation: "hiPulseRing 1.5s 0.75s ease-out infinite" }} />
        </>}

        {/* ── NECK ── */}
        <rect x="124" y="132" width="32" height="30" rx="12" fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="0.9" />

        {/* ── LEFT ARM (resting at side, always) ── */}
        <path d="M56 168 Q34 208 36 258 Q40 278 54 278 Q66 278 70 260 Q74 216 82 180" fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="1.2" />
        <ellipse cx="46" cy="276" rx="16" ry="19" fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="1" />

        {/* ── HEAD ── */}
        <g>
          {/* Hair back */}
          <path d="M104 78 Q100 40 140 30 Q180 40 176 78 L176 92 L104 92 Z" fill="url(#hiHair)" />
          {/* Ears */}
          <ellipse cx="103" cy="108" rx="7" ry="11" fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="0.8" />
          <ellipse cx="177" cy="108" rx="7" ry="11" fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="0.8" />
          {/* Face */}
          <path d="M140 46 C168 46 182 68 182 98 C182 130 168 152 140 152 C112 152 98 130 98 98 C98 68 112 46 140 46Z"
            fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="1.4" />
          {/* Hair front / fringe */}
          <path d="M100 92 Q98 62 140 54 Q182 62 180 92 Q160 78 140 78 Q120 78 100 92Z" fill="url(#hiHair)" />
          {/* Cheeks */}
          <circle cx="115" cy="118" r="14" fill="url(#hiCheek)" />
          <circle cx="165" cy="118" r="14" fill="url(#hiCheek)" />
          {/* Eyebrows */}
          <path d="M113 90 Q122 85 132 89" stroke="#3A2210" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M148 89 Q158 85 167 90" stroke="#3A2210" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {/* Eyes */}
          <ellipse cx="122" cy="100" rx="5.5" ry={isHold ? 1.8 : 5} fill="#2B2118" />
          <circle cx="123.6" cy="98" r="1.7" fill="#fff" />
          <ellipse cx="158" cy="100" rx="5.5" ry={isHold ? 1.8 : 5} fill="#2B2118" />
          <circle cx="159.6" cy="98" r="1.7" fill="#fff" />
          {/* Nose */}
          <path d="M136 104 L133 120 Q140 124 147 120 L144 104" stroke="#D98E68" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Mouth states */}
          {(isExhale1 || (isFinal && isVent)) && (
            <>
              <ellipse cx="140" cy="134" rx="12" ry="9" fill="#7B2222" />
              <ellipse cx="140" cy="135" rx="9.5" ry="6.5" fill="#C23B22" />
              <line x1="133" y1="130" x2="147" y2="130" stroke="#fff" strokeWidth="2.4" opacity="0.55" />
            </>
          )}
          {atMouth && (
            <ellipse cx="140" cy="134" rx="7" ry="5.5" fill="#7B2222" />
          )}
          {isFinal && !isVent && (
            <>
              <ellipse cx="140" cy="136" rx="20" ry="15" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
              <ellipse cx="140" cy="139" rx="14" ry="9" fill="#DC2626" opacity="0.8" />
            </>
          )}
          {!atMouth && !isExhale1 && !(isFinal && isVent) && !(isFinal && !isVent) && (
            <path d="M129 133 Q140 141 151 133" stroke="#C23B22" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          )}
          {/* mouth-hold badge */}
          {isHold && (
            <g transform="translate(140 30)">
              <rect x="-78" y="-14" width="156" height="26" rx="13" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="800" fill="#15803D">{HOLD_LABEL[language] ?? HOLD_LABEL.da}</text>
            </g>
          )}
        </g>

        {/* exhale breath particles */}
        {(isExhale1 || (isFinal && isVent)) && [0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={156 + i * 11} cy={133 - i * 5} r={4.2 - i * 0.4}
            fill={i < 3 ? "#BAE6FD" : "#E0F2FE"} opacity="0.9"
            style={{ animation: `hiPuffOut 1.2s ${i * 0.13}s ease-out infinite` }} />
        ))}

        {/* rinse step for Symbicort: a small glass tilted right up against the
            mouth, with water dripping the short distance straight into it —
            not a distant shower-drip that never visually reaches the mouth */}
        {isFinal && !isVent && (
          <g transform="translate(178 118) rotate(18)">
            <path d="M-14 0 L-11 34 L11 34 L14 0 Z" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="1.8" opacity="0.92" />
            <path d="M-13 22 L13 22 L11 34 L-11 34 Z" fill="#38BDF8" opacity="0.6" />
            {[0, 1].map((i) => (
              <ellipse key={i} cx={-2 + i * 5} cy={-6 - i * 4} rx="3" ry="4.5" fill="#7DD3FC"
                style={{ animation: `hiDrop 0.9s ${i * 0.25}s ease-in infinite` }} />
            ))}
          </g>
        )}
        {isFinal && !isVent && (
          <path d="M158 140 Q170 146 178 138" fill="none" stroke="#7DD3FC" strokeWidth="2.6" strokeDasharray="5 4" strokeLinecap="round" />
        )}

        {/* ── RIGHT ARM + HAND + DEVICE (raises to mouth, or rests at chest for prep) ── */}
        {atMouth ? (
          /* bent at elbow, forearm crossing up in front of chest to meet the lips */
          <g>
            <path d="M226 176 Q244 150 232 122 Q222 100 200 96 Q182 94 168 108 Q158 118 152 130"
              fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="1.2" />
            {/* hand gripping the device — (0,0) inside each device is exactly where
                the mouthpiece meets the lips, so this point must sit at the mouth */}
            <g transform="translate(141 135)">
              {isVent ? <VentAtMouth isInhale={isInhale} /> : <SymbAtMouth isInhale={isInhale} language={language} />}
            </g>
            <path d="M158 118 Q150 122 146 130 Q148 136 156 134" fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="1.1" />
          </g>
        ) : isPrep ? (
          /* arm bent, raised so the hand holds the device up at chest/chin height to inspect/shake/twist it */
          <g>
            <path d="M228 174 Q250 178 254 198 Q256 214 240 220 Q222 224 208 210 Q198 198 200 184"
              fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="1.2" />
            {isPrep && (
              // VIGTIGT: den statiske position (translate) og CSS-animationen skal
              // sidde på HVER SIN <g> — sætter man begge dele på samme element,
              // overskriver animationens "transform" fuldstændig den statiske
              // translate (CSS transform vinder altid over SVG transform-attributten),
              // og hele figuren springer tilbage til øverste venstre hjørne af canvas.
              <g style={{ animation: isVent ? "hiShake 0.42s ease-in-out infinite" : "none", transformOrigin: "224px 200px" }}>
                <g transform="translate(224 200)">
                  <g style={{ animation: !isVent ? "hiTwistL 1.4s ease-in-out infinite" : "none", transformOrigin: "0px 30px" }}>
                    {isVent ? <VentPrep /> : <SymbPrep language={language} />}
                  </g>
                </g>
              </g>
            )}
          </g>
        ) : (
          /* arm resting down at the side (exhale / hold / final step) */
          <g>
            <path d="M228 174 Q252 200 250 244 Q246 264 232 264 Q220 264 216 246 Q212 208 202 182"
              fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="1.2" />
            <ellipse cx="242" cy="262" rx="16" ry="19" fill="url(#hiSkin)" stroke="#D98E68" strokeWidth="1" />
          </g>
        )}

        {/* ── PANTS + SHOES ── */}
        <path d="M50 320 L44 336 L92 336 L96 320 Z" fill="#1E293B" />
        <path d="M186 320 L190 336 L238 336 L232 320 Z" fill="#1E293B" />
        <rect x="46" y="316" width="192" height="10" rx="5" fill="#152238" />
        <ellipse cx="66" cy="336" rx="26" ry="9" fill="#0F172A" />
        <ellipse cx="212" cy="336" rx="26" ry="9" fill="#0F172A" />
      </svg>
    </div>
  );
}

/* ── Ventoline (pressurised MDI): mouthpiece at the bottom, canister up top ── */
// Lokalt koordinatsystem: (0,0) er PRÆCIS der hvor mundstykket rører læberne —
// resten tegnes ovenfor (negativ y) for Ventoline, som holdes med dåsen pegende
// opad foran ansigtet. Bevidst kompakt (kun ~44px høj, mod tidligere 75px), så
// den ikke dækker hele ansigtet — kun når mundstykket reelt op til næse-højde.
function VentAtMouth({ isInhale }) {
  return (
    <g>
      <rect x="-10" y="-44" width="20" height="17" rx="6" fill="url(#hiVentBody)"
        style={{ transform: isInhale ? "translateY(3px)" : "translateY(0)", transition: "transform 0.18s" }} />
      <rect x="-13" y="-28" width="26" height="17" rx="7" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.6" />
      <rect x="-16" y="-12" width="32" height="13" rx="6.5" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1.6" />
      {isInhale && [0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={-3 - i * 6} cy={-6 + (i % 2) * 4} r={2.6 - i * 0.35} fill="#38BDF8" opacity="0.85"
          style={{ animation: `hiSprayIn 0.65s ${i * 0.1}s ease-out infinite` }} />
      ))}
    </g>
  );
}
function VentPrep() {
  return (
    <g>
      <rect x="-10" y="-44" width="20" height="17" rx="6" fill="url(#hiVentBody)" />
      <rect x="-13" y="-28" width="26" height="17" rx="7" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.6" />
      <rect x="-16" y="-12" width="32" height="13" rx="6.5" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1.6" />
    </g>
  );
}

/* ── Symbicort Turbuhaler: mundstykket sidder ØVERST (0,0), selve cylinderen
   hænger nedad derfra — matcher hvordan den rent faktisk holdes op til munden
   uden at det lange korpus overhovedet kommer i nærheden af ansigtet. ── */
function SymbAtMouth({ isInhale, language }) {
  return (
    <g>
      <rect x="-11" y="0" width="22" height="14" rx="6" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.6" />
      <rect x="-15" y="12" width="30" height="46" rx="12" fill="url(#hiSymbBody)" stroke="#EA580C" strokeWidth="1.8" />
      <text x="0" y="36" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#EA580C">Symbicort</text>
      <rect x="-15" y="46" width="30" height="14" rx="7" fill="#DC2626" />
      {isInhale && [0, 1, 2, 3].map((i) => (
        <circle key={i} cx={0 - i * 6} cy={-4 - (i % 2) * 3} r={2.6 - i * 0.3} fill="#FED7AA" opacity="0.9"
          style={{ animation: `hiSprayIn 0.5s ${i * 0.08}s ease-out infinite` }} />
      ))}
    </g>
  );
}
function SymbPrep({ language }) {
  return (
    <g>
      <rect x="-11" y="0" width="22" height="14" rx="6" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.6" />
      <rect x="-15" y="12" width="30" height="46" rx="12" fill="url(#hiSymbBody)" stroke="#EA580C" strokeWidth="1.8" />
      <text x="0" y="30" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#EA580C">Symbicort</text>
      <rect x="-15" y="46" width="30" height="14" rx="7" fill="#DC2626" />
      <text x="0" y="57" textAnchor="middle" fontSize="6" fontWeight="800" fill="#fff">{TWIST_LABEL[language] ?? TWIST_LABEL.da}</text>
    </g>
  );
}
