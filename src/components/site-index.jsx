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
  da: { aboutMe:"Om mig", aboutSite:"Om Somalimed", faq:"FAQ", feedback:"Ris & Ros", contact:"Kontakt" },
  en: { aboutMe:"About me", aboutSite:"About Somalimed", faq:"FAQ", feedback:"Feedback", contact:"Contact" },
  so: { aboutMe:"Ku saabsan aniga", aboutSite:"Ku saabsan Somalimed", faq:"Su'aalaha", feedback:"Faallo", contact:"Xiriir" },
  ar: { aboutMe:"نبذة عني", aboutSite:"نبذة عن Somalimed", faq:"الأسئلة الشائعة", feedback:"آراء وملاحظات", contact:"تواصل معي" },
};

const FAQ_MODAL_TITLE = {
  da: "FAQ — Ofte stillede spørgsmål",
  en: "FAQ — Frequently Asked Questions",
  so: "Su'aalaha inta badan la isweydiiyo",
  ar: "الأسئلة الشائعة",
};

// ── Color themes ───────────────────────────────────────────────────────────
const LANG_THEME = {
  so: { primary:"#0D9488", soft:"#F0FDFA", border:"#99f6e4", tagBg:"linear-gradient(135deg,#f0fdfa,#e0f2fe)" },
  da: { primary:"#2563EB", soft:"#EFF6FF", border:"#bfdbfe", tagBg:"linear-gradient(135deg,#eff6ff,#dbeafe)" },
  en: { primary:"#92400E", soft:"#FEF3C7", border:"#fcd34d", tagBg:"linear-gradient(135deg,#fef3c7,#fde68a)" },
  ar: { primary:"#D97706", soft:"#FFFBEB", border:"#fde68a", tagBg:"linear-gradient(135deg,#fffbeb,#fef3c7)" },
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
    intro: "Har du spørgsmål til et lægemiddel eller en kommentar til siden? Skriv til mig — jeg svarer inden for 1–2 hverdage.",
    chatTitle: "Chat direkte med Ibrahim",
    chatDesc: "Du kan også chatte med mig live via chat-ikonet nederst til højre på siden.",
    emailLabel: "Eller skriv på e-mail",
    emailNote: "Svar inden for 1–2 hverdage",
    responseTitle: "Du kan skrive om:",
    topics: ["Spørgsmål om et specifikt lægemiddel", "Forslag til nye emner", "Fejl eller unøjagtigheder på siden", "Generel feedback"],
  },
  en: {
    intro: "Do you have a question about a medicine or a comment about the site? Write to me — I respond within 1–2 working days.",
    chatTitle: "Chat directly with Ibrahim",
    chatDesc: "You can also chat with me live via the chat icon in the bottom right corner of the page.",
    emailLabel: "Or write by email",
    emailNote: "Response within 1–2 working days",
    responseTitle: "You can write about:",
    topics: ["Questions about a specific medicine", "Suggestions for new topics", "Errors or inaccuracies on the site", "General feedback"],
  },
  so: {
    intro: "Ma qabtaa su'aal ku saabsan daawooyin ama faallo ku saabsan bogga? Ii qor — waxaan kugu jawaabi doonaa 1–2 maalmood gudahood.",
    chatTitle: "La xiriir Ibraahim si toos ah",
    chatDesc: "Riix astaanta chat-ka ee ku taalla geeska hoose ee midig.",
    emailLabel: "Ama ii qor emailka",
    emailNote: "Jawaab ayaad helaysaa 1–2 maalmood gudahood",
    responseTitle: "Waxaad ka qori kartaa:",
    topics: ["Su'aalo ku saabsan daawooyin gaar ah", "Talooyin ku saabsan mawduucyo cusub", "Khaladaad ama xog aan saxnayn", "Faallo guud"],
  },
  ar: {
    intro: "هل لديك سؤال حول دواء أو تعليق على الموقع؟ راسلني — سأرد خلال يوم أو يومين عمل.",
    chatTitle: "تحدث مع إبراهيم مباشرةً",
    chatDesc: "يمكنك أيضاً التحدث معي مباشرةً عبر أيقونة المحادثة في الزاوية السفلية اليمنى من الصفحة.",
    emailLabel: "أو راسلني عبر البريد الإلكتروني",
    emailNote: "سيتم الرد خلال يوم أو يومين عمل",
    responseTitle: "يمكنك الكتابة عن:",
    topics: ["أسئلة حول دواء معين", "اقتراحات لموضوعات جديدة", "أخطاء أو معلومات غير دقيقة", "تعليقات عامة"],
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
  da:"Lægemiddelinformation på dit eget sprog",
  en:"Medicine information in your own language",
  so:"Macluumaadka daawooyinka ee luqaddaada hooyo",
  ar:"معلومات الدواء بلغتك الأم",
};

