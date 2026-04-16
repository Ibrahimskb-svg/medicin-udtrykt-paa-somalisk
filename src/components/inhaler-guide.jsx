"use client";
import { useState } from "react";

/* ─── Global keyframes (injected once into DOM) ─────────────────────────── */
const KF = `
@keyframes ig-cap-rise  { 0%{transform:translateY(0);opacity:1} 75%{transform:translateY(-52px);opacity:1} 100%{transform:translateY(-52px);opacity:0} }
@keyframes ig-cap-ret   { 0%{transform:translateY(-52px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes ig-shake     { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-9px)} 40%{transform:translateX(9px)} 60%{transform:translateX(-7px)} 80%{transform:translateX(7px)} }
@keyframes ig-flow      { 0%{opacity:0;transform:translateX(0)} 35%{opacity:1} 100%{opacity:0;transform:translateX(38px)} }
@keyframes ig-flow-slow { 0%{opacity:0;transform:translateX(0)} 45%{opacity:.65} 100%{opacity:0;transform:translateX(26px)} }
@keyframes ig-flow-fast { 0%{opacity:0;transform:translateX(0)} 18%{opacity:1} 65%{opacity:0;transform:translateX(46px)} }
@keyframes ig-lip-close { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
@keyframes ig-press     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(9px)} }
@keyframes ig-mist      { 0%{opacity:0;transform:translate(0,0)} 30%{opacity:.9} 100%{opacity:0;transform:translate(var(--dx,0px),var(--dy,-22px))} }
@keyframes ig-lung      { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
@keyframes ig-arc       { from{stroke-dashoffset:453} to{stroke-dashoffset:0} }
@keyframes ig-ring-spin { 0%{transform:rotate(0deg)} 40%{transform:rotate(145deg)} 65%{transform:rotate(-14deg)} 100%{transform:rotate(0deg)} }
@keyframes ig-click     { 0%,82%,100%{opacity:0;transform:scale(.5)} 88%{opacity:1;transform:scale(1.35)} 96%{opacity:.4;transform:scale(1)} }
@keyframes ig-drop      { 0%{opacity:0;transform:translateY(-8px)} 25%{opacity:1} 100%{opacity:0;transform:translateY(24px)} }
@keyframes ig-clock     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes ig-pulse-ring{ 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.7;transform:scale(1.06)} }
`;

/* ─── Text / label data ──────────────────────────────────────────────────── */

const TITLE = {
  da: "Sådan bruger du din inhalator – trin for trin",
  en: "How to use your inhaler – step by step",
  so: "Sida loo isticmaalo buufinta – tallaabo tallaabo",
  ar: "كيفية استخدام البخاخ — خطوة بخطوة",
};

const SUBTITLE = {
  ventoline: {
    da: "Ventoline (Salbutamol) – MDI-spray",
    en: "Ventoline (Salbutamol) – MDI inhaler",
    so: "Ventoline (Salbutamol) – buufin la riixo",
    ar: "فنتولين (سالبوتامول) — بخاخ مضغوط",
  },
  symbicort: {
    da: "Symbicort – Turbuhaler (tørt pulver)",
    en: "Symbicort – Turbuhaler (dry powder)",
    so: "Symbicort – Turbuhaler (budo qallalan)",
    ar: "سيمبيكورت — توربوهيلر (مسحوق جاف)",
  },
};

const NAV_PREV = { da: "Forrige", en: "Previous", so: "Hore",      ar: "السابق" };
const NAV_NEXT = { da: "Næste",   en: "Next",     so: "Xiga",      ar: "التالي" };
const STEP_LBL = { da: "Trin",    en: "Step",     so: "Tallaabo",  ar: "خطوة"   };
const STEP_OF  = { da: "af",      en: "of",       so: "ka",        ar: "من"     };

const SCENE_COPY = {
  slow: {
    da: "LANGSOMT",
    en: "SLOW",
    so: "TARTIIB",
    ar: "ببطء",
  },
  fast: {
    da: "HURTIGT",
    en: "FAST",
    so: "DEGDEG",
    ar: "بسرعة",
  },
  seconds: {
    da: "sek",
    en: "sec",
    so: "ilbiriqsi",
    ar: "ثوانٍ",
  },
  waitSeconds: {
    da: "30–60 sek",
    en: "30–60 sec",
    so: "30–60 ilbiriqsi",
    ar: "30–60 ثانية",
  },
  replaceCap: {
    da: "Sæt låget på",
    en: "Replace cap",
    so: "Daboolka saar",
    ar: "أعد الغطاء",
  },
  neverIntoInhaler: {
    da: ["Pust ikke ind", "i inhalatoren"],
    en: ["Do not breathe", "into the inhaler"],
    so: ["Ha ku neefsan", "gudaha buufinta"],
    ar: ["لا تنفخ", "داخل البخاخ"],
  },
  rinseAndSpit: {
    da: "SKYL + SPYT",
    en: "RINSE + SPIT",
    so: "DHAQ + TUF",
    ar: "اغسل + ابصق",
  },
  click: {
    da: "KLIK!",
    en: "CLICK!",
    so: "GUJIN!",
    ar: "طَق!",
  },
};

