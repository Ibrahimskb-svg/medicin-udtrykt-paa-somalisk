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

// ── Color themes per language ──────────────────────────────────────────────
// so=teal, da=blue, en=brown/red, ar=orange
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

// ── Nav tab icon colors per language ───────────────────────────────────────
const NAV_ICON_COLORS = {
  so: { faq:"#0D9488", feedback:"#059669", contact:"#0F766E" },
  da: { faq:"#2563EB", feedback:"#1D4ED8", contact:"#0284C7" },
  en: { faq:"#92400E", feedback:"#B45309", contact:"#C2410C" },
  ar: { faq:"#D97706", feedback:"#B45309", contact:"#EA580C" },
};

// ── Contact data ───────────────────────────────────────────────────────────
const CONTACT_DATA = {
  da: {
    intro:"Har du spørgsmål til et lægemiddel, et forslag til siden eller blot lyst til at skrive? Jeg svarer gerne — skriv til mig på e-mail.",
    emailNote:"Svar inden for 1–2 hverdage",
    responseTitle:"Hvad kan du skrive om?",
    topics:["Spørgsmål om et specifikt lægemiddel","Forslag til nye emner eller lægemidler","Fejl eller unøjagtigheder på siden","Generel feedback eller ros"],
  },
  en: {
    intro:"Do you have a question about a medicine, a suggestion for the site, or just want to get in touch? I am happy to help — write to me by email.",
    emailNote:"Response within 1–2 working days",
    responseTitle:"What can you write about?",
    topics:["Questions about a specific medicine","Suggestions for new topics or medicines","Errors or inaccuracies on the site","General feedback or praise"],
  },
  so: {
    intro:"Ma qabtaa su'aal ku saabsan daawooyin, talooyin ku saabsan bogga, mise waxaad rabaan inaad xiriir la yeeshaan? Waxaan ku faraxsanahay inaan kaa caawiyaa — ii qor emailka.",
    emailNote:"Jawaab ayaad helaysaa 1–2 maalmood gudahood",
    responseTitle:"Maxaad ka qori kartaa?",
    topics:["Su'aalaha ku saabsan daawooyin gaar ah","Talooyin ku saabsan mawduucyo ama daawooyin cusub","Khaladaadka ama xog aan saxnayn bogga","Faallo guud ama amaano"],
  },
  ar: {
    intro:"هل لديك سؤال حول دواء معين، أو اقتراح للموقع، أو تريد فقط التواصل؟ يسعدني مساعدتك — راسلني عبر البريد الإلكتروني.",
    emailNote:"سيتم الرد خلال يوم أو يومين عمل",
    responseTitle:"عمَّ يمكنك الكتابة؟",
    topics:["أسئلة حول دواء معين","اقتراحات لموضوعات أو أدوية جديدة","أخطاء أو معلومات غير دقيقة في الموقع","تعليقات عامة أو إطراء"],
  },
};

// ── About Me data — new professional combined text ─────────────────────────
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
    { icon:"education", text:"Shahaadada koowaad ee Kimistari iyo Bayoolajiga Dawooyinka, farmashiiste tababaran — leh awood naadir ah oo ah in cilmiga xisaabta, fizikada, kimistarka iyo bayoolajiga laga dhigo mid sahlan oo xiiso leh" },
    { icon:"work",      text:"Shaqo maalinleh oo ku saabsan farmashiyaha bulshada iyo farmashiyaha xaaladaha degdega ah — xiriirka tooska ah ee bukaanka ayaa si cad u muujiyay muhiimadda macluumaadka daawooyinka ee cad oo la aamin karo" },
    { icon:"school",    text:"Macalin khibrad leh oo ku caawiyay ardayda dugsiga sare iyo jaamacadda inay ku guuleystaan mawduucyada adag — iyada oo lagu saleynayo dulqaad, dhiirrigelin iyo jawiga barashada ee waxtar leh" },
    { icon:"pills",     text:"Xiise weyn u qaba in aqoonta xirfadeedka laga dhigo mid macno leh oo la isticmaali karo — oo keena isku darka gaarka ah ee aqoonta qoto dheer iyo xiriirinta firfircoon" },
  ],
  ar: [
    { icon:"education", text:"بكالوريوس في الكيمياء وعلم الأحياء الدوائي، وحاصل على تأهيل فارماكونوم — بقدرة نادرة على تحويل المواد المعقدة كالرياضيات والفيزياء والكيمياء وعلم الأحياء إلى مواد سهلة وممتعة" },
    { icon:"work",      text:"ممارسة يومية في الصيدلية الخاصة وصيدلية المناوبة — أوضح التواصل المباشر مع المرضى مدى أهمية المعلومات الدوائية الواضحة والموثوقة" },
    { icon:"school",    text:"معلم متمرس ساعد طلاب المرحلة الثانوية والجامعية على إتقان المجالات الدراسية الصعبة — بصبر وعزم وبيئة تعليمية ملهمة" },
    { icon:"pills",     text:"شغوف بجعل المعرفة المتخصصة ذات معنى وقابلة للتطبيق — يجمع بين العمق العلمي والتواصل الحيوي في كل سياق" },
  ],
};