const ABOUT_SITE_BULLETS = {
  da: [
    { icon:"pills",     text:"25 nøje udvalgte lægemidler fra den daglige apotekspraksis" },
    { icon:"school",    text:"Tilgængelig på dansk, engelsk, somali og arabisk" },
    { icon:"education", text:"Fagligt funderet — skrevet af en uddannet Farmakonom" },
    { icon:"work",      text:"Løbende udvidelse: antibiotika, antivirale midler, antihistaminer m.m." },
  ],
  en: [
    { icon:"pills",     text:"25 carefully selected medicines from everyday pharmacy practice" },
    { icon:"school",    text:"Available in Danish, English, Somali and Arabic" },
    { icon:"education", text:"Professionally grounded — written by a trained Pharmaconomist" },
    { icon:"work",      text:"Continuously expanding: antibiotics, antivirals, antihistamines and more" },
  ],
  so: [
    { icon:"pills",     text:"25 daawo oo si taxaddar leh loo xushay shaqada maalinlaha ah ee farmashiyaha" },
    { icon:"school",    text:"Waxaa lagu heli karaa af-Soomaali, Ingiriisi, Deenish iyo Carabi" },
    { icon:"education", text:"Waxa qoray farmashiiste xirfad leh oo si buuxda u tababaran" },
    { icon:"work",      text:"Waxaa si joogto ah loogu dari doonaa: antibiyootikada, daawooyinka fayraska, kiniinnada xasaasiyadda iwm." },
  ],
  ar: [
    { icon:"pills",     text:"25 دواءً مختاراً بعناية من الممارسة اليومية في الصيدلية" },
    { icon:"school",    text:"متاح باللغات الدنماركية والإنجليزية والصومالية والعربية" },
    { icon:"education", text:"أساس مهني متين — بقلم فارماكونوم مؤهل تأهيلاً كاملاً" },
    { icon:"work",      text:"توسع مستمر: المضادات الحيوية، مضادات الفيروسات، مضادات الهيستامين وغيرها" },
  ],
};