const WARNING = {
  ventoline: {
    da: "Ventoline er akutmedicin. Virker den ikke inden 10–15 min, søg straks lægehjælp.",
    en: "Ventoline is a reliever. If it does not work within 10–15 min, seek urgent medical help.",
    so: "Ventoline waa daawo degdeg ah oo loo isticmaalo neef-qabatin kedis ah. Haddii aysan ku anfacin 10–15 daqiiqo gudahood, raadi gargaar caafimaad oo degdeg ah.",
    ar: "فنتولين دواء للنوبات. إذا لم يفد خلال 10–15 دقيقة، اطلب مساعدة طبية طارئة فورًا.",
  },
  symbicort: {
    da: "Symbicort er ikke akutmedicin – brug Ventoline ved akut åndenød. Symbicort skal tages fast hver dag.",
    en: "Symbicort is not a reliever – use Ventoline for acute breathlessness. Symbicort must be taken every single day.",
    so: "Symbicort ma aha daawo degdeg ah. Marka neef-qabatin kedis ahi kugu timaado, isticmaal Ventoline. Symbicort waa in maalin kasta si joogto ah loo qaataa.",
    ar: "سيمبيكورت ليس لعلاج النوبات — استخدم فنتولين لضيق النفس المفاجئ. يجب أخذ سيمبيكورت يوميًا بانتظام.",
  },
};

const STEPS = {
  ventoline: {
    da: [
      { title: "Tag låget af og ryst",             body: "Tag låget af og ryst inhalatoren kraftigt 4–5 gange. Har du ikke brugt den i over 3 dage, afgiv ét pust i luften først." },
      { title: "Pust lungerne tomme",               body: "Pust roligt og helt ud – hold inhalatoren væk fra munden under udåndingen." },
      { title: "Luk læberne om mundstykket",        body: "Sæt mundstykket i munden og luk læberne tæt – tungen må ikke blokere åbningen." },
      { title: "Tryk ned og træk vejret langsomt ind", body: "Tryk bunden ned og træk vejret langsomt og dybt ind ad munden på samme tid – 3 til 5 sekunder." },
      { title: "Hold vejret i 10 sekunder",         body: "Hold vejret i 10 sekunder – giv medicinen tid til at sætte sig i lungerne." },
      { title: "Pust ud og vent",                   body: "Pust langsomt ud og vent 30–60 sekunder, inden du tager endnu et pust. Sæt låget på igen." },
    ],
    en: [
      { title: "Remove cap and shake",              body: "Remove the cap and shake the inhaler firmly 4–5 times. If unused for more than 3 days, release one puff into the air first." },
      { title: "Breathe out fully",                 body: "Breathe out slowly and completely – keep the inhaler away from your mouth while doing so." },
      { title: "Seal lips around mouthpiece",       body: "Place the mouthpiece in your mouth and close your lips firmly – tongue must not block the opening." },
      { title: "Press down and breathe in slowly",  body: "Press the canister down and breathe in slowly and deeply through your mouth at the same time – 3 to 5 seconds." },
      { title: "Hold your breath for 10 seconds",   body: "Hold your breath for 10 seconds – give the medicine time to settle in the lungs." },
      { title: "Breathe out and wait",              body: "Breathe out slowly and wait 30–60 seconds before taking another puff. Replace the cap." },
    ],
    so: [
      { title: "Ka qaad daboolka oo rux",                 body: "Ka qaad daboolka buufinta oo si fiican u rux 4 ilaa 5 jeer. Haddii aadan isticmaalin in ka badan 3 maalmood, hal mar hawada ku buufi marka hore." },
      { title: "Sambabada faaruji",                       body: "Si tartiib ah oo buuxda hawada dibadda ugu saar, adigoo buufinta ka fogeynaya afkaaga inta aad sidaas samaynayso." },
      { title: "Bushimaha ku qabso afdhiga",              body: "Afdhiga afka geli oo bushimaha si adag ugu qabso. Hubi in carrabku uusan xannibin furitaanka." },
      { title: "Riix oo si tartiib ah u neefso",          body: "Hoosta riix isla waqtigaasna si tartiib ah oo qoto dheer afka uga neefso 3 ilaa 5 ilbiriqsi." },
      { title: "Neefta hay 10 ilbiriqsi",                body: "Neefta hay 10 ilbiriqsi, ama inta aad awooddo. Tani waxay daawada siinaysaa waqti ay sambabada ugu degto." },
      { title: "Dibadda u neefso oo sug",                body: "Si tartiib ah dibadda ugu neefso oo sug 30 ilaa 60 ilbiriqsi ka hor intaadan buufin kale qaadan. Daboolka dib u saar." },
    ],
    ar: [
      { title: "أزل الغطاء وارجّ",                  body: "أزل الغطاء وارجّ البخاخ بقوة 4–5 مرات. إذا لم تستخدمه أكثر من 3 أيام، أطلق بخة واحدة في الهواء أولًا." },
      { title: "أفرغ رئتيك تمامًا",                  body: "أخرج نفسك ببطء وبالكامل – أبعد البخاخ عن فمك أثناء ذلك." },
      { title: "أغلق شفتيك حول الفوهة",              body: "ضع الفوهة في فمك وأغلق شفتيك بإحكام – لا تسدّ المنفذ بلسانك." },
      { title: "اضغط واستنشق ببطء",                  body: "اضغط القاع للأسفل وفي نفس الوقت استنشق ببطء وعمق من فمك – 3 إلى 5 ثوانٍ." },
      { title: "احبس نفسك 10 ثوانٍ",                 body: "احبس نفسك 10 ثوانٍ – أتح للدواء وقتًا كافيًا للاستقرار في الرئتين." },
      { title: "أخرج نفسك وانتظر",                   body: "أخرج نفسك ببطء وانتظر 30–60 ثانية قبل أخذ بخة أخرى. أعد الغطاء." },
    ],
  },
  symbicort: {
    da: [
      { title: "Hold opret og lad",                      body: "Hold Turbuhaler opret. Drej den røde ring helt til højre, derefter helt til venstre, til der klikker. Enheden er nu ladet." },
      { title: "Pust ud – væk fra inhalatoren",           body: "Pust roligt og helt ud – hold inhalatoren væk fra munden. Pust aldrig ind i en Turbuhaler." },
      { title: "Luk læberne om mundstykket",              body: "Sæt mundstykket i munden og luk læberne tæt og fast – tungen må ikke blokere åbningen." },
      { title: "Træk vejret hurtigt og dybt ind",         body: "Træk vejret kraftigt og hurtigt ind – Turbuhaler kræver et stærkere åndedræt end en spraydåse for at frigøre pulveret." },
      { title: "Hold vejret i 10 sekunder",               body: "Hold vejret i 10 sekunder – giv medicinen tid til at nå de små luftveje." },
      { title: "Skyl munden – vigtigt!",                  body: "Spyt ud og skyl munden grundigt med vand. Dette forebygger svamp i munden og hæshed." },
    ],
    en: [
      { title: "Hold upright and load",                   body: "Hold the Turbuhaler upright. Twist the red ring fully to the right, then fully to the left, until it clicks. The device is now loaded." },
      { title: "Breathe out – away from the inhaler",     body: "Breathe out slowly and completely – keep the inhaler away from your mouth. Never breathe out into a Turbuhaler." },
      { title: "Seal lips around mouthpiece",             body: "Place the mouthpiece in your mouth and close your lips firmly – tongue must not block the opening." },
      { title: "Breathe in fast and deep",                body: "Breathe in quickly and forcefully – the Turbuhaler requires a stronger breath than a spray inhaler to release the powder." },
      { title: "Hold your breath for 10 seconds",         body: "Hold your breath for 10 seconds – give the medicine time to reach the small airways." },
      { title: "Rinse your mouth – important!",           body: "Spit out and rinse your mouth thoroughly with water. This prevents oral thrush and hoarseness." },
    ],
    so: [
      { title: "Si toosan u qabo oo diyaari",            body: "Buufinta si toosan u qabo. Giraanta casaanka ah si buuxda ugu wareeji midig, dabadeedna bidix ilaa aad ka maqasho cod gujin ah. Hadda waa diyaar." },
      { title: "Dibadda u neefso, kana fogee buufinta",  body: "Si tartiib ah oo buuxda hawada dibadda ugu saar, adigoo buufinta ka fogeynaya afkaaga. Waligaa gudaha ha ugu neefsan buufinta." },
      { title: "Bushimaha ku qabso afdhiga",             body: "Afdhiga afka geli oo bushimaha si adag ugu qabso. Hubi in carrabku uusan xannibin furitaanka." },
      { title: "Si xoog leh oo degdeg ah u neefso",      body: "Afka si xoog leh oo degdeg ah uga neefso. Turbuhaler-ku wuxuu u baahan yahay neefsasho ka xoog badan tan buufinta caadiga ah si budadu u soo baxdo." },
      { title: "Neefta hay 10 ilbiriqsi",                body: "Neefta hay 10 ilbiriqsi, ama inta aad awooddo. Tani waxay daawada ka caawisaa inay gaarto marinnada hawada ee yaryar." },
      { title: "Afka dhaq, dabadeed tuf",                body: "Isticmaal kasta ka dib afka si fiican biyo ugu dhaq dabadeedna tuf. Tani waxay ka hortagtaa fangaska afka iyo xabeebta codka." },
    ],
    ar: [
      { title: "أمسكه عموديًا وحمّله",               body: "أمسك الجهاز عموديًا. أدر الحلقة الحمراء تمامًا إلى اليمين ثم إلى اليسار حتى تسمع صوتًا. الجهاز الآن محمّل." },
      { title: "أخرج نفسك – بعيدًا عن الجهاز",       body: "أخرج نفسك ببطء وبالكامل – أبعد الجهاز عن فمك. لا تنفخ أبدًا داخل الجهاز." },
      { title: "أغلق شفتيك حول الفوهة",              body: "ضع الفوهة في فمك وأغلق شفتيك بإحكام – لا تسدّ المنفذ بلسانك." },
      { title: "استنشق بسرعة وبعمق",                 body: "استنشق بسرعة وبقوة – يحتاج هذا الجهاز شهيقًا أقوى من البخاخ العادي لتحرير المسحوق." },
      { title: "احبس نفسك 10 ثوانٍ",                 body: "احبس نفسك 10 ثوانٍ – أتح للدواء وقتًا كافيًا للوصول إلى الشعب الهوائية الصغيرة." },
      { title: "اغسل فمك – مهم جدًا!",              body: "ابصق واغسل فمك جيدًا بالماء. هذا يمنع ظهور فطريات الفم وبحة الصوت." },
    ],
  },
};