// ── About Somalimed ────────────────────────────────────────────────────────
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
    { icon:"school",    text:"Waxaa lagu heli karaa af-Soomaali, Ingiriisi, Dansk iyo Carabi" },
    { icon:"education", text:"Waxa qoray farmashiiste xirfad leh oo si buuxda u tababaran" },
    { icon:"work",      text:"Waxaa si joogto ah loogu dari doonaa: antibiyootikada, daawooyinka fayraska, antihistamiinnada iwm." },
  ],
  ar: [
    { icon:"pills",     text:"25 دواءً مختاراً بعناية من الممارسة اليومية في الصيدلية" },
    { icon:"school",    text:"متاح باللغات الدنماركية والإنجليزية والصومالية والعربية" },
    { icon:"education", text:"أساس مهني متين — بقلم فارماكونوم مؤهل تأهيلاً كاملاً" },
    { icon:"work",      text:"توسع مستمر: المضادات الحيوية، مضادات الفيروسات، مضادات الهيستامين وغيرها" },
  ],
};

// ── FAQ — specific, medicine-based, all 4 languages ───────────────────────
const FAQ_DATA = {
  da: {
    title:"Ofte stillede spørgsmål",
    items:[
      {
        q:"Hvornår på dagen skal jeg tage Lamotrigin, og hvad sker der, hvis jeg springer en dosis over?",
        a:"Lamotrigin bør tages på samme tidspunkt hver dag for at holde et stabilt niveau i blodet. Det tages typisk én til to gange dagligt — afhængigt af din læges anvisning. Springer du en dosis over, skal du tage den, så snart du husker det — men aldrig tage dobbelt dosis. Et fald i blodkoncentrationen kan øge risikoen for anfald hos patienter med epilepsi. Ophør af Lamotrigin må aldrig ske pludseligt, men skal nedtrappes gradvist under lægelig vejledning."
      },
      {
        q:"Kan jeg tage Paracetamol og Ibuprofen på samme tid, og hvad er den maksimale dosis?",
        a:"Ja, Paracetamol og Ibuprofen kan kombineres, da de virker via forskellig mekanismer — Paracetamol centralt og Ibuprofen antiinflammatorisk. For Paracetamol gælder maks. 1 g (2 tabletter á 500 mg) per dosis, maks. 4 g (8 tabletter) i døgnet og mindst 4–6 timer mellem doserne. For Ibuprofen er den anbefalede enkeltdosis 200–400 mg, maks. 1.200 mg dagligt uden recept, og mindst 6–8 timer mellem doserne. Ibuprofen bør tages til mad for at skåne maveslimhinden."
      },
      {
        q:"Hvad skal jeg undgå, mens jeg er i Marevan-behandling?",
        a:"Marevan (Warfarin) er en blodfortyndende medicin, der kræver særlig opmærksomhed. Pludselige ændringer i indtagelsen af K-vitaminrige fødevarer — som grønkål, spinat, broccoli og persille — kan påvirke INR-værdien markant. Du bør undgå smertestillende som Ibuprofen og Diclofenac, da disse øger blødningsrisikoen. Alkohol bør begrænses. Det er afgørende at møde op til dine regelmæssige INR-kontroller og altid informere din læge og tandlæge om behandlingen inden indgreb."
      },
      {
        q:"Skal Atorvastatin tages om morgenen eller om aftenen, og kan jeg spise grapefrugt?",
        a:"Atorvastatin kan tages på alle tidspunkter af døgnet — men det er vigtigst at tage den på samme tidspunkt hver dag. Den er effektiv uanset tidspunkt, da kroppen producerer mest kolesterol om natten. Undgå dog store mængder grapefrugt eller grapefrugtjuice, da den indeholder stoffer der hæmmer nedbrydningen af Atorvastatin i leveren og derved øger koncentrationen i blodet. Dette kan øge risikoen for bivirkninger, særligt muskelsmerte (myopati)."
      },
      {
        q:"Hvordan virker Metformin, og hvornår skal det tages i relation til mad?",
        a:"Metformin sænker blodsukkeret primært ved at hæmme leverens glukoseproduktion og forbedre kroppens insulinfølsomhed. Det tages altid i forbindelse med et måltid eller umiddelbart efter — dette mindsker risikoen for mave-tarm-bivirkninger som kvalme, diarre og mavesmerter, der er hyppige i opstartsfasen. Metformin nedlægges gradvist, og kroppen vænner sig typisk til det inden for 2–4 uger. Fortæl altid din læge om Metformin-behandlingen inden røntgenundersøgelser med kontrastmiddel."
      },
      {
        q:"Hvad er den vigtigste forskel på blodtryksmedicinerne Amlodipin, Losartan og Enalapril?",
        a:"Amlodipin er en calciumantagonist, der afslapper blodkarrene og sænker modstanden mod blodstrømmen. Losartan er en angiotensin II-receptorblokker (ARB), der blokerer et hormon som trækker blodkarrene sammen. Enalapril er en ACE-hæmmer, der forhindrer omdannelsen af angiotensin I til angiotensin II. Alle tre sænker blodtrykket, men via forskellige mekanismer. Din læge vælger den mest hensigtsmæssige type ud fra din samlede helbredsprofil, eventuelle andre sygdomme og bivirkningsprofilen."
      },
      {
        q:"Kan jeg tage Ibuprofen, hvis jeg er i blodtryksmedicinbehandling?",
        a:"Det frarådes i de fleste tilfælde. Ibuprofen og andre NSAID-præparater kan modvirke virkningen af blodtryksmedicin og i sig selv medføre en stigning i blodtrykket. De kan desuden belaste nyrerne, særligt i kombination med ACE-hæmmere (Enalapril) eller ARB'er (Losartan). Paracetamol er generelt et sikrere alternativ til smertelindring for patienter i blodtryksmedicinbehandling. Spørg altid din apotek eller læge, inden du kombinerer præparater."
      },
      {
        q:"Hvad sker der i kroppen, hvis jeg pludseligt stopper med Lamotrigin eller Sertralin?",
        a:"Pludseligt ophør med Lamotrigin kan udløse alvorlige absensanfald eller generaliserede kramper, selv hos patienter der har været anfaldsfrie i lang tid. Pludseligt ophør med Sertralin kan give såkaldte seponeringsreaktioner, der inkluderer svimmelhed, elektrisk prikkende fornemmelse ('brain zaps'), søvnforstyrrelser, irritabilitet og influenzalignende symptomer. Begge lægemidler skal altid nedtrappes gradvist under lægelig vejledning — aldrig stoppes fra den ene dag til den anden."
      },
      {
        q:"Hvad skal jeg gøre, hvis jeg tager for mange Paracetamol-tabletter?",
        a:"Kontakt straks Giftlinjen på 82 12 12 12 (åben døgnet rundt) eller ring 112. En overdosering af Paracetamol er alvorlig, selv hvis du ikke mærker umiddelbare symptomer — skaden på leveren kan opstå i løbet af 24–72 timer uden tidlige tegn. Forsøg ikke at vente og se, men søg hjælp med det samme. Tag medicin-emballagen med til hospitalet, så personalet ved præcis, hvad og hvor meget du har taget."
      },
      {
        q:"Kan Atorvastatin give muskelsmerter, og hvornår skal jeg kontakte min læge?",
        a:"Ja, muskelsmerte (myalgi) er en velkendt bivirkning til statiner som Atorvastatin. Den opleves typisk som en diffus ømhed eller svaghed i muskler, særligt i lår og overarme. I sjældne tilfælde kan det udvikle sig til rhabdomyolyse — en alvorlig nedbrydning af muskelvæv. Kontakt din læge, hvis du oplever uforklarlig, vedvarende muskelsmerte, muskelsvaghed eller mørk urin. Din læge vil vurdere, om dosis bør justeres eller præparatet skiftes."
      },
    ],
  },
  en: {
    title:"Frequently Asked Questions",
    items:[
      {
        q:"When during the day should I take Lamotrigine, and what happens if I miss a dose?",
        a:"Lamotrigine should be taken at the same time every day to maintain a stable blood level. It is typically taken once or twice daily depending on your doctor's instructions. If you miss a dose, take it as soon as you remember — but never double up. A drop in blood concentration can increase seizure risk in patients with epilepsy. Lamotrigine must never be stopped suddenly — it should always be tapered gradually under medical supervision."
      },
      {
        q:"Can I take Paracetamol and Ibuprofen at the same time, and what is the maximum dose?",
        a:"Yes, Paracetamol and Ibuprofen can be combined as they work through different mechanisms — Paracetamol centrally and Ibuprofen as an anti-inflammatory. For Paracetamol, the maximum single dose is 1 g (2 tablets of 500 mg), up to 4 g (8 tablets) per day, with at least 4–6 hours between doses. For Ibuprofen, the recommended single dose is 200–400 mg, up to 1,200 mg daily without prescription, with at least 6–8 hours between doses. Ibuprofen should be taken with food to protect the stomach lining."
      },
      {
        q:"What should I avoid while taking Warfarin (Marevan)?",
        a:"Warfarin requires particular care. Sudden changes in your intake of vitamin K-rich foods — such as kale, spinach, broccoli and parsley — can significantly affect your INR level. Avoid pain relievers such as Ibuprofen and Diclofenac, as these increase the risk of bleeding. Alcohol should be kept to a minimum. It is essential to attend your regular INR monitoring appointments and always inform your doctor and dentist about your treatment before any procedures."
      },
      {
        q:"Should Atorvastatin be taken in the morning or evening, and can I eat grapefruit?",
        a:"Atorvastatin can be taken at any time of day — the most important thing is to take it consistently at the same time each day. It is effective regardless of timing, as the body produces most cholesterol overnight. However, avoid large amounts of grapefruit or grapefruit juice, as it contains compounds that inhibit the breakdown of Atorvastatin in the liver, raising its concentration in the blood. This can increase the risk of side effects, particularly muscle pain (myopathy)."
      },
      {
        q:"How does Metformin work, and when should it be taken in relation to meals?",
        a:"Metformin lowers blood sugar primarily by inhibiting glucose production in the liver and improving the body's sensitivity to insulin. It should always be taken with or immediately after a meal — this reduces the risk of gastrointestinal side effects such as nausea, diarrhoea and stomach pain, which are common during the initial period. The body typically adjusts within 2–4 weeks. Always inform your doctor about Metformin treatment before any X-ray examination involving contrast dye."
      },
      {
        q:"What is the key difference between the blood pressure medicines Amlodipine, Losartan and Enalapril?",
        a:"Amlodipine is a calcium channel blocker that relaxes blood vessels and reduces resistance to blood flow. Losartan is an angiotensin II receptor blocker (ARB) that blocks a hormone responsible for constricting blood vessels. Enalapril is an ACE inhibitor that prevents the conversion of angiotensin I to angiotensin II. All three lower blood pressure, but through different mechanisms. Your doctor selects the most appropriate based on your overall health profile, any co-existing conditions and the side effect profile."
      },
      {
        q:"Can I take Ibuprofen while on blood pressure medicine?",
        a:"In most cases this is not recommended. Ibuprofen and other NSAIDs can counteract the effect of blood pressure medicines and themselves contribute to a rise in blood pressure. They can also place strain on the kidneys, particularly in combination with ACE inhibitors (Enalapril) or ARBs (Losartan). Paracetamol is generally a safer alternative for pain relief in patients on blood pressure treatment. Always ask your pharmacist or doctor before combining medicines."
      },
      {
        q:"What happens in the body if I suddenly stop Lamotrigine or Sertraline?",
        a:"Stopping Lamotrigine suddenly can trigger serious absence seizures or generalised convulsions, even in patients who have been seizure-free for a long time. Stopping Sertraline abruptly can cause discontinuation syndrome, including dizziness, electric shock-like sensations ('brain zaps'), sleep disturbances, irritability and flu-like symptoms. Both medicines must always be tapered gradually under medical supervision — never stopped from one day to the next."
      },
      {
        q:"What should I do if I have taken too many Paracetamol tablets?",
        a:"Contact the Poison Information Centre (Giftlinjen) immediately on 82 12 12 12 (open around the clock) or call 112. A Paracetamol overdose is serious even if you feel no immediate symptoms — liver damage can develop within 24–72 hours without early warning signs. Do not wait to see if symptoms appear. Seek help immediately and bring the medicine packaging to the hospital so staff know exactly what and how much was taken."
      },
      {
        q:"Can Atorvastatin cause muscle pain, and when should I contact my doctor?",
        a:"Yes, muscle pain (myalgia) is a well-recognised side effect of statins such as Atorvastatin. It is typically experienced as a diffuse aching or weakness in the muscles, particularly in the thighs and upper arms. In rare cases it can progress to rhabdomyolysis — a serious breakdown of muscle tissue. Contact your doctor if you experience unexplained, persistent muscle pain, muscle weakness or dark urine. Your doctor will assess whether the dose should be adjusted or the medicine changed."
      },
    ],
  },
  so: {
    title:"Su'aalaha inta badan la isweydiiyo",
    items:[
      {
        q:"Goorma maalinta ayaan qaadan karaa Lamotrigin, maxaana dhacaya haddaan hilmaamo dosis?",
        a:"Lamotrigin waa in lagu qaadaa wakht isku mid ah maalin kasta si heerka dhiigga uu u joogtoobo. Caadiga ahaan waxaa lagu qaadaa hal ama laba jeer maalintii — iyada oo ku xidantahay tilmaamaha dhakhtarkaaga. Haddaad hilmaami dosista, qaado markii aad xasuusatid — laakiin ha qaadin laba dosis mar. Hoos u dhac ku yimaada heerka dhiigga waxay kordhin kartaa khatarta qodob-xanuunka bukaanka epilepsy. Lamotrigin weligiis looma joojin karo si lama filaan ah — had iyo jeer waa in si tartiib ah hoos loogu dhigo hagitaanka dhakhtarka.",
      },
      {
        q:"Ma qaadan karaa Paracetamol iyo Ibuprofen isla mar, maxayna tahay qadarka ugu badan?",
        a:"Haa, Paracetamol iyo Ibuprofen waa la isku dari karaa maadaama ay si kala duwan ugu shaqeeyaan — Paracetamol waxay ku shaqaysaa nidaamka xididdada maskaxda, halka Ibuprofen ay tahay daawada ka hortaga barar. Paracetamol: qadarka ugu badan hal mar waa 1 g (2 kiniin oo 500 mg ah), maalin kasta ugu badan 4 g (8 kiniin), ugu yaraan 4–6 saacadood u dhexeeya. Ibuprofen: qadarka hal mar waa 200–400 mg, ugu badan 1,200 mg maalin kasta la'aanta qoraal dhakhtareed, ugu yaraan 6–8 saacadood u dhexeeya. Ibuprofen waa in la qaadaa cuntada si looga ilaaliyo caloosha.",
      },
      {
        q:"Maxaan ka fogaan karaa intaan ku jiro daawaynta Marevan?",
        a:"Marevan (Warfarin) waa daawada dareere-dhiigga ah oo u baahan dareen gaar ah. Isbedelada lama filaan ah ee cuntada ka kooban vitamin K — sida canabka cagaaran, isbinaashka, barootiinka iyo baarsaleeyo — waxay si weyn u beddeli karaan qiimaha INR-ka. Iska ilaali xanuun-daawooyinka sida Ibuprofen iyo Diclofenac, maadaama ay kordhinayaan khatarta dhiig-baxa. Khamriga waa in la xaddidaa. Waa muhiim in aad si joogto ah u tagto tijaabooyinka INR-ka oo mar walba u sheegto dhakhtarkaaga iyo dacawooyaha ilkaha inaad ku jirto daawayntaan ka hor fal kasta.",
      },
      {
        q:"Atorvastatin ma subaxdii baa lagu qaadaa mise habeenkii, miyaana cirishta lagu cuni karin?",
        a:"Atorvastatin waxaa lagu qaadi karaa wakht kasta maalinta — waxa ugu muhiimsan waa in si joogto ah wakht isku mid ah lagu qaado maalin kasta. Waxay shaqaysaa waqti kasta, maadaama jiruhu uu inta badan kolestarool u soo saaro habeenkii. Si kastaba ha ahaatee, iska ilaali tirada badan ee cirishta ama cabitaankeedu (grapefruit juice), maadaama ay ka kooban yihiin walxo xannibaya jabinta Atorvastatin ee beer, taas oo kordhinaysa heerkeeda dhiigga. Tani waxay kordhin kartaa khatarta saameynta xumida, gaar ahaan xanuunka muruqyada (myopathy).",
      },
      {
        q:"Sidee u shaqeeyaa Metformin, goormaana la qaadaa marka la eego cuntada?",
        a:"Metformin waxay hoos u dhigeysaa sonkoraha dhiigga aasaasiga ahaan iyada oo xannibaysa soo saarka glukooska ee beerta iyo hagaajinta xassaasiyada jiirku u leeyahay insulinka. Marka had iyo jeer waa in la qaadaa cuntada la socota ama isla markiiba ka dib — tani waxay yaraynaysaa khatarta saameynta xumida caloosha sida dareeraha, shuban iyo xanuunka caloosha, oo caadi ah xilliga bilowga. Jiruhu caadiga ahaan wuu qabsadaa 2–4 todobaad gudahood. Mar walba u sheeg dhakhtarkaaga daawynta Metformin ka hor sawiridda X-ray ee isticmaalaya maaddada contrast-ka.",
      },
      {
        q:"Waa maxay farqiga ugu muhiimsan u dhexeeya daawooyinka dhiig-karka Amlodipin, Losartan iyo Enalapril?",
        a:"Amlodipin waa xannibaha kalsiiyumka oo dareemaynaya xididdada dhiigga oo yaraynaya iska caabinta socodka dhiigga. Losartan waa xannibaha natiijada angiotensin II (ARB) oo xannibaya hormoon ku soo jiidanaysa xididdada dhiigga. Enalapril waa xannibaha ACE oo ka hortaga beddelida angiotensin I si looga saaro angiotensin II. Saddadkooduba waxay hoos u dhigeeyaan dhiig-karka, laakiin iyagoo maraya jidadyo kala duwan. Dhakhtarkaagu wuxuu dooranayaa kii ku habboon ee ugu habboon xaaladda caafimaadkaaga guud, xanuunada kale ee jira iyo astaamaha saameynta xumida.",
      },
      {
        q:"Ma qaadan karaa Ibuprofen haddaan ku jiro daawaynta dhiig-karka?",
        a:"Inta badan tani laguma talinayo. Ibuprofen iyo daawooyinka NSAID kale waxay ka hor istaagi karaan saameynta daawooyinka dhiig-karka waxayna si madaxbanaan u kordhin karaan dhiig-karka. Sidoo kale waxay culays saari karaan goobahaas kelyaha, gaar ahaan marka la isku daro ACE xannibayaasha (Enalapril) ama ARB-yada (Losartan). Paracetamol guud ahaan waa xulasho ammaan ah oo kale oo xanuun-daaweyn ah bukaanka ku jira daawaynta dhiig-karka. Mar walba weydii farmashiistaha ama dhakhtarkaaga ka hor inaad daawooyin isku darto.",
      },
      {
        q:"Maxaa jidhka ku dhacaya haddaan si lama filaan ah u joojiyaa Lamotrigin ama Sertralin?",
        a:"Joojinta lama filaan ah ee Lamotrigin waxay kicin kartaa qodob-xanuunno cidhibta ah ama kuwa guud oo xooggan, xitaa bukaanka muddo dheer aanay qodob-xanuun lahayn. Joojinta lama filaan ah ee Sertralin waxay keeni kartaa calaamadaha seponeerisaanka, oo ay ku jiraan sharar, dareenkii koronto-gaadha ah ('brain zaps'), dhibaatooyin hurdada, xanaaq iyo calaamadaha la mid ah hargabka. Labada daawoba had iyo jeer waa in si tartiib ah hoos loogu dhigo hagitaanka dhakhtarka — weligoodna looga joojiyo maalinta kastaanka.",
      },
      {
        q:"Maxaan sameeyaa haddaan qaatay Paracetamol badan?",
        a:"Si deg-deg ah u la xiriir Giftlinjen lambarka 82 12 12 12 (furan 24 saacadood) ama wac 112. Xad-dhaafka Paracetamol waa xaalad cidhibeed, xitaa haddaanad dareensanayn calaamadaha markiiba — waxyeelada beerta waxay ka dhici kartaa 24–72 saacadood gudahood la'aanta calaamadaha hore. Ha sugin si aad u aragto calaamadaha soo muuqan. Caawimaad raadi isla markiiba waxaadna qaadan doontaa xirmada daawooyinka si shaqaalaha caafimaadka ay u garan karaan waxa iyo tirada aad qaadatay.",
      },
      {
        q:"Ma Atorvastatin keeni kartaa xanuunka muruqyada, goormaana la la xiriiraa dhakhtarka?",
        a:"Haa, xanuunka muruqyada (myalgia) waa saameyn xun la yaqaan ee statiinnada sida Atorvastatin. Caadiga ahaan waxaa laga dareemaa xanuun kala firirsan ama daciifnimo muruqyada, gaar ahaan cududaha iyo gacanaha sare. Kiisasyo naadir ah ayuu u kobci karaa rhabdomyolysis — jabis adag oo unugyada muruqyada ah. La xiriir dhakhtarkaaga haddaad dareento xanuun muruq oo aan lagu sharraxi karin, oo joogtaysa, daciifnimo muruq ama kaadi madow. Dhakhtarkaagu wuxuu qiimeyn doonaa haddii qadarka la beddelan doono ama daawada la beddelan doono.",
      },
    ],
  },
  ar: {
    title:"الأسئلة الشائعة",
    items:[
      {
        q:"متى يجب تناول لاموتريجين خلال اليوم، وماذا يحدث إذا فاتتني جرعة؟",
        a:"يجب تناول لاموتريجين في نفس الوقت كل يوم للحفاظ على مستوى ثابت في الدم. يُؤخذ عادةً مرة أو مرتين يومياً وفقاً لتعليمات طبيبك. إذا فاتتك جرعة، تناولها حال تذكّرك — لكن لا تُضاعف الجرعة أبداً. قد يؤدي انخفاض تركيزه في الدم إلى زيادة خطر النوبات لدى مرضى الصرع. لا يجوز إيقاف لاموتريجين فجأة — يجب دائماً تقليل الجرعة تدريجياً تحت إشراف طبي.",
      },
      {
        q:"هل يمكنني تناول الباراسيتامول والإيبوبروفين معاً، وما الجرعة القصوى؟",
        a:"نعم، يمكن الجمع بينهما لأنهما يعملان عبر آليتين مختلفتين — الباراسيتامول يعمل مركزياً والإيبوبروفين مضاد للالتهاب. بالنسبة للباراسيتامول: الحد الأقصى للجرعة الواحدة 1 غ (قرصان 500 مغ)، بحد أقصى 4 غ (8 أقراص) يومياً مع فاصل لا يقل عن 4–6 ساعات. أما الإيبوبروفين: فالجرعة الواحدة 200–400 مغ، بحد أقصى 1,200 مغ يومياً بدون وصفة، مع فاصل لا يقل عن 6–8 ساعات. يُؤخذ الإيبوبروفين مع الطعام لحماية الغشاء المعدي.",
      },
      {
        q:"ما الذي يجب تجنبه أثناء علاج الوارفارين (ماريفان)؟",
        a:"يستلزم الوارفارين عناية خاصة. التغيرات المفاجئة في تناول الأطعمة الغنية بفيتامين K — كاللفت الأخضر والسبانخ والبروكلي والبقدونس — يمكن أن تؤثر تأثيراً بالغاً على مستوى INR. تجنّب مسكنات الألم كالإيبوبروفين والديكلوفيناك لأنها تزيد خطر النزيف. اعتدل في تناول الكحول. من الضروري حضور جلسات مراقبة INR بانتظام وإخبار طبيبك وطبيب أسنانك دائماً بعلاجك قبل أي إجراء.",
      },
      {
        q:"هل يُؤخذ أتورفاستاتين صباحاً أم مساءً، وهل يمكنني تناول الجريب فروت؟",
        a:"يمكن تناول أتورفاستاتين في أي وقت من اليوم — الأهم هو الالتزام بنفس الوقت يومياً. وهو فعّال بغض النظر عن التوقيت، إذ يُنتج الجسم معظم الكوليسترول ليلاً. غير أنه يجب تجنب كميات كبيرة من الجريب فروت أو عصيره، لأنه يحتوي على مركبات تُثبط تكسير أتورفاستاتين في الكبد مما يرفع تركيزه في الدم، وقد يزيد من خطر الآثار الجانبية ولا سيما آلام العضلات (الاعتلال العضلي).",
      },
      {
        q:"كيف يعمل ميتفورمين ومتى يُؤخذ بالنسبة للوجبات؟",
        a:"يُخفّض ميتفورمين سكر الدم أساساً عن طريق تثبيط إنتاج الغلوكوز في الكبد وتحسين استجابة الجسم للأنسولين. يجب تناوله دائماً مع الوجبة أو مباشرة بعدها — مما يُقلل خطر الآثار الجانبية الهضمية كالغثيان والإسهال وآلام المعدة، الشائعة في المرحلة الأولى. يعتاد الجسم عليه عادةً خلال 2–4 أسابيع. أخبر طبيبك دائماً بعلاجك بميتفورمين قبل أي فحص بالأشعة السينية مع صبغة التباين.",
      },
      {
        q:"ما الفرق الجوهري بين أدوية ضغط الدم: أملوديبين، لوسارتان وإيناليبريل؟",
        a:"أملوديبين هو حاصر لقنوات الكالسيوم يُرخي الأوعية الدموية ويُقلل المقاومة أمام تدفق الدم. لوسارتان هو حاصر لمستقبلات أنجيوتنسين II يمنع هرموناً يُضيّق الأوعية الدموية. إيناليبريل هو مثبط ACE يمنع تحويل أنجيوتنسين I إلى أنجيوتنسين II. الثلاثة تُخفض ضغط الدم لكن عبر آليات مختلفة. يختار طبيبك الأنسب بناءً على ملفك الصحي الكامل والأمراض المصاحبة وملف الآثار الجانبية.",
      },
      {
        q:"هل يمكنني تناول الإيبوبروفين وأنا على أدوية ضغط الدم؟",
        a:"في معظم الحالات لا يُنصح بذلك. يمكن للإيبوبروفين وغيره من مضادات الالتهاب اللاستيرويدية أن تُضادّ تأثير أدوية ضغط الدم وترفع ضغط الدم من تلقاء نفسها. كما قد تُجهد الكلى، خاصةً عند تناولها مع مثبطات ACE (إيناليبريل) أو حاصرات ARB (لوسارتان). الباراسيتامول عموماً خيار أكثر أماناً لتسكين الألم لمرضى ضغط الدم. استشر الصيدلي أو طبيبك دائماً قبل دمج الأدوية.",
      },
      {
        q:"ماذا يحدث في الجسم إذا توقفت فجأة عن لاموتريجين أو سيرترالين؟",
        a:"قد يُفضي التوقف المفاجئ عن لاموتريجين إلى نوبات غياب خطيرة أو تشنجات معممة، حتى لدى مرضى كانوا بلا نوبات لفترة طويلة. أما التوقف المفاجئ عن سيرترالين فقد يُسبب متلازمة الانقطاع، وتشمل الدوخة وإحساساً كهربائياً ('brain zaps') واضطرابات النوم والتهيج وأعراضاً شبيهة بالأنفلونزا. يجب تقليل كلا الدواءين تدريجياً تحت إشراف طبي ولا يُوقفان فجأة أبداً.",
      },
      {
        q:"ماذا أفعل إذا تناولت عدداً كبيراً من أقراص الباراسيتامول؟",
        a:"تواصل فوراً مع مركز السموم Giftlinjen على الرقم 82 12 12 12 (مفتوح على مدار الساعة) أو اتصل بـ 112. جرعة الباراسيتامول الزائدة خطيرة حتى لو لم تشعر بأعراض فورية — فتلف الكبد قد يحدث خلال 24–72 ساعة دون علامات تحذيرية مبكرة. لا تنتظر ظهور الأعراض، واطلب المساعدة فوراً مع إحضار عبوة الدواء إلى المستشفى.",
      },
      {
        q:"هل يمكن لأتورفاستاتين أن يسبب آلام عضلية، ومتى أتصل بطبيبي؟",
        a:"نعم، آلام العضلات (الألم العضلي) من الآثار الجانبية المعروفة للستاتينات كأتورفاستاتين. تظهر عادةً كألم منتشر أو ضعف في العضلات، ولا سيما في الفخذين والذراعين. في حالات نادرة قد تتطور إلى انحلال الربيدات (rhabdomyolysis) — وهو تكسّر خطير لأنسجة العضلات. تواصل مع طبيبك إذا عانيت من آلام عضلية مستمرة غير مبررة، أو ضعف عضلي، أو بول داكن. سيُقيّم طبيبك ما إذا كان يجب تعديل الجرعة أو تغيير الدواء.",
      },
    ],
  },
};