// ── FAQ — sharp, concise, correct Somali, bullet-style answers ─────────────
// Each answer has: intro line + bullet points (stored as array for rendering)
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
    { q:"Maxay tahay Lamotrigin, sidaana loo qaadaa?",
      bullets:["Waxaa loo isticmaalaa xanuunka faruurta (epilepsy) iyo xaalada laba-cirifoodka (bipolar disorder)","Qaado isla wakhtiga maalin kasta — cuntada la socota ama la'aanteeda, labadaba waa sax","Haddaad ka gaabisay qaadashada, qaado markii aad xasuusato — ha labanlaabinin qadarka","Ha joojin si kedis ah — la xiriir dhakhtarkaaga horta"] },
    { q:"Ma qaadan karaa Paracetamol iyo Ibuprofen isla mar?",
      bullets:["Haa — si kala duwan bay u shaqeeyaan jirka, waxaana la isku dari karaa","Paracetamol: ugu badan 2 kiniin hal mar, 8 kiniin maalintii, ugu yaraan 4–6 saacadood u dhaxaysa","Ibuprofen: ugu badan 2 kiniin hal mar, 6 kiniin maalintii, ugu yaraan 6–8 saacadood u dhaxaysa","Mar walba qaado Ibuprofen cuntada la socota — si looga ilaaliyo caloosha"] },
    { q:"Maxaan ka fogaan karaa intaan qaadanayo Marevan?",
      bullets:["Iska ilaali isbeddelada lama filaan ah ee cuntada ka kooban K-vitamiin — canabka cagaaran, isbinaashka, barootiinka iyo baarsaleeyo","Iska ilaali Ibuprofen iyo Diclofenac — waxay kordhinayaan khatarta dhiig-baxa","Xaddid khamriga","U tag baaritaanka dhiigga si joogto ah; u sheeg dhakhtarkaaga iyo dacawooyaha ilkaha"] },
    { q:"Atorvastatin goorma la qaadaa, miyaana cirishta lagu cuni karin?",
      bullets:["Waxaa lagu qaadan karaa wakht kasta maalinta — waxa muhiimsan waa in isla wakhtiga lagu qaado maalin kasta","Cuntada la socota ama la'aanteeda — labadaba waa sax","Iska ilaali tirada badan ee cirishta — waxay kordhinaysaa khatarta saameynta xumida, gaar ahaan xanuunka muruqyada"] },
    { q:"Maxay tahay Metformin, goormaana la qaadaa?",
      bullets:["Daawada sonkoraha (diabetes) oo caawin jirka inuu hoos u dhigo heerka sonkoraha dhiigga","Mar walba qaado cuntada la socota ama isla markiiba ka dib — ha qaadin calool madhan abid","Dhibaatada caloosha bilowga waa caadi ah — jiruhu caadiga ahaan wuu qabsadaa 2–4 todobaad gudahood"] },
    { q:"Maxay tahay daawooyinka dhiig-karka, sidaana Amlodipin, Losartan iyo Enalapril loo qaadaa?",
      bullets:["Waxay hoos u dhigeeyaan dhiig-karka oo ilaaliyaan wadnaha iyo xididdada dhiigga waqti ka dib","Saddadkooduba waxaa lagu qaadaa hal mar maalintii — cuntada la socota ama la'aanteeda","Qaado isla wakhtiga maalin kasta, xitaa haddaanad waxba dareensanayn — daawadu waxay wali shaqaynaysaa"] },
    { q:"Ma qaadan karaa Ibuprofen haddaan qaadanayo daawooyinka dhiig-karka?",
      bullets:["Inta badan laguma talinayo — Ibuprofen waxay daciifin kartaa daawooyinka dhiig-karka","Waxay sidoo kale culays ku saari kartaa kelyahaaga, gaar ahaan noocyada qaarkood","Isticmaal Paracetamol beddelkeeda — waa xulasho aad u ammaan ah","Mar walba weydii farmashiistaha ama dhakhtarkaaga ka hor"] },
    { q:"Maxaa dhacaya haddaan si kedis ah u joojiyaa Lamotrigin ama Sertralin?",
      bullets:["Lamotrigin: waxay kicin kartaa qodob-xanuunno, xitaa haddaad muddo dheer ahayd oo aadan qodob-xanuun lahayn","Sertralin: waxay keeni kartaa sharar, dareenkii kuleylka ah ee jirka, dhibaatada hurdada iyo isbeddelada xaaladda","Labada daawoba waa in si tartiib ah hoos loogu dhigo hagitaanka dhakhtarka — ha joojiyin si kedis ah abid"] },
    { q:"Maxaan sameeyaa haddaan qaatay Paracetamol aad u badan?",
      bullets:["Si deg-deg ah u wac Giftlinjen: 82 12 12 12 — furan 24 saacadood, bilaash ah","Wac 112 xaaladaha degdega ah","Dhaawaca beerta waxay dhici kartaa 24–72 saacadood — ha sugin calaamadaha","Qaado xirmada daawooyinka si shaqaalaha ay u ogaadaan waxa iyo tirada aad qaadatay"] },
    { q:"Ma Atorvastatin keeni kartaa xanuunka muruqyada?",
      bullets:["Haa — xanuun kala firirsan ama daciifnimo muruqyada waa saameyn xun la yaqaan","La xiriir dhakhtarkaaga haddaad dareento xanuun muruq oo joogto ah, daciifnimo muruq ama kaadi madow","Dhakhtarkaagu wuxuu qiimeyn doonaa haddii la beddelan doono qadarka ama nooca daawada"] },
    { q:"Kuma xanuun-daawooyinka ugu fiican, goormaana la doortaa mid kasta?",
      bullets:["Paracetamol: ku habboon madax-xanuunka, qandhada iyo xanuunka fudud — ammaan u ah dadka inta badan","Ibuprofen: xooggan, ku fiican xanuunka ilkaha, muruqyada iyo xubnoha — mar walba qaado cuntada la socota","Dhibaato caloosha, daawooyinka dhiig-karka ama uur? Isticmaal Paracetamol","Shaki qabto? Weydii farmashiistaha"] },
    { q:"Ma qaadan karaa daawooyin cusub oo aan qoraal u baahnayn markaan qaadanayo daawooyinkayga caadiga ah?",
      bullets:["Maaha had iyo jeer — daawooyin badan oo aan qoraal u baahnayn waxay saameyn karaan daawooyinkaaga","Tusaale ahaan, Ibuprofen waxay daciifin kartaa daawooyinka dhiig-karka","Daawooyinka dabiiciga ah qaarkood waxay saameyn karaan daawooyinka dareere-dhiigga","Mar walba weydii farmashiistaha — bilaash waa, waxayna kaa qaadanaysaa daqiiqad laba keliya"] },
  ]},
  ar: { items:[
    { q:"ما هو لاموتريجين وكيف يُؤخذ؟",
      bullets:["يُستخدم للصرع والاضطراب ثنائي القطب","تناوله في نفس الوقت يومياً — مع الطعام أو بدونه","نسيت جرعة؟ تناولها حين تتذكر — لا تُضاعف الجرعة","لا توقفه فجأة — تحدث مع طبيبك أولاً"] },
    { q:"هل يمكن تناول الباراسيتامول والإيبوبروفين معاً؟",
      bullets:["نعم — يعملان بطريقتين مختلفتين ويمكن الجمع بينهما","باراسيتامول: أقصى قرصان في المرة، 8 يومياً، 4–6 ساعات على الأقل بين الجرعات","إيبوبروفين: أقصى قرصان في المرة، 6 يومياً، 6–8 ساعات على الأقل بين الجرعات","تناول الإيبوبروفين دائماً مع الطعام لحماية المعدة"] },
    { q:"ما الذي يجب تجنبه أثناء علاج الوارفارين؟",
      bullets:["تجنّب التغيرات المفاجئة في اللفت والسبانخ والبروكلي والبقدونس (فيتامين K)","تجنّب الإيبوبروفين والديكلوفيناك — يزيدان خطر النزيف","اعتدل في الكحول","احضر فحوصات الدم بانتظام وأخبر طبيبك وطبيب الأسنان دائماً"] },
    { q:"متى يُؤخذ أتورفاستاتين وهل يمكن تناول الجريب فروت؟",
      bullets:["يمكن تناوله في أي وقت — الأهم الالتزام بنفس الوقت يومياً","مع الطعام أو بدونه — كلاهما صحيح","تجنّب كميات كبيرة من الجريب فروت — يزيد خطر الآثار الجانبية لا سيما آلام العضلات"] },
    { q:"ما هو ميتفورمين ومتى يُؤخذ؟",
      bullets:["دواء سكري موثوق يساعد على خفض مستوى السكر في الدم","تناوله دائماً مع الوجبة أو بعدها مباشرة — ليس على معدة فارغة","مشاكل المعدة في البداية طبيعية — الجسم يعتاد عادةً خلال 2–4 أسابيع"] },
    { q:"ما هي أدوية ضغط الدم وكيف يُؤخذ أملوديبين ولوسارتان وإيناليبريل؟",
      bullets:["تُخفض ضغط الدم وتحمي القلب والأوعية الدموية مع مرور الوقت","تُؤخذ الثلاثة مرة واحدة يومياً — مع الطعام أو بدونه","تناولها في نفس الوقت كل يوم، حتى لو لم تشعر بشيء"] },
    { q:"هل يمكن تناول الإيبوبروفين مع أدوية ضغط الدم؟",
      bullets:["لا يُنصح به في أغلب الحالات — قد يُضعف أدوية ضغط الدم","قد يُجهد الكلى مع بعض أنواع هذه الأدوية","استخدم الباراسيتامول بدلاً منه — أكثر أماناً","استشر الصيدلي أو طبيبك دائماً"] },
    { q:"ماذا يحدث إذا توقفت فجأة عن لاموتريجين أو سيرترالين؟",
      bullets:["لاموتريجين: قد يُسبب نوبات صرع حتى بعد فترة طويلة بلا نوبات","سيرترالين: قد يُسبب دواراً ووخزاً ومشاكل نوم وتقلبات مزاجية","يجب تخفيض كلاهما تدريجياً تحت إشراف الطبيب"] },
    { q:"ماذا أفعل إذا تناولت جرعة زائدة من الباراسيتامول؟",
      bullets:["اتصل فوراً بـ Giftlinjen: 82 12 12 12 — مفتوح 24 ساعة، مجاناً","اتصل بـ 112 في حالات الطوارئ","تلف الكبد قد يحدث خلال 24–72 ساعة — لا تنتظر الأعراض","أحضر عبوة الدواء ليعرف الكوادر الطبية ما تناولته"] },
    { q:"هل يمكن لأتورفاستاتين أن يسبب آلام عضلية؟",
      bullets:["نعم — ألم منتشر أو ضعف في العضلات من الآثار الجانبية المعروفة","تواصل مع طبيبك عند آلام مستمرة أو ضعف عضلي أو بول داكن","يمكن تعديل الجرعة أو تغيير الدواء"] },
    { q:"أي مسكن ألم هو الأفضل؟",
      bullets:["باراسيتامول: للصداع والحمى والآلام الخفيفة — آمن للغالبية","إيبوبروفين: أقوى، للأسنان والعضلات والمفاصل — مع الطعام دائماً","مشاكل معدة أو ضغط دم أو حمل؟ استخدم الباراسيتامول","في حال الشك، اسأل الصيدلي"] },
    { q:"هل يمكن تناول دواء جديد بدون وصفة مع دوائي المعتاد؟",
      bullets:["ليس دائماً — كثير من هذه الأدوية تؤثر على دوائك المعتاد","الإيبوبروفين قد يُضعف أدوية ضغط الدم","بعض الأعشاب الطبية قد تؤثر على مرقِّقات الدم","استشر الصيدلية دائماً — مجاني ولا يستغرق أكثر من دقيقتين"] },
  ]},
};