/* ─── Reusable SVG sub-shapes ────────────────────────────────────────────── */

/* Ventoline MDI – drawn centered, mouthpiece at bottom */
function VentBody({ ox = 0, oy = 0 }) {
  const x = 140 + ox, y = 100 + oy;
  return (
    <g>
      {/* Canister */}
      <rect x={x - 24} y={y - 52} width={48} height={68} rx={11} fill="#0284c7" />
      <rect x={x - 18} y={y - 38} width={36} height={7}  rx={3}  fill="white" opacity={0.4} />
      <rect x={x - 18} y={y - 26} width={24} height={5}  rx={3}  fill="white" opacity={0.22} />
      <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize={8} fontWeight="700" opacity={0.55}>Ventoline</text>
      {/* Actuator body */}
      <rect x={x - 28} y={y + 10} width={56} height={36} rx={10} fill="#bae6fd" stroke="#0284c7" strokeWidth={2} />
      {/* Mouthpiece */}
      <rect x={x - 35} y={y + 36} width={70} height={19} rx={9}  fill="#7dd3fc" stroke="#0284c7" strokeWidth={2} />
      {/* Nozzle */}
      <ellipse cx={x} cy={y + 55} rx={6} ry={4} fill="#0284c7" />
    </g>
  );
}

function VentCap({ ox = 0, oy = 0, anim }) {
  const x = 140 + ox, y = 100 + oy;
  const animStyle =
    anim === "off" ? { animation: "ig-cap-rise 1.1s ease-out 0.3s forwards", transformBox: "fill-box", transformOrigin: `${x}px ${y - 52}px` } :
    anim === "on"  ? { animation: "ig-cap-ret  0.8s ease-out 0.5s both",    transformBox: "fill-box", transformOrigin: `${x}px ${y - 52}px` } : {};
  return (
    <g style={animStyle}>
      <rect x={x - 28} y={y - 74} width={56} height={26} rx={13} fill="#0369a1" />
      <rect x={x - 21} y={y - 67} width={42} height={5}  rx={3}  fill="white" opacity={0.3} />
    </g>
  );
}