// ── Feedback data ──────────────────────────────────────────────────────────
const FEEDBACK_DATA = {
  da: { title:"Ris & Ros", subtitle:"Din mening betyder noget. Del gerne din oplevelse med Somalimed.", praise:"Ros 👍", criticism:"Ris 👎", suggestion:"Forslag 💡", placeholder:"Skriv din besked her...", send:"Send besked", sent:"Tak for din besked! 🙏", emailLabel:"Din e-mail (valgfri)" },
  en: { title:"Feedback", subtitle:"Your opinion matters. Feel free to share your experience with Somalimed.", praise:"Praise 👍", criticism:"Criticism 👎", suggestion:"Suggestion 💡", placeholder:"Write your message here...", send:"Send message", sent:"Thank you for your message! 🙏", emailLabel:"Your email (optional)" },
  so: { title:"Faallo", subtitle:"Ra'yaagaagu waa muhiim. Nala wadaag khibradaada Somalimed.", praise:"Amaano 👍", criticism:"Dhaleeceyn 👎", suggestion:"Talooyin 💡", placeholder:"Halkan ku qor fariintaada...", send:"Dir fariinta", sent:"Mahadsanid fariintaada! 🙏", emailLabel:"Emailkaaga (ikhtiyaari)" },
  ar: { title:"آراء وملاحظات", subtitle:"رأيك يهمنا. شاركنا تجربتك مع Somalimed.", praise:"إطراء 👍", criticism:"نقد 👎", suggestion:"اقتراح 💡", placeholder:"اكتب رسالتك هنا...", send:"إرسال الرسالة", sent:"شكراً على رسالتك! 🙏", emailLabel:"بريدك الإلكتروني (اختياري)" },
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
function MailIcon({size=18}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);}
function StarIcon({size=16,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);}
function QuestionIcon({size=16,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>);}
function MailIconColored({size=16,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);}

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
            <span style={{color:"#fff",fontWeight:800,fontSize:"18px",letterSpacing:"-0.01em"}}>{title}</span>
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
      <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:46,height:46,borderRadius:"13px",flexShrink:0,background:palette.bg,border:`1.5px solid ${palette.color}30`,boxShadow:`0 2px 8px ${palette.color}20`,marginTop:"1px"}}>
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
  const iconEl=<img src={tab==="me"?P.education:P.pills} alt="" style={{width:26,height:26,objectFit:"contain",filter:"brightness(0) invert(1)"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>;
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

// ── Contact Modal ──────────────────────────────────────────────────────────
function ContactModal({language,onClose}){
  const isRtl=language==="ar";
  const navLabels=NAV_LABELS[language]??NAV_LABELS.so;
  const data=CONTACT_DATA[language]??CONTACT_DATA.so;
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const iconColors=NAV_ICON_COLORS[language]??NAV_ICON_COLORS.so;
  const iconEl=<MailIconColored size={22} color="rgba(255,255,255,0.95)"/>;
  return(
    <ModalShell title={navLabels.contact} iconEl={iconEl} onClose={onClose} isRtl={isRtl}>
      <p style={{fontSize:"15px",color:"#475569",lineHeight:1.7,margin:"0 0 20px",textAlign:isRtl?"right":"left"}}>{data.intro}</p>
      <a href="mailto:Ibrahim_skb@live.dk" style={{display:"flex",alignItems:"center",gap:"12px",padding:"16px 20px",borderRadius:"18px",background:theme.tagBg,border:`1.5px solid ${theme.border}`,textDecoration:"none",marginBottom:"20px"}}>
        <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:44,height:44,borderRadius:"12px",background:theme.primary,flexShrink:0}}>
          <MailIcon size={20} color="#fff"/>
        </span>
        <div>
          <p style={{fontWeight:700,fontSize:"15px",color:theme.primary,margin:0}}>Ibrahim_skb@live.dk</p>
          <p style={{fontSize:"13px",color:"#64748b",margin:"2px 0 0"}}>{data.emailNote}</p>
        </div>
      </a>
      <p style={{fontWeight:700,fontSize:"14px",color:"#0f172a",margin:"0 0 10px",textAlign:isRtl?"right":"left"}}>{data.responseTitle}</p>
      <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:"8px"}}>
        {data.topics.map((t,i)=>(
          <li key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",background:"#fff",borderRadius:"12px",border:"1px solid #e5e7eb",fontSize:"14px",color:"#334155",fontWeight:500}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:theme.primary,flexShrink:0}}/>
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
  const navLabels=NAV_LABELS[language]??NAV_LABELS.so;
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const iconEl=<QuestionIcon size={22} color="rgba(255,255,255,0.95)"/>;
  return(
    <ModalShell title={navLabels.faq} iconEl={iconEl} onClose={onClose} isRtl={isRtl} wide>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {data.items.map((item,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:"16px",border:`1.5px solid ${open===i?theme.primary+"55":"#e5e7eb"}`,overflow:"hidden",boxShadow:open===i?`0 4px 16px ${theme.primary}15`:"0 1px 3px rgba(0,0,0,0.04)",transition:"all 0.2s"}}>
            <button type="button" onClick={()=>setOpen(open===i?null:i)} style={{width:"100%",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px",padding:"15px 18px",background:"none",border:"none",cursor:"pointer",textAlign:isRtl?"right":"left"}}>
              <span style={{fontWeight:700,fontSize:"15px",color:open===i?theme.primary:"#0f172a",lineHeight:1.4,flex:1}}>{item.q}</span>
              <span style={{flexShrink:0,width:26,height:26,borderRadius:"50%",background:open===i?theme.primary:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",color:open===i?"#fff":theme.primary,fontSize:"17px",fontWeight:700,transition:"all 0.2s",marginTop:"1px"}}>{open===i?"−":"+"}</span>
            </button>
            {open===i&&<div style={{padding:"0 18px 16px",fontSize:"14px",color:"#475569",lineHeight:1.75,borderTop:`1px solid ${theme.primary}20`}}>{item.a}</div>}
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

  // Nav tabs with language-aware colors
  const navTabs=useMemo(()=>[
    {key:"me",    iconEl:<img src={P.education} alt="" style={{width:15,height:15,objectFit:"contain"}}/>, label:navLabels.aboutMe},
    {key:"site",  iconEl:<img src={P.work}      alt="" style={{width:15,height:15,objectFit:"contain"}}/>, label:navLabels.aboutSite},
    {key:"faq",   iconEl:<QuestionIcon size={15} color={iconColors.faq}/>,  label:navLabels.faq},
    {key:"feedback",iconEl:<StarIcon size={15} color={iconColors.feedback}/>, label:navLabels.feedback},
    {key:"contact", iconEl:<MailIconColored size={15} color={iconColors.contact}/>, label:navLabels.contact},
  ],[navLabels,iconColors]);

  return(
    <div style={{background:"var(--bg)",color:"var(--text)"}} className="min-h-screen">

      {/* ── Sticky nav ──────────────────────────────────────────────────── */}
      <div style={{background:"rgba(255,255,255,0.96)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid rgba(0,0,0,0.07)",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:"72rem",margin:"0 auto",padding:"0 1rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:"58px",gap:"8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
            <div style={{width:32,height:32,borderRadius:"10px",background:"var(--heroBg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <img src={P.pills} alt="" style={{width:20,height:20,objectFit:"contain"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
            </div>
            <span style={{fontWeight:800,fontSize:"17px",color:"var(--accent,#0d9488)",letterSpacing:"-0.02em"}}>Somalimed</span>
          </div>
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
              {text.footer3&&<p style={{marginTop:"10px",fontSize:"15px",lineHeight:"1.75",color:"var(--text-muted)"}}>{text.footer3}</p>}
              {text.footer2&&<p style={{marginTop:"14px",fontSize:"15px",fontWeight:600,color:"var(--text-muted)"}}>{text.footer2}</p>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
