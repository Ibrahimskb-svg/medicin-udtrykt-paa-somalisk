"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LanguageSelect } from "./language-select";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import { applyLanguageToDocument } from "../lib/language";
import { getIndexData, uiText } from "../lib/site";

const indexData = getIndexData();

const ICON_BASE = "/icons/";
const P = {
  school:    "/icons/school.png",
  work:      "/icons/work.png",
  education: "/icons/education.png",
  pills:     "/icons/pills.png",
};

// ── Translated display names ───────────────────────────────────────────────
const SLUG_DISPLAY_NAMES = {
  amlodipin:        { da:"Amlodipin",                             en:"Amlodipine",                          ar:"أملوديبين",                              so:"Amlodipin" },
  hjertemagnyl:     { da:"Hjertemagnyl (Acetylsalicylsyre, ASA)", en:"Aspirin (Acetylsalicylic acid, ASA)", ar:"أسبرين (حمض أسيتيل الساليسيليك، ASA)", so:"Hjertemagnyl (Acetylsalicylsyre, ASA)" },
  zopiclon:         { da:"Imozop (Zopiclon)",                     en:"Imovane (Zopiclone)",                 ar:"إيموفان (زوبيكلون)",                     so:"Imozop (Zopiclon)" },
  lamotrigin:       { da:"Lamotrigin",                            en:"Lamotrigine",                         ar:"لاموتريجين",                             so:"Lamotrigin" },
  pantoprazol:      { da:"Pantoprazol",                           en:"Pantoprazole",                        ar:"بانتوبرازول",                            so:"Pantoprazol" },
  quetiapin:        { da:"Quetiapin",                             en:"Quetiapine",                          ar:"كويتيابين",                              so:"Quetiapin" },
  sertralin:        { da:"Sertralin",                             en:"Sertraline",                          ar:"سيرترالين",                              so:"Sertralin" },
  ventoline:        { da:"Ventoline (Salbutamol)",                en:"Ventolin (Salbutamol)",               ar:"فنتولين (سالبوتامول)",                   so:"Ventoline (Salbutamol)" },
  morfin_injektion: { da:"Morfin (injektion)",                    en:"Morphine (injection)",                ar:"مورفين (حقن)",                           so:"Morfin (irbad)" },
  morfin_tablet:    { da:"Morfin (tablet)",                       en:"Morphine (tablet)",                   ar:"مورفين (قرص)",                           so:"Morfin (kiniin)" },
};

function getDisplayName(slug, language, fallback) {
  const t = SLUG_DISPLAY_NAMES[slug];
  if (!t) return fallback;
  return t[language] ?? t.so ?? fallback;
}

// ── Nav labels ─────────────────────────────────────────────────────────────
const NAV_LABELS = {
  da: { aboutMe:"Om mig", aboutSite:"Om Somalimed", faq:"FAQ", feedback:"Feedback", contact:"Kontakt", tpi:"Inhalationsteknik" },
  en: { aboutMe:"About me", aboutSite:"About Somalimed", faq:"FAQ", feedback:"Feedback", contact:"Contact", tpi:"Inhaler technique" },
  so: { aboutMe:"Ku saabsan aniga", aboutSite:"Ku saabsan Somalimed", faq:"Su'aalaha inta badan la isweydiiyo", feedback:"Faallo", contact:"Xiriir", tpi:"Farsamada buufinta" },
  ar: { aboutMe:"نبذة عني", aboutSite:"حول Somalimed", faq:"الأسئلة الشائعة", feedback:"ملاحظات", contact:"تواصل", tpi:"تقنية الاستنشاق" },
};

const FAQ_MODAL_TITLE = {
  da: "FAQ — Ofte stillede spørgsmål",
  en: "FAQ — Frequently Asked Questions",
  so: "Su'aalaha inta badan la isweydiiyo",
  ar: "الأسئلة الشائعة",
};

const TPI_MODAL_TITLE = {
  da: "Korrekt inhalationsteknik",
  en: "Correct inhaler technique",
  so: "Farsamada saxda ah ee buufinta",
  ar: "تقنية الاستنشاق الصحيحة",
};