/* Symbicort Turbuhaler – cylindrical, mouthpiece on top */
function SymbBody({ ox = 0, oy = 0 }) {
  const x = 140 + ox, y = 35 + oy;
  return (
    <g>
      {/* Main cylinder */}
      <rect x={x - 22} y={y}      width={44}  height={122} rx={15} fill="#fffbf5" stroke="#ea580c" strokeWidth={2.5} />
      {/* Red grip ring */}
      <rect x={x - 26} y={y + 96} width={52}  height={22}  rx={11} fill="#dc2626" />
      <rect x={x - 19} y={y+101}  width={38}  height={4}   rx={2}  fill="white"   opacity={0.3} />
      {/* Dose counter window */}
      <rect x={x - 12} y={y + 58} width={24}  height={14}  rx={5}  fill="#0369a1" />
      <text x={x} y={y + 69} textAnchor="middle" fill="white" fontSize={8} fontWeight="700">120</text>
      {/* Body label */}
      <text x={x} y={y + 44} textAnchor="middle" fill="#ea580c" fontSize={7} fontWeight="700" opacity={0.65}>Symbicort</text>
      {/* Mouthpiece (top) */}
      <rect x={x - 16} y={y - 22} width={32}  height={26}  rx={10} fill="#fed7aa" stroke="#ea580c" strokeWidth={2} />
      {/* Top nozzle */}
      <ellipse cx={x} cy={y - 22} rx={7} ry={4} fill="#ea580c" opacity={0.5} />
    </g>
  );
}