// ── Feedback data ──────────────────────────────────────────────────────────
const FEEDBACK_DATA = {
  da: { subtitle:"Din mening betyder noget. Del gerne din oplevelse med Somalimed.", praise:"Ros 👍", criticism:"Ris 👎", suggestion:"Forslag 💡", placeholder:"Skriv din besked her...", send:"Send besked", sent:"Tak for din besked! 🙏", emailLabel:"Din e-mail (valgfri)" },
  en: { subtitle:"Your opinion matters. Feel free to share your experience with Somalimed.", praise:"Praise 👍", criticism:"Criticism 👎", suggestion:"Suggestion 💡", placeholder:"Write your message here...", send:"Send message", sent:"Thank you for your message! 🙏", emailLabel:"Your email (optional)" },
  so: { subtitle:"Ra'yaagaagu waa muhiim. Nala wadaag khibradaada Somalimed.", praise:"Amaano 👍", criticism:"Dhaleeceyn 👎", suggestion:"Talooyin 💡", placeholder:"Halkan ku qor fariintaada...", send:"Dir fariinta", sent:"Mahadsanid fariintaada! 🙏", emailLabel:"Emailkaaga (ikhtiyaari)" },
  ar: { subtitle:"رأيك يهمنا. شاركنا تجربتك مع Somalimed.", praise:"إطراء 👍", criticism:"نقد 👎", suggestion:"اقتراح 💡", placeholder:"اكتب رسالتك هنا...", send:"إرسال الرسالة", sent:"شكراً على رسالتك! 🙏", emailLabel:"بريدك الإلكتروني (اختياري)" },
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

// ── Modal shell ────────────────────────────────────────────────────────────
function ModalShell({title,iconEl,onClose,children,isRtl,wide}){
  useEffect(()=>{
    const onKey=(e)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",onKey);
    document.body.style.overflow="hidden";
    return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow="";};
  },[onClose]);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",background:"rgba(0,0,0,0.52)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
      <div onClick={(e)=>e.stopPropagation()} style={{background:"#f8fafc",borderRadius:"28px",width:"100%",maxWidth:wide?"660px":"560px",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 40px 100px rgba(0,0,0,0.28)",direction:isRtl?"rtl":"ltr"}}>
        <div style={{background:"var(--heroBg)",borderRadius:"28px 28px 0 0",padding:"22px 24px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            {iconEl}
            <span style={{color:"#fff",fontWeight:800,fontSize:"17px",letterSpacing:"-0.01em"}}>{title}</span>
          </div>
          <button type="button" onClick={onClose} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",color:"#fff",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
        </div>
        <div style={{padding:"24px 24px 28px"}}>{children}</div>
      </div>
    </div>
  );
}

// ── Bullet row ─────────────────────────────────────────────────────────────
function BulletRow({bullet,palette}){
  return(
    <li style={{display:"flex",alignItems:"flex-start",gap:"14px",background:"#fff",borderRadius:"16px",padding:"13px 16px",border:`1.5px solid ${palette.color}22`,boxShadow:`0 2px 8px ${palette.color}10`}}>
      <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:46,height:46,borderRadius:"13px",flexShrink:0,background:palette.bg,border:`1.5px solid ${palette.color}30`,marginTop:"1px"}}>
        <img src={P[bullet.icon]} alt="" style={{width:28,height:28,objectFit:"contain"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
      </span>
      <span style={{fontSize:"15px",color:"#1e293b",lineHeight:1.65,fontWeight:500,paddingTop:"4px"}}>{bullet.text}</span>
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
        <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"20px",background:"#fff",borderRadius:"20px",padding:"16px 18px",border:`1.5px solid ${theme.border}`,boxShadow:`0 4px 16px ${theme.primary}15`}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{position:"absolute",inset:"-4px",borderRadius:"50%",background:"linear-gradient(135deg,#14b8a6,#38bdf8,#818cf8)",opacity:0.9,filter:"blur(2px)"}}/>
            <img src="/Ibrahim.png" alt={meMeta.name} style={{position:"relative",width:76,height:76,borderRadius:"50%",objectFit:"cover",border:"4px solid white",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}/>
          </div>
          <div>
            <p style={{fontWeight:800,fontSize:"19px",color:"#0f172a",margin:0}}>{meMeta.name}</p>
            <p style={{fontSize:"13px",color:theme.primary,margin:"4px 0 0",fontWeight:600}}>{meMeta.title}</p>
          </div>
        </div>
      )}
      {tab==="site"&&(
        <div style={{background:theme.tagBg,borderRadius:"16px",padding:"16px 20px",marginBottom:"20px",border:`1.5px solid ${theme.border}`}}>
          <p style={{fontWeight:700,fontSize:"16px",color:theme.primary,margin:0,textAlign:isRtl?"right":"left"}}>{siteTagline}</p>
        </div>
      )}
      <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:"10px"}}>
        {bullets.map((b,i)=><BulletRow key={i} bullet={b} palette={palette[i%palette.length]}/>)}
      </ul>
    </ModalShell>
  );
}