// ── TPI Data (Beholdt og struktureret til animation) ────────────────────────
const TPI_DATA = {
  da: {
    intro: "Korrekt inhalationsteknik er afgørende — bruger du den forkert, når medicinen ikke godt nok ned i lungerne, og effekten udebliver. Jeg ser det næsten dagligt på apoteket: patienter, der tager medicinen trofast, men ikke mærker nok forskel. Ofte handler det ikke om forkert medicin, men om teknikken.",
    ibrahimNote: "Jeg plejer at sige det sådan her: din inhalator er ikke bare en flaske, du trykker på — den kræver et præcist samspil mellem spray og vejrtrækning. Når det sidder rigtigt, mærker du forskellen.",
    ventoline: {
      name: "Ventoline (Salbutamol)",
      subtitle: "Hurtigtvirkende anfaldsmedicin — åbner luftvejene på få minutter",
      warning: "Brug altid Ventoline som din første hjælp ved akut åndenød. Virker den ikke inden for 10–15 minutter, eller forværres vejrtrækningen — søg akut hjælp.",
      steps: [
        { icon:"🔷", title:"Tag låget af og ryst", body:"Tag låget af mundstykket og ryst inhalatoren godt 4–5 gange. Hvis du ikke har brugt den i mere end 3 dage, afgiv én pust i luften for at aktivere den." },
        { icon:"💨", title:"Pust lungerne tomme", body:"Pust roligt og helt ud — men hold mundstykket væk fra munden, mens du gør det. Undgå at puste ind i inhalatoren." },
        { icon:"💊", title:"Sæt mundstykket til læberne", body:"Luk læberne tæt om mundstykket. Tungen må ikke blokere åbningen." },
        { icon:"▶️", title:"Tryk og træk vejret ind", body:"Tryk bunden ned og træk samtidigt langsomt og dybt vejret ind gennem munden i 3–5 sekunder. Synk ikke — hold vejret." },
        { icon:"⏸️", title:"Hold vejret i 10 sekunder", body:"Hold vejret i 10 sekunder — eller så længe det er behageligt. Det giver medicinen tid til at sætte sig i lungerne." },
        { icon:"🔁", title:"Pust ud og gentag ved behov", body:"Pust langsomt ud og vent 30–60 sekunder, inden du eventuelt tager et pust mere. Sæt altid låget på igen efterfølgende." },
      ],
      tips: [
        "Brug spacer, hvis du har svært ved at koordinere spray og vejrtrækning — det gælder særligt børn og ældre.",
        "Vask mundstykket med vand en gang om ugen og lad det lufttørre.",
        "Holder du vejret i 10 sekunder, øges optagelsen markant.",
        "Tæl dine pust — de fleste inhalatorer har en tæller. Bestil ny i god tid.",
      ],
    },
    symbicort: {
      name: "Symbicort Turbuhaler",
      subtitle: "Fast forebyggende behandling — dæmper betændelse og holder luftvejene åbne",
      warning: "Symbicort er ikke anfaldsmedicin. Brug altid Ventoline ved akut åndenød. Symbicort virker kun, når den tages fast og rigtigt.",
      afterUse: "Skyl altid munden med vand og spyt ud efter brug — det forebygger svamp i munden (trøske), som er en velkendt bivirkning ved inhalationssteroider.",
      steps: [
        { icon:"🔷", title:"Hold Turbuhaler opret og åbn", body:"Hold inhalatoren opret med mundstykket opad. Drej den røde ring helt til højre og derefter tilbage til venstre, indtil du hører et klik. Enheden er nu ladet." },
        { icon:"💨", title:"Pust helt ud — væk fra inhalatoren", body:"Pust roligt og dybt ud, men hold inhalatoren væk fra munden. Pust aldrig ind i en Turbuhaler — det kan fugtige pulveret og ødelægge dosen." },
        { icon:"💊", title:"Sæt mundstykket til munden", body:"Luk læberne tæt og fast om mundstykket. Tungen må ikke blokere." },
        { icon:"▶️", title:"Træk vejret hurtigt og dybt ind", body:"Træk vejret hurtigt og kraftigt ind gennem munden — Turbuhaler kræver et stærkere og hurtigere åndedræt end en spray-inhalator for at frigøre pulveret korrekt." },
        { icon:"⏸️", title:"Hold vejret i 10 sekunder", body:"Hold vejret i 10 sekunder — eller så længe det er behageligt. Tænk på det som at lade medicinen finde vej til de små luftveje." },
        { icon:"🌊", title:"Skyl munden — vigtigt!", body:"Spyt ud og skyl munden grundigt med vand efter hvert brug. Det er ikke valgfrit — det reducerer risikoen for svamp i munden og hæshed markant." },
      ],
      tips: [
        "En Turbuhaler indeholder normalt 60 eller 120 doser. Et rødt vindue i dosistælleren betyder: bestil ny nu.",
        "Du smager eller mærker måske næsten ingenting — det er normalt. Pulverdosen er meget lille.",
        "Opbevar Turbuhaler med låget på, tørt og væk fra varme og fugt.",
        "Tag Symbicort på samme tidspunkt hver dag — selv de dage, du har det fint.",
      ],
    },
  },
  en: {
    intro: "Correct inhaler technique is essential — if you use it incorrectly, the medicine does not reach the lungs properly and the effect is lost. I see it almost every day at the pharmacy: patients who take their medicine faithfully but do not feel enough difference. Often it is not about the wrong medicine, but about the technique.",
    ibrahimNote: "I usually put it like this: your inhaler is not just a bottle you press — it requires a precise coordination between the spray and your breathing. When you get it right, you feel the difference.",
    ventoline: {
      name: "Ventoline (Salbutamol)",
      subtitle: "Fast-acting reliever — opens the airways within minutes",
      warning: "Always use Ventoline as your first help during acute breathlessness. If it does not work within 10–15 minutes, or if breathing gets worse — seek urgent help.",
      steps: [
        { icon:"🔷", title:"Remove cap and shake", body:"Remove the mouthpiece cap and shake the inhaler well 4–5 times. If you have not used it for more than 3 days, release one puff into the air to prime it." },
        { icon:"💨", title:"Breathe out fully", body:"Breathe out slowly and completely — but hold the mouthpiece away from your mouth while doing so. Never breathe out into the inhaler." },
        { icon:"💊", title:"Place the mouthpiece to your lips", body:"Close your lips tightly around the mouthpiece. Make sure your tongue does not block the opening." },
        { icon:"▶️", title:"Press and breathe in", body:"Press the canister down and at the same time breathe in slowly and deeply through your mouth for 3–5 seconds. Do not swallow — hold your breath." },
        { icon:"⏸️", title:"Hold your breath for 10 seconds", body:"Hold your breath for 10 seconds — or as long as is comfortable. This gives the medicine time to settle in the lungs." },
        { icon:"🔁", title:"Breathe out and repeat if needed", body:"Breathe out slowly and wait 30–60 seconds before taking another puff if needed. Always replace the cap afterwards." },
      ],
      tips: [
        "Use a spacer if you find it hard to coordinate the spray and breathing — this applies especially to children and older adults.",
        "Wash the mouthpiece with water once a week and let it air dry.",
        "Holding your breath for 10 seconds significantly increases absorption.",
        "Count your puffs — most inhalers have a dose counter. Order a new one in good time.",
      ],
    },
    symbicort: {
      name: "Symbicort Turbuhaler",
      subtitle: "Regular preventive treatment — reduces inflammation and keeps the airways open",
      warning: "Symbicort is not a reliever inhaler. Always use Ventoline for acute breathlessness. Symbicort only works when taken regularly and correctly.",
      afterUse: "Always rinse your mouth with water and spit it out after use — this prevents oral thrush, which is a well-known side effect of inhaled steroids.",
      steps: [
        { icon:"🔷", title:"Hold upright and load", body:"Hold the inhaler upright with the mouthpiece facing up. Twist the red ring fully to the right, then back to the left until you hear a click. The device is now loaded." },
        { icon:"💨", title:"Breathe out fully — away from the inhaler", body:"Breathe out slowly and deeply, but hold the inhaler away from your mouth. Never breathe out into a Turbuhaler — moisture can damage the powder dose." },
        { icon:"💊", title:"Place the mouthpiece to your mouth", body:"Close your lips firmly around the mouthpiece. Make sure your tongue does not block the opening." },
        { icon:"▶️", title:"Breathe in fast and deep", body:"Breathe in quickly and forcefully through your mouth — a Turbuhaler requires a stronger and faster breath than a spray inhaler in order to release the powder correctly." },
        { icon:"⏸️", title:"Hold your breath for 10 seconds", body:"Hold your breath for 10 seconds — or as long as is comfortable. Think of it as allowing the medicine to find its way to the small airways." },
        { icon:"🌊", title:"Rinse your mouth — important!", body:"Spit out and rinse your mouth thoroughly with water after every use. This is not optional — it significantly reduces the risk of oral thrush and hoarseness." },
      ],
      tips: [
        "A Turbuhaler normally contains 60 or 120 doses. A red window in the dose counter means: order a new one now.",
        "You may taste or feel almost nothing — this is normal. The powder dose is very small.",
        "Store the Turbuhaler with the cap on, in a dry place away from heat and moisture.",
        "Take Symbicort at the same time every day — even on days when you feel well.",
      ],
    },
  },
  so: {
    intro: "Farsamada saxda ah ee buufinta waa muhiim aad — haddii farsamadu khaldan tahay, daawadu si fiican uguma gaarto sambabada, saameynteeduna way lumaa. Waxaan maalin kasta ku aragaa farmashiyaha: bukaan daawadooda si joogto ah u qaada, laakiin kaa badna saameyn. Badanaa dhibaatadu ma aha daawada, balse waa farsamada.",
    ibrahimNote: "Waxaan dadka ugu sharxaa sidan: buufintaadu ma aha oo keliya dhalmo aad ku riixdo — waxay u baahan tahay isku-dheellitir sax ah oo u dhexeeya buufinta iyo neefsashada. Marka aad saxdo farsamada, kaa badna dareemaysaa.",
    ventoline: {
      name: "Ventoline (Salbutamol)",
      subtitle: "Daawo degdeg u shaqaysa — waxay furtaa marinnada hawada daqiiqo gudahood",
      warning: "Mar walba Ventoline u isticmaal marka neef-qabatinku si kedis ah ku soo boodo. Haddii 10–15 daqiiqo gudahood aysan shaqayn, ama neefsashadu sii xumaato — raadi gargaar caafimaad si degdeg ah.",
      steps: [
        { icon:"🔷", title:"Ka qaad daboolka oo gariir", body:"Ka qaad daboolka mundstykket-ka oo si fiican u gariir buufinta 4–5 jeer. Haddii aad 3 maalmood ka badan isticmaalin weydo, buufin hal mar hawada saar si aad u heshiisiiso." },
        { icon:"💨", title:"Sambabada si buuxda u madheeso", body:"Si degdeg ah oo buuxda u neefsaaso dibadda — laakiin mundstykka ka hay fogaan murtaada inta aad sidaas samaynayso. Ha u neefsanin gudaha buufinta." },
        { icon:"💊", title:"Mundstykka bushimaha ku rid", body:"Bushimaha si adag oo xidna ugu rid mundstykka. Ilaa carrabku uusan daaqa xidnayn." },
        { icon:"▶️", title:"Riix oo neefsashada soo qaad", body:"Hoostiisa riix isla markaana si tartiib ah oo qoto dheer neefsashada afka ka soo qaad 3–5 ilbiriqsi gudahood. Ha liqin — neefsashada hayn." },
        { icon:"⏸️", title:"Neefsashada 10 ilbiriqsi hayn", body:"Neefsashada 10 ilbiriqsi hayn — ama muddo kugu dhow. Tani waxay siinaysaa daawada waqtiga ay sambabada ku degto." },
        { icon:"🔁", title:"Dibadda u neefsaaso oo ku celi haddii loo baahdo", body:"Si tartiib ah u neefsaaso dibadda oo sug 30–60 ilbiriqsi ka hor intaad hal buufin kale qaadanayso haddii loo baahdo. Mar walba daboolka saar ka dib." },
      ],
      tips: [
        "Spacer isticmaal haddii aad ku adag tahay inaad isku waafajiso buufinta iyo neefsashada — gaar ahaan carruurta iyo dadka waayeelka ah.",
        "Mundstykka biyo ku dhaqi toddobaadkiiba mar oo hawada ku qalajso.",
        "Neefsashada 10 ilbiriqsi haystu aad ayay u kordhisaa nuugista daawada.",
        "Tiri buufimahagaaga — inhalatoryada badankood waxaa ku jira tiriye. Cusub ka dalbo waqtigiisa.",
      ],
    },
    symbicort: {
      name: "Symbicort Turbuhaler",
      subtitle: "Daaweyn joogto ah oo ka hortagta — waxay yareysaa bararka oo marinnada hawada furan ku haynaysaa",
      warning: "Symbicort ma aha daawo xaaladda degdegga ah. Mar walba Ventoline u isticmaal marka neef-qabatinku yimaado si kedis ah. Symbicort waxay shaqaysaa keliya marka si joogto ah oo sax ah loo qaato.",
      afterUse: "Mar walba isticmaalka ka dib afka biyo ku dhaq oo ku tuf — tani waxay ka hortagtaa fangaska afka, kaas oo ah waxyeello la yaqaan oo ka timaadda daawooyinka inhalation-ka steroid-ka ah.",
      steps: [
        { icon:"🔷", title:"Si toos ah u hayn oo soo dejiso", body:"Inhalatoran si toos ah u hayn oo mundstykka kor u jeediyo. Geediga cas si buuxda u jari midigta, kadibna dib u laabo bidixda ilaa aad maqasho cod klik ah. Qalab-ku hadda ayuu dejisan yahay." },
        { icon:"💨", title:"Sambabada u madheeso — buufinta ka fogee", body:"Si tartiib ah oo qoto dheer u neefsaaso dibadda, laakiin buufinta uga hay fogaan murtaada. Ha u neefsanin gudaha Turbuhaler — qoyaanku wuxuu waxyeelleyn karaa boorka daawada." },
        { icon:"💊", title:"Mundstykka afka ku rid", body:"Bushimaha si adag oo adag ugu rid mundstykka. Ilaa carrabku uusan daaqa xidnayn." },
        { icon:"▶️", title:"Si degdeg ah oo qoto dheer u neefsaaso", body:"Si degdeg ah oo xoogga leh ugu neefsaaso afka — Turbuhaler waxay u baahan tahay neefsasho ka adag oo ka degdeg badan inhalatoryada buufinta si boorka si sax ah u sii daayo." },
        { icon:"⏸️", title:"Neefsashada 10 ilbiriqsi hayn", body:"Neefsashada 10 ilbiriqsi hayn — ama muddo kugu dhow. U qiyaas sidii daawada u raadisato marinnada hawada yar yar." },
        { icon:"🌊", title:"Afka dhaq — muhiim ah!", body:"Tuf oo afka si buuxda ugu dhaq biyo isticmaalka kasta ka dib. Tani ma aha ikhtiyaari — si weyn ayay u yarayneysaa khatarta fangaska afka iyo cod xabeeb." },
      ],
      tips: [
        "Turbuhaler badanaa waxaa ku jira 60 ama 120 qiyaas. Daaqad cas oo ku jirta tirada qiyaasha waxay la macno tahay: hada dalbo mid cusub.",
        "Dhadhan ama dareen yar ayaad dareemi kartaa — tani waa caadi. Boorka qiyaastu aad ayay u yar tahay.",
        "Turbuhaler ku kaydso daboolka saaran, meel qalalan oo ka fog kulaylka iyo qoyaanka.",
        "Symbicort ku qaado waqti isku mid ah maalin kasta — xataa maalmaha aad is leedahay fiicantahay.",
      ],
    },
  },
  ar: {
    intro: "تقنية الاستنشاق الصحيحة أساسية — إذا استخدمت البخاخ بطريقة خاطئة، فالدواء لا يصل إلى الرئتين بشكل كاف وتضيع الفائدة. أرى هذا كل يوم تقريبا في الصيدلية: مرضى يأخذون دواءهم بانتظام لكن لا يلاحظون فرقا كافيا. كثيرا ما تكون المشكلة ليست في الدواء، بل في الطريقة.",
    ibrahimNote: "أنا أشرح الأمر هكذا دائما: بخاخك ليس مجرد زجاجة تضغط عليها — إنه يحتاج إلى تنسيق دقيق بين الضغط والشهيق. عندما تتقنه، تشعر بالفرق.",
    ventoline: {
      name: "فنتولين (سالبوتامول)",
      subtitle: "دواء سريع المفعول للنوبات — يفتح الشعب الهوائية في دقائق",
      warning: "استخدم فنتولين دائما أولا عند ضيق النفس المفاجئ. إذا لم يفد خلال 10–15 دقيقة، أو ساءت حالتك — اطلب مساعدة طارئة فورا.",
      steps: [
        { icon:"🔷", title:"أزل الغطاء ورج", body:"أزل غطاء فوهة البخاخ وارجه جيدا 4–5 مرات. إذا لم تستخدمه أكثر من 3 أيام، أطلق بخة واحدة في الهواء لتنشيطه." },
        { icon:"💨", title:"أفرغ رئتيك تماما", body:"أخرج الهواء ببطء وبشكل كامل — لكن أبعد فوهة البخاخ عن فمك أثناء ذلك. لا تنفخ أبدا داخل البخاخ." },
        { icon:"💊", title:"ضع الفوهة على شفتيك", body:"أغلق شفتيك بإحكام حول الفوهة. تأكد من أن لسانك لا يسد المنفذ." },
        { icon:"▶️", title:"اضغط واستنشق", body:"اضغط القاع للأسفل وفي نفس الوقت استنشق ببطء وعمق من فمك لمدة 3–5 ثوان. لا تبتلع — احبس نفسك." },
        { icon:"⏸️", title:"احبس نفسك 10 ثوان", body:"احبس نفسك 10 ثوان — أو ما تستطيعه. هذا يمنح الدواء وقتا للاستقرار في الرئتين." },
        { icon:"🔁", title:"أخرج الهواء وكرر عند الحاجة", body:"أخرج الهواء ببطء وانتظر 30–60 ثانية قبل أخذ بخة أخرى إذا لزم. أعد الغطاء دائما بعد الاستخدام." },
      ],
      tips: [
        "استخدم الحجرة التوسعية (spacer) إذا وجدت صعوبة في تنسيق البخة مع الشهيق — وهذا ينطبق خاصة على الأطفال وكبار السن.",
        "اغسل الفوهة بالماء مرة أسبوعيا واتركها تجف في الهواء.",
        "حبس النفس 10 ثوان يزيد امتصاص الدواء بشكل ملحوظ.",
        "احسب البخات — معظم البخاخات بها عداد. اطلب واحدة جديدة مبكرا.",
      ],
    },
    symbicort: {
      name: "سيمبيكورت توربوهيلر",
      subtitle: "علاج وقائي منتظم — يقلل الالتهاب ويبقي الشعب الهوائية مفتوحة",
      warning: "سيمبيكورت ليس لعلاج النوبات. استخدم فنتولين دائما عند ضيق النفس المفاجئ. سيمبيكورت يعمل فقط عند استخدامه بانتظام وبشكل صحيح.",
      afterUse: "اغسل فمك بالماء وابصق بعد كل استخدام — هذا يمنع فطريات الفم، وهي من الآثار الجانبية المعروفة للستيرويدات الاستنشاقية.",
      steps: [
        { icon:"🔷", title:"أمسكه عموديا وحمله", body:"أمسك الجهاز عموديا مع توجيه الفوهة للأعلى. أدر الحلقة الحمراء تماما إلى اليمين ثم أعدها إلى اليسار حتى تسمع صوت طقطقة. الجهاز الآن محمل." },
        { icon:"💨", title:"أفرغ رئتيك — بعيدا عن الجهاز", body:"أخرج الهواء ببطء وعمق، لكن أبعد الجهاز عن فمك. لا تنفخ أبدا داخل توربوهيلر — الرطوبة تتلف جرعة المسحوق." },
        { icon:"💊", title:"ضع الفوهة في فمك", body:"أغلق شفتيك بإحكام حول الفوهة. تأكد من أن لسانك لا يسد المنفذ." },
        { icon:"▶️", title:"استنشق بسرعة وعمق", body:"استنشق بسرعة وبقوة من فمك — التوربوهيلر يحتاج شهيقا أقوى وأسرع من بخاخ الرذاذ لتحرير المسحوق بشكل صحيح." },
        { icon:"⏸️", title:"احبس نفسك 10 ثوان", body:"احبس نفسك 10 ثوان — أو ما تستطيعه. فكر في الأمر كأنك تتيح للدواء الوصول إلى الشعب الهوائية الصغيرة." },
        { icon:"🌊", title:"اغسل فمك — مهم جدا!", body:"ابصق واغسل فمك جيدا بالماء بعد كل استخدام. هذا ليس اختياريا — يقلل بشكل كبير من خطر فطريات الفم وبحة الصوت." },
      ],
      tips: [
        "التوربوهيلر يحتوي عادة على 60 أو 120 جرعة. النافذة الحمراء في عداد الجرعات تعني: اطلب واحدة جديدة الآن.",
        "قد لا تشعر بشيء يكاد يذكر — هذا طبيعي. جرعة المسحوق صغيرة جدا.",
        "احفظ التوربوهيلر بغطائه في مكان جاف بعيدا عن الحرارة والرطوبة.",
        "تناول سيمبيكورت في نفس الوقت كل يوم — حتى في الأيام التي تشعر فيها بأنك بخير.",
      ],
    },
  },
};

// ── Color themes ───────────────────────────────────────────────────────────
const LANG_THEME = {
  so: { primary:"#0D9488", soft:"#F0FDFA", border:"#99f6e4", tagBg:"linear-gradient(135deg,#f0fdfa,#e0f2fe)" },
  da: { primary:"#2563EB", soft:"#EFF6FF", border:"#bfdbfe", tagBg:"linear-gradient(135deg,#eff6ff,#dbeafe)" },
  en: { primary:"#92400E", soft:"#FEF3C7", border:"#92400E", tagBg:"linear-gradient(135deg,#d4a373,#c8843a)" },
  ar: { primary:"#D97706", soft:"#FFF7ED", border:"#F97316", tagBg:"linear-gradient(135deg,#fed7aa,#fb923c)" },
};

const BULLET_PALETTES = {
  so: [{color:"#0D9488",bg:"#F0FDFA"},{color:"#059669",bg:"#ECFDF5"},{color:"#0F766E",bg:"#CCFBF1"},{color:"#0284C7",bg:"#F0F9FF"}],
  da: [{color:"#2563EB",bg:"#EFF6FF"},{color:"#1D4ED8",bg:"#DBEAFE"},{color:"#3B82F6",bg:"#EFF6FF"},{color:"#0284C7",bg:"#F0F9FF"}],
  en: [{color:"#92400E",bg:"#FEF3C7"},{color:"#B45309",bg:"#FEF9EE"},{color:"#C2410C",bg:"#FFF7ED"},{color:"#DC2626",bg:"#FEF2F2"}],
  ar: [{color:"#D97706",bg:"#FFFBEB"},{color:"#B45309",bg:"#FEF3C7"},{color:"#EA580C",bg:"#FFF7ED"},{color:"#F59E0B",bg:"#FFFBEB"}],
};

const NAV_ICON_COLORS = {
  so: { faq:"#0D9488", feedback:"#059669", contact:"#0F766E" },
  da: { faq:"#2563EB", feedback:"#1D4ED8", contact:"#0284C7" },
  en: { faq:"#92400E", feedback:"#B45309", contact:"#C2410C" },
  ar: { faq:"#D97706", feedback:"#B45309", contact:"#EA580C" },
};