/* Stylised lips */
function Lips({ cx = 140, cy = 160, anim = false }) {
  const style = anim ? { animation: "ig-lip-close 1.2s ease-in-out 0.3s infinite", transformBox: "fill-box", transformOrigin: `${cx}px ${cy}px` } : {};
  return (
    <g style={style}>
      <path d={`M${cx - 26},${cy} C${cx - 14},${cy - 10} ${cx + 14},${cy - 10} ${cx + 26},${cy}`}
        fill="#f9a8d4" stroke="#db2777" strokeWidth={2.2} strokeLinecap="round" />
      <path d={`M${cx - 26},${cy} C${cx - 8},${cy + 10} ${cx + 8},${cy + 10} ${cx + 26},${cy}`}
        fill="#f472b6" stroke="#db2777" strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
}

function PatientProfile({
  x = 214,
  y = 104,
  scale = 1,
  skin = "#fde68a",
  stroke = "#d97706",
  shirt = "#bfdbfe",
  mouthOpen = false,
  airway = false,
  airwayColor = "#0284c7",
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="-8" cy="58" rx="34" ry="20" fill={shirt} opacity={0.95} />
      <rect x="-22" y="34" width={22} height={24} rx={10} fill={skin} stroke={stroke} strokeWidth={2} />
      <path
        d="M-4 -46 C16 -46 30 -31 33 -8 C35 8 31 22 23 33 C14 46 -1 55 -18 55 C-35 55 -47 45 -51 28 C-55 10 -51 -8 -39 -22 C-30 -33 -20 -46 -4 -46Z"
        fill={skin}
        stroke={stroke}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <circle cx="-10" cy="-10" r="2.8" fill="#1f2937" />
      <path d="M-30 2 Q-39 7 -45 11" fill="none" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M-30 11 Q-39 18 -45 19" fill="none" stroke={stroke} strokeWidth={2.1} strokeLinecap="round" />
      <path d="M-34 -1 Q-43 4 -48 10 Q-42 13 -34 14" fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      {mouthOpen ? (
        <ellipse cx="-46" cy="15" rx="4.6" ry="5.8" fill="#991b1b" stroke="#ef4444" strokeWidth={1.4} />
      ) : (
        <path d="M-34 10 Q-40 14 -47 15" fill="none" stroke="#b91c1c" strokeWidth={2.1} strokeLinecap="round" />
      )}
      {airway ? (
        <>
          <path d="M-42 15 C-26 22 -14 31 -8 43" fill="none" stroke={airwayColor} strokeWidth={2.6} strokeDasharray="6 5" strokeLinecap="round" opacity={0.8} />
          <circle cx="-8" cy="43" r="3.5" fill={airwayColor} opacity={0.22} />
        </>
      ) : null}
    </g>
  );
}

/* Lung pair with optional pulse */
function Lungs({ pulse = false, fill = "#bae6fd", stroke = "#0284c7" }) {
  const style = pulse ? { animation: "ig-lung 2s ease-in-out infinite", transformBox: "fill-box", transformOrigin: "140px 108px" } : {};
  return (
    <g style={style}>
      <path d="M102 76 C84 76 70 90 70 114 C70 134 79 150 94 154 C105 157 112 149 112 140 L112 87 C112 81 108 76 102 76Z" fill={fill} stroke={stroke} strokeWidth={2.2} />
      <path d="M178 76 C196 76 210 90 210 114 C210 134 201 150 186 154 C175 157 168 149 168 140 L168 87 C168 81 172 76 178 76Z" fill={fill} stroke={stroke} strokeWidth={2.2} />
      <rect x={132} y={52} width={16} height={32} rx={8} fill={fill === "#bae6fd" ? "#7dd3fc" : "#fdba74"} stroke={stroke} strokeWidth={2} />
      <path d="M132 78 C120 85 112 87 112 92" fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M148 78 C160 85 168 87 168 92" fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

/* Exhale arrows (3 rows) */
function ExhaleArrows({ x0 = 90, color = "#0284c7", speed = "normal" }) {
  const anim = speed === "slow" ? "ig-flow-slow" : "ig-flow";
  const dur  = speed === "slow" ? "2.3s" : "1.4s";
  const w    = speed === "slow" ? 2.5 : 3.5;
  return (
    <>
      {[{ y: 88, d: "0s" }, { y: 104, d: "0.22s" }, { y: 120, d: "0.44s" }].map((a, i) => (
        <g key={i} style={{ animation: `${anim} ${dur} ${a.d} ease-in-out infinite` }}>
          <line x1={x0}    y1={a.y} x2={x0 + 44} y2={a.y} stroke={color} strokeWidth={w}
            strokeLinecap="round" strokeDasharray={speed === "slow" ? "9 5" : "none"} />
          <polygon points={`${x0 + 41},${a.y - 7} ${x0 + 57},${a.y} ${x0 + 41},${a.y + 7}`} fill={color} />
        </g>
      ))}
    </>
  );
}

/* ─── Ventoline SVG scenes ──────────────────────────────────────────────── */

function VS0() {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#EFF6FF" rx={18} />
      {/* Shake wrapper */}
      <g style={{ animation: "ig-shake 0.45s ease-in-out 1.5s 3", transformBox: "fill-box", transformOrigin: "140px 128px" }}>
        <VentBody />
        {/* Motion lines */}
        {[[-34, 94], [-38, 108], [-34, 122]].map(([dx, y], i) => (
          <line key={i} x1={140 + dx - 10} y1={y} x2={140 + dx} y2={y}
            stroke="#0284c7" strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
        ))}
        {[[34, 94], [38, 108], [34, 122]].map(([dx, y], i) => (
          <line key={i} x1={140 + dx} y1={y} x2={140 + dx + 10} y2={y}
            stroke="#0284c7" strokeWidth={2.5} strokeLinecap="round" opacity={0.45} />
        ))}
      </g>
      {/* Cap flying off */}
      <g style={{ animation: "ig-cap-rise 1.1s ease-out 0.3s forwards", transformBox: "fill-box", transformOrigin: "140px 48px" }}>
        <rect x={112} y={26} width={56} height={26} rx={13} fill="#0369a1" />
        <rect x={119} y={33} width={42} height={5}  rx={3}  fill="white" opacity={0.3} />
      </g>
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#0284c7" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>1</text>
    </svg>
  );
}

function VS1() {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#EFF6FF" rx={18} />
      <PatientProfile x={84} y={96} scale={0.95} mouthOpen airwayColor="#0284c7" shirt="#cfe8ff" />
      <ExhaleArrows x0={40} color="#0284c7" />
      {/* Small inhaler right – kept far away */}
      <g transform="translate(188 53) scale(0.42)" opacity={0.5}>
        <VentBody />
        <rect x={112} y={26} width={56} height={26} rx={13} fill="#0369a1" />
      </g>
      {/* Big ✕ over inhaler */}
      <text x={225} y={148} textAnchor="middle" fill="#dc2626" fontSize={30} fontWeight="900">✕</text>
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#0284c7" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>2</text>
    </svg>
  );
}

function VS2() {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#EFF6FF" rx={18} />
      <PatientProfile x={218} y={98} scale={0.98} mouthOpen={false} shirt="#dbeafe" />
      <g transform="translate(-10 10) rotate(-90 140 100)">
        <VentBody />
      </g>
      <rect x={165} y={105} width={14} height={10} rx={5} fill="#0284c7" opacity={0.7} />
      <circle cx={212} cy={107} r={26} fill="none" stroke="#bfdbfe" strokeWidth={3} opacity={0.7} />
      <path d="M186 107 L200 107" stroke="#0284c7" strokeWidth={2.2} strokeDasharray="5 4" strokeLinecap="round" />
      {/* Green check */}
      <circle cx={212} cy={50} r={19} fill="#16a34a" />
      <path d="M202 50 L209 58 L222 43" fill="none" stroke="white" strokeWidth={3.2}
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#0284c7" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>3</text>
    </svg>
  );
}

