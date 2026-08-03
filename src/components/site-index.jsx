"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useLanguageRouting } from "../hooks/use-language-routing";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import { applyLanguageToDocument } from "../lib/language";
import { getIndexData, getDisplayName, uiText } from "../lib/site";
import { ModalShell, LANG_THEME } from "./modal-shell";
import { MyListModal } from "./my-list-modal";
import { PharmacyFinderModal } from "./pharmacy-finder-modal";
import { getLastRevisedText } from "../lib/last-revised";
import { VoiceSearchButton } from "./voice-search-button";

const indexData = getIndexData();

const ICON_BASE = "/icons/";
const P = {
  school:    "/icons/school.png",
  work:      "/icons/work.png",
  education: "/icons/education.png",
  pills:     "/icons/pills.png",
};

// ── Nav labels ─────────────────────────────────────────────────────────────
const NAV_LABELS = {
  da: { aboutMe:"Om mig", aboutSite:"Om Somalimed", faq:"Ofte stillede spørgsmål", feedback:"Feedback", contact:"Kontakt", tpi:"Inhalationsteknik" },
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
// ── Color themes ───────────────────────────────────────────────────────────
const BULLET_PALETTES = {
  so: [{color:"#0b7e74",bg:"#F0FDFA"},{color:"#048059",bg:"#ECFDF5"},{color:"#0F766E",bg:"#CCFBF1"},{color:"#0277b3",bg:"#F0F9FF"}],
  da: [{color:"#2563EB",bg:"#EFF6FF"},{color:"#1D4ED8",bg:"#DBEAFE"},{color:"#3B82F6",bg:"#EFF6FF"},{color:"#0277b3",bg:"#F0F9FF"}],
  en: [{color:"#92400E",bg:"#FEF3C7"},{color:"#B45309",bg:"#FEF9EE"},{color:"#C2410C",bg:"#FFF7ED"},{color:"#d12424",bg:"#FEF2F2"}],
  ar: [{color:"#ae5f05",bg:"#FFFBEB"},{color:"#B45309",bg:"#FEF3C7"},{color:"#EA580C",bg:"#FFF7ED"},{color:"#9f6707",bg:"#FFFBEB"}],
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
    responseTitle: "Du kan f.eks. skrive om:",
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
    { icon:"pills",     text:"25 nøje udvalgte lægemidler fra apotekets hverdag — dem jeg oftest møder i skranken og rådgiver om" },
    { icon:"school",    text:"Tilgængelig på dansk, engelsk, somalisk og arabisk" },
    { icon:"education", text:"Fagligt funderet og formidlet i et klart og trygt sprog — skrevet af en uddannet farmakonom" },
    { icon:"work",      text:"Udvides løbende med flere lægemidler og emner fra den daglige rådgivning på apoteket" },
  ],
  en: [
    { icon:"pills",     text:"25 carefully selected medicines from everyday pharmacy practice — the ones I most often see at the counter and advise on" },
    { icon:"school",    text:"Available in Danish, English, Somali and Arabic" },
    { icon:"education", text:"Professionally grounded and written in clear, reassuring language by a trained pharmaconomist" },
    { icon:"work",      text:"Continuously expanded with more medicines and topics from everyday counselling in the pharmacy" },
  ],
  so: [
    { icon:"pills",     text:"25 daawo oo si taxaddar leh loo xulay — kuwa aan inta badan ku arko farmashiyaha oo aan talo ka bixiyo" },
    { icon:"school",    text:"Waxaa lagu heli karaa Af-Soomaali, Af-Ingiriis, Af-Deenish iyo Af-Caraabi" },
    { icon:"education", text:"Waxay ku dhisan tahay aqoon xirfadeed, waxaana lagu qoray si cad oo kalsooni leh" },
    { icon:"work",      text:"Si joogto ah ayaa loogu kordhinayaa daawooyin iyo mawduucyo kale oo ka soo baxay la-talinta maalinlaha ah ee farmashiyaha" },
  ],
  ar: [
    { icon:"pills",     text:"25 دواء تم اختيارها بعناية — من الأدوية التي أراها يوميا في الصيدلية وأقدم بشأنها المشورة" },
    { icon:"school",    text:"متوفرة بالدنماركية والإنجليزية والصومالية والعربية" },
    { icon:"education", text:"محتوى مهني موثوق، مكتوب بلغة واضحة ومطمئنة" },
    { icon:"work",      text:"يتم توسيع المحتوى باستمرار ليشمل مزيدا من الأدوية والموضوعات من واقع الاستشارة اليومية في الصيدلية" },
  ],
};