// ── Contact data ───────────────────────────────────────────────────────────
const CONTACT_DATA = {
  da: {
    intro: "Har du spørgsmål om et lægemiddel eller feedback på siden? Du er altid velkommen til at skrive — jeg svarer typisk inden for 1–2 hverdage.",
    chatTitle: "Chat direkte med Ibrahim",
    chatDesc: "Du kan skrive via chat-ikonet nederst til højre.",
    emailLabel: "Eller skriv via e-mail",
    emailNote: "Svar inden for 1–2 hverdage",
    responseTitle: "Du kan fx skrive om:",
    topics: ["Spørgsmål om et lægemiddel", "Forslag til nye emner", "Fejl eller mangler", "Generel feedback"],
  },
  en: {
    intro: "Do you have a question about a medicine or feedback on the site? Feel free to reach out — I usually respond within 1–2 working days.",
    chatTitle: "Chat directly with Ibrahim",
    chatDesc: "Use the chat icon in the bottom right corner.",
    emailLabel: "Or send an email",
    emailNote: "Response within 1–2 working days",
    responseTitle: "You can contact me about:",
    topics: ["Questions about a medicine", "Suggestions", "Errors", "General feedback"],
  },
  so: {
    intro: "Ma qabtaa su'aal ku saabsan daawo ama faallo ku saabsan bogga? Ii soo qor — waxaan kuugu jawaabi doonaa 1–2 maalmood gudahood.",
    chatTitle: "La xiriir Ibraahim",
    chatDesc: "Isticmaal chat-ka hoose ee midig.",
    emailLabel: "Ama ii soo dir email",
    emailNote: "Jawaab 1–2 maalmood gudahood",
    responseTitle: "Waxaad wax ka qori kartaa:",
    topics: ["Su'aalo ku saabsan daawo", "Talooyin", "Khaladaad", "Faallo"],
  },
  ar: {
    intro: "هل لديك سؤال حول دواء أو ملاحظة على الموقع؟ يمكنك التواصل معي — أجيب عادة خلال يوم أو يومين عمل.",
    chatTitle: "تواصل مع إبراهيم",
    chatDesc: "استخدم أيقونة المحادثة في أسفل يمين الصفحة.",
    emailLabel: "أو عبر البريد الإلكتروني",
    emailNote: "الرد خلال يوم أو يومين عمل",
    responseTitle: "يمكنك التواصل بشأن:",
    topics: ["أسئلة حول دواء", "اقتراحات", "أخطاء", "ملاحظات"],
  },
};

// ── About Me ───────────────────────────────────────────────────────────────
const ABOUT_ME_META = {
  da: { name:"Ibrahim Dahir Hanaf", title:"Farmakonom, kemiker & faglig formidler" },
  en: { name:"Ibrahim Dahir Hanaf", title:"Pharmaconomist, chemist & science communicator" },
  so: { name:"Ibraahim Dahir Xanaf", title:"Farmashiiste, kimistar & xog-ogaal caafimaad" },
  ar: { name:"إبراهيم ظاهر حنف", title:"فارماكونوم، كيميائي ومتخصص في التواصل العلمي" },
};

const ABOUT_ME_BULLETS = {
  da: [
    { icon:"education", text:"Bachelor i Kemi og Medicinalbiologi samt uddannet Farmakonom — med en sjælden evne til at gøre komplekse fag som matematik, fysik, kemi og biologi tilgængelige og engagerende" },
    { icon:"work",      text:"Daglig praksis på privatapotek og vagtapotek — mødet med patienter i skranken har tydeligt vist, hvor afgørende klar og tryg lægemiddelinformation er" },
    { icon:"school",    text:"Erfaren formidler der har hjulpet gymnasieelever og universitetsstuderende med at mestre komplekse fagområder — med tålmodighed, gå-på-mod og et inspirerende læringsmiljø" },
    { icon:"pills",     text:"Brænder for at gøre faglig viden nærværende og brugbar — og bringer en unik kombination af dybdegående viden og engageret formidling til enhver sammenhæng" },
  ],
  en: [
    { icon:"education", text:"Bachelor's degree in Chemistry and Medicinal Biology, trained Pharmaconomist — with a rare ability to make complex subjects such as mathematics, physics, chemistry and biology both accessible and engaging" },
    { icon:"work",      text:"Daily practice in community and emergency pharmacy — direct patient contact has made it clear how essential clear and trustworthy medicine information truly is" },
    { icon:"school",    text:"Experienced educator who has helped upper secondary and university students master demanding subject areas — with patience, determination and an inspiring learning environment" },
    { icon:"pills",     text:"Passionate about making professional knowledge meaningful and practical — bringing a unique combination of in-depth expertise and lively communication to every context" },
  ],
  so: [
    { icon:"education", text:"Shahaadada koowaad ee Kimistari iyo Bayoolajiga Dawooyinka, waxaana sidoo kale ahay farmashiiste tababaran — leh awood u gaar ah oo ah in xisaabta, fizikada, kimistarka iyo bayoolajiga laga dhigo mawduucyo sahlan oo xiiso leh" },
    { icon:"work",      text:"Shaqo maalinleh oo ku saabsan farmashiyaha bulshada iyo farmashiyaha xaaladaha degdega ah — xiriirka tooska ah ee bukaanka ayaa si cad u muujiyay baahida weyn ee macluumaadka daawooyinka ee cad oo la aamin karo" },
    { icon:"school",    text:"Macalin khibrad leh oo ku caawiyay ardayda dugsiga sare iyo ardayda jaamacadda inay si wanaagsan ugu guuleystaan mawduucyada adag — isagoo adeegsanaya dulqaad, dhiirrigelin iyo jawi barasho oo waxtar leh" },
    { icon:"pills",     text:"Wuxuu si gaar ah u xiiseeyaa in aqoonta xirfadeedka laga dhigo mid macno leh, la isticmaali karo — isagoo keena isku darka aqoon qoto dheer iyo xiriirin firfircoon oo nooceedu ka duwan yahay" },
  ],
  ar: [
    { icon:"education", text:"بكالوريوس في الكيمياء وعلم الأحياء الدوائي، وحاصل على تأهيل فارماكونوم — بقدرة نادرة على تحويل المواد المعقدة كالرياضيات والفيزياء والكيمياء وعلم الأحياء إلى مواد سهلة وممتعة" },
    { icon:"work",      text:"ممارسة يومية في الصيدلية الخاصة وصيدلية المناوبة — أوضح التواصل المباشر مع المرضى مدى أهمية المعلومات الدوائية الواضحة والموثوقة" },
    { icon:"school",    text:"معلم متمرس ساعد طلاب المرحلة الثانوية والجامعية على إتقان المجالات الدراسية الصعبة — بصبر وعزم وبيئة تعليمية ملهمة" },
    { icon:"pills",     text:"شغوف بجعل المعرفة المتخصصة ذات معنى وقابلة للتطبيق — يجمع بين العمق العلمي والتواصل الحيوي في كل سياق" },
  ],
};

const ABOUT_SITE_TAGLINE = {
  da: "Lægemiddelinformation på dit eget sprog",
  en: "Medicine information in your own language",
  so: "Macluumaadka daawooyinka oo ku qoran afkaaga hooyo",
  ar: "معلومات الأدوية بلغتك الأم",
};

const ABOUT_SITE_BULLETS = {
  da: [
    { icon:"pills",     text:"25 nøje udvalgte lægemidler fra apotekets hverdag — dem vi oftest møder i skranken og rådgiver om" },
    { icon:"school",    text:"Tilgængelig på dansk, engelsk, somalisk og arabisk" },
    { icon:"education", text:"Fagligt funderet og formidlet i et klart og trygt sprog — skrevet af en uddannet farmakonom" },
    { icon:"work",      text:"Udvides løbende med flere lægemidler og emner fra den daglige rådgivning på apoteket" },
  ],
  en: [
    { icon:"pills",     text:"25 carefully selected medicines from everyday pharmacy practice — the ones we most often see at the counter and advise on" },
    { icon:"school",    text:"Available in Danish, English, Somali and Arabic" },
    { icon:"education", text:"Professionally grounded and written in clear, reassuring language by a trained pharmaconomist" },
    { icon:"work",      text:"Continuously expanded with more medicines and topics from everyday counselling in the pharmacy" },
  ],
  so: [
    { icon:"pills",     text:"25 daawo oo si taxaddar leh loo xulay — kuwa aan inta badan ku aragno farmashiyaha oo aan talo ka bixino" },
    { icon:"school",    text:"Waxaa lagu heli karaa Af-Soomaali, Af-Ingiriisi, Af-Daanish iyo Af-Carabi" },
    { icon:"education", text:"Waxay ku dhisan tahay aqoon xirfadeed, waxaana lagu qoray si cad oo kalsooni leh" },
    { icon:"work",      text:"Si joogto ah ayaa loogu kordhinayaa daawooyin iyo mawduucyo kale oo ka soo baxay la-talinta maalinlaha ah ee farmashiyaha" },
  ],
  ar: [
    { icon:"pills",     text:"25 دواء تم اختيارها بعناية — من الأدوية التي نراها يوميا في الصيدلية ونقدم بشأنها المشورة" },
    { icon:"school",    text:"متوفرة بالدنماركية والإنجليزية والصومالية والعربية" },
    { icon:"education", text:"محتوى مهني موثوق، مكتوب بلغة واضحة ومطمئنة" },
    { icon:"work",      text:"يتم توسيع المحتوى باستمرار ليشمل مزيدا من الأدوية والموضوعات من واقع الاستشارة اليومية في الصيدلية" },
  ],
};