function VS3({ language }) {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#EFF6FF" rx={18} />
      <PatientProfile x={220} y={98} scale={1} mouthOpen airway airwayColor="#0284c7" shirt="#dbeafe" />
      <g transform="translate(-18 10) rotate(-90 140 100)">
        <VentBody />
      </g>
      {/* Finger pressing canister */}
      <g style={{ animation: "ig-press 1.1s ease-in-out 0.2s infinite", transformBox: "fill-box", transformOrigin: "82px 102px" }}>
        <ellipse cx={82} cy={98} rx={15} ry={10} fill="#fde68a" stroke="#d97706" strokeWidth={2} />
        <rect x={75} y={104} width={14} height={18} rx={7} fill="#fde68a" stroke="#d97706" strokeWidth={2} />
      </g>
      {/* Mist particles */}
      {[[-12, -12], [0, -18], [15, -10], [8, -3], [18, 2]].map(([dx, dy], i) => (
        <circle key={i} cx={176} cy={104} r={4} fill="#7dd3fc" opacity={0.75}
          style={{ animation: `ig-mist 1.5s ease-out ${i * 0.17}s infinite`, ["--dx"]: `${dx}px`, ["--dy"]: `${dy}px` }} />
      ))}
      {/* Slow curved inhale arrow */}
      <path d="M178 104 Q203 104 218 112" fill="none" stroke="#0284c7" strokeWidth={3.2}
        strokeDasharray="9 6" strokeLinecap="round"
        style={{ animation: "ig-arc 1.8s ease-in-out 0.5s infinite", strokeDashoffset: 70 }} />
      <polygon points="213,106 225,113 213,120" fill="#0284c7" />
      {/* SLOW badge */}
      <rect x={188} y={68} width={66} height={28} rx={9} fill="#dbeafe" />
      <text x={221} y={87} textAnchor="middle" fill="#0284c7" fontSize={13} fontWeight="800">
        {`${SCENE_COPY.slow[language] ?? SCENE_COPY.slow.en} 🐢`}
      </text>
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#0284c7" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>4</text>
    </svg>
  );
}

function VS4({ language }) {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#EFF6FF" rx={18} />
      <Lungs pulse fill="#bae6fd" stroke="#0284c7" />
      {/* Background ring */}
      <circle cx={140} cy={108} r={74} fill="none" stroke="#dbeafe" strokeWidth={7} />
      {/* Animated progress ring */}
      <circle cx={140} cy={108} r={74} fill="none" stroke="#0284c7" strokeWidth={7}
        strokeDasharray="465" strokeLinecap="round"
        style={{ animation: "ig-arc 3s linear 0.4s infinite", transformOrigin: "140px 108px", transform: "rotate(-90deg)" }} />
      {/* Central text */}
      <text x={140} y={100} textAnchor="middle" fill="#0284c7" fontSize={42} fontWeight="900">10</text>
      <text x={140} y={122} textAnchor="middle" fill="#0284c7" fontSize={12} fontWeight={600}>
        {SCENE_COPY.seconds[language] ?? SCENE_COPY.seconds.en}
      </text>
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#0284c7" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>5</text>
    </svg>
  );
}

function VS5({ language }) {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#EFF6FF" rx={18} />
      {/* Mouth on left */}
      <ellipse cx={52} cy={96} rx={28} ry={19} fill="#fef9c3" stroke="#d97706" strokeWidth={2} />
      <path d="M33 96 Q52 107 71 96" fill="#fbbf24" />
      {/* Slow dashed exhale arrows */}
      <ExhaleArrows x0={86} color="#0284c7" speed="slow" />
      {/* Clock centre-right */}
      <circle cx={208} cy={96} r={40} fill="white" stroke="#94a3b8" strokeWidth={2.5} />
      <circle cx={208} cy={96} r={3.5} fill="#334155" />
      <line x1={208} y1={96} x2={208} y2={64} stroke="#334155" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={208} y1={96} x2={230} y2={96} stroke="#dc2626" strokeWidth={2.2} strokeLinecap="round"
        style={{ animation: "ig-clock 5s linear infinite", transformBox: "fill-box", transformOrigin: "208px 96px" }} />
      <text x={208} y={152} textAnchor="middle" fill="#64748b" fontSize={13} fontWeight={700}>
        {SCENE_COPY.waitSeconds[language] ?? SCENE_COPY.waitSeconds.en}
      </text>
      {/* Cap-on indicator */}
      <rect x={166} y={166} width={84} height={26} rx={9} fill="#dbeafe" />
      <text x={208} y={183} textAnchor="middle" fill="#0284c7" fontSize={11} fontWeight={800}>
        {`🔒 ${SCENE_COPY.replaceCap[language] ?? SCENE_COPY.replaceCap.en}`}
      </text>
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#0284c7" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>6</text>
    </svg>
  );
}

/* ─── Symbicort SVG scenes ──────────────────────────────────────────────── */

function SS0({ language }) {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#FFF7ED" rx={18} />
      <SymbBody />
      {/* Rotating grip ring */}
      <g style={{ animation: "ig-ring-spin 2.2s ease-in-out 0.4s infinite", transformBox: "fill-box", transformOrigin: "140px 152px" }}>
        <rect x={114} y={131} width={52} height={22} rx={11} fill="#dc2626" />
        <text x={127} y={147} fill="white" fontSize={15} fontWeight="900">↺</text>
        <text x={149} y={147} fill="white" fontSize={15} fontWeight="900">↻</text>
      </g>
      {/* Click effect */}
      <g style={{ animation: "ig-click 2.2s ease-out 1.8s infinite", transformBox: "fill-box", transformOrigin: "194px 138px" }}>
        <text x={194} y={138} fontSize={24} textAnchor="middle">✦</text>
        <text x={194} y={155} fill="#16a34a" fontSize={11} fontWeight="800" textAnchor="middle">
          {SCENE_COPY.click[language] ?? SCENE_COPY.click.en}
        </text>
      </g>
      {/* Upright arrow (left side) */}
      <line x1={76} y1={175} x2={76} y2={46} stroke="#ea580c" strokeWidth={3.5} strokeLinecap="round" opacity={0.55} />
      <polygon points="69,52 76,34 83,52" fill="#ea580c" opacity={0.55} />
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#ea580c" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>1</text>
    </svg>
  );
}

