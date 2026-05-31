"use client";

export const TWIST_LABEL = { da:"↺ DREJ", en:"↺ TURN", so:"↺ LEEXI", ar:"↺ أدر" };

export function HumanInhalerSVG({ step, type = "ventoline", language = "da" }) {
  const isExhaling     = step === 1;
  const isSeal         = step === 2;
  const isInhaling     = step === 3;
  const isHolding      = step === 4;
  const isShaking      = step === 0 && type === "ventoline";
  const isTwisting     = step === 0 && type === "symbicort";
  const isRinsing      = step === 5 && type === "symbicort";
  const isLastExhale   = step === 5 && type === "ventoline";
  const inhalerAtMouth = isSeal || isInhaling || isHolding;
  const anyExhale      = isExhaling || isLastExhale;

  const lungOpacity = isHolding ? 0.72 : isInhaling ? 0.52 : anyExhale ? 0.07 : 0.22;
  const chestStyle  = {
    transformOrigin: "140px 168px",
    transform: isHolding ? "scale(1.085, 1.06)" : "scale(1,1)",
    transition: isHolding ? "transform 0.55s ease-out" : "none",
    animation: isInhaling ? "hmBreatheIn 1.7s ease-in-out infinite alternate"
             : anyExhale  ? "hmBreatheOut 1.7s ease-in-out infinite alternate"
             : "none",
  };

  const S = "#FDBCB4"; const SD = "#E8967A";
  const H = "#3A2210";
  const SHIRT = "#2563EB";
  const PANTS = "#1E3A5F";

  return (
    <div style={{ width: 280, height: 330, margin: "0 auto", position: "relative" }}>
      <style>{`
        @keyframes hmBreatheIn {
          from { transform: scale(1,1); }
          to   { transform: scale(1.088, 1.065); }
        }
        @keyframes hmBreatheOut {
          from { transform: scale(1.04, 1.02); }
          to   { transform: scale(0.92, 0.95); }
        }
        @keyframes hmPuffOut {
          0%   { opacity:0.9; transform:translate(0,0) scale(1); }
          100% { opacity:0;   transform:translate(-52px,-26px) scale(0.3); }
        }
        @keyframes hmSprayIn {
          0%   { opacity:0; transform:translateY(0) scale(0.4); }
          35%  { opacity:1; }
          100% { opacity:0; transform:translateY(-20px) scale(0.15); }
        }
        @keyframes hmShake {
          0%,100% { transform:rotate(-8deg) translateY(0); }
          25%     { transform:rotate(8deg)  translateY(-7px); }
          50%     { transform:rotate(-5deg) translateY(3px); }
          75%     { transform:rotate(5deg)  translateY(-5px); }
        }
        @keyframes hmTwist {
          0%,100% { transform:rotate(0deg); }
          35%     { transform:rotate(42deg); }
          70%     { transform:rotate(-42deg); }
        }
        @keyframes hmDrop {
          0%   { opacity:0.9; transform:translateY(-10px); }
          100% { opacity:0;   transform:translateY(18px); }
        }
        @keyframes hmGlow {
          0%,100% { opacity:0.62; }
          50%     { opacity:0.88; }
        }
        @keyframes hmPulseRing {
          0%   { r:12; opacity:0.7; }
          100% { r:22; opacity:0; }
        }
      `}</style>

      <svg viewBox="0 0 280 330" width="280" height="330">

        {/* HAIR */}
        <ellipse cx="140" cy="36" rx="36" ry="22" fill={H}/>
        <rect x="104" y="40" width="72" height="14" fill={H}/>

        {/* HEAD */}
        <ellipse cx="140" cy="60" rx="32" ry="37" fill={S} stroke={SD} strokeWidth="1.2"/>
        <ellipse cx="109" cy="63" rx="6" ry="10" fill="#F7A895" stroke={SD} strokeWidth="0.8"/>
        <ellipse cx="171" cy="63" rx="6" ry="10" fill="#F7A895" stroke={SD} strokeWidth="0.8"/>

        {/* Eyebrows */}
        <path d="M122 47 Q128 44 134 47" stroke={H} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        <path d="M146 47 Q152 44 158 47" stroke={H} strokeWidth="2.2" fill="none" strokeLinecap="round"/>

        {/* Eyes */}
        <ellipse cx="128" cy="56" rx="5.5" ry={isHolding ? 2.2 : 5.5} fill="#1C1C1C"/>
        <circle  cx="129.8" cy="54.2" r="1.6" fill="white"/>
        <ellipse cx="152" cy="56" rx="5.5" ry={isHolding ? 2.2 : 5.5} fill="#1C1C1C"/>
        <circle  cx="153.8" cy="54.2" r="1.6" fill="white"/>

        {/* Nose */}
        <path d="M137 62 L135 74 Q140 77 145 74 L143 62" stroke={SD} strokeWidth="1.3" fill="none" strokeLinecap="round"/>

        {/* Cheeks */}
        <ellipse cx="114" cy="72" rx="9" ry="5" fill="#F48C9F" opacity="0.26"/>
        <ellipse cx="166" cy="72" rx="9" ry="5" fill="#F48C9F" opacity="0.26"/>

        {/* MOUTH */}
        {anyExhale && <>
          <ellipse cx="140" cy="83" rx="11" ry="8" fill="#7B2222"/>
          <ellipse cx="140" cy="84" rx="9"  ry="6" fill="#C23B22"/>
          <line x1="134" y1="80" x2="146" y2="80" stroke="white" strokeWidth="2.5" opacity="0.6"/>
        </>}
        {(isSeal || isInhaling || isHolding) &&
          <ellipse cx="140" cy="83" rx="6" ry="5" fill="#7B2222"/>}
        {!anyExhale && !isSeal && !isInhaling && !isHolding &&
          <path d="M131 83 Q140 90 149 83" stroke="#C23B22" strokeWidth="2.2" fill="none" strokeLinecap="round"/>}

        {/* EXHALE PARTICLES */}
        {anyExhale && [0,1,2,3,4,5].map(i => (
          <circle key={i}
            cx={156 + i * 10} cy={82 - i * 5} r={4 - i * 0.4}
            fill={i < 3 ? "#BAE6FD" : "#E0F2FE"} opacity="0.88"
            style={{ animation: `hmPuffOut 1.25s ${i * 0.13}s ease-out infinite` }}/>
        ))}

        {/* NECK */}
        <rect x="126" y="96" width="28" height="26" rx="10" fill={S} stroke={SD} strokeWidth="0.9"/>

        {/* SHIRT */}
        <path d="M38 124 Q68 114 126 116 L140 132 L154 116 Q212 114 242 124 L238 254 Q140 264 42 254 Z"
          fill={SHIRT} stroke="#1D4ED8" strokeWidth="1"/>
        <path d="M126 116 L140 134 L154 116" fill={S} stroke={SD} strokeWidth="0.9"/>

        {/* LUNGS + CHEST */}
        <g style={chestStyle}>
          <ellipse cx="104" cy="170" rx="32" ry="44" fill="#FF8FAB"
            opacity={lungOpacity} style={{ transition: "opacity 0.75s ease" }}/>
          <ellipse cx="176" cy="170" rx="32" ry="44" fill="#FF8FAB"
            opacity={lungOpacity} style={{ transition: "opacity 0.75s ease" }}/>
          <line x1="140" y1="116" x2="140" y2="138" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" opacity="0.4"/>
          <path d="M140 138 Q120 148 104 162" stroke="#94A3B8" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.4"/>
          <path d="M140 138 Q160 148 176 162" stroke="#94A3B8" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.4"/>
          {(isInhaling || isHolding) && [
            [92,152],[104,166],[92,180],[108,188],[96,198],
            [168,152],[180,166],[168,180],[182,188],[170,198]
          ].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r="3" fill="#60A5FA" opacity="0.7"
              style={{ animation: `hmGlow 1.4s ${i*0.11}s ease-in-out infinite` }}/>
          ))}
        </g>

        {/* Breath-hold pulse ring */}
        {isHolding && <>
          <circle cx="140" cy="168" r="12" fill="none" stroke="#22C55E" strokeWidth="2.5"
            style={{ animation: "hmPulseRing 1.4s ease-out infinite" }}/>
          <circle cx="140" cy="168" r="12" fill="none" stroke="#22C55E" strokeWidth="2"
            style={{ animation: "hmPulseRing 1.4s 0.7s ease-out infinite" }}/>
        </>}

        {/* LEFT ARM */}
        <path d="M42 132 Q22 178 24 224 Q28 242 40 242 Q52 242 56 226 Q60 186 68 146" fill={S} stroke={SD} strokeWidth="1.2"/>
        <ellipse cx="32" cy="240" rx="15" ry="18" fill={S} stroke={SD} strokeWidth="1"/>

        {/* RIGHT ARM */}
        {inhalerAtMouth
          ? <path d="M238 132 Q256 108 248 84 Q238 64 218 66 Q200 68 188 82 Q178 92 172 96"
              fill={S} stroke={SD} strokeWidth="1.2"/>
          : <path d="M238 132 Q258 178 256 224 Q252 242 240 242 Q228 242 224 226 Q220 186 212 146"
              fill={S} stroke={SD} strokeWidth="1.2"/>
        }
        {!inhalerAtMouth &&
          <ellipse cx="248" cy="238" rx="15" ry="18" fill={S} stroke={SD} strokeWidth="1"/>}

        {/* VENTOLINE */}
        {type === "ventoline" && (inhalerAtMouth ? (
          <g transform="translate(148, 56)">
            <rect x="2" y="-24" width="24" height="28" rx="8" fill="#0EA5E9"
              style={{ transform: isInhaling ? "translateY(5px)" : "translateY(0)", transition: "transform 0.2s" }}/>
            <rect x="0" y="2" width="28" height="68" rx="10" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2"/>
            <rect x="4" y="14" width="20" height="18" rx="5" fill="#BAE6FD"/>
            <text x="14" y="26" textAnchor="middle" fontSize="6" fontWeight="800" fill="#0284C7">Ventoline</text>
            <rect x="-18" y="66" width="48" height="18" rx="9" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2"/>
            <rect x="-14" y="78" width="28" height="10" rx="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.2"/>
            {isInhaling && [0,1,2,3,4].map(i => (
              <circle key={i} cx={-4 - i * 7} cy={83 + (i%2)*4} r={3 - i*0.4} fill="#38BDF8" opacity="0.85"
                style={{ animation: `hmSprayIn 0.7s ${i*0.1}s ease-out infinite` }}/>
            ))}
          </g>
        ) : (
          <g style={{ animation: isShaking ? "hmShake 0.44s ease-in-out infinite" : "none",
                      transformOrigin: "242px 215px" }}>
            <g transform="translate(228, 165)">
              <rect x="4" y="-22" width="24" height="28" rx="8" fill="#0EA5E9"/>
              <rect x="2" y="4" width="28" height="68" rx="10" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2"/>
              <rect x="6" y="14" width="20" height="18" rx="5" fill="#BAE6FD"/>
              <text x="16" y="26" textAnchor="middle" fontSize="6" fontWeight="800" fill="#0284C7">Ventoline</text>
              <rect x="-4" y="68" width="44" height="17" rx="9" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1.8"/>
              <rect x="4" y="-24" width="24" height="7" rx="3.5" fill="#0284C7"/>
            </g>
          </g>
        ))}

        {/* SYMBICORT */}
        {type === "symbicort" && (inhalerAtMouth ? (
          <g transform="translate(150, 52)">
            <rect x="0" y="0" width="34" height="86" rx="14" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2"/>
            {[0,1,2].map(i => (
              <rect key={i} x="1" y={28+i*13} width="32" height="6" rx="3" fill="#FED7AA" opacity="0.65"/>
            ))}
            <text x="17" y="18" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#EA580C">Symbicort</text>
            <text x="17" y="27" textAnchor="middle" fontSize="5"   fill="#9A3412">Turbuhaler</text>
            <rect x="0" y="68" width="34" height="14" rx="7" fill="#EA580C"/>
            <text x="17" y="79" textAnchor="middle" fontSize="6.5" fill="white" fontWeight="700">{TWIST_LABEL[language]??TWIST_LABEL.da}</text>
            <rect x="-12" y="80" width="56" height="16" rx="8" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.8"/>
            <rect x="-8"  y="90" width="30" height="9" rx="4.5" fill="#FB923C" stroke="#EA580C" strokeWidth="1.2"/>
            {isInhaling && [0,1,2,3].map(i => (
              <circle key={i} cx={0 - i*7} cy={95 + (i%2)*4} r={3-i*0.35} fill="#FED7AA" opacity="0.9"
                style={{ animation: `hmSprayIn 0.55s ${i*0.08}s ease-out infinite` }}/>
            ))}
          </g>
        ) : (
          <g style={{ animation: isTwisting ? "hmShake 0.75s ease-in-out infinite" : "none",
                      transformOrigin: "244px 210px" }}>
            <g transform="translate(226, 158)">
              <rect x="0" y="0" width="36" height="88" rx="14" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2"/>
              {[0,1,2].map(i => (
                <rect key={i} x="1" y={26+i*14} width="34" height="6" rx="3" fill="#FED7AA" opacity="0.65"/>
              ))}
              <text x="18" y="17" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#EA580C">Symbicort</text>
              <text x="18" y="25" textAnchor="middle" fontSize="5"   fill="#9A3412">Turbuhaler</text>
              <rect x="0" y="70" width="36" height="14" rx="7" fill="#EA580C"
                style={{ animation: isTwisting ? "hmTwist 1s ease-in-out infinite" : "none",
                         transformOrigin: "18px 77px" }}/>
              <text x="18" y="81" textAnchor="middle" fontSize="6.5" fill="white" fontWeight="700">{TWIST_LABEL[language]??TWIST_LABEL.da}</text>
              <rect x="4" y="82" width="28" height="14" rx="7" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.5"/>
              <rect x="22" y="4" width="13" height="11" rx="3" fill="white" stroke="#EA580C" strokeWidth="1.2"/>
              <text x="28.5" y="13" textAnchor="middle" fontSize="6" fontWeight="700" fill="#EA580C">60</text>
            </g>
          </g>
        ))}

        {/* WATER GLASS (Symbicort rinse) */}
        {isRinsing && (
          <g transform="translate(26, 218)">
            <path d="M4 0 L0 52 L48 52 L44 0 Z" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.8" opacity="0.88"/>
            <path d="M4 0 L44 0" stroke="#93C5FD" strokeWidth="1.8"/>
            <path d="M1 36 L47 36 L48 52 L0 52 Z" fill="#60A5FA" opacity="0.3"/>
            {[0,1,2].map(i => (
              <ellipse key={i} cx={10+i*14} cy={-7+(i%2)*5} rx="4" ry="5.5" fill="#BAE6FD" opacity="0.88"
                style={{ animation: `hmDrop 1.0s ${i*0.22}s ease-in infinite` }}/>
            ))}
          </g>
        )}

        {/* PANTS */}
        <path d="M44 252 L38 320 L82 320 L88 252 Z" fill={PANTS}/>
        <path d="M192 252 L196 320 L240 320 L236 252 Z" fill={PANTS}/>
        <rect x="42" y="248" width="196" height="12" rx="6" fill="#152848"/>

        {/* SHOES */}
        <ellipse cx="60"  cy="320" rx="28" ry="11" fill="#111"/>
        <ellipse cx="218" cy="320" rx="28" ry="11" fill="#111"/>

        {/* HOLD BADGE */}
        {isHolding && (
          <g transform="translate(-5, 168)">
            <rect x="0" y="0" width="136" height="28" rx="14" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1.5"/>
            <text x="68" y="19" textAnchor="middle" fontSize="11" fontWeight="800" fill="#15803D">
              {language==="so" ? "✓ Neefta hayso" :
               language==="da" ? "✓ Hold vejret" :
               language==="en" ? "✓ Hold your breath" :
               "✓ احبس أنفاسك"}
            </text>
          </g>
        )}

      </svg>
    </div>
  );
}