// ── Revision date ──────────────────────────────────────────────────────────
const QUALITY_NOTE = {
  da: "Denne side gennemgås og opdateres løbende for at rette fejl og mangler.",
  en: "This site is continuously reviewed and updated to correct errors and gaps.",
  so: "Boggan waa la dib-eegaa oo la cusboonaysiiyaa si joogto ah si loo saxo khaladaad iyo waxa maqan.",
  ar: "تتم مراجعة هذا الموقع وتحديثه باستمرار لتصحيح الأخطاء والنواقص.",
};

function ShieldCheckIcon({ size = 14, color = "#94a3b8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

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
      bullets:["Ikke nødvendigvis — mange håndkøbsmediciner påvirker din faste medicin","Ibuprofen kan f.eks. svække blodtryksmedicin","Naturlægemidler kan påvirke blodfortyndende medicin","Spørg altid på apoteket — det er gratis og tager 2 minutter"] },
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
    { q:"What is blood pressure medicine, and how are Amlodipine, Losartan and Enalapril taken?",
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
      bullets:["Waxay hoos u dhigaan dhiig-karka, waxayna muddo dheer ilaaliyaan wadnaha iyo xididdada dhiigga.","Saddexdaba hal mar ayaa la qaataa maalin kasta.","Daawadan waxaa la qaatan karaa adigoon cunto cunin ama adigoo cunto la qaadanaya.","Ku qaado wakhti isku mid ah maalin kasta, xitaa haddii aadan wax calaamado ah dareemayn."] },
    { q:"Ma qaadan karaa Ibuprofen haddii aan qaadanayo daawada dhiig-karka?",
      bullets:["Inta badan laguma taliyo — Ibuprofen waxay daciifin kartaa saameynta daawada dhiig-karka.","Waxay sidoo kale culays saari kartaa kelyaha, gaar ahaan noocyo ka mid ah daawooyinka dhiig-karka.","Paracetamol ayaa badanaa ka ammaan badan.","Mar walba la tasho farmashiyaha ama dhakhtarkaaga."] },
    { q:"Maxaa dhici kara haddii aan si kedis ah u joojiyo Lamotrigin ama Sertralin?",
      bullets:["Lamotrigin: waxay keeni kartaa in suuxdintu dib u soo noqoto, xitaa haddii aad muddo dheer fiicnayd.","Sertralin: waxay keeni kartaa dawakh, dareen mudid ama gubasho ah, hurdo-xumo iyo isbeddel niyadeed.","Labadan daawo waa in si tartiib tartiib ah loo yareeyaa, iyadoo uu dhakhtar hagayo."] },
    { q:"Maxaan sameeyaa haddii aan qaatay Paracetamol ka badan intii la rabay?",
      bullets:["Isla markiiba wac Giftlinjen: 82 12 12 12 — waxay furan tahay 24 saacadood, waana bilaash.","Wac 112 haddii ay xaaladdu degdeg tahay.","Dhaawaca beerka wuxuu soo bixi karaa 24 ilaa 72 saacadood gudahood — ha sugin calaamadaha.","Qaado baakadka daawada si shaqaalaha caafimaadku u arkaan waxa aad qaadatay."] },
    { q:"Atorvastatin ma keeni kartaa murqo-xanuun?",
      bullets:["Haa — murqo-xanuun ama murqo-daciifnimo waa waxyeello la yaqaan.","La xiriir dhakhtarkaaga haddii murqo-xanuunku sii socdo, aad dareento murqo-daciifnimo ama kaadidu noqoto madow.","Dhakhtarkaagu wuxuu beddeli karaa qiyaasta ama nooca daawada."] },
    { q:"Daawada xanuun-baabi'iyaha ah kee fiican?",
      bullets:["Paracetamol: waxay ku fiican tahay madax-xanuun, qandho iyo xanuun fudud — dad badan ayay ammaan u tahay.","Ibuprofen: way ka xoog badan tahay, waxayna ku fiican tahay ilko-xanuun, murqo-xanuun iyo kala-goysyo xanuunaya — ku qaado cunto.","Haddii aad leedahay dhibaato caloosha ah, aad qaadato daawo dhiig-kar ama aad uur leedahay, Paracetamol ayaa badanaa ka habboon.","Haddii aad shaki qabto, weydii farmashiyaha."] },
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
  da: { formTitle:"Send mig ris, ros eller forslag", subtitle:"Din mening betyder noget. Del gerne din oplevelse med Somalimed.", praise:"Ros 👍", criticism:"Ris 👎", suggestion:"Forslag 💡", placeholder:"Skriv din besked her...", send:"Send besked", sent:"Tak for din besked! 🙏", nameLabel:"Dit navn", cityLabel:"Din by", emailLabel:"Din e-mail (valgfri)", phoneLabel:"Telefonnummer (valgfri)", requiredHint:"* skal udfyldes" },
  en: { formTitle:"Send me praise, criticism or suggestions", subtitle:"Your opinion matters. Feel free to share your experience with Somalimed.", praise:"Praise 👍", criticism:"Criticism 👎", suggestion:"Suggestion 💡", placeholder:"Write your message here...", send:"Send message", sent:"Thank you for your message! 🙏", nameLabel:"Your name", cityLabel:"Your city", emailLabel:"Your email (optional)", phoneLabel:"Phone number (optional)", requiredHint:"* required" },
  so: { formTitle:"Ii dir amaano, dhaleeceyn ama talo", subtitle:"Ra'yaagaagu waa muhiim. Ila wadaag khibradaada Somalimed.", praise:"Amaano 👍", criticism:"Dhaleeceyn 👎", suggestion:"Talooyin 💡", placeholder:"Halkan ku qor fariintaada...", send:"Dir fariinta", sent:"Mahadsanid fariintaada! 🙏", nameLabel:"Magacaaga", cityLabel:"Magaalada aad ku nooshahay", emailLabel:"Emailkaaga (ikhtiyaari)", phoneLabel:"Lambarka taleefanka (ikhtiyaari)", requiredHint:"* waa lagama maarmaan" },
  ar: { formTitle:"أرسل لي إطراءً أو نقدًا أو اقتراحًا", subtitle:"رأيك يهمني. شاركني تجربتك مع Somalimed.", praise:"إطراء 👍", criticism:"نقد 👎", suggestion:"اقتراح 💡", placeholder:"اكتب رسالتك هنا...", send:"إرسال الرسالة", sent:"شكرا على رسالتك! 🙏", nameLabel:"اسمك", cityLabel:"مدينتك", emailLabel:"بريدك الإلكتروني (اختياري)", phoneLabel:"رقم الهاتف (اختياري)", requiredHint:"* مطلوب" },
};