function SS1({ language }) {
  const inhalerWarning = SCENE_COPY.neverIntoInhaler[language] ?? SCENE_COPY.neverIntoInhaler.en;
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#FFF7ED" rx={18} />
      <PatientProfile x={84} y={96} scale={0.95} mouthOpen airwayColor="#ea580c" shirt="#fde8d7" />
      <ExhaleArrows x0={40} color="#ea580c" />
      {/* Symbicort to the right, away */}
      <g transform="translate(68 0) scale(0.82)" opacity={0.85}>
        <SymbBody />
      </g>
      {/* NEVER into inhaler label */}
      <rect x={128} y={162} width={144} height={34} rx={10} fill="#fef2f2" stroke="#fecaca" strokeWidth={1.5} />
      <text x={200} y={176} textAnchor="middle" fill="#dc2626" fontSize={9} fontWeight="800">
        <tspan x={200} dy={0}>{`✕ ${inhalerWarning[0]}`}</tspan>
        <tspan x={200} dy={11}>{inhalerWarning[1]}</tspan>
      </text>
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#ea580c" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>2</text>
    </svg>
  );
}

function SS2() {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#FFF7ED" rx={18} />
      <PatientProfile x={140} y={106} scale={1.02} mouthOpen={false} shirt="#fde8d7" />
      <g transform="translate(0 8)">
        <SymbBody oy={42} />
      </g>
      <circle cx={140} cy={96} r={22} fill="none" stroke="#fed7aa" strokeWidth={3} opacity={0.8} />
      <path d="M140 98 L140 116" stroke="#ea580c" strokeWidth={2.4} strokeDasharray="5 4" strokeLinecap="round" />
      {/* Green check */}
      <circle cx={212} cy={50} r={19} fill="#16a34a" />
      <path d="M202 50 L209 58 L222 43" fill="none" stroke="white" strokeWidth={3.2}
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#ea580c" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>3</text>
    </svg>
  );
}

function SS3({ language }) {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#FFF7ED" rx={18} />
      <PatientProfile x={214} y={98} scale={1} mouthOpen airway airwayColor="#ea580c" shirt="#fde8d7" />
      <g transform="translate(-6 8)">
        <SymbBody ox={-10} oy={18} />
      </g>
      {/* Fast bold inhale arrows */}
      {[{ y: 90, d: "0s", w: 6 }, { y: 102, d: "0.1s", w: 5 }, { y: 114, d: "0.2s", w: 4 }].map((a, i) => (
        <g key={i} style={{ animation: `ig-flow-fast 0.75s ${a.d} ease-out infinite` }}>
          <line x1={120} y1={a.y} x2={168} y2={a.y} stroke="#ea580c" strokeWidth={a.w} strokeLinecap="round" />
          <polygon points={`${163},${a.y - 8} ${179},${a.y} ${163},${a.y + 8}`} fill="#ea580c" />
        </g>
      ))}
      {/* Speed streaks */}
      {[-14, -5, 4, 13, 22].map((oy, i) => (
        <line key={i} x1={132} y1={102 + oy} x2={166} y2={102 + oy}
          stroke="#fed7aa" strokeWidth={2.2} strokeLinecap="round"
          style={{ animation: `ig-flow-fast 0.55s ${i * 0.07}s ease-out infinite` }} />
      ))}
      {/* FAST badge */}
      <rect x={172} y={120} width={82} height={30} rx={10} fill="#ea580c" />
      <text x={213} y={140} textAnchor="middle" fill="white" fontSize={14} fontWeight="900">
        {`${SCENE_COPY.fast[language] ?? SCENE_COPY.fast.en} ⚡`}
      </text>
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#ea580c" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>4</text>
    </svg>
  );
}

function SS4({ language }) {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#FFF7ED" rx={18} />
      <Lungs pulse fill="#fed7aa" stroke="#ea580c" />
      <circle cx={140} cy={108} r={74} fill="none" stroke="#ffedd5"   strokeWidth={7} />
      <circle cx={140} cy={108} r={74} fill="none" stroke="#ea580c"   strokeWidth={7}
        strokeDasharray="465" strokeLinecap="round"
        style={{ animation: "ig-arc 3s linear 0.4s infinite", transformOrigin: "140px 108px", transform: "rotate(-90deg)" }} />
      <text x={140} y={100} textAnchor="middle" fill="#ea580c" fontSize={42} fontWeight="900">10</text>
      <text x={140} y={122} textAnchor="middle" fill="#ea580c" fontSize={12} fontWeight={600}>
        {SCENE_COPY.seconds[language] ?? SCENE_COPY.seconds.en}
      </text>
      <circle cx={32} cy={32} r={20} fill="#ea580c" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>5</text>
    </svg>
  );
}

function SS5({ language }) {
  return (
    <svg viewBox="0 0 280 210" width="100%" style={{ maxHeight: 210, display: "block" }}>
      <rect width={280} height={210} fill="#FFF7ED" rx={18} />
      {/* Water source bar */}
      <rect x={106} y={18} width={68} height={14} rx={6} fill="#7dd3fc" stroke="#0284c7" strokeWidth={2} />
      {/* Drops */}
      {[122, 140, 158].map((cx, i) => (
        <ellipse key={i} cx={cx} cy={48} rx={5} ry={8} fill="#7dd3fc"
          style={{ animation: `ig-drop 1.5s ${i * 0.24}s ease-in infinite` }} />
      ))}
      {/* Open mouth */}
      <ellipse cx={140} cy={122} rx={44} ry={32} fill="#fef3c7" stroke="#d97706" strokeWidth={2.5} />
      <ellipse cx={140} cy={126} rx={32} ry={20} fill="#dc2626"  opacity={0.75} />
      <ellipse cx={140} cy={136} rx={22} ry={9}  fill="#be123c"  opacity={0.55} />
      {/* Spit arc */}
      <path d="M182 138 Q212 132 234 112" fill="none" stroke="#7dd3fc"
        strokeWidth={3.5} strokeDasharray="8 5" strokeLinecap="round" />
      <polygon points="228,105 240,115 226,119" fill="#7dd3fc" />
      {/* Warning badge */}
      <rect x={86} y={170} width={108} height={26} rx={9} fill="#dc2626" />
      <text x={140} y={187} textAnchor="middle" fill="white" fontSize={11} fontWeight="800">
        {`⚠ ${SCENE_COPY.rinseAndSpit[language] ?? SCENE_COPY.rinseAndSpit.en}`}
      </text>
      {/* Step badge */}
      <circle cx={32} cy={32} r={20} fill="#ea580c" />
      <text x={32} y={39} textAnchor="middle" fill="white" fontWeight="800" fontSize={18}>6</text>
    </svg>
  );
}