// ── FAQ ────────────────────────────────────────────────────────────────────
const FAQ_DATA = {
  da: { items:[
    { q:"Hvad er Lamotrigin, og hvordan tages det?",
      bullets:["Bruges mod epilepsi og bipolar lidelse","Tages på samme tidspunkt hver dag — med eller uden mad","Glem en dosis? Tag den, så snart du husker — aldrig dobbelt","Stop aldrig pludseligt — tal med din læge først"] },
    { q:"Kan jeg tage Paracetamol og Ibuprofen på samme tid?",
      bullets:["Ja — de virker forskelligt og kan kombineres","Paracetamol: maks. 2 tabletter ad gangen, maks. 8 i døgnet, mindst 4–6 timer imellem","Ibuprofen: maks. 2 tabletter ad gangen, maks. 6 i døgnet, mindst 6–8 timer imellem","Tag altid Ibuprofen til mad — det skåner maven"] },
    { q:"Hvad skal jeg undgå under Marevan-behandling?",
      bullets:["Undgå pludselige store ændringer i grønkål, spinat, broccoli og persille (K-vitamin)","Undgå Ibuprofen og Diclofenac — øger blødningsrisikoen","Begræns alkohol","Mød op til dine regelmæssige blodprøver og fortæl altid din læge og tandlæge om behandlingen"] },
    { q:"Hvornår tages Atorvastatin, og kan jeg spise grapefrugt?",
      bullets:["Kan tages på alle tidspunkter — vigtigst er at tage det på samme tid hver dag","Tages med eller uden mad","Undgå store mængder grapefrugt — det øger risikoen for bivirkninger, særligt muskelsmerter"] },
    { q:"Hvad er Metformin, og hvornår tages det?",
      bullets:["En velafprøvet diabetesmedicin der holder blodsukkeret nede","Tages altid til mad eller umiddelbart efter — aldrig på tom mave","Mavegener i starten er normalt — kroppen vænner sig typisk inden for 2–4 uger"] },
    { q:"Hvad er blodtryksmedicin, og hvordan tages Amlodipin, Losartan og Enalapril?",
      bullets:["Holder blodtrykket nede og beskytter hjerte og blodkar over tid","Alle tre tages én gang dagligt — med eller uden mad","Tag dem på samme tidspunkt hver dag, selv hvis du ikke mærker noget"] },
    { q:"Kan jeg tage Ibuprofen, hvis jeg tager blodtryksmedicin?",
      bullets:["Frarådes i de fleste tilfælde — Ibuprofen kan svække blodtryksmedicinen","Kan også belaste nyrerne ved visse typer blodtryksmedicin","Brug Paracetamol i stedet — det er sikrere","Spørg altid dit apotek eller din læge"] },
    { q:"Hvad sker der, hvis jeg stopper med Lamotrigin eller Sertralin fra den ene dag til den anden?",
      bullets:["Lamotrigin: kan udløse anfald, selv om du har været anfaldsfri i lang tid","Sertralin: kan give svimmelhed, prikkende fornemmelse, søvnproblemer og humørsvingninger","Begge skal altid nedtrappes langsomt under lægelig vejledning"] },
    { q:"Hvad gør jeg, hvis jeg har taget for mange Paracetamol?",
      bullets:["Ring straks til Giftlinjen: 82 12 12 12 — åben hele døgnet, gratis","Ring 112 i akutte tilfælde","Leversskaden kan opstå over 24–72 timer — vent ikke på symptomer","Tag emballagen med, så personalet kan se hvad du har taget"] },
    { q:"Kan Atorvastatin give muskelsmerter?",
      bullets:["Ja — spredt ømhed eller svaghed i muskler er en velkendt bivirkning","Kontakt din læge ved vedvarende muskelsmerter, muskelsvaghed eller mørk urin","Din læge kan justere din dosis eller skifte til en anden type"] },
    { q:"Hvilket smertestillende virker bedst?",
      bullets:["Paracetamol: bedst til hovedpine, feber og lettere smerter — sikkert for de fleste","Ibuprofen: stærkere, god ved tandpine, muskelsmerter og ledsmerter — tag til mad","Har du mavegener, tager blodtryksmedicin eller er gravid? Brug Paracetamol","Er du i tvivl? Spørg dit apotek"] },
    { q:"Kan jeg tage et nyt håndkøbsmiddel sammen med min faste medicin?",
      bullets:["Ikke nødvendigvis — mange håndkøbsmediciner påvirker din faste medicin","Ibuprofen kan fx svække blodtryksmedicin","Naturlægemidler kan påvirke blodfortyndende medicin","Spørg altid på apoteket — det er gratis og tager 2 minutter"] },
  ]},
  en: { items:[
    { q:"What is Lamotrigine, and how is it taken?",
      bullets:["Used for epilepsy and bipolar disorder","Take at the same time every day — with or without food","Missed a dose? Take it when you remember — never double up","Never stop suddenly — always speak to your doctor first"] },
    { q:"Can I take Paracetamol and Ibuprofen at the same time?",
      bullets:["Yes — they work differently and can be combined","Paracetamol: max. 2 tablets per dose, max. 8 per day, at least 4–6 hours apart","Ibuprofen: max. 2 tablets per dose, max. 6 per day, at least 6–8 hours apart","Always take Ibuprofen with food to protect the stomach"] },
    { q:"What should I avoid while taking Warfarin (Marevan)?",
      bullets:["Avoid sudden large changes in kale, spinach, broccoli and parsley (vitamin K)","Avoid Ibuprofen and Diclofenac — increases bleeding risk","Limit alcohol","Attend regular blood tests and always tell your doctor and dentist about your treatment"] },
    { q:"When should I take Atorvastatin, and can I eat grapefruit?",
      bullets:["Can be taken at any time — most important is to take it at the same time each day","Can be taken with or without food","Avoid large amounts of grapefruit — it increases the risk of side effects, particularly muscle pain"] },
    { q:"What is Metformin, and when should it be taken?",
      bullets:["A well-tested diabetes medicine that keeps blood sugar down","Always take with or immediately after a meal — never on an empty stomach","Stomach problems at the start are normal — the body usually adjusts within 2–4 weeks"] },
    { q:"What is blood pressure medicine, and how is Amlodipine, Losartan and Enalapril taken?",
      bullets:["Keeps blood pressure down and protects the heart and blood vessels over time","All three taken once daily — with or without food","Take at the same time every day, even if you feel nothing"] },
    { q:"Can I take Ibuprofen while on blood pressure medicine?",
      bullets:["Not recommended in most cases — Ibuprofen can weaken blood pressure medicine","Can also strain the kidneys with certain blood pressure medicines","Use Paracetamol instead — it is safer","Always ask your pharmacist or doctor"] },
    { q:"What happens if I stop Lamotrigine or Sertraline suddenly?",
      bullets:["Lamotrigine: can trigger seizures, even after a long seizure-free period","Sertraline: can cause dizziness, tingling, sleep problems and mood swings","Both must always be tapered down slowly under medical guidance"] },
    { q:"What do I do if I have taken too many Paracetamol tablets?",
      bullets:["Call Giftlinjen immediately: 82 12 12 12 — open around the clock, free of charge","Call 112 in emergencies","Liver damage can develop over 24–72 hours — do not wait for symptoms","Bring the packaging so staff know exactly what was taken"] },
    { q:"Can Atorvastatin cause muscle pain?",
      bullets:["Yes — widespread aching or weakness in muscles is a well-known side effect","Contact your doctor for persistent muscle pain, weakness or dark urine","Your doctor can adjust your dose or switch to a different type"] },
    { q:"Which pain reliever works best?",
      bullets:["Paracetamol: best for headache, fever and mild pain — safe for most people","Ibuprofen: stronger, good for toothache, muscle and joint pain — take with food","Stomach problems, blood pressure medicine or pregnant? Use Paracetamol","Not sure? Ask your pharmacist"] },
    { q:"Can I take a new over-the-counter medicine with my regular medicine?",
      bullets:["Not always — many over-the-counter medicines affect your regular medicine","Ibuprofen can weaken blood pressure medicine","Herbal remedies can affect blood-thinning medicine","Always ask at the pharmacy — it is free and takes 2 minutes"] },
  ]},
  so: { items:[
    { q:"Waa maxay Lamotrigin, sideese loo qaataa?",
      bullets:["Waxaa loo isticmaalaa suuxdinta iyo cudurka laba-cirifoodka","Qaado wakhti isku mid ah maalin kasta. Daawadan waxaa la qaatan karaa adigoon cunto cunin ama adigoo cunto la qaadanaya.","Haddii aad hilmaanto qiyaasta, qaado marka aad xasuusato — hana labanlaabin qiyaasta.","Ha joojin daawada si kedis ah — marka hore la hadal dhakhtarkaaga."] },
    { q:"Ma wada qaadan karaa Paracetamol iyo Ibuprofen isku mar?",
      bullets:["Haa — labadan daawo si kala duwan ayay u shaqeeyaan, waxaana mararka qaarkood la isku dari karaa.","Paracetamol: ugu badnaan 2 kiniin hal mar, ugu badnaan 8 kiniin 24 saacadood gudahood, ugu yaraan 4–6 saacadood ha u dhexeeyaan.","Ibuprofen: ugu badnaan 2 kiniin hal mar, ugu badnaan 6 kiniin 24 saacadood gudahood, ugu yaraan 6–8 saacadood ha u dhexeeyaan.","Ibuprofen mar walba ku qaado cunto si caloosha loo ilaaliyo."] },
    { q:"Maxaan iska ilaalinayaa marka aan qaadanayo Marevan?",
      bullets:["Ka fogow isbeddel weyn oo kedis ah oo ku yimaada cunista kaabashka cagaaran, isbinaajka, brokoliga iyo dhir-caleedka (fitamiin K).","Ka fogow Ibuprofen iyo Diclofenac — waxay kordhin karaan khatarta dhiig-baxa.","Yaree cabbitaanka khamriga.","Si joogto ah u samee baaritaannada dhiigga, mar walbana u sheeg dhakhtarkaaga iyo dhakhtarka ilkaha inaad qaadanayso Marevan."] },
    { q:"Goorma ayaa la qaataa Atorvastatin, ma cuni karaa canab-guduudan?",
      bullets:["Waxaa la qaatan karaa wakhti kasta — waxa ugu muhiimsan waa in maalin kasta la qaato wakhti isku mid ah.","Daawadan waxaa la qaatan karaa adigoon cunto cunin ama adigoo cunto la qaadanaya.","Ka fogow xaddi badan oo canab-guduudan ah — waxay kordhin kartaa khatarta waxyeellada daawada, gaar ahaan murqo-xanuunka."] },
    { q:"Waa maxay Metformin, goormase la qaataa?",
      bullets:["Waa daawo sonkorow oo si fiican loo tijaabiyay, kana caawisa hoos u dhigista sonkorta dhiigga.","Mar walba ku qaado cunto ama isla markiiba cuntada ka dib — ha ku qaadan calool madhan.","Dhibaatooyinka caloosha ee bilowga ah waa wax caadi ah — badanaa jirku wuu la qabsadaa 2 ilaa 4 toddobaad gudahood."] },
    { q:"Waa maxay daawooyinka dhiig-karka, sideese loo qaataa Amlodipin, Losartan iyo Enalapril?",
      bullets:["Waxay hoos u dhigaan dhiig-karka, waxayna muddo dheer ilaaliyaan wadnaha og xididdada dhiigga.","Saddexdaba hal mar ayaa la qaataa maalin kasta.","Daawadan waxaa la qaatan karaa adigoon cunto cunin ama adigoo cunto la qaadanaya.","Ku qaado wakhti isku mid ah maalin kasta, xitaa haddii aadan wax calaamado ah dareemayn."] },
    { q:"Ma qaadan karaa Ibuprofen haddii aan qaadanayo daawada dhiig-karka?",
      bullets:["Inta badan laguma taliyo — Ibuprofen waxay daciifin kartaa saameynta daawada dhiig-karka.","Waxay sidoo kale culays saari kartaa kelyaha, gaar ahaan noocyo ka mid ah daawooyinka dhiig-karka.","Paracetamol ayaa badanaa ka ammaan badan.","Mar walba la tasho farmashiyaha ama dhakhtarkaaga."] },
    { q:"Maxaa dhici kara haddii aan si kedis ah u joojiyo Lamotrigin ama Sertralin?",
      bullets:["Lamotrigin: waxay keeni kartaa in suuxdintu dib u soo noqoto, xitaa haddii aad muddo dheer fiicnayd.","Sertralin: waxay keeni kartaa dawakh, dareen mudid ama gubasho ah, hurdo-xumo iyo isbeddel niyadeed.","Labadan daawo waa in si tartiib tartiib ah loo yareeyaa, iyadoo uu dhakhtar hagayo."] },
    { q:"Maxaan sameeyaa haddii aan qaatay Paracetamol ka badan intii la rabay?",
      bullets:["Isla markiiba wac Giftlinjen: 82 12 12 12 — waxay furan tahay 24 saacadood, waana bilaash.","Wac 112 haddii ay xaaladdu degdeg tahay.","Dhaawaca beerka wuxuu soo bixi karaa 24 ilaa 72 saacadood gudahood — ha sugin calaamadaha.","Qaado baakadka daawada si shaqaalaha caafimaadku u arkaan waxa aad qaadatay."] },
    { q:"Atorvastatin ma keeni kartaa murqo-xanuun?",
      bullets:["Haa — murqo-xanuun ama murqo-daciifnimo waa waxyeello la yaqaan.","La xiriir dhakhtarkaaga haddii murqo-xanuunku sii socdo, aad dareento murqo-daciifnimo ama kaadidu noqoto madow.","Dhakhtarkaagu wuxuu beddeli karaa qiyaasta ama nooca daawada."] },
    { q:"Daawada xanuun-baabi'iyaha ah kee fiican?",
      bullets:["Paracetamol: waxay ku fiican tahay madax-xanuun, qandho og xanuun fudud — dad badan ayay ammaan u tahay.","Ibuprofen: way ka xoog badan tahay, waxayna ku fiican tahay ilko-xanuun, murqo-xanuun og kala-goysyo xanuunaya — ku qaado cunto.","Haddii aad leedahay dhibaato caloosha ah, aad qaadato daawo dhiig-kar ama aad uur leedahay, Paracetamol ayaa badanaa ka habboon.","Haddii aad shaki qabto, weydii farmashiyaha."] },
    { q:"Ma qaadan karaa daawo cusub oo farmashiyaha laga helo anigoo qaadanaya daawooyinkayga caadiga ah?",
      bullets:["Mar walba ma aha — daawooyin badan oo aan warqad dhakhtar u baahnayn waxay saameyn karaan daawooyinkaaga kale.","Ibuprofen waxay daciifin kartaa daawooyinka dhiig-karka.","Daawooyinka dabiiciga ah qaarkood waxay saameyn karaan dawooyinka dhiiga cafiifiya.","Mar walba weydii farmashiyaha — waa bilaash, waana degdeg."] },
  ]},
  ar: { items:[
    { q:"ما هو لاموتريجين وكيف يؤخذ؟",
      bullets:["يستخدم للصرع والاضطراب ثنائي القطب","تناوله في نفس الوقت يوميا — مع الطعام أو بدونه","نسيت جرعة؟ تناولها حين تتذكر — لا تضاعف الجرعة","لا توقفه فجأة — تحدث مع طبيبك أولا"] },
    { q:"هل يمكن تناول الباراسيتامول والإيبوبروفين معا؟",
      bullets:["نعم — يعملان بطريقتين مختلفتين ويمكن الجمع بينهما","باراسيتامول: أقصى قرصان في المرة، 8 يوميا، 4–6 ساعات على الأقل بين الجرعات","إيبوبروفين: أقصى قرصان في المرة، 6 يوميا، 6–8 ساعات على الأقل بين الجرعات","تناول الإيبوبروفين دائما مع الطعام لحماية المعدة"] },
    { q:"ما الذي يجب تجنبه أثناء علاج الوارفارين؟",
      bullets:["تجنب التغيرات المفاجئة في اللفت والسبانخ والبروكلي والبقدونس (فيتامين K)","تجنب الإيبوبروفين والديكلوفيناك — يزيدان خطر النزيف","اعتدل في الكحول","احضر فحوصات الدم بانتظام وأخبر طبيبك وطبيب الأسنان دائما"] },
    { q:"متى يؤخذ أتورفاستاتين وهل يمكن تناول الجريب فروت؟",
      bullets:["يمكن تناوله في أي وقت — الأهم الالتزام بنفس الوقت يوميا","مع الطعام أو بدونه — كلاهما صحيح","تجنب كميات كبيرة من الجريب فروت — يزيد خطر الآثار الجانبية لا سيما آلام العضلات"] },
    { q:"ما هو ميتفورمين ومتى يؤخذ؟",
      bullets:["دواء سكري موثوق يساعد على خفض مستوى السكر في الدم","تناوله دائما مع الوجبة أو بعدها مباشرة — ليس على معدة فارغة","مشاكل المعدة في البداية طبيعية — الجسم يعتاد عادة خلال 2–4 أسابيع"] },
    { q:"ما هي أدوية ضغط الدم وكيف يؤخذ أملوديبين ولوسارتان وإيناليبريل؟",
      bullets:["تخفض ضغط الدم وتحمي القلب والأوعية الدموية مع مرور الوقت","تؤخذ الثلاثة مرة واحدة يوميا — مع الطعام أو بدونه","تناولها في نفس الوقت كل يوم، حتى لو لم تشعر بشيء"] },
    { q:"هل يمكن تناول الإيبوبروفين مع أدوية ضغط الدم؟",
      bullets:["لا ينصح به في أغلب الحالات — قد يضعف أدوية ضغط الدم","قد يجهد الكلى مع بعض أنواع هذه الأدوية","استخدم الباراسيتامول بدلا منه — أكثر أمانا","استشر الصيدلي أو طبيبك دائما"] },
    { q:"ماذا يحدث إذا توقفت فجأة عن لاموتريجين أو سيرترالين؟",
      bullets:["لاموتريجين: قد يسبب نوبات صرع حتى بعد فترة طويلة بلا نوبات","سيرترالين: قد يسبب دوارا ووخزا ومشاكل نوم وتقلبات مزاجية","يجب تخفيض كلاهما تدريجيا تحت إشراف الطبيب"] },
    { q:"ماذا أفعل إذا تناولت جرعة زائدة من الباراسيتامول؟",
      bullets:["اتصل فورا بـ Giftlinjen: 82 12 12 12 — مفتوح 24 ساعة، مجانا","اتصل بـ 112 في حالات الطوارئ","تلف الكبد قد يحدث خلال 24–72 ساعة — لا تنتظر الأعراض","أحضر عبوة الدواء ليعرف الكوادر الطبية ما تناولته"] },
    { q:"هل يمكن لأتورفاستاتين أن يسبب آلاما عضلية؟",
      bullets:["نعم — ألم منتشر أو ضعف في العضلات من الآثار الجانبية المعروفة","تواصل مع طبيبك عند آلام مستمرة أو ضعف عضلي أو بول داكن","يمكن تعديل الجرعة أو تغيير الدواء"] },
    { q:"أي مسكن ألم هو الأفضل؟",
      bullets:["باراسيتامول: للصداع والحمى والآلام الخفيفة — آمن للغالبية","إيبوبروفين: أقوى، للأسنان والعضلات والمفاصل — مع الطعام دائما","مشاكل معدة أو ضغط دم أو حمل؟ استخدم الباراسيتامول","في حال الشك، اسأل الصيدلي"] },
    { q:"هل يمكن تناول دواء جديد بدون وصفة مع دوائي المعتاد؟",
      bullets:["ليس دائما — كثير من هذه الأدوية تؤثر على دوائك المعتاد","الإيبوبروفين قد يضعف أدوية ضغط الدم","بعض الأعشاب الطبية قد تؤثر على مرققات الدم","استشر الصيدلية دائما — مجاني ولا يستغرق أكثر من دقيقتين"] },
  ]},
};