const LEGAL_LABELS = {
  da: { cookie: "Cookiepolitik", privacy: "Persondatapolitik" },
  en: { cookie: "Cookie Policy", privacy: "Privacy Policy" },
  so: { cookie: "Siyaasadda Cookies", privacy: "Siyaasadda Xogta Shakhsiga" },
  ar: { cookie: "سياسة ملفات تعريف الارتباط", privacy: "سياسة الخصوصية" },
};

// ── Medicine maps ──────────────────────────────────────────────────────────
const SLUG_ICON={amlodipin:"blood-pressure.png",enalapril:"blood-pressure.png",losartan:"blood-pressure.png",metoprolol:"blood-pressure.png",eliquis:"line.png",marevan:"line.png",xarelto:"line.png",hjertemagnyl:"line.png",atorvastatin:"cholesterol.png",metformin:"blood-test.png",insulin:"blood-test.png",ventoline:"lungs.png",symbicort:"lungs.png",sertralin:"mental-health.png",quetiapin:"mental-health.png",lamotrigin:"brain.png",melatonin:"nighttime.png",zopiclon:"nighttime.png",paracetamol:"download.png",ibuprofen:"download.png",diclofenac:"download.png",naproxen:"download.png",morfin_tablet:"download.png",morfin_injektion:"download.png",pantoprazol:"stomach.png"};
const SLUG_STYLE={amlodipin:{color:"#d12424",bg:"#FEF2F2"},enalapril:{color:"#d12424",bg:"#FEF2F2"},losartan:{color:"#d12424",bg:"#FEF2F2"},metoprolol:{color:"#d61c44",bg:"#FFF1F2"},eliquis:{color:"#7C3AED",bg:"#F5F3FF"},marevan:{color:"#7C3AED",bg:"#F5F3FF"},xarelto:{color:"#7C3AED",bg:"#F5F3FF"},hjertemagnyl:{color:"#6D28D9",bg:"#EDE9FE"},atorvastatin:{color:"#ae5f05",bg:"#FFFBEB"},metformin:{color:"#0277b3",bg:"#F0F9FF"},insulin:{color:"#0277b3",bg:"#F0F9FF"},ventoline:{color:"#0b7e74",bg:"#F0FDFA"},symbicort:{color:"#0b7e74",bg:"#F0FDFA"},sertralin:{color:"#7d53dd",bg:"#F5F3FF"},quetiapin:{color:"#8f48d2",bg:"#FAF5FF"},lamotrigin:{color:"#7C3AED",bg:"#F5F3FF"},melatonin:{color:"#4F46E5",bg:"#EEF2FF"},zopiclon:{color:"#595cd9",bg:"#EEF2FF"},paracetamol:{color:"#9f6707",bg:"#FFFBEB"},ibuprofen:{color:"#cb3a3a",bg:"#FEF2F2"},diclofenac:{color:"#cb3a3a",bg:"#FEF2F2"},naproxen:{color:"#cb3a3a",bg:"#FEF2F2"},morfin_tablet:{color:"#048059",bg:"#ECFDF5"},morfin_injektion:{color:"#048059",bg:"#ECFDF5"},pantoprazol:{color:"#0b825a",bg:"#ECFDF5"}};
const DEFAULT_STYLE={color:"#0b7e74",bg:"#F0FDFA"};
const CATEGORY_PILL_ICON={"forhøjet blodtryk":{icon:"blood-pressure.png",color:"#d12424",bg:"#FEF2F2"},"blodtryk & hjertebanken":{icon:"blood-pressure.png",color:"#d61c44",bg:"#FFF1F2"},"blodfortyndende":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"blodpropforebyggelse":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"kolesterol":{icon:"cholesterol.png",color:"#ae5f05",bg:"#FFFBEB"},"diabetes":{icon:"blood-test.png",color:"#0277b3",bg:"#F0F9FF"},"astma":{icon:"lungs.png",color:"#0b7e74",bg:"#F0FDFA"},"depression & angst":{icon:"mental-health.png",color:"#7d53dd",bg:"#F5F3FF"},"psykose & bipolar":{icon:"mental-health.png",color:"#8f48d2",bg:"#FAF5FF"},"epilepsi & bipolar":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"søvn":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"søvnløshed":{icon:"nighttime.png",color:"#595cd9",bg:"#EEF2FF"},"smertestillende":{icon:"download.png",color:"#048059",bg:"#ECFDF5"},"smerter og feber":{icon:"download.png",color:"#9f6707",bg:"#FFFBEB"},"smerter og betændelse":{icon:"download.png",color:"#cb3a3a",bg:"#FEF2F2"},"mavesyre og halsbrand":{icon:"stomach.png",color:"#0b825a",bg:"#ECFDF5"},"dhiig-karka":{icon:"blood-pressure.png",color:"#d12424",bg:"#FEF2F2"},"dhiig-karka & wadne garaac":{icon:"blood-pressure.png",color:"#d61c44",bg:"#FFF1F2"},"dhiig-khafiifiye":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"dhiig-xinjir ka hortag":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"kolestarool":{icon:"cholesterol.png",color:"#ae5f05",bg:"#FFFBEB"},"sonkoroow":{icon:"blood-test.png",color:"#0277b3",bg:"#F0F9FF"},"neef-mareenka":{icon:"lungs.png",color:"#0b7e74",bg:"#F0FDFA"},"niyad-jab & welwel":{icon:"mental-health.png",color:"#7d53dd",bg:"#F5F3FF"},"cilad dhimirka & laba-cirifood":{icon:"mental-health.png",color:"#8f48d2",bg:"#FAF5FF"},"suuxdin & laba-cirifood":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"hurdo":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"hurdo la'aan":{icon:"nighttime.png",color:"#595cd9",bg:"#EEF2FF"},"xanuun baabi'iye":{icon:"download.png",color:"#048059",bg:"#ECFDF5"},"xanuun & qandho":{icon:"download.png",color:"#9f6707",bg:"#FFFBEB"},"xanuun & barar":{icon:"download.png",color:"#cb3a3a",bg:"#FEF2F2"},"gaastriga iyo laab-jeexa":{icon:"stomach.png",color:"#0b825a",bg:"#ECFDF5"},"high blood pressure":{icon:"blood-pressure.png",color:"#d12424",bg:"#FEF2F2"},"blood pressure & palpitations":{icon:"blood-pressure.png",color:"#d61c44",bg:"#FFF1F2"},"blood thinner":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"blood clot prevention":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"cholesterol":{icon:"cholesterol.png",color:"#ae5f05",bg:"#FFFBEB"},"asthma":{icon:"lungs.png",color:"#0b7e74",bg:"#F0FDFA"},"depression & anxiety":{icon:"mental-health.png",color:"#7d53dd",bg:"#F5F3FF"},"psychosis & bipolar":{icon:"mental-health.png",color:"#8f48d2",bg:"#FAF5FF"},"epilepsy & bipolar":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"sleep":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"insomnia":{icon:"nighttime.png",color:"#595cd9",bg:"#EEF2FF"},"pain relief":{icon:"download.png",color:"#048059",bg:"#ECFDF5"},"pain and fever":{icon:"download.png",color:"#9f6707",bg:"#FFFBEB"},"pain and inflammation":{icon:"download.png",color:"#cb3a3a",bg:"#FEF2F2"},"stomach acid and heartburn":{icon:"stomach.png",color:"#0b825a",bg:"#ECFDF5"},"ارتفاع ضغط الدم":{icon:"blood-pressure.png",color:"#d12424",bg:"#FEF2F2"},"ضغط الدم وخفقان القلب":{icon:"blood-pressure.png",color:"#d61c44",bg:"#FFF1F2"},"مميع للدم":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"الوقاية من الجلطات":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"الكوليسترول":{icon:"cholesterol.png",color:"#ae5f05",bg:"#FFFBEB"},"السكري":{icon:"blood-test.png",color:"#0277b3",bg:"#F0F9FF"},"الربو":{icon:"lungs.png",color:"#0b7e74",bg:"#F0FDFA"},"الاكتئاب والقلق":{icon:"mental-health.png",color:"#7d53dd",bg:"#F5F3FF"},"الذهان وثنائي القطب":{icon:"mental-health.png",color:"#8f48d2",bg:"#FAF5FF"},"الصرع وثنائي القطب":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"النوم":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"الأرق":{icon:"nighttime.png",color:"#595cd9",bg:"#EEF2FF"},"مسكن ألم":{icon:"download.png",color:"#048059",bg:"#ECFDF5"},"ألم وحمى":{icon:"download.png",color:"#9f6707",bg:"#FFFBEB"},"ألم والتهاب":{icon:"download.png",color:"#cb3a3a",bg:"#FEF2F2"},"حموضة المعدة وحرقة المعدة":{icon:"stomach.png",color:"#0b825a",bg:"#ECFDF5"}};