const VENT_SCENES = [VS0, VS1, VS2, VS3, VS4, VS5];
const SYMB_SCENES = [SS0, SS1, SS2, SS3, SS4, SS5];

/* ─── Main InhalerGuide component ───────────────────────────────────────── */

export function InhalerGuide({ slug, language }) {
  const [step, setStep] = useState(0);

  const steps   = STEPS[slug]?.[language] ?? STEPS[slug]?.da ?? [];
  const isRtl   = language === "ar";
  const isVent  = slug === "ventoline";
  const Scenes  = isVent ? VENT_SCENES : SYMB_SCENES;
  const Scene   = Scenes[Math.min(step, Scenes.length - 1)];
  const warning = WARNING[slug]?.[language] ?? WARNING[slug]?.da;

  const theme = isVent
    ? { primary: "#0284c7", bg: "#EFF6FF", border: "#bae6fd", soft: "#dbeafe" }
    : { primary: "#ea580c", bg: "#FFF7ED", border: "#fed7aa", soft: "#ffedd5" };

  return (
    <section
      className="reveal-on-scroll mt-6 overflow-hidden rounded-2xl border"
      style={{ borderColor: theme.border, background: "white" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <style dangerouslySetInnerHTML={{ __html: KF }} />

      {/* ── Header ── */}
      <div style={{ background: theme.bg, borderBottom: `2px solid ${theme.border}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: 24 }}>{isVent ? "💨" : "🌀"}</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: theme.primary, lineHeight: 1.2 }}>
              {TITLE[language] ?? TITLE.da}
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b", fontWeight: 600 }}>
              {SUBTITLE[slug]?.[language] ?? SUBTITLE[slug]?.en}
            </p>
          </div>
        </div>
      </div>

      {/* ── Warning banner ── */}
      <div style={{ background: "#fef2f2", borderBottom: "1.5px solid #fecaca", padding: "10px 20px", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 13, color: "#991b1b", lineHeight: 1.65, fontWeight: 500 }}>{warning}</p>
      </div>

      {/* ── Animation area ── */}
      <div style={{ padding: "14px 14px 6px" }}>
        {/* Step dot navigation */}
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 12 }}>
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`${STEP_LBL[language] ?? "Step"} ${i + 1}`}
              style={{
                width: i === step ? 30 : 10, height: 10, borderRadius: 99, border: "none", padding: 0,
                background: i === step ? theme.primary : `${theme.primary}33`,
                cursor: "pointer", transition: "all 0.22s",
              }}
            />
          ))}
        </div>
        {/* Scene – remounted on step change to restart animations */}
        <div
          key={`${slug}-scene-${step}`}
          style={{ borderRadius: 14, overflow: "hidden", border: `1.5px solid ${theme.border}` }}
        >
          <Scene language={language} />
        </div>
      </div>

      {/* ── Step text card ── */}
      <div style={{ padding: "6px 14px 16px" }}>
        <div style={{ background: theme.bg, border: `1.5px solid ${theme.border}`, borderRadius: 14, padding: "13px 15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span style={{
              background: theme.primary, color: "white", fontWeight: 800, fontSize: 12,
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>
              {step + 1}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: theme.primary, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {STEP_LBL[language] ?? "Step"} {step + 1} {STEP_OF[language] ?? "of"} {steps.length}
            </span>
          </div>
          <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}>
            {steps[step]?.title}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#334155", lineHeight: 1.75, textAlign: isRtl ? "right" : "left" }}>
            {steps[step]?.body}
          </p>
        </div>

        {/* Prev / Next buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 11 }}>
          <button
            type="button"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              flex: 1, padding: "13px 10px", borderRadius: 12, fontWeight: 700, fontSize: 14,
              border: `1.5px solid ${theme.border}`, background: "white",
              color: step === 0 ? "#cbd5e1" : theme.primary,
              cursor: step === 0 ? "not-allowed" : "pointer", transition: "all 0.18s",
            }}
          >
            {isRtl ? `${NAV_PREV[language]} →` : `← ${NAV_PREV[language]}`}
          </button>
          <button
            type="button"
            onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
            disabled={step === steps.length - 1}
            style={{
              flex: 1, padding: "13px 10px", borderRadius: 12, fontWeight: 700, fontSize: 14,
              border: "none",
              background: step === steps.length - 1 ? "#e2e8f0" : theme.primary,
              color: step === steps.length - 1 ? "#94a3b8" : "white",
              cursor: step === steps.length - 1 ? "not-allowed" : "pointer", transition: "all 0.18s",
            }}
          >
            {isRtl ? `← ${NAV_NEXT[language]}` : `${NAV_NEXT[language]} →`}
          </button>
        </div>
      </div>
    </section>
  );
}