// ── Feedback data ──────────────────────────────────────────────────────────
const FEEDBACK_DATA = {
  da: { subtitle:"Din mening betyder noget. Del gerne din oplevelse med Somalimed.", praise:"Ros 👍", criticism:"Ris 👎", suggestion:"Forslag 💡", placeholder:"Skriv din besked her...", send:"Send besked", sent:"Tak for din besked! 🙏", emailLabel:"Din e-mail (valgfri)" },
  en: { subtitle:"Your opinion matters. Feel free to share your experience with Somalimed.", praise:"Praise 👍", criticism:"Criticism 👎", suggestion:"Suggestion 💡", placeholder:"Write your message here...", send:"Send message", sent:"Thank you for your message! 🙏", emailLabel:"Your email (optional)" },
  so: { subtitle:"Ra'yaagaagu waa muhiim. Nala wadaag khibradaada Somalimed.", praise:"Amaano 👍", criticism:"Dhaleeceyn 👎", suggestion:"Talooyin 💡", placeholder:"Halkan ku qor fariintaada...", send:"Dir fariinta", sent:"Mahadsanid fariintaada! 🙏", emailLabel:"Emailkaaga (ikhtiyaari)" },
  ar: { subtitle:"رأيك يهمنا. شاركنا تجربتك مع Somalimed.", praise:"إطراء 👍", criticism:"نقد 👎", suggestion:"اقتراح 💡", placeholder:"اكتب رسالتك هنا...", send:"إرسال الرسالة", sent:"شكرا على رسالتك! 🙏", emailLabel:"بريدك الإلكتروني (اختياري)" },
};

// ── Medicine maps ──────────────────────────────────────────────────────────
const SLUG_ICON={amlodipin:"blood-pressure.png",enalapril:"blood-pressure.png",losartan:"blood-pressure.png",metoprolol:"blood-pressure.png",eliquis:"line.png",marevan:"line.png",xarelto:"line.png",hjertemagnyl:"line.png",atorvastatin:"cholesterol.png",metformin:"blood-test.png",insulin:"blood-test.png",ventoline:"lungs.png",symbicort:"lungs.png",sertralin:"mental-health.png",quetiapin:"mental-health.png",lamotrigin:"brain.png",melatonin:"nighttime.png",zopiclon:"nighttime.png",paracetamol:"download.png",ibuprofen:"download.png",diclofenac:"download.png",naproxen:"download.png",morfin_tablet:"download.png",morfin_injektion:"download.png",pantoprazol:"stomach.png"};
const SLUG_STYLE={amlodipin:{color:"#DC2626",bg:"#FEF2F2"},enalapril:{color:"#DC2626",bg:"#FEF2F2"},losartan:{color:"#DC2626",bg:"#FEF2F2"},metoprolol:{color:"#E11D48",bg:"#FFF1F2"},eliquis:{color:"#7C3AED",bg:"#F5F3FF"},marevan:{color:"#7C3AED",bg:"#F5F3FF"},xarelto:{color:"#7C3AED",bg:"#F5F3FF"},hjertemagnyl:{color:"#6D28D9",bg:"#EDE9FE"},atorvastatin:{color:"#D97706",bg:"#FFFBEB"},metformin:{color:"#0284C7",bg:"#F0F9FF"},insulin:{color:"#0284C7",bg:"#F0F9FF"},ventoline:{color:"#0D9488",bg:"#F0FDFA"},symbicort:{color:"#0D9488",bg:"#F0FDFA"},sertralin:{color:"#8B5CF6",bg:"#F5F3FF"},quetiapin:{color:"#A855F7",bg:"#FAF5FF"},lamotrigin:{color:"#7C3AED",bg:"#F5F3FF"},melatonin:{color:"#4F46E5",bg:"#EEF2FF"},zopiclon:{color:"#6366F1",bg:"#EEF2FF"},paracetamol:{color:"#F59E0B",bg:"#FFFBEB"},ibuprofen:{color:"#EF4444",bg:"#FEF2F2"},diclofenac:{color:"#EF4444",bg:"#FEF2F2"},naproxen:{color:"#EF4444",bg:"#FEF2F2"},morfin_tablet:{color:"#059669",bg:"#ECFDF5"},morfin_injektion:{color:"#059669",bg:"#ECFDF5"},pantoprazol:{color:"#10B981",bg:"#ECFDF5"}};
const DEFAULT_STYLE={color:"#0D9488",bg:"#F0FDFA"};
const CATEGORY_PILL_ICON={"forhøjet blodtryk":{icon:"blood-pressure.png",color:"#DC2626",bg:"#FEF2F2"},"blodtryk & hjertebanken":{icon:"blood-pressure.png",color:"#E11D48",bg:"#FFF1F2"},"blodfortyndende":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"blodpropforebyggelse":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"kolesterol":{icon:"cholesterol.png",color:"#D97706",bg:"#FFFBEB"},"diabetes":{icon:"blood-test.png",color:"#0284C7",bg:"#F0F9FF"},"astma":{icon:"lungs.png",color:"#0D9488",bg:"#F0FDFA"},"depression & angst":{icon:"mental-health.png",color:"#8B5CF6",bg:"#F5F3FF"},"psykose & bipolar":{icon:"mental-health.png",color:"#A855F7",bg:"#FAF5FF"},"epilepsi & bipolar":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"søvn":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"søvnløshed":{icon:"nighttime.png",color:"#6366F1",bg:"#EEF2FF"},"smertestillende":{icon:"download.png",color:"#059669",bg:"#ECFDF5"},"smerter og feber":{icon:"download.png",color:"#F59E0B",bg:"#FFFBEB"},"smerter og betændelse":{icon:"download.png",color:"#EF4444",bg:"#FEF2F2"},"mavesyre og halsbrand":{icon:"stomach.png",color:"#10B981",bg:"#ECFDF5"},"dhiig-karka":{icon:"blood-pressure.png",color:"#DC2626",bg:"#FEF2F2"},"dhiig-karka & wadne garaac":{icon:"blood-pressure.png",color:"#E11D48",bg:"#FFF1F2"},"dhiig-khafiifiye":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"dhiig-xinjir ka hortag":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"kolestarool":{icon:"cholesterol.png",color:"#D97706",bg:"#FFFBEB"},"sonkoroow":{icon:"blood-test.png",color:"#0284C7",bg:"#F0F9FF"},"neef-mareenka":{icon:"lungs.png",color:"#0D9488",bg:"#F0FDFA"},"niyad-jab & welwel":{icon:"mental-health.png",color:"#8B5CF6",bg:"#F5F3FF"},"cilad dhimirka & laba-cirifood":{icon:"mental-health.png",color:"#A855F7",bg:"#FAF5FF"},"suuxdin & laba-cirifood":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"hurdo":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"hurdo la'aan":{icon:"nighttime.png",color:"#6366F1",bg:"#EEF2FF"},"xanuun baabi'iye":{icon:"download.png",color:"#059669",bg:"#ECFDF5"},"xanuun & qandho":{icon:"download.png",color:"#F59E0B",bg:"#FFFBEB"},"xanuun & barar":{icon:"download.png",color:"#EF4444",bg:"#FEF2F2"},"gaastriga iyo laab-jeexa":{icon:"stomach.png",color:"#10B981",bg:"#ECFDF5"},"high blood pressure":{icon:"blood-pressure.png",color:"#DC2626",bg:"#FEF2F2"},"blood pressure & palpitations":{icon:"blood-pressure.png",color:"#E11D48",bg:"#FFF1F2"},"blood thinner":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"blood clot prevention":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"cholesterol":{icon:"cholesterol.png",color:"#D97706",bg:"#FFFBEB"},"asthma":{icon:"lungs.png",color:"#0D9488",bg:"#F0FDFA"},"depression & anxiety":{icon:"mental-health.png",color:"#8B5CF6",bg:"#F5F3FF"},"psychosis & bipolar":{icon:"mental-health.png",color:"#A855F7",bg:"#FAF5FF"},"epilepsy & bipolar":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"sleep":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"insomnia":{icon:"nighttime.png",color:"#6366F1",bg:"#EEF2FF"},"pain relief":{icon:"download.png",color:"#059669",bg:"#ECFDF5"},"pain and fever":{icon:"download.png",color:"#F59E0B",bg:"#FFFBEB"},"pain and inflammation":{icon:"download.png",color:"#EF4444",bg:"#FEF2F2"},"stomach acid and heartburn":{icon:"stomach.png",color:"#10B981",bg:"#ECFDF5"},"ارتفاع ضغط الدم":{icon:"blood-pressure.png",color:"#DC2626",bg:"#FEF2F2"},"ضغط الدم وخفقان القلب":{icon:"blood-pressure.png",color:"#E11D48",bg:"#FFF1F2"},"مميع للدم":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"الوقاية من الجلطات":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"الكوليسترول":{icon:"cholesterol.png",color:"#D97706",bg:"#FFFBEB"},"السكري":{icon:"blood-test.png",color:"#0284C7",bg:"#F0F9FF"},"الربو":{icon:"lungs.png",color:"#0D9488",bg:"#F0FDFA"},"الاكتئاب والقلق":{icon:"mental-health.png",color:"#8B5CF6",bg:"#F5F3FF"},"الذهان وثنائي القطب":{icon:"mental-health.png",color:"#A855F7",bg:"#FAF5FF"},"الصرع وثنائي القطب":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"النوم":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"الأرق":{icon:"nighttime.png",color:"#6366F1",bg:"#EEF2FF"},"مسكن ألم":{icon:"download.png",color:"#059669",bg:"#ECFDF5"},"ألم وحمى":{icon:"download.png",color:"#F59E0B",bg:"#FFFBEB"},"ألم والتهاب":{icon:"download.png",color:"#EF4444",bg:"#FEF2F2"},"حموضة المعدة وحرقة المعدة":{icon:"stomach.png",color:"#10B981",bg:"#ECFDF5"}};

function getPillMeta(l){return CATEGORY_PILL_ICON[l]||{icon:"download.png",color:"#0D9488",bg:"#F0FDFA"};}
function capitalize(s){if(!s)return s;return s.charAt(0).toUpperCase()+s.slice(1);}
function buildCategoryPills(language){const seen=new Set(),pills=[];for(const item of indexData.items){const label=indexData.subtitles[item.slug]?.[language]||indexData.subtitles[item.slug]?.so||"";if(!label||seen.has(label))continue;seen.add(label);pills.push({label,language});}return pills;}