function getPillMeta(l){return CATEGORY_PILL_ICON[l]||{icon:"download.png",color:"#0b7e74",bg:"#F0FDFA"};}
function capitalize(s){if(!s)return s;return s.charAt(0).toUpperCase()+s.slice(1);}
function buildCategoryPills(language){const seen=new Set(),pills=[];for(const item of indexData.items){const label=indexData.subtitles[item.slug]?.[language]||indexData.subtitles[item.slug]?.so||"";if(!label||seen.has(label))continue;seen.add(label);pills.push({label,language});}return pills;}

// ── SVG Icons ──────────────────────────────────────────────────────────────
function SearchIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7.5"/><path d="m20 20-4.2-4.2"/></svg>);}
function ShieldIcon(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>);}
function MailIcon({size=18,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);}
function QuestionIcon({size=16,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>);}
function ChatIcon({size=18,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);}


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
  const fb=FEEDBACK_DATA[language]??FEEDBACK_DATA.so;
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const iconEl=<MailIcon size={22} color="rgba(255,255,255,0.95)"/>;
  const nameId=useId();
  const cityId=useId();

  const[type,setType]=useState("praise");
  const[name,setName]=useState("");
  const[city,setCity]=useState("");
  const[email,setEmail]=useState("");
  const[phone,setPhone]=useState("");
  const[msg,setMsg]=useState("");
  const[sent,setSent]=useState(false);
  const[showErrors,setShowErrors]=useState(false);

  const nameMissing=!name.trim();
  const cityMissing=!city.trim();

  const handleSend=()=>{
    if(nameMissing||cityMissing||!msg.trim()){setShowErrors(true);return;}
    const subject=encodeURIComponent(`[Somalimed ${fb[type]||type}]`);
    const lines=[
      `${fb.nameLabel}: ${name}`,
      `${fb.cityLabel}: ${city}`,
      email?`${fb.emailLabel}: ${email}`:null,
      phone?`${fb.phoneLabel}: ${phone}`:null,
      "",
      msg,
    ].filter(Boolean);
    const body=encodeURIComponent(lines.join("\n"));
    window.open(`mailto:Ibrahim_skb@live.dk?subject=${subject}&body=${body}`);
    setSent(true);
  };

  const inputStyle=(missing)=>({
    padding:"12px 14px",borderRadius:"14px",fontSize:"16px",outline:"none",fontFamily:"inherit",
    border:`1.5px solid ${missing&&showErrors?"#ef4444":"#e2e8f0"}`,
    direction:isRtl?"rtl":"ltr",minHeight:"48px",width:"100%",boxSizing:"border-box",
  });

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
      <ul style={{listStyle:"none",padding:0,margin:"0 0 22px",display:"flex",flexDirection:"column",gap:"7px"}}>
        {data.topics.map((t,i)=>(
          <li key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 14px",background:"#fff",borderRadius:"12px",border:"1px solid #e5e7eb",fontSize:"14px",color:"#334155",fontWeight:500}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:theme.primary,flexShrink:0}}/>
            {t}
          </li>
        ))}
      </ul>

      {/* Feedback form (Ris/Ros/Forslag) */}
      <div style={{borderTop:"1.5px solid #e5e7eb",paddingTop:"20px"}}>
        {sent?(
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>🙏</div>
            <p style={{fontWeight:700,fontSize:"16px",color:"#0f172a"}}>{fb.sent}</p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <p style={{fontWeight:700,fontSize:"14px",color:"#0f172a",margin:0,textAlign:isRtl?"right":"left"}}>{fb.formTitle}</p>
            <p style={{fontSize:"13px",color:"#64748b",margin:0,textAlign:isRtl?"right":"left"}}>{fb.subtitle}</p>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {[["praise",fb.praise],["criticism",fb.criticism],["suggestion",fb.suggestion]].map(([key,label])=>(
                <button key={key} type="button" onClick={()=>setType(key)} aria-pressed={type===key} style={{padding:"10px 18px",borderRadius:"999px",border:"1.5px solid",fontWeight:600,fontSize:"14px",cursor:"pointer",transition:"all 0.2s",borderColor:type===key?theme.primary:"#e2e8f0",background:type===key?theme.primary:"#fff",color:type===key?"#fff":"#334155",minHeight:"44px"}}>{label}</button>
              ))}
            </div>
            <div>
              <label htmlFor={nameId} style={{display:"block",fontSize:"12.5px",fontWeight:600,color:"#475569",marginBottom:"5px",textAlign:isRtl?"right":"left"}}>
                {fb.nameLabel} <span style={{color:"#cb3a3a"}}>*</span>
              </label>
              <input id={nameId} value={name} onChange={(e)=>setName(e.target.value)} style={inputStyle(nameMissing)}/>
            </div>
            <div>
              <label htmlFor={cityId} style={{display:"block",fontSize:"12.5px",fontWeight:600,color:"#475569",marginBottom:"5px",textAlign:isRtl?"right":"left"}}>
                {fb.cityLabel} <span style={{color:"#cb3a3a"}}>*</span>
              </label>
              <input id={cityId} value={city} onChange={(e)=>setCity(e.target.value)} style={inputStyle(cityMissing)}/>
            </div>
            <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder={fb.emailLabel} type="email" style={{...inputStyle(false),flex:"1 1 160px"}}/>
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder={fb.phoneLabel} type="tel" style={{...inputStyle(false),flex:"1 1 160px"}}/>
            </div>
            <textarea value={msg} onChange={(e)=>setMsg(e.target.value)} placeholder={fb.placeholder} rows={4} style={{...inputStyle(showErrors&&!msg.trim()),resize:"vertical"}}/>
            {showErrors&&(nameMissing||cityMissing||!msg.trim())&&(
              <p style={{fontSize:"12.5px",color:"#cb3a3a",margin:0,textAlign:isRtl?"right":"left"}}>{fb.requiredHint}</p>
            )}
            <button type="button" onClick={handleSend} style={{padding:"15px",borderRadius:"14px",background:theme.primary,color:"#fff",fontWeight:700,fontSize:"16px",border:"none",cursor:"pointer",boxShadow:`0 4px 14px ${theme.primary}40`,minHeight:"52px"}}>{fb.send}</button>
          </div>
        )}
      </div>
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
            <button type="button" onClick={()=>setOpen(open===i?null:i)} aria-expanded={open===i} style={{width:"100%",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"10px",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",textAlign:isRtl?"right":"left",minHeight:"52px"}}>
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

// ── Video Guide Component ──────────────────────────────────────────────────
const PLAY_LABEL = { so: "Daawo fiidiyaha", da: "Afspil video", en: "Play video", ar: "شغّل الفيديو" };

function VideoPlayer({ src, language }) {
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  }, [src]);

  function handlePlay() {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <div
      style={{ position:"relative", borderRadius:"14px", overflow:"hidden", background:"#0f172a", aspectRatio:"16/9" }}
    >
      <video
        ref={videoRef}
        src={src}
        controls={playing}
        playsInline
        preload="none"
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{ width:"100%", height:"100%", display:"block", objectFit:"contain" }}
      />
      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={PLAY_LABEL[language] ?? PLAY_LABEL.so}
          style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.25)", border:"none", padding:0, cursor:"pointer" }}
        >
          <span style={{
            width:72, height:72, borderRadius:"50%",
            background:"var(--heroBg,#0D9488)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
            transform: hovered ? "scale(1.12)" : "scale(1)",
            transition:"transform 0.2s ease",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style={{ marginLeft:"4px" }}>
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

function VideoGuide({ chromeText, language }) {
  const [activeTab, setActiveTab] = useState("so");
  const isRtl = language === "ar";

  const tabs = [
    { key:"so", label: chromeText.videoTabSo, src:"/guide-so.mp4" },
    { key:"da", label: chromeText.videoTabDa, src:"/guide-da.mp4" },
    { key:"en", label: chromeText.videoTabEn, src:"/guide-en.mp4" },
    { key:"ar", label: chromeText.videoTabAr, src:"/guide-ar.mp4" },
  ];

  const activeVideo = tabs.find(t => t.key === activeTab);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-2">
      <div className="reveal-on-scroll rounded-3xl border bg-white overflow-hidden" style={{ borderColor:"var(--border)", boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>

        {/* Header */}
        <div className="px-5 pt-6 pb-4 sm:px-8 sm:pt-7" style={{ direction: isRtl ? "rtl" : "ltr" }}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color:"var(--text-muted)" }}>{chromeText.videoEyebrow}</p>
          <h2 className="text-xl font-extrabold sm:text-2xl" style={{ color:"var(--text)" }}>{chromeText.videoTitle}</h2>
          <p className="mt-1 text-sm leading-6" style={{ color:"var(--text-muted)" }}>{chromeText.videoSubtitle}</p>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-4 sm:px-8 overflow-x-auto" style={{ direction: isRtl ? "rtl" : "ltr", WebkitOverflowScrolling: "touch" }}>
          <div className="inline-flex gap-2 rounded-2xl p-1" style={{ background:"var(--bg)" }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={isActive}
                  style={{
                    padding:"9px 20px", borderRadius:"14px", border:"none",
                    fontSize:"14px", fontWeight:700, cursor:"pointer",
                    transition:"all 0.2s ease",
                    background: isActive ? "var(--heroBg,#0D9488)" : "transparent",
                    color: isActive ? "#fff" : "var(--text-muted)",
                    boxShadow: isActive ? "0 2px 12px rgba(13,148,136,0.35)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video */}
        <div className="px-5 pb-6 sm:px-8 sm:pb-7">
          <VideoPlayer src={activeVideo.src} language={language} />
        </div>

      </div>
    </div>
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

  // Logger søgeord der giver 0 resultater til GA4, så det kan ses i dashboardet
  // hvilken medicin folk leder efter, som endnu ikke er på siden. Debounced, så
  // det kun logges når brugeren er holdt op med at skrive (ikke pr. tastetryk),
  // og kun når "Alle" kategorier er valgt (ellers er 0 resultater bare et
  // kategori-filter, ikke et reelt hul i indholdet).
  useEffect(() => {
    const query = searchTerm.trim();
    if (!query || query.length < 2 || activeCategory !== "all" || filteredItems.length > 0) return;
    const handle = setTimeout(() => {
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "search_no_results", { search_term: query.toLowerCase() });
      }
    }, 1200);
    return () => clearTimeout(handle);
  }, [searchTerm, activeCategory, filteredItems.length]);

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
      {modalTab==="contact"  &&<ContactModal  language={language} onClose={()=>setModalTab(null)}/>}
      {modalTab==="mylist"   &&<MyListModal   language={language} onClose={()=>setModalTab(null)}/>}
      {modalTab==="findPharmacy" &&<PharmacyFinderModal language={language} onClose={()=>setModalTab(null)}/>}

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

      {/* ── Video Guide ──────────────────────────────────────────────────── */}
      <VideoGuide chromeText={chromeText} language={language} />

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:pt-8">
        <div className="reveal-on-scroll mb-5 sm:mb-6">
          <label htmlFor="medSearch" className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{color:"var(--text-muted)"}}>{chromeText.searchLabel}</span>
            <div className="group flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm transition duration-200 focus-within:-translate-y-0.5 focus-within:shadow-xl" style={{borderColor:"var(--border)"}}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{background:"var(--bg)",color:"var(--accent)"}}><SearchIcon/></span>
              <input id="medSearch" className="flex-1 bg-transparent outline-none placeholder:text-slate-400" style={{color:"var(--text)",fontSize:"16px"}} onChange={(e)=>setSearchTerm(e.target.value)} placeholder={chromeText.searchPlaceholder} value={searchTerm}/>
              <VoiceSearchButton language={language} onResult={(transcript)=>setSearchTerm(transcript)} text={chromeText} />
              {searchTerm?(<button type="button" className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-90" style={{background:"var(--bg)",color:"var(--text-muted)",minHeight:"36px"}} onClick={()=>setSearchTerm("")}>{chromeText.clearFilters}</button>):null}
            </div>
          </label>
        </div>

        <div className="reveal-on-scroll mb-6 sm:mb-7">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest" style={{color:"var(--text-muted)"}}>{chromeText.categoryLabel}</span>
          <div className="flex gap-2.5 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0" style={{scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
            <button type="button" onClick={()=>setActiveCategory("all")} aria-pressed={activeCategory==="all"} style={{display:"inline-flex",alignItems:"center",gap:"8px",borderRadius:"999px",border:"1.5px solid",padding:"9px 18px",fontSize:"14px",fontWeight:600,lineHeight:1,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap",flexShrink:0,minHeight:"44px",...(activeCategory==="all"?{background:"#1a1a1a",color:"#ffffff",borderColor:"#1a1a1a",boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}:{background:"var(--surface,#fff)",color:"var(--text)",borderColor:"var(--border)"})}}>
              <span style={{width:10,height:10,borderRadius:"50%",display:"inline-block",flexShrink:0,background:activeCategory==="all"?"#fff":"#888"}}/>
              {capitalize(chromeText.allCategories)}
            </button>
            {categoryPills.map(({label})=>{
              const isActive=activeCategory===label;
              const meta=getPillMeta(label);
              return(
                <button key={label} type="button" onClick={()=>setActiveCategory(isActive?"all":label)} aria-pressed={isActive} style={{display:"inline-flex",alignItems:"center",gap:"8px",borderRadius:"999px",border:"1.5px solid",padding:"9px 18px",fontSize:"14px",fontWeight:600,lineHeight:1,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap",flexShrink:0,minHeight:"44px",...(isActive?{background:meta.color,color:"#ffffff",borderColor:meta.color,boxShadow:`0 2px 12px ${meta.color}50`}:{background:meta.bg,color:meta.color,borderColor:`${meta.color}40`})}}>
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
          <div style={{marginTop:"16px",paddingTop:"14px",borderTop:`1px solid ${(LANG_THEME[language]??LANG_THEME.so).border}`}}>
            <p style={{fontSize:"13.5px",fontWeight:700,color:(LANG_THEME[language]??LANG_THEME.so).primary,margin:0,letterSpacing:"0.01em"}}>
              © {new Date().getFullYear()} Somalimed{text.footer2 ? ` — ${text.footer2}` : ""}
            </p>
          </div>
          <div style={{marginTop:"10px",display:"flex",gap:"14px",flexWrap:"wrap"}}>
            <a href={`/cookiepolitik?lang=${language}`} style={{fontSize:"12px",color:"#64748b",textDecoration:"underline"}}>{(LEGAL_LABELS[language]??LEGAL_LABELS.so).cookie}</a>
            <a href={`/persondatapolitik?lang=${language}`} style={{fontSize:"12px",color:"#64748b",textDecoration:"underline"}}>{(LEGAL_LABELS[language]??LEGAL_LABELS.so).privacy}</a>
          </div>
        </div>
      </footer>

      {/* ── Revision date bar — bottom of entire page ── */}
      <div style={{
        width:"100%",
        background:"linear-gradient(90deg,#e6faf6 0%,#ccf5ec 50%,#e6faf6 100%)",
        borderTop:"2px solid #5eead4",
        padding:"14px 24px",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"10px",
      }}>
        <span style={{
          display:"inline-flex",alignItems:"center",gap:"8px",
          padding:"6px 20px",borderRadius:"999px",
          background:"#ffffff",
          border:"1.5px solid #5eead4",
          boxShadow:"0 1px 6px rgba(13,148,136,0.12)",
          fontSize:"12px",fontWeight:700,
          color:"#0f766e",letterSpacing:"0.02em",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          {getLastRevisedText(language)}
        </span>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "9px 16px", borderRadius: "12px", maxWidth: "440px",
          background: "rgba(255,255,255,0.6)", border: "1px solid rgba(94,234,212,0.5)",
          color: "#0f766e", fontSize: "12px", lineHeight: 1.6,
          textAlign: language === "ar" ? "right" : "left",
          direction: language === "ar" ? "rtl" : "ltr",
        }}>
          <ShieldCheckIcon size={15} color="#0f766e" />
          <span>{QUALITY_NOTE[language] ?? QUALITY_NOTE.da}</span>
        </div>
      </div>
    </div>
  );
}