// ── Contact Modal — with chat section ─────────────────────────────────────
function ContactModal({language,onClose}){
  const isRtl=language==="ar";
  const navLabels=NAV_LABELS[language]??NAV_LABELS.so;
  const data=CONTACT_DATA[language]??CONTACT_DATA.so;
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const iconEl=<MailIcon size={22} color="rgba(255,255,255,0.95)"/>;
  return(
    <ModalShell title={navLabels.contact} iconEl={iconEl} onClose={onClose} isRtl={isRtl}>
      <p style={{fontSize:"15px",color:"#475569",lineHeight:1.7,margin:"0 0 20px",textAlign:isRtl?"right":"left"}}>{data.intro}</p>

      {/* Chat section */}
      <div style={{background:theme.tagBg,borderRadius:"18px",padding:"16px 20px",marginBottom:"16px",border:`1.5px solid ${theme.border}`,display:"flex",alignItems:"center",gap:"14px"}}>
        <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:48,height:48,borderRadius:"14px",background:theme.primary,flexShrink:0}}>
          <ChatIcon size={22} color="#fff"/>
        </span>
        <div>
          <p style={{fontWeight:700,fontSize:"15px",color:theme.primary,margin:0}}>{data.chatTitle}</p>
          <p style={{fontSize:"13px",color:"#64748b",margin:"3px 0 0",lineHeight:1.5}}>{data.chatDesc}</p>
        </div>
      </div>

      {/* Email section */}
      <p style={{fontWeight:700,fontSize:"13px",color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 10px",textAlign:isRtl?"right":"left"}}>{data.emailLabel}</p>
      <a href="mailto:Ibrahim_skb@live.dk" style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 18px",borderRadius:"16px",background:"#fff",border:`1.5px solid ${theme.border}`,textDecoration:"none",marginBottom:"20px",boxShadow:`0 2px 8px ${theme.primary}10`}}>
        <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:40,height:40,borderRadius:"10px",background:theme.primary,flexShrink:0}}>
          <MailIcon size={18} color="#fff"/>
        </span>
        <div>
          <p style={{fontWeight:700,fontSize:"15px",color:theme.primary,margin:0}}>Ibrahim_skb@live.dk</p>
          <p style={{fontSize:"12px",color:"#94a3b8",margin:"2px 0 0"}}>{data.emailNote}</p>
        </div>
      </a>

      {/* Topics */}
      <p style={{fontWeight:700,fontSize:"14px",color:"#0f172a",margin:"0 0 10px",textAlign:isRtl?"right":"left"}}>{data.responseTitle}</p>
      <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:"7px"}}>
        {data.topics.map((t,i)=>(
          <li key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",background:"#fff",borderRadius:"12px",border:"1px solid #e5e7eb",fontSize:"14px",color:"#334155",fontWeight:500}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:theme.primary,flexShrink:0}}/>
            {t}
          </li>
        ))}
      </ul>
    </ModalShell>
  );
}