// ── SVG Icons ──────────────────────────────────────────────────────────────
function SearchIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7.5"/><path d="m20 20-4.2-4.2"/></svg>);}
function ShieldIcon(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>);}
function MailIcon({size=18,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);}
function StarIcon({size=16,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);}
function QuestionIcon({size=16,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>);}
function ChatIcon({size=18,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);}
function LungsIcon({size=18,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v4"/><path d="M6 8c-1.5 0-4 1.5-4 6 0 3 2 5 4 5 1.3 0 2.4-.5 3.2-1.4"/><path d="M18 8c1.5 0 4 1.5 4 6 0 3-2 5-4 5-1.3 0-2.4-.5-3.2-1.4"/><path d="M10.8 17.8A3 3 0 0 1 9 20v0a3 3 0 0 1-3-3"/><path d="M13.2 17.8A3 3 0 0 0 15 20v0a3 3 0 0 0 3-3"/><path d="M12 8c-2 0-3 1-3 3v6"/><path d="M12 8c2 0 3 1 3 3v6"/></svg>);}

// ── NEW Inhaler SVG animations ─────────────────────────────────────────────────
function VentolineSVG({ step }) {
  // step 0=shake, 1=breathe out, 2=seal lips, 3=press+inhale, 4=hold, 5=breathe out
  const isActive = step === 3;
  const isHold = step === 4;
  return (
    <div style={{ position: "relative", width: 160, height: 200, margin: "0 auto" }}>
      <svg viewBox="0 0 160 200" width="160" height="200" style={{ display: "block" }}>
        {/* Canister body */}
        <rect x="55" y="40" width="50" height="90" rx="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5"/>
        {/* Canister label */}
        <rect x="62" y="60" width="36" height="28" rx="5" fill="#0284c7" opacity="0.15"/>
        <text x="80" y="79" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0284c7">Ventoline</text>
        {/* Actuation button top */}
        <rect x="68" y="30" width="24" height="14" rx="6" fill="#0284c7"
          style={{ transform: isActive ? "translateY(6px)" : "translateY(0)", transformOrigin: "80px 37px", transition: "transform 0.18s" }}/>
        {/* Mouthpiece */}
        <rect x="50" y="125" width="60" height="30" rx="10" fill="#bae6fd" stroke="#0284c7" strokeWidth="2"/>
        <rect x="62" y="148" width="36" height="16" rx="8" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1.5"/>
        {/* Spray particles — visible only when pressing */}
        {isActive && [0,1,2,3,4].map(i => (
          <circle key={i} cx={72 + i * 4} cy={172 + (i % 2) * 4} r="2.5" fill="#38bdf8" opacity="0.7"
            style={{ animation: `particleFloat 0.6s ${i * 0.08}s ease-out infinite` }}/>
        ))}
        {/* Breath hold indicator */}
        {isHold && (
          <g>
            <circle cx="80" cy="185" r="10" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2"/>
            <text x="80" y="189" textAnchor="middle" fontSize="10" fill="#16a34a">✓</text>
          </g>
        )}
      </svg>
      <style>{`
        @keyframes particleFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.7; }
          100% { transform: translateY(14px) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const TWIST_LABEL = { da:"↺ DREJ", en:"↺ TURN", so:"↺ LEEXI", ar:"↺ أدر" };

function SymbicortSVG({ step, language="da" }) {
  // step 0=load/twist, 1=breathe out, 2=seal, 3=inhale fast, 4=hold, 5=rinse
  const isLoading = step === 0;
  const isInhaling = step === 3;
  const isRinsing = step === 5;
  return (
    <div style={{ position: "relative", width: 160, height: 210, margin: "0 auto" }}>
      <svg viewBox="0 0 160 210" width="160" height="210" style={{ display: "block" }}>
        {/* Turbuhaler body — cylindrical */}
        <rect x="52" y="30" width="56" height="110" rx="18" fill="#fff7ed" stroke="#ea580c" strokeWidth="2.5"/>
        {/* Grip ridges */}
        {[0,1,2,3,4].map(i => (
          <rect key={i} x="52" y={75 + i * 10} width="56" height="4" rx="2" fill="#fed7aa" opacity="0.7"/>
        ))}
        {/* Label */}
        <text x="80" y="62" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#ea580c">Symbicort</text>
        <text x="80" y="73" textAnchor="middle" fontSize="6" fill="#9a3412">Turbuhaler</text>
        {/* Red twist ring */}
        <rect x="52" y="128" width="56" height="18" rx="8" fill="#ea580c"
          style={{ transform: isLoading ? "rotate(15deg)" : "rotate(0deg)", transformOrigin: "80px 137px", transition: "transform 0.4s ease" }}/>
        <text x="80" y="140" textAnchor="middle" fontSize="7" fill="white" fontWeight="700">{TWIST_LABEL[language]??TWIST_LABEL.da}</text>
        {/* Mouthpiece */}
        <rect x="58" y="142" width="44" height="28" rx="10" fill="#fed7aa" stroke="#ea580c" strokeWidth="2"/>
        <rect x="66" y="162" width="28" height="14" rx="7" fill="#fb923c" stroke="#ea580c" strokeWidth="1.5"/>
        {/* Dose counter window */}
        <rect x="88" y="40" width="14" height="12" rx="3" fill="#fff" stroke="#ea580c" strokeWidth="1.5"/>
        <text x="95" y="50" textAnchor="middle" fontSize="7" fontWeight="700" fill="#ea580c">60</text>
        {/* Inhale arrow — fast breath indicator */}
        {isInhaling && (
          <g style={{ animation: "arrowPulse 0.5s ease-in-out infinite alternate" }}>
            <path d="M80 200 L80 183" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
            <path d="M73 192 L80 183 L87 192" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        )}
        {/* Rinse water drops */}
        {isRinsing && [0,1,2].map(i => (
          <ellipse key={i} cx={68 + i * 12} cy={200 + (i % 2) * 5} rx="4" ry="5" fill="#bae6fd" opacity="0.8"
            style={{ animation: `dropFall 0.8s ${i * 0.15}s ease-in infinite` }}/>
        ))}
      </svg>
      <style>{`
        @keyframes arrowPulse {
          from { opacity: 0.6; transform: translateY(3px); }
          to   { opacity: 1;   transform: translateY(0);   }
        }
        @keyframes dropFall {
          0%   { transform: translateY(-8px); opacity: 0.8; }
          100% { transform: translateY(10px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── TPI Modal ──────────────────────────────────────────────────────────────
function TPIModal({ language, onClose }) {
  const [inhaler, setInhaler] = useState("ventoline");
  const [activeStep, setActiveStep] = useState(0);
  const isRtl = language === "ar";
  const data = TPI_DATA[language] ?? TPI_DATA.da;
  const theme = LANG_THEME[language] ?? LANG_THEME.da;
  const inhalerData = inhaler === "ventoline" ? data.ventoline : data.symbicort;
  const totalSteps = inhalerData.steps.length;

  useEffect(() => { setActiveStep(0); }, [inhaler]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const iconEl = <LungsIcon size={22} color="rgba(255,255,255,0.95)" />;

  return (
    <div
      onClick={onClose}
      style={{ position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0",background:"rgba(0,0,0,0.52)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)" }}
      className="sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background:"#f8fafc",borderRadius:"28px 28px 0 0",width:"100%",maxWidth:"680px",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.22)",direction:isRtl?"rtl":"ltr" }}
        className="sm:rounded-[28px] sm:shadow-[0_40px_100px_rgba(0,0,0,0.28)]"
      >
        {/* Header */}
        <div style={{ background:"var(--heroBg)",borderRadius:"28px 28px 0 0",padding:"18px 20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10 }}
          className="sm:rounded-t-[28px]">
          <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
            {iconEl}
            <span style={{ color:"#fff",fontWeight:800,fontSize:"16px",letterSpacing:"-0.01em" }}>{TPI_MODAL_TITLE[language] ?? TPI_MODAL_TITLE.da}</span>
          </div>
          <button type="button" onClick={onClose} style={{ background:"rgba(255,255,255,0.18)",border:"none",borderRadius:"50%",width:44,height:44,cursor:"pointer",color:"#fff",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,minWidth:44,minHeight:44 }}>✕</button>
        </div>

        <div style={{ padding:"20px 20px 32px" }}>

          {/* Intro + Ibrahim note */}
          <p style={{ fontSize:"14px",color:"#475569",lineHeight:1.75,margin:"0 0 14px",textAlign:isRtl?"right":"left" }}>{data.intro}</p>
          <div style={{ background: theme.tagBg, border:`1.5px solid ${theme.border}`, borderRadius:"16px", padding:"14px 16px", marginBottom:"20px", display:"flex", gap:"12px", alignItems:"flex-start" }}>
            <img src="/Ibrahim.png" alt="Ibrahim" style={{ width:44,height:44,borderRadius:"50%",objectFit:"cover",border:`2px solid ${theme.border}`,flexShrink:0 }} onError={(e)=>{e.currentTarget.style.display="none";}}/>
            <p style={{ fontSize:"14px",color:"#334155",lineHeight:1.7,margin:0,fontStyle:"italic",textAlign:isRtl?"right":"left" }}>"{data.ibrahimNote}"</p>
          </div>

          {/* Inhaler tabs */}
          <div style={{ display:"flex",gap:"10px",marginBottom:"20px" }}>
            {(["ventoline","symbicort"]).map((key) => {
              const isActive = inhaler === key;
              const label = key === "ventoline" ? data.ventoline.name : data.symbicort.name;
              return (
                <button key={key} type="button" onClick={() => setInhaler(key)}
                  style={{ flex:1,padding:"12px 14px",borderRadius:"14px",border:`2px solid`,fontWeight:700,fontSize:"13px",cursor:"pointer",transition:"all 0.2s",lineHeight:1.3,minHeight:"52px",
                    borderColor: isActive ? theme.primary : "#e2e8f0",
                    background: isActive ? theme.primary : "#fff",
                    color: isActive ? "#fff" : "#64748b" }}>
                  {key === "ventoline" ? "💨" : "🌀"} {label}
                </button>
              );
            })}
          </div>

          {/* Subtitle + warning */}
          <p style={{ fontSize:"13px",color:theme.primary,fontWeight:700,margin:"0 0 10px",textAlign:isRtl?"right":"left" }}>{inhalerData.subtitle}</p>
          <div style={{ background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:"12px",padding:"12px 14px",marginBottom:"20px",display:"flex",gap:"10px",alignItems:"flex-start" }}>
            <span style={{ fontSize:"18px",flexShrink:0 }}>⚠️</span>
            <p style={{ fontSize:"13px",color:"#991b1b",lineHeight:1.65,margin:0,fontWeight:500,textAlign:isRtl?"right":"left" }}>{inhalerData.warning}</p>
          </div>

          {/* Animated inhaler + step navigator */}
          <div style={{ background:"#fff",borderRadius:"20px",border:`1.5px solid ${theme.border}`,padding:"20px",marginBottom:"20px",boxShadow:`0 4px 16px ${theme.primary}10` }}>
            {/* Inhaler animation */}
            <div style={{ marginBottom:"16px" }}>
              {inhaler === "ventoline"
                ? <VentolineSVG step={activeStep} />
                : <SymbicortSVG step={activeStep} language={language} />}
            </div>

            {/* Step dots */}
            <div style={{ display:"flex",justifyContent:"center",gap:"8px",marginBottom:"16px" }}>
              {inhalerData.steps.map((_, i) => (
                <button key={i} type="button" onClick={() => setActiveStep(i)}
                  style={{ width: i === activeStep ? 28 : 10, height:10, borderRadius:"9999px", border:"none", cursor:"pointer", transition:"all 0.2s",
                    background: i === activeStep ? theme.primary : `${theme.primary}30` }}/>
              ))}
            </div>

            {/* Active step card */}
            <div style={{ background:theme.soft,borderRadius:"14px",padding:"16px",border:`1px solid ${theme.border}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px" }}>
                <span style={{ fontSize:"22px" }}>{inhalerData.steps[activeStep].icon}</span>
                <div>
                  <span style={{ fontSize:"11px",fontWeight:700,color:theme.primary,textTransform:"uppercase",letterSpacing:"0.05em" }}>
                    {activeStep + 1} / {totalSteps}
                  </span>
                  <p style={{ fontSize:"15px",fontWeight:800,color:"#0f172a",margin:0,lineHeight:1.2 }}>{inhalerData.steps[activeStep].title}</p>
                </div>
              </div>
              <p style={{ fontSize:"14px",color:"#334155",lineHeight:1.7,margin:0,textAlign:isRtl?"right":"left" }}>{inhalerData.steps[activeStep].body}</p>
            </div>

            {/* Prev / Next */}
            <div style={{ display:"flex",gap:"10px",marginTop:"14px" }}>
              <button type="button" onClick={() => setActiveStep(s => Math.max(0, s - 1))} disabled={activeStep === 0}
                style={{ flex:1,padding:"12px",borderRadius:"12px",border:`1.5px solid ${theme.border}`,background:"#fff",color:activeStep===0?"#cbd5e1":theme.primary,fontWeight:700,fontSize:"14px",cursor:activeStep===0?"not-allowed":"pointer",transition:"all 0.2s",minHeight:"48px" }}>
                ← {isRtl ? "السابق" : language === "so" ? "Hore" : language === "da" ? "Forrige" : "Previous"}
              </button>
              <button type="button" onClick={() => setActiveStep(s => Math.min(totalSteps - 1, s + 1))} disabled={activeStep === totalSteps - 1}
                style={{ flex:1,padding:"12px",borderRadius:"12px",border:"none",background:activeStep===totalSteps-1?"#e2e8f0":theme.primary,color:activeStep===totalSteps-1?"#94a3b8":"#fff",fontWeight:700,fontSize:"14px",cursor:activeStep===totalSteps-1?"not-allowed":"pointer",transition:"all 0.2s",minHeight:"48px" }}>
                {isRtl ? "التالي" : language === "so" ? "Xiga" : language === "da" ? "Næste" : "Next"} →
              </button>
            </div>
          </div>

          {/* After-use note for Symbicort */}
          {inhaler === "symbicort" && inhalerData.afterUse && (
            <div style={{ background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:"12px",padding:"12px 14px",marginBottom:"20px",display:"flex",gap:"10px",alignItems:"flex-start" }}>
              <span style={{ fontSize:"18px",flexShrink:0 }}>🌊</span>
              <p style={{ fontSize:"13px",color:"#166534",lineHeight:1.65,margin:0,fontWeight:600,textAlign:isRtl?"right":"left" }}>{inhalerData.afterUse}</p>
            </div>
          )}

          {/* All steps list */}
          <p style={{ fontSize:"11px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 10px",textAlign:isRtl?"right":"left" }}>
            {language === "da" ? "Alle trin" : language === "en" ? "All steps" : language === "so" ? "Tallaabooyinka oo dhan" : "جميع الخطوات"}
          </p>
          <div style={{ display:"flex",flexDirection:"column",gap:"8px",marginBottom:"20px" }}>
            {inhalerData.steps.map((step, i) => (
              <button key={i} type="button" onClick={() => setActiveStep(i)}
                style={{ display:"flex",alignItems:"flex-start",gap:"12px",padding:"12px 14px",borderRadius:"14px",border:`1.5px solid`,cursor:"pointer",textAlign:isRtl?"right":"left",background: i === activeStep ? theme.soft : "#fff",
                  borderColor: i === activeStep ? theme.primary : "#e5e7eb",
                  boxShadow: i === activeStep ? `0 2px 8px ${theme.primary}20` : "none",
                  transition:"all 0.2s" }}>
                <span style={{ width:32,height:32,borderRadius:"50%",background: i === activeStep ? theme.primary : `${theme.primary}15`,color: i === activeStep ? "#fff" : theme.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:800,flexShrink:0 }}>{i + 1}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:"14px",fontWeight:700,color: i === activeStep ? theme.primary : "#0f172a",margin:"0 0 2px" }}>{step.title}</p>
                  <p style={{ fontSize:"13px",color:"#64748b",margin:0,lineHeight:1.5 }}>{step.body}</p>
                </div>
                <span style={{ fontSize:"16px",flexShrink:0,marginTop:"6px" }}>{step.icon}</span>
              </button>
            ))}
          </div>

          {/* Tips */}
          <p style={{ fontSize:"11px",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 10px",textAlign:isRtl?"right":"left" }}>
            {language === "da" ? "Gode råd fra apoteket" : language === "en" ? "Pharmacy tips" : language === "so" ? "Talooyinka farmashiyaha" : "نصائح من الصيدلية"}
          </p>
          <div style={{ display:"flex",flexDirection:"column",gap:"8px" }}>
            {inhalerData.tips.map((tip, i) => (
              <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:"12px",padding:"12px 14px",borderRadius:"14px",background:"#fff",border:"1.5px solid #e5e7eb" }}>
                <span style={{ width:32,height:32,borderRadius:"50%",background:`${theme.primary}15`,color:theme.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0 }}>💡</span>
                <p style={{ fontSize:"13px",color:"#334155",lineHeight:1.65,margin:0,fontWeight:500,textAlign:isRtl?"right":"left" }}>{tip}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Modal shell ────────────────────────────────────────────────────────────
function ModalShell({title,iconEl,onClose,children,isRtl,wide}){
  useEffect(()=>{
    const onKey=(e)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",onKey);
    document.body.style.overflow="hidden";
    return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow="";};
  },[onClose]);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0",background:"rgba(0,0,0,0.52)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}
      className="sm:items-center sm:p-4">
      <div onClick={(e)=>e.stopPropagation()} style={{background:"#f8fafc",borderRadius:"28px 28px 0 0",width:"100%",maxWidth:wide?"660px":"560px",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,0.22)",direction:isRtl?"rtl":"ltr"}}
        className="sm:rounded-[28px] sm:shadow-[0_40px_100px_rgba(0,0,0,0.28)]">
        <div style={{background:"var(--heroBg)",borderRadius:"28px 28px 0 0",padding:"18px 20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}
          className="sm:rounded-t-[28px]">
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            {iconEl}
            <span style={{color:"#fff",fontWeight:800,fontSize:"16px",letterSpacing:"-0.01em"}}>{title}</span>
          </div>
          <button type="button" onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:"50%",width:44,height:44,cursor:"pointer",color:"#fff",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,minWidth:44,minHeight:44}}>✕</button>
        </div>
        <div style={{padding:"20px 20px 32px"}}>{children}</div>
      </div>
    </div>
  );
}

// ── Bullet row ─────────────────────────────────────────────────────────────
function BulletRow({bullet,palette}){
  return(
    <li style={{display:"flex",alignItems:"flex-start",gap:"12px",background:"#fff",borderRadius:"16px",padding:"12px 14px",border:`1.5px solid ${palette.color}22`,boxShadow:`0 2px 8px ${palette.color}10`}}>
      <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:44,height:44,borderRadius:"13px",flexShrink:0,background:palette.bg,border:`1.5px solid ${palette.color}30`,marginTop:"1px"}}>
        <img src={P[bullet.icon]} alt="" style={{width:26,height:26,objectFit:"contain"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
      </span>
      <span style={{fontSize:"15px",color:"#1e293b",lineHeight:1.65,fontWeight:500,paddingTop:"3px"}}>{bullet.text}</span>
    </li>
  );
}

// ── About Modal ────────────────────────────────────────────────────────────
function AboutModal({tab,language,onClose}){
  const isRtl=language==="ar";
  const navLabels=NAV_LABELS[language]??NAV_LABELS.so;
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const palette=BULLET_PALETTES[language]??BULLET_PALETTES.so;
  const meMeta=ABOUT_ME_META[language]??ABOUT_ME_META.so;
  const bullets=tab==="me"?(ABOUT_ME_BULLETS[language]??ABOUT_ME_BULLETS.so):(ABOUT_SITE_BULLETS[language]??ABOUT_SITE_BULLETS.so);
  const siteTagline=ABOUT_SITE_TAGLINE[language]??ABOUT_SITE_TAGLINE.so;
  const title=tab==="me"?navLabels.aboutMe:navLabels.aboutSite;
  const iconEl=<img src={tab==="me"?P.education:P.pills} alt="" style={{width:24,height:24,objectFit:"contain",filter:"brightness(0) invert(1)"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>;
  return(
    <ModalShell title={title} iconEl={iconEl} onClose={onClose} isRtl={isRtl}>
      {tab==="me"&&(
        <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"18px",background:"#fff",borderRadius:"20px",padding:"14px 16px",border:`1.5px solid ${theme.border}`,boxShadow:`0 4px 16px ${theme.primary}15`}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{position:"absolute",inset:"-4px",borderRadius:"50%",background:"linear-gradient(135deg,#14b8a6,#38bdf8,#818cf8)",opacity:0.9,filter:"blur(2px)"}}/>
            <img src="/Ibrahim.png" alt={meMeta.name} style={{position:"relative",width:68,height:68,borderRadius:"50%",objectFit:"cover",border:"4px solid white",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}/>
          </div>
          <div>
            <p style={{fontWeight:800,fontSize:"17px",color:"#0f172a",margin:0}}>{meMeta.name}</p>
            <p style={{fontSize:"13px",color:theme.primary,margin:"4px 0 0",fontWeight:600}}>{meMeta.title}</p>
          </div>
        </div>
      )}
      {tab==="site"&&(
        <div style={{background:theme.tagBg,borderRadius:"16px",padding:"14px 18px",marginBottom:"18px",border:`1.5px solid ${theme.border}`}}>
          <p style={{fontWeight:700,fontSize:"15px",color:theme.primary,margin:0,textAlign:isRtl?"right":"left"}}>{siteTagline}</p>
        </div>
      )}
      <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:"10px"}}>
        {bullets.map((b,i)=><BulletRow key={i} bullet={b} palette={palette[i%palette.length]}/>)}
      </ul>
    </ModalShell>
  );
}

// ── Contact Modal ─────────────────────────────────────────────────────────
function ContactModal({language,onClose}){
  const isRtl=language==="ar";
  const navLabels=NAV_LABELS[language]??NAV_LABELS.so;
  const data=CONTACT_DATA[language]??CONTACT_DATA.so;
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const iconEl=<MailIcon size={22} color="rgba(255,255,255,0.95)"/>;
  return(
    <ModalShell title={navLabels.contact} iconEl={iconEl} onClose={onClose} isRtl={isRtl}>
      <p style={{fontSize:"15px",color:"#475569",lineHeight:1.7,margin:"0 0 18px",textAlign:isRtl?"right":"left"}}>{data.intro}</p>
      <div style={{background:theme.tagBg,borderRadius:"18px",padding:"14px 18px",marginBottom:"14px",border:`1.5px solid ${theme.border}`,display:"flex",alignItems:"center",gap:"12px"}}>
        <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:48,height:48,borderRadius:"14px",background:theme.primary,flexShrink:0}}>
          <ChatIcon size={22} color="#fff"/>
        </span>
        <div>
          <p style={{fontWeight:700,fontSize:"15px",color:theme.primary,margin:0}}>{data.chatTitle}</p>
          <p style={{fontSize:"13px",color:"#64748b",margin:"3px 0 0",lineHeight:1.5}}>{data.chatDesc}</p>
        </div>
      </div>
      <p style={{fontWeight:700,fontSize:"13px",color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 10px",textAlign:isRtl?"right":"left"}}>{data.emailLabel}</p>
      <a href="mailto:Ibrahim_skb@live.dk" style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",borderRadius:"16px",background:"#fff",border:`1.5px solid ${theme.border}`,textDecoration:"none",marginBottom:"18px",boxShadow:`0 2px 8px ${theme.primary}10`}}>
        <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:40,height:40,borderRadius:"10px",background:theme.primary,flexShrink:0}}>
          <MailIcon size={18} color="#fff"/>
        </span>
        <div>
          <p style={{fontWeight:700,fontSize:"15px",color:theme.primary,margin:0}}>Ibrahim_skb@live.dk</p>
          <p style={{fontSize:"12px",color:"#94a3b8",margin:"2px 0 0"}}>{data.emailNote}</p>
        </div>
      </a>
      <p style={{fontWeight:700,fontSize:"14px",color:"#0f172a",margin:"0 0 10px",textAlign:isRtl?"right":"left"}}>{data.responseTitle}</p>
      <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:"7px"}}>
        {data.topics.map((t,i)=>(
          <li key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 14px",background:"#fff",borderRadius:"12px",border:"1px solid #e5e7eb",fontSize:"14px",color:"#334155",fontWeight:500}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:theme.primary,flexShrink:0}}/>
            {t}
          </li>
        ))}
      </ul>
    </ModalShell>
  );
}

// ── FAQ Modal ──────────────────────────────────────────────────────────────
function FAQModal({language,onClose}){
  const[open,setOpen]=useState(null);
  const isRtl=language==="ar";
  const data=FAQ_DATA[language]??FAQ_DATA.so;
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const faqTitle=FAQ_MODAL_TITLE[language]??FAQ_MODAL_TITLE.so;
  const iconEl=<QuestionIcon size={22} color="rgba(255,255,255,0.95)"/>;
  return(
    <ModalShell title={faqTitle} iconEl={iconEl} onClose={onClose} isRtl={isRtl} wide>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {data.items.map((item,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:"16px",border:`1.5px solid ${open===i?theme.primary+"55":"#e5e7eb"}`,overflow:"hidden",boxShadow:open===i?`0 4px 16px ${theme.primary}15`:"0 1px 3px rgba(0,0,0,0.04)",transition:"all 0.2s"}}>
            <button type="button" onClick={()=>setOpen(open===i?null:i)} style={{width:"100%",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"10px",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",textAlign:isRtl?"right":"left",minHeight:"52px"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:"10px",flex:1}}>
                <span style={{flexShrink:0,width:26,height:26,borderRadius:"50%",background:open===i?theme.primary:`${theme.primary}15`,display:"flex",alignItems:"center",justifyContent:"center",color:open===i?"#fff":theme.primary,fontSize:"12px",fontWeight:800,marginTop:"2px",transition:"all 0.2s"}}>{i+1}</span>
                <span style={{fontWeight:700,fontSize:"14px",color:open===i?theme.primary:"#0f172a",lineHeight:1.45}}>{item.q}</span>
              </div>
              <span style={{flexShrink:0,width:28,height:28,borderRadius:"50%",background:open===i?theme.primary:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",color:open===i?"#fff":theme.primary,fontSize:"18px",fontWeight:700,transition:"all 0.2s",marginTop:"1px"}}>{open===i?"−":"+"}</span>
            </button>
            {open===i&&(
              <div style={{padding:"6px 12px 14px",borderTop:`1px solid ${theme.primary}20`}}>
                <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:"7px"}}>
                  {item.bullets.map((b,bi)=>{
                    const iconStyles=[
                      {bg:"#dcfce7",color:"#16a34a",svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a9.9 9.9 0 0 0 2.121-.232"/><path d="M8 11h2l2 9 2.5-6.5L17 13h2"/><path d="M9 3.5A2 2 0 1 1 11 5.5"/><path d="M12 2a10 10 0 1 1 0 20"/></svg>},
                      {bg:"#dbeafe",color:"#2563eb",svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>},
                      {bg:"#fef9c3",color:"#ca8a04",svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>},
                      {bg:"#ede9fe",color:"#7c3aed",svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M16 3 8 3"/><path d="m12 16 0 5"/></svg>},
                    ];
                    const s=iconStyles[bi%4];
                    return(
                      <li key={bi} style={{display:"flex",alignItems:"flex-start",gap:"12px",padding:"11px 12px",borderRadius:"12px",background:"#fff",border:"1px solid #f1f5f9",fontSize:"14px",color:"#334155",lineHeight:1.65,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                        <span style={{width:40,height:40,borderRadius:"50%",background:s.bg,color:s.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"1px",border:`1.5px solid ${s.color}30`}}>
                          {s.svg}
                        </span>
                        <span style={{paddingTop:"9px",fontWeight:500}}>{b}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

// ── Feedback Modal ─────────────────────────────────────────────────────────
function FeedbackModal({language,onClose}){
  const[type,setType]=useState("praise");
  const[msg,setMsg]=useState("");
  const[email,setEmail]=useState("");
  const[sent,setSent]=useState(false);
  const isRtl=language==="ar";
  const data=FEEDBACK_DATA[language]??FEEDBACK_DATA.so;
  const navLabels=NAV_LABELS[language]??NAV_LABELS.so;
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const handleSend=()=>{
    if(!msg.trim())return;
    const subject=encodeURIComponent(`[Somalimed ${data[type]||type}]`);
    const body=encodeURIComponent(`Type: ${data[type]||type}\n\n${msg}${email?`\n\nFra: ${email}`:""}`);
    window.open(`mailto:Ibrahim_skb@live.dk?subject=${subject}&body=${body}`);
    setSent(true);
  };
  const iconEl=<StarIcon size={22} color="rgba(255,255,255,0.95)"/>;
  return(
    <ModalShell title={navLabels.feedback} iconEl={iconEl} onClose={onClose} isRtl={isRtl}>
      {sent?(
        <div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{fontSize:"48px",marginBottom:"16px"}}>🙏</div>
          <p style={{fontWeight:700,fontSize:"18px",color:"#0f172a"}}>{data.sent}</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
          <p style={{fontSize:"14px",color:"#64748b",margin:0,textAlign:isRtl?"right":"left"}}>{data.subtitle}</p>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {[["praise",data.praise],["criticism",data.criticism],["suggestion",data.suggestion]].map(([key,label])=>(
              <button key={key} type="button" onClick={()=>setType(key)} style={{padding:"10px 18px",borderRadius:"999px",border:"1.5px solid",fontWeight:600,fontSize:"14px",cursor:"pointer",transition:"all 0.2s",borderColor:type===key?theme.primary:"#e2e8f0",background:type===key?theme.primary:"#fff",color:type===key?"#fff":"#334155",minHeight:"44px"}}>{label}</button>
            ))}
          </div>
          <textarea value={msg} onChange={(e)=>setMsg(e.target.value)} placeholder={data.placeholder} rows={4} style={{width:"100%",padding:"12px 14px",borderRadius:"14px",border:"1.5px solid #e2e8f0",fontSize:"16px",resize:"vertical",outline:"none",fontFamily:"inherit",boxSizing:"border-box",direction:isRtl?"rtl":"ltr"}}/>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder={data.emailLabel} type="email" style={{padding:"12px 14px",borderRadius:"14px",border:"1.5px solid #e2e8f0",fontSize:"16px",outline:"none",fontFamily:"inherit",direction:isRtl?"rtl":"ltr",minHeight:"48px"}}/>
          <button type="button" onClick={handleSend} style={{padding:"15px",borderRadius:"14px",background:theme.primary,color:"#fff",fontWeight:700,fontSize:"16px",border:"none",cursor:"pointer",boxShadow:`0 4px 14px ${theme.primary}40`,minHeight:"52px"}}>{data.send}</button>
        </div>
      )}
    </ModalShell>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export function SiteIndex({initialLang}){
  const{language,updateLanguage}=useLanguageRouting({initialLanguage:initialLang});
  const[searchTerm,setSearchTerm]=useState("");
  const[activeCategory,setActiveCategory]=useState("all");
  const[modalTab,setModalTab]=useState(null);

  const text=useMemo(()=>indexData.translations[language]||indexData.translations.so,[language]);
  const chromeText=useMemo(()=>uiText[language]||uiText.so,[language]);
  const navLabels=useMemo(()=>NAV_LABELS[language]??NAV_LABELS.so,[language]);
  const iconColors=useMemo(()=>NAV_ICON_COLORS[language]??NAV_ICON_COLORS.so,[language]);

  useEffect(()=>{applyLanguageToDocument(language,text.pageTitle);},[language,text.pageTitle]);
  useEffect(()=>{setActiveCategory("all");},[language]);

  useEffect(()=>{
    const handler=(e)=>setModalTab(prev=>prev===e.detail?null:e.detail);
    window.addEventListener("somalimed-tab",handler);
    return()=>window.removeEventListener("somalimed-tab",handler);
  },[]);

  const categoryPills=useMemo(()=>buildCategoryPills(language),[language]);
  const filteredItems=useMemo(()=>{
    const query=searchTerm.trim().toLowerCase();
    return indexData.items.filter((item)=>{
      const subtitle=indexData.subtitles[item.slug]?.[language]||indexData.subtitles[item.slug]?.so||"";
      const matchesCat=activeCategory==="all"||subtitle===activeCategory;
      const displayName=getDisplayName(item.slug,language,item.name);
      const matchSearch=!query||displayName.toLowerCase().includes(query)||item.name.toLowerCase().includes(query)||subtitle.toLowerCase().includes(query);
      return matchesCat&&matchSearch;
    });
  },[activeCategory,language,searchTerm]);

  useScrollReveal([language,activeCategory,searchTerm]);

  const navTabs=useMemo(()=>[
    {key:"me",      iconEl:<img src={P.education} alt="" style={{width:15,height:15,objectFit:"contain"}}/>, label:navLabels.aboutMe},
    {key:"site",    iconEl:<img src={P.work}      alt="" style={{width:15,height:15,objectFit:"contain"}}/>, label:navLabels.aboutSite},
    {key:"faq",     iconEl:<svg width="22" height="15" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="13" height="10" rx="3" fill={iconColors.faq}/><path d="M2 10 L2 13 L6 10Z" fill={iconColors.faq}/><text x="6.5" y="7.5" fontFamily="-apple-system,sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">Q</text><rect x="8" y="5" width="13" height="10" rx="3" fill={iconColors.faq} opacity="0.65"/><path d="M19 15 L19 18 L15 15Z" fill={iconColors.faq} opacity="0.65"/><text x="14.5" y="12.5" fontFamily="-apple-system,sans-serif" fontSize="7" fontWeight="700" fill="white" textAnchor="middle">A</text></svg>, label:navLabels.faq},
    {key:"tpi",     iconEl:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={iconColors.faq} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v4"/><path d="M6 8c-1.5 0-4 1.5-4 6 0 3 2 5 4 5 1.3 0 2.4-.5 3.2-1.4"/><path d="M18 8c1.5 0 4 1.5 4 6 0 3-2 5-4 5-1.3 0-2.4-.5-3.2-1.4"/><path d="M12 8c-2 0-3 1-3 3v6"/><path d="M12 8c2 0 3 1 3 3v6"/></svg>, label:navLabels.tpi},
    {key:"feedback",iconEl:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={iconColors.feedback} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>, label:navLabels.feedback},
    {key:"contact", iconEl:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={iconColors.contact} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>, label:navLabels.contact},
  ],[navLabels,iconColors]);

  return(
    <div style={{background:"var(--bg)",color:"var(--text)"}} className="min-h-screen">

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {(modalTab==="me"||modalTab==="site")&&<AboutModal tab={modalTab} language={language} onClose={()=>setModalTab(null)}/>}
      {modalTab==="faq"      &&<FAQModal      language={language} onClose={()=>setModalTab(null)}/>}
      {modalTab==="tpi"      &&<TPIModal      language={language} onClose={()=>setModalTab(null)}/>}
      {modalTab==="feedback" &&<FeedbackModal language={language} onClose={()=>setModalTab(null)}/>}
      {modalTab==="contact"  &&<ContactModal  language={language} onClose={()=>setModalTab(null)}/>}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{background:"var(--heroBg)"}}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white/90">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
            {chromeText.heroEyebrow}
          </div>
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl" style={{lineHeight:1.1}}>{text.hdrTitle}</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/80 sm:mt-4 sm:text-lg">{text.hdrSubtitle}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/80 sm:mt-6">
            <span className="flex items-center gap-1.5"><span className="text-lg font-black text-white">{indexData.items.length}</span>{chromeText.medicinesStat}</span>
            <span className="text-white/40 hidden xs:inline">·</span>
            <span className="flex items-center gap-1.5"><span className="text-lg font-black text-white">4</span>{chromeText.languagesStat}</span>
            <span className="text-white/40 hidden xs:inline">·</span>
            <span>{chromeText.heroFormatValue}</span>
          </div>
        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:pt-8">
        <div className="reveal-on-scroll"><LanguageSelect label={text.langLabel} onChange={updateLanguage} value={language}/></div>

        <div className="reveal-on-scroll mb-5 sm:mb-6">
          <label htmlFor="medSearch" className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{color:"var(--text-muted)"}}>{chromeText.searchLabel}</span>
            <div className="group flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm transition duration-200 focus-within:-translate-y-0.5 focus-within:shadow-xl" style={{borderColor:"var(--border)"}}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{background:"var(--bg)",color:"var(--accent)"}}><SearchIcon/></span>
              <input id="medSearch" className="flex-1 bg-transparent outline-none placeholder:text-slate-400" style={{color:"var(--text)",fontSize:"16px"}} onChange={(e)=>setSearchTerm(e.target.value)} placeholder={chromeText.searchPlaceholder} value={searchTerm}/>
              {searchTerm?(<button type="button" className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-90" style={{background:"var(--bg)",color:"var(--text-muted)",minHeight:"36px"}} onClick={()=>setSearchTerm("")}>{chromeText.clearFilters}</button>):null}
            </div>
          </label>
        </div>

        <div className="reveal-on-scroll mb-6 sm:mb-7">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest" style={{color:"var(--text-muted)"}}>{chromeText.categoryLabel}</span>
          <div className="flex gap-2.5 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0" style={{scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
            <button type="button" onClick={()=>setActiveCategory("all")} style={{display:"inline-flex",alignItems:"center",gap:"8px",borderRadius:"999px",border:"1.5px solid",padding:"9px 18px",fontSize:"14px",fontWeight:600,lineHeight:1,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap",flexShrink:0,minHeight:"44px",...(activeCategory==="all"?{background:"#1a1a1a",color:"#ffffff",borderColor:"#1a1a1a",boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}:{background:"var(--surface,#fff)",color:"var(--text)",borderColor:"var(--border)"})}}>
              <span style={{width:10,height:10,borderRadius:"50%",display:"inline-block",flexShrink:0,background:activeCategory==="all"?"#fff":"#888"}}/>
              {capitalize(chromeText.allCategories)}
            </button>
            {categoryPills.map(({label})=>{
              const isActive=activeCategory===label;
              const meta=getPillMeta(label);
              return(
                <button key={label} type="button" onClick={()=>setActiveCategory(isActive?"all":label)} style={{display:"inline-flex",alignItems:"center",gap:"8px",borderRadius:"999px",border:"1.5px solid",padding:"9px 18px",fontSize:"14px",fontWeight:600,lineHeight:1,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap",flexShrink:0,minHeight:"44px",...(isActive?{background:meta.color,color:"#ffffff",borderColor:meta.color,boxShadow:`0 2px 12px ${meta.color}50`}:{background:meta.bg,color:meta.color,borderColor:`${meta.color}40`})}}>
                  <img src={`${ICON_BASE}${meta.icon}`} alt="" style={{width:20,height:20,objectFit:"contain",flexShrink:0,filter:isActive?"brightness(0) invert(1)":"none",mixBlendMode:isActive?"normal":"multiply"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
                  {capitalize(label)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="reveal-on-scroll mb-4 sm:mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest" style={{color:"var(--text-muted)"}}>{chromeText.libraryEyebrow}</p>
            <h2 className="text-xl font-extrabold sm:text-2xl" style={{color:"var(--text)"}}>{text.pickTitle}</h2>
          </div>
          {filteredItems.length>0&&<span className="shrink-0 text-sm" style={{color:"var(--text-muted)"}}>{filteredItems.length} {chromeText.medicinesStat.toLowerCase()}</span>}
        </div>

        {filteredItems.length?(
          <ul className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item,index)=>{
              const subtitle=indexData.subtitles[item.slug]?.[language]||indexData.subtitles[item.slug]?.so||"";
              const style=SLUG_STYLE[item.slug]||DEFAULT_STYLE;
              const iconFile=SLUG_ICON[item.slug]||"download.png";
              const displayName=getDisplayName(item.slug,language,item.name);
              return(
                <li className="reveal-on-scroll" key={item.slug} style={{transitionDelay:`${Math.min(index*40,200)}ms`}}>
                  <Link className="group flex h-full overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]" style={{borderColor:"var(--border)"}} href={{pathname:`/${item.href}`,query:{lang:language}}}>
                    <div className="w-1.5 shrink-0" style={{background:style.color}}/>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex shrink-0 items-center justify-center rounded-2xl border shadow-[0_10px_24px_rgba(15,23,42,0.08)]" style={{width:56,height:56,background:style.bg,borderColor:`${style.color}22`}}>
                          <img src={`${ICON_BASE}${iconFile}`} alt="" style={{width:38,height:38,objectFit:"contain",mixBlendMode:"multiply"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
                        </span>
                        <span className="rounded-full font-semibold" style={{background:style.bg,color:style.color,fontSize:"13px",padding:"6px 13px"}}>
                          {capitalize(subtitle)||capitalize(chromeText.medicinePill)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold sm:text-xl" style={{color:"var(--text)"}}>{displayName}</h3>
                      <div className="mt-auto flex items-center justify-between border-t pt-3 sm:pt-4" style={{borderColor:"var(--border)",marginTop:"0.875rem"}}>
                        <span className="text-sm font-medium" style={{color:"var(--text-muted)"}}>{chromeText.openDetails}</span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-white transition duration-300 group-hover:scale-110" style={{background:style.color}}>→</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ):(
          <section className="reveal-on-scroll rounded-2xl border bg-white px-6 py-10 text-center sm:px-8 sm:py-12" style={{borderColor:"var(--border)"}}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{background:"var(--bg)"}}><SearchIcon/></div>
            <h3 className="text-xl font-bold" style={{color:"var(--text)"}}>{chromeText.noResultsTitle}</h3>
            <p className="mt-2" style={{color:"var(--text-muted)"}}>{chromeText.noResultsBody}</p>
          </section>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mx-auto max-w-6xl px-4 pb-14 pt-4">
        <div style={{borderRadius:"24px",border:`2px solid ${(LANG_THEME[language]??LANG_THEME.so).border}`,background:(LANG_THEME[language]??LANG_THEME.so).tagBg,padding:"20px 20px",boxShadow:`0 4px 20px ${(LANG_THEME[language]??LANG_THEME.so).primary}18`}}
          className="sm:p-7">
          <div style={{display:"flex",alignItems:"flex-start",gap:"14px"}}>
            <div style={{display:"flex",height:44,width:44,flexShrink:0,alignItems:"center",justifyContent:"center",borderRadius:"14px",background:"rgba(255,255,255,0.7)",color:(LANG_THEME[language]??LANG_THEME.so).primary,border:`1.5px solid ${(LANG_THEME[language]??LANG_THEME.so).border}`,marginTop:"2px"}}><ShieldIcon/></div>
            <div>
              <strong style={{display:"block",fontSize:"15px",fontWeight:700,color:(LANG_THEME[language]??LANG_THEME.so).primary,marginBottom:"6px"}}>{text.footerStrong}</strong>
              {text.footer1&&<p style={{fontSize:"14px",lineHeight:"1.75",color:"#334155",margin:0}}>{text.footer1}</p>}
            </div>
          </div>
          <div style={{marginTop:"16px",paddingTop:"14px",borderTop:`1px solid ${(LANG_THEME[language]??LANG_THEME.so).border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
            {text.footer2&&<p style={{fontSize:"13px",fontWeight:700,color:(LANG_THEME[language]??LANG_THEME.so).primary,margin:0}}>{text.footer2}</p>}
            <p style={{fontSize:"13px",color:"#64748b",margin:0}}>© 2026 Somalimed</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