// ── FAQ Modal — bullet-style answers ──────────────────────────────────────
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
            <button type="button" onClick={()=>setOpen(open===i?null:i)} style={{width:"100%",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px",padding:"15px 18px",background:"none",border:"none",cursor:"pointer",textAlign:isRtl?"right":"left"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:"12px",flex:1}}>
                <span style={{flexShrink:0,width:28,height:28,borderRadius:"50%",background:open===i?theme.primary:`${theme.primary}15`,display:"flex",alignItems:"center",justifyContent:"center",color:open===i?"#fff":theme.primary,fontSize:"13px",fontWeight:800,marginTop:"1px",transition:"all 0.2s"}}>{i+1}</span>
                <span style={{fontWeight:700,fontSize:"15px",color:open===i?theme.primary:"#0f172a",lineHeight:1.4}}>{item.q}</span>
              </div>
              <span style={{flexShrink:0,width:26,height:26,borderRadius:"50%",background:open===i?theme.primary:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",color:open===i?"#fff":theme.primary,fontSize:"17px",fontWeight:700,transition:"all 0.2s",marginTop:"1px"}}>{open===i?"−":"+"}</span>
            </button>
            {open===i&&(
              <div style={{padding:"8px 14px 16px",borderTop:`1px solid ${theme.primary}20`}}>
                <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:"8px"}}>
                  {item.bullets.map((b,bi)=>{
                    // Cycle through 4 icon styles like medicine-page
                    const iconStyles=[
                      {bg:"#dcfce7",color:"#16a34a",svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a9.9 9.9 0 0 0 2.121-.232"/><path d="M8 11h2l2 9 2.5-6.5L17 13h2"/><path d="M9 3.5A2 2 0 1 1 11 5.5"/><path d="M12 2a10 10 0 1 1 0 20"/></svg>},
                      {bg:"#dbeafe",color:"#2563eb",svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>},
                      {bg:"#fef9c3",color:"#ca8a04",svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>},
                      {bg:"#ede9fe",color:"#7c3aed",svg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M16 3 8 3"/><path d="m12 16 0 5"/></svg>},
                    ];
                    const s=iconStyles[bi%4];
                    return(
                      <li key={bi} style={{display:"flex",alignItems:"flex-start",gap:"14px",padding:"12px 14px",borderRadius:"14px",background:"#fff",border:"1px solid #f1f5f9",fontSize:"15px",color:"#334155",lineHeight:1.65,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                        <span style={{width:44,height:44,borderRadius:"50%",background:s.bg,color:s.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"1px",border:`1.5px solid ${s.color}30`}}>
                          {s.svg}
                        </span>
                        <span style={{paddingTop:"10px",fontWeight:500}}>{b}</span>
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
              <button key={key} type="button" onClick={()=>setType(key)} style={{padding:"8px 16px",borderRadius:"999px",border:"1.5px solid",fontWeight:600,fontSize:"14px",cursor:"pointer",transition:"all 0.2s",borderColor:type===key?theme.primary:"#e2e8f0",background:type===key?theme.primary:"#fff",color:type===key?"#fff":"#334155"}}>{label}</button>
            ))}
          </div>
          <textarea value={msg} onChange={(e)=>setMsg(e.target.value)} placeholder={data.placeholder} rows={4} style={{width:"100%",padding:"12px 14px",borderRadius:"14px",border:"1.5px solid #e2e8f0",fontSize:"15px",resize:"vertical",outline:"none",fontFamily:"inherit",boxSizing:"border-box",direction:isRtl?"rtl":"ltr"}}/>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder={data.emailLabel} type="email" style={{padding:"12px 14px",borderRadius:"14px",border:"1.5px solid #e2e8f0",fontSize:"14px",outline:"none",fontFamily:"inherit",direction:isRtl?"rtl":"ltr"}}/>
          <button type="button" onClick={handleSend} style={{padding:"13px",borderRadius:"14px",background:theme.primary,color:"#fff",fontWeight:700,fontSize:"15px",border:"none",cursor:"pointer",boxShadow:`0 4px 14px ${theme.primary}40`}}>{data.send}</button>
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
    {key:"faq",     iconEl:<QuestionIcon size={15} color={iconColors.faq}/>,       label:navLabels.faq},
    {key:"feedback",iconEl:<StarIcon     size={15} color={iconColors.feedback}/>,   label:navLabels.feedback},
    {key:"contact", iconEl:<MailIcon     size={15} color={iconColors.contact}/>,    label:navLabels.contact},
  ],[navLabels,iconColors]);

  return(
    <div style={{background:"var(--bg)",color:"var(--text)"}} className="min-h-screen">

      {/* ── Sticky nav ──────────────────────────────────────────────────── */}
      <div style={{background:"rgba(255,255,255,0.96)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid rgba(0,0,0,0.07)",position:"sticky",top:"58px",zIndex:90}}>
        <div style={{maxWidth:"72rem",margin:"0 auto",padding:"0 1rem",display:"flex",alignItems:"center",justifyContent:"flex-end",height:"52px",gap:"8px"}}>
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap",justifyContent:"flex-end"}}>
            {navTabs.map(({key,iconEl,label})=>{
              const active=modalTab===key;
              return(
                <button key={key} type="button" onClick={()=>setModalTab(active?null:key)} style={{display:"inline-flex",alignItems:"center",gap:"5px",padding:"7px 12px",borderRadius:"999px",border:"1.5px solid",borderColor:active?"var(--accent,#0d9488)":"#e2e8f0",background:active?"var(--accent,#0d9488)":"#fff",color:active?"#fff":"#334155",fontWeight:600,fontSize:"13px",cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap",boxShadow:active?"0 2px 12px rgba(13,148,136,0.28)":"0 1px 3px rgba(0,0,0,0.06)"}}>
                  <span style={{display:"flex",alignItems:"center"}}>{iconEl}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {(modalTab==="me"||modalTab==="site")&&<AboutModal tab={modalTab} language={language} onClose={()=>setModalTab(null)}/>}
      {modalTab==="faq"      &&<FAQModal      language={language} onClose={()=>setModalTab(null)}/>}
      {modalTab==="feedback" &&<FeedbackModal language={language} onClose={()=>setModalTab(null)}/>}
      {modalTab==="contact"  &&<ContactModal  language={language} onClose={()=>setModalTab(null)}/>}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{background:"var(--heroBg)"}}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white/90">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
            {chromeText.heroEyebrow}
          </div>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl" style={{lineHeight:1.1}}>{text.hdrTitle}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{text.hdrSubtitle}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><span className="text-lg font-black text-white">{indexData.items.length}</span>{chromeText.medicinesStat}</span>
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1.5"><span className="text-lg font-black text-white">4</span>{chromeText.languagesStat}</span>
            <span className="text-white/40">·</span>
            <span>{chromeText.heroFormatValue}</span>
          </div>
        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="reveal-on-scroll"><LanguageSelect label={text.langLabel} onChange={updateLanguage} value={language}/></div>

        <div className="reveal-on-scroll mb-6">
          <label htmlFor="medSearch" className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{color:"var(--text-muted)"}}>{chromeText.searchLabel}</span>
            <div className="group flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm transition duration-200 focus-within:-translate-y-0.5 focus-within:shadow-xl" style={{borderColor:"var(--border)"}}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{background:"var(--bg)",color:"var(--accent)"}}><SearchIcon/></span>
              <input id="medSearch" className="flex-1 bg-transparent text-base outline-none placeholder:text-slate-400" style={{color:"var(--text)"}} onChange={(e)=>setSearchTerm(e.target.value)} placeholder={chromeText.searchPlaceholder} value={searchTerm}/>
              {searchTerm?(<button type="button" className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-90" style={{background:"var(--bg)",color:"var(--text-muted)"}} onClick={()=>setSearchTerm("")}>{chromeText.clearFilters}</button>):null}
            </div>
          </label>
        </div>

        <div className="reveal-on-scroll mb-7">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest" style={{color:"var(--text-muted)"}}>{chromeText.categoryLabel}</span>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={()=>setActiveCategory("all")} style={{display:"inline-flex",alignItems:"center",gap:"8px",borderRadius:"999px",border:"1.5px solid",padding:"8px 18px",fontSize:"14px",fontWeight:600,lineHeight:1,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap",...(activeCategory==="all"?{background:"#1a1a1a",color:"#ffffff",borderColor:"#1a1a1a",boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}:{background:"var(--surface,#fff)",color:"var(--text)",borderColor:"var(--border)"})}}>
              <span style={{width:10,height:10,borderRadius:"50%",display:"inline-block",flexShrink:0,background:activeCategory==="all"?"#fff":"#888"}}/>
              {capitalize(chromeText.allCategories)}
            </button>
            {categoryPills.map(({label})=>{
              const isActive=activeCategory===label;
              const meta=getPillMeta(label);
              return(
                <button key={label} type="button" onClick={()=>setActiveCategory(isActive?"all":label)} style={{display:"inline-flex",alignItems:"center",gap:"8px",borderRadius:"999px",border:"1.5px solid",padding:"8px 18px",fontSize:"14px",fontWeight:600,lineHeight:1,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap",...(isActive?{background:meta.color,color:"#ffffff",borderColor:meta.color,boxShadow:`0 2px 12px ${meta.color}50`}:{background:meta.bg,color:meta.color,borderColor:`${meta.color}40`})}}>
                  <img src={`${ICON_BASE}${meta.icon}`} alt="" style={{width:22,height:22,objectFit:"contain",flexShrink:0,filter:isActive?"brightness(0) invert(1)":"none",mixBlendMode:isActive?"normal":"multiply"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
                  {capitalize(label)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="reveal-on-scroll mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest" style={{color:"var(--text-muted)"}}>{chromeText.libraryEyebrow}</p>
            <h2 className="text-2xl font-extrabold" style={{color:"var(--text)"}}>{text.pickTitle}</h2>
          </div>
          {filteredItems.length>0&&<span className="shrink-0 text-sm" style={{color:"var(--text-muted)"}}>{filteredItems.length} {chromeText.medicinesStat.toLowerCase()}</span>}
        </div>

        {filteredItems.length?(
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item,index)=>{
              const subtitle=indexData.subtitles[item.slug]?.[language]||indexData.subtitles[item.slug]?.so||"";
              const style=SLUG_STYLE[item.slug]||DEFAULT_STYLE;
              const iconFile=SLUG_ICON[item.slug]||"download.png";
              const displayName=getDisplayName(item.slug,language,item.name);
              return(
                <li className="reveal-on-scroll" key={item.slug} style={{transitionDelay:`${Math.min(index*40,200)}ms`}}>
                  <Link className="group flex h-full overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{borderColor:"var(--border)"}} href={{pathname:`/${item.href}`,query:{lang:language}}}>
                    <div className="w-1.5 shrink-0" style={{background:style.color}}/>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex shrink-0 items-center justify-center rounded-2xl border shadow-[0_10px_24px_rgba(15,23,42,0.08)]" style={{width:64,height:64,background:style.bg,borderColor:`${style.color}22`}}>
                          <img src={`${ICON_BASE}${iconFile}`} alt="" style={{width:44,height:44,objectFit:"contain",mixBlendMode:"multiply"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
                        </span>
                        <span className="rounded-full font-semibold" style={{background:style.bg,color:style.color,fontSize:"15px",padding:"7px 15px"}}>
                          {capitalize(subtitle)||capitalize(chromeText.medicinePill)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-bold" style={{color:"var(--text)"}}>{displayName}</h3>
                      <div className="mt-auto flex items-center justify-between border-t pt-4" style={{borderColor:"var(--border)",marginTop:"1rem"}}>
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
          <section className="reveal-on-scroll rounded-2xl border bg-white px-8 py-12 text-center" style={{borderColor:"var(--border)"}}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{background:"var(--bg)"}}><SearchIcon/></div>
            <h3 className="text-xl font-bold" style={{color:"var(--text)"}}>{chromeText.noResultsTitle}</h3>
            <p className="mt-2" style={{color:"var(--text-muted)"}}>{chromeText.noResultsBody}</p>
          </section>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mx-auto max-w-6xl px-4 pb-14 pt-4">
        <div className="rounded-3xl border bg-white px-6 py-6 shadow-sm" style={{borderColor:"var(--border)"}}>
          <div className="flex items-start gap-4">
            <div style={{marginTop:"2px",display:"flex",height:48,width:48,flexShrink:0,alignItems:"center",justifyContent:"center",borderRadius:"14px",background:"var(--bg)",color:"var(--accent)"}}><ShieldIcon/></div>
            <div className="min-w-0">
              <strong style={{display:"block",fontSize:"16px",fontWeight:700,color:"var(--text)"}}>{text.footerStrong}</strong>
              {text.footer1&&<p style={{marginTop:"10px",fontSize:"15px",lineHeight:"1.75",color:"var(--text-muted)"}}>{text.footer1}</p>}
              {text.footer2&&<p style={{marginTop:"14px",fontSize:"15px",fontWeight:600,color:"var(--text-muted)"}}>{text.footer2}</p>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
