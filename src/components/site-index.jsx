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

// ── FAQ modal title — full title shown inside modal ────────────────────────
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
  da: { intro:"Har du spørgsmål til et lægemiddel, et forslag til siden eller blot lyst til at skrive? Jeg svarer gerne — skriv til mig på e-mail.", emailNote:"Svar inden for 1–2 hverdage", responseTitle:"Hvad kan du skrive om?", topics:["Spørgsmål om et specifikt lægemiddel","Forslag til nye emner eller lægemidler","Fejl eller unøjagtigheder på siden","Generel feedback eller ros"] },
  en: { intro:"Do you have a question about a medicine, a suggestion for the site, or just want to get in touch? I am happy to help — write to me by email.", emailNote:"Response within 1–2 working days", responseTitle:"What can you write about?", topics:["Questions about a specific medicine","Suggestions for new topics or medicines","Errors or inaccuracies on the site","General feedback or praise"] },
  so: { intro:"Ma qabtaa su'aal ku saabsan daawooyin, talooyin ku saabsan bogga, mise waxaad rabaan inaad xiriir la yeeshaan? Waxaan ku faraxsanahay inaan kaa caawiyaa — ii qor emailka.", emailNote:"Jawaab ayaad helaysaa 1–2 maalmood gudahood", responseTitle:"Maxaad ka qori kartaa?", topics:["Su'aalaha ku saabsan daawooyin gaar ah","Talooyin ku saabsan mawduucyo ama daawooyin cusub","Khaladaadka ama xog aan saxnayn bogga","Faallo guud ama amaano"] },
  ar: { intro:"هل لديك سؤال حول دواء معين، أو اقتراح للموقع، أو تريد فقط التواصل؟ يسعدني مساعدتك — راسلني عبر البريد الإلكتروني.", emailNote:"سيتم الرد خلال يوم أو يومين عمل", responseTitle:"عمَّ يمكنك الكتابة؟", topics:["أسئلة حول دواء معين","اقتراحات لموضوعات أو أدوية جديدة","أخطاء أو معلومات غير دقيقة في الموقع","تعليقات عامة أو إطراء"] },
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

// ── FAQ — 12 questions, plain language, medicine-specific ─────────────────
const FAQ_DATA = {
  da: {
    items:[
      {
        q:"Hvad er Lamotrigin, og hvordan skal jeg tage det?",
        a:"Lamotrigin er en medicin, der bruges til at forebygge anfald hos mennesker med epilepsi og til at stabilisere humøret hos personer med bipolar lidelse. Det er vigtigt, at du tager det på samme tidspunkt hver dag — morgenen, aftensmaden eller en anden fast tid, som passer dig. Det kan tages med eller uden mad. Springer du en dosis over, skal du tage den, så snart du husker det. Men spring den over, hvis det snart er tid til næste dosis — og tag aldrig dobbelt op. Stop aldrig med Lamotrigin fra den ene dag til den anden uden at tale med din læge først.",
      },
      {
        q:"Kan jeg tage Paracetamol og Ibuprofen på samme tid, og hvad er den maksimale dosis?",
        a:"Ja, du kan godt tage begge to på samme tid, da de virker på forskellig måde i kroppen. For Paracetamol gælder det, at du højst må tage 2 tabletter (500 mg hver) ad gangen og maks. 8 tabletter i løbet af et døgn — med mindst 4–6 timer imellem doserne. For Ibuprofen er grænsen 1–2 tabletter ad gangen og maks. 6 tabletter pr. dag uden recept — med mindst 6–8 timer imellem. Ibuprofen skal du altid tage til mad, da det ellers kan give mavegener.",
      },
      {
        q:"Hvad skal jeg undgå, mens jeg er i Marevan-behandling?",
        a:"Marevan er en blodfortyndende medicin, og det kræver lidt ekstra opmærksomhed i hverdagen. Du bør undgå pludselige store ændringer i, hvor meget grønkål, spinat, broccoli og persille du spiser — disse grøntsager indeholder K-vitamin, som kan påvirke, hvor godt Marevan virker. Undgå også smertestillende som Ibuprofen og Diclofenac, da de øger risikoen for blødning. Begræns alkohol. Husk at møde op til dine regelmæssige blodprøver og altid fortælle din læge og tandlæge, at du tager Marevan — særligt inden du skal opereres eller have lavet indgreb.",
      },
      {
        q:"Skal Atorvastatin tages om morgenen eller om aftenen, og kan jeg spise grapefrugt?",
        a:"Atorvastatin er en medicin, der sænker dit kolesterol, og du kan tage den på alle tider af døgnet — det vigtigste er, at du tager den på samme tidspunkt hver dag. Den kan tages med eller uden mad. En ting du skal være opmærksom på: undgå at spise store mængder grapefrugt eller drikke grapefrugtjuice, da det kan gøre, at medicinen ophober sig i kroppen og øge risikoen for bivirkninger — særligt muskelsmerter.",
      },
      {
        q:"Hvad er Metformin, og hvornår skal jeg tage det i relation til mad?",
        a:"Metformin er en sukkersygemedicin (diabetes-medicin), der hjælper din krop med at holde blodsukkeret nede. Det er en af de mest brugte og velafprøvede diabetesmediciner, og det tages altid i forbindelse med et måltid eller umiddelbart efter — aldrig på tom mave. Grunden er, at det ellers kan give mavegener som kvalme, diarre og mavesmerter, som mange oplever i starten. Kroppen vænner sig typisk til medicinen inden for 2–4 uger.",
      },
      {
        q:"Hvad er blodtryksmedicin, og hvordan tages Amlodipin, Losartan og Enalapril?",
        a:"Blodtryksmedicin hjælper med at holde dit blodtryk nede og beskytte dit hjerte og dine blodkar over tid. Amlodipin, Losartan og Enalapril er tre forskellige typer blodtryksmedicin — de virker på forskellig måde i kroppen, men målet er det samme: et sundere blodtryk. Alle tre tages normalt én gang dagligt og kan tages med eller uden mad. Det vigtigste er at tage dem på samme tidspunkt hver dag og ikke springe doser over — selv hvis du ikke mærker noget, virker medicinen.",
      },
      {
        q:"Kan jeg tage Ibuprofen, hvis jeg allerede tager blodtryksmedicin?",
        a:"Det frarådes i de fleste tilfælde. Ibuprofen kan modvirke din blodtryksmedicin, så den ikke virker lige så godt — og det kan i sig selv gøre dit blodtryk højere. Det kan også belaste dine nyrer, særligt hvis du tager visse typer blodtryksmedicin. Paracetamol er et langt sikrere valg til smertelindring, hvis du er i blodtryksmedicinbehandling. Spørg altid dit apotek eller din læge, inden du tager noget udover din faste medicin.",
      },
      {
        q:"Hvad sker der, hvis jeg pludseligt stopper med Lamotrigin eller Sertralin?",
        a:"Det er vigtigt, at du aldrig stopper med disse to mediciner fra den ene dag til den anden — hverken Lamotrigin eller Sertralin. Stopper du brat med Lamotrigin, kan det udløse anfald, selv om du har været anfaldsfri i lang tid. Stopper du pludseligt med Sertralin, kan du opleve svimmelhed, prikkende fornemmelse i kroppen, søvnproblemer og humørsvingninger. Begge mediciner skal trappes ned langsomt og under vejledning fra din læge.",
      },
      {
        q:"Hvad skal jeg gøre, hvis jeg tager for mange Paracetamol-tabletter?",
        a:"Ring straks til Giftlinjen på 82 12 12 12 — de er åbne hele døgnet og giver gratis vejledning. Eller ring 112 i akutte tilfælde. En overdosering af Paracetamol er alvorlig, selv hvis du ikke mærker noget med det samme — skaden på leveren kan ske stille og roligt over 24–72 timer. Vent ikke på, at der sker noget. Tag medicin-emballagen med, så personalet kan se præcis, hvad du har taget.",
      },
      {
        q:"Kan Atorvastatin give muskelsmerter, og hvornår skal jeg kontakte min læge?",
        a:"Ja, det kan det. Muskelsmerter er en velkendt bivirkning ved kolesterolmedicin som Atorvastatin. Det opleves typisk som en dump, spredt ømhed eller svaghedsfornemmelse i musklerne — særligt i lår og overarme. Det er ikke farligt for alle, men du bør kontakte din læge, hvis du oplever vedvarende eller tiltagende muskelsmerter, muskelsvaghed eller mørk urin. Din læge kan vurdere, om din dosis skal justeres eller skiftes til en anden type.",
      },
      {
        q:"Hvilket smertestillende virker bedst, og hvornår skal jeg vælge hvad?",
        a:"Det afhænger af, hvad du har ondt i. Paracetamol er det mildeste og skånsomste valg — det passer til de fleste former for smerter som hovedpine, feber og lettere smerter, og det er sikkert for langt de fleste. Ibuprofen er stærkere og virker også på betændelse — det er godt ved tandpine, muskelsmerter og led-smerter, men det kan irritere maven og er ikke egnet til alle. Har du ondt i maven, tager blodtryksmedicin eller er gravid, er Paracetamol det sikreste valg. Er du i tvivl, spørg dit apotek.",
      },
      {
        q:"Kan jeg tage min faste medicin, hvis jeg er begyndt at tage et nyt håndkøbsmiddel?",
        a:"Ikke nødvendigvis — og det er et rigtig vigtigt spørgsmål at stille. Mange håndkøbsmediciner kan påvirke din faste medicin, enten ved at gøre den stærkere, svagere eller ved at give uønskede bivirkninger. For eksempel kan Ibuprofen og visse hostepiller påvirke blodtryksmedicin, og nogle naturlægemidler kan påvirke blodfortyndende medicin. Spørg altid på apoteket, inden du begynder på noget nyt — det er gratis, og personalet er der præcis for at hjælpe dig med den slags.",
      },
    ],
  },
  en: {
    items:[
      {
        q:"What is Lamotrigine, and how should I take it?",
        a:"Lamotrigine is a medicine used to prevent seizures in people with epilepsy and to stabilise mood in people with bipolar disorder. It is important to take it at the same time every day — morning, evening meal or another fixed time that works for you. It can be taken with or without food. If you miss a dose, take it as soon as you remember. Skip it if it is nearly time for your next dose — and never take a double dose. Never stop Lamotrigine from one day to the next without speaking to your doctor first.",
      },
      {
        q:"Can I take Paracetamol and Ibuprofen at the same time, and what is the maximum dose?",
        a:"Yes, you can take both at the same time as they work differently in the body. For Paracetamol, the maximum is 2 tablets (500 mg each) per dose and no more than 8 tablets in a 24-hour period — with at least 4–6 hours between doses. For Ibuprofen, the limit is 1–2 tablets per dose and no more than 6 tablets per day without a prescription — with at least 6–8 hours between doses. Always take Ibuprofen with food to avoid stomach problems.",
      },
      {
        q:"What should I avoid while taking Warfarin (Marevan)?",
        a:"Warfarin is a blood-thinning medicine that requires a little extra attention in daily life. Avoid sudden large changes in how much kale, spinach, broccoli and parsley you eat — these vegetables contain vitamin K, which can affect how well Warfarin works. Also avoid pain relievers such as Ibuprofen and Diclofenac, as they increase the risk of bleeding. Limit alcohol. Remember to attend your regular blood tests and always tell your doctor and dentist that you take Warfarin — especially before any surgery or procedures.",
      },
      {
        q:"Should Atorvastatin be taken in the morning or evening, and can I eat grapefruit?",
        a:"Atorvastatin is a cholesterol-lowering medicine, and you can take it at any time of day — the most important thing is to take it at the same time every day. It can be taken with or without food. One thing to be aware of: avoid eating large amounts of grapefruit or drinking grapefruit juice, as it can cause the medicine to build up in your body and increase the risk of side effects — particularly muscle pain.",
      },
      {
        q:"What is Metformin, and when should I take it in relation to meals?",
        a:"Metformin is a diabetes medicine that helps your body keep blood sugar levels down. It is one of the most commonly used and well-tested diabetes medicines, and it should always be taken with or immediately after a meal — never on an empty stomach. This is because it can otherwise cause stomach problems such as nausea, diarrhoea and stomach pain, which many people experience at the start. The body usually adjusts to the medicine within 2–4 weeks.",
      },
      {
        q:"What is blood pressure medicine, and how do I take Amlodipine, Losartan and Enalapril?",
        a:"Blood pressure medicine helps keep your blood pressure down and protects your heart and blood vessels over time. Amlodipine, Losartan and Enalapril are three different types of blood pressure medicine — they each work in their own way, but the goal is the same: a healthier blood pressure. All three are normally taken once daily and can be taken with or without food. The most important thing is to take them at the same time every day and not skip doses — even if you feel nothing, the medicine is still working.",
      },
      {
        q:"Can I take Ibuprofen if I am already taking blood pressure medicine?",
        a:"In most cases this is not recommended. Ibuprofen can counteract your blood pressure medicine, making it less effective — and can itself raise your blood pressure. It can also put strain on your kidneys, particularly with certain types of blood pressure medicine. Paracetamol is a much safer choice for pain relief if you are on blood pressure treatment. Always ask your pharmacist or doctor before taking anything in addition to your regular medicine.",
      },
      {
        q:"What happens if I suddenly stop taking Lamotrigine or Sertraline?",
        a:"It is important never to stop either of these medicines from one day to the next. Stopping Lamotrigine suddenly can trigger seizures, even if you have been seizure-free for a long time. Stopping Sertraline abruptly can cause dizziness, a tingling sensation in the body, sleep problems and mood swings. Both medicines must be tapered down slowly and under the guidance of your doctor.",
      },
      {
        q:"What should I do if I have taken too many Paracetamol tablets?",
        a:"Call the Poison Information Centre (Giftlinjen) immediately on 82 12 12 12 — they are open around the clock and provide free guidance. Or call 112 in an emergency. A Paracetamol overdose is serious even if you feel nothing at first — liver damage can happen quietly over 24–72 hours. Do not wait for symptoms to appear. Bring the medicine packaging so staff can see exactly what you have taken.",
      },
      {
        q:"Can Atorvastatin cause muscle pain, and when should I contact my doctor?",
        a:"Yes, it can. Muscle pain is a well-known side effect of cholesterol medicines such as Atorvastatin. It is typically felt as a dull, widespread aching or weakness in the muscles — particularly in the thighs and upper arms. It is not dangerous for everyone, but you should contact your doctor if you experience persistent or worsening muscle pain, muscle weakness or dark urine. Your doctor can assess whether your dose needs adjusting or switching to a different type.",
      },
      {
        q:"Which pain reliever works best, and when should I choose which one?",
        a:"It depends on what is causing your pain. Paracetamol is the mildest and gentlest option — it suits most types of pain such as headache, fever and mild aches, and it is safe for the vast majority of people. Ibuprofen is stronger and also works against inflammation — it is good for toothache, muscle pain and joint pain, but it can irritate the stomach and is not suitable for everyone. If you have stomach problems, take blood pressure medicine or are pregnant, Paracetamol is the safer choice. If in doubt, ask your pharmacist.",
      },
      {
        q:"Can I take my regular medicine if I have started a new over-the-counter product?",
        a:"Not necessarily — and that is a really important question to ask. Many over-the-counter medicines can affect your regular medicine, either by making it stronger, weaker or by causing unwanted side effects. For example, Ibuprofen and certain cough medicines can affect blood pressure medicine, and some herbal remedies can affect blood-thinning medicine. Always ask at the pharmacy before starting something new — it is free, and the staff are there precisely to help you with questions like this.",
      },
    ],
  },
  so: {
    items:[
      {
        q:"Maxay tahay Lamotrigin, sidaana loo qaadaa?",
        a:"Lamotrigin waa daawada loo isticmaalo ka hortagga qodob-xanuunka dadka qaba cudurka epilepsy (guba) iyo sidoo kale dejinta xaalada maskaxda dadka qaba bipolar disorder (laba-cirifood). Waa muhiim in aad qaadato wakht isku mid ah maalin kasta — subaxdii, inta cuntada la cunayo habeenkii, ama wakht kale oo joogto ah oo kuu habboon. Waxaa lagu qaadan karaa cuntada la socota ama la'aanteeda. Haddaad hilmaami dosista, qaadana markii aad xasuusan, laakiin ha qaadin laba dosis mar. Weligaana ha joojiyo Lamotrigin si lama filaan ah — mar walba la tasho dhakhtarkaaga horta.",
      },
      {
        q:"Ma qaadan karaa Paracetamol iyo Ibuprofen isla mar, maxayna tahay qadarka ugu badan?",
        a:"Haa, waa la isku dari karaa maadaama ay si kala duwan ugu shaqeeyaan jirka. Paracetamol: ugu badan hal mar 2 kiniin (500 mg mid walba), ugu badna 8 kiniin 24 saacadood gudahood — ugu yaraan 4–6 saacadood u dhexeeya. Ibuprofen: 1–2 kiniin hal mar, ugu badna 6 kiniin maalintii la'aanta qoraalka dhakhtarka — ugu yaraan 6–8 saacadood u dhexeeya. Ibuprofen mar walba qaado cuntada la socota si looga fogaado dhibaatada caloosha.",
      },
      {
        q:"Maxaan ka fogaan karaa intaan ku jiro daawaynta Marevan?",
        a:"Marevan waa daawada dareere-dhiigga ah oo u baahan xoogaa dareen dheeraad ah noloshiisa maalinlaha ah. Iska ilaali isbedelada lama filaan ah ee baaxadda ee cuntada ka kooban K-vitamin — sida canabka cagaaran, isbinaashka, barootiinka iyo baarsaleeyo — maadaama ay saameyn karaan sida Marevan u shaqayso. Sidoo kale iska ilaali xanuun-daawooyinka sida Ibuprofen iyo Diclofenac, maadaama ay kordhinayaan khatarta dhiig-baxa. Xaddid khamriga. Xusuusnow in aad si joogto ah u tagto baaritaanka dhiigga oo mar walba u sheegto dhakhtarkaaga iyo dacawooyaha ilkaha inaad qaadanayso Marevan — gaar ahaan ka hor qalliinka ama falalka caafimaadka.",
      },
      {
        q:"Atorvastatin subaxdii baa lagu qaadaa mise habeenkii, miyaana cirishta lagu cuni karin?",
        a:"Atorvastatin waa daawada hoos u dhigaysa kolestaroolka, waxaana lagu qaadan karaa wakht kasta maalinta — waxa ugu muhiimsan waa in wakht isku mid ah lagu qaado maalin kasta. Waxaa lagu qaadan karaa cuntada la socota ama la'aanteeda. Wax muhiim ah oo la xasuusto: iska ilaali tirada badan ee cirishta ama cabista cabitaankeedu (grapefruit juice), maadaama ay keeni karto in daawadu isu uruursato jirka oo kordhinaysa khatarta saameynta xumida — gaar ahaan xanuunka muruqyada.",
      },
      {
        q:"Maxay tahay Metformin, goormaana la qaadaa marka la eego cuntada?",
        a:"Metformin waa daawada sonkoraha (diabetes) oo caawisa jirkaaga inuu hoos u dhigo heerka sonkoraha dhiigga. Waa mid ka mid ah daawooyinka diabetes ee inta badan la isticmaalo oo si fiican loo tijaabiyay, waxaana lagu qaadaa marka cuntada la cuno ama isla markiiba ka dib — weligeedna calool madhan. Sababtu waxay tahay in kale waxay keeni karto dhibaatooyin caloosha sida dareeraha, shuban iyo xanuunka caloosha, kuwaas oo badan ee bilowga. Jiruhu caadiga ahaan wuu qabsadaa 2–4 todobaad gudahood.",
      },
      {
        q:"Maxay tahay daawooyinka dhiig-karka, sidaana Amlodipin, Losartan iyo Enalapril loo qaadaa?",
        a:"Daawooyinka dhiig-karka waxay ka caawiyaan in dhiig-karkaagu hoos u dhaco oo ay u ilaaliyaan wadnahaaga iyo xididdada dhiigga waqti ka dib. Amlodipin, Losartan iyo Enalapril waa saddex nooc oo kala duwan oo daawooyinka dhiig-karka ah — mid walba si gaar ah ayuu u shaqeeyaa, laakiin ujeeddadu waa isku mid: dhiig-kar caafimaad leh. Saddadkooduba caadiga ahaan waxaa lagu qaadaa hal mar maalintii, waxaana lagu qaadan karaa cuntada la socota ama la'aanteeda. Waxa ugu muhiimsan waa in wakht isku mid ah lagu qaado maalin kasta oo aan la bixin dosisyada — xitaa haddaanad waxba dareensanayn, daawadu waxay wali shaqaynaysaa.",
      },
      {
        q:"Ma qaadan karaa Ibuprofen haddaan ku jiro daawaynta dhiig-karka?",
        a:"Inta badan tani laguma talinayo. Ibuprofen waxay ka hor istaagi kartaa daawooyinka dhiig-karka oo waxay ka dhigi kartaa inay si wanaagsan u shaqaynayn — waxayna si madaxbanaan u kordhin kartaa dhiig-karka. Sidoo kale waxay culays saari kartaa kelyahaaga, gaar ahaan noocyada qaarkood ee daawooyinka dhiig-karka. Paracetamol waa xulasho aad u ammaan ah ee xanuun-daaweynta haddaad ku jirto daawaynta dhiig-karka. Mar walba weydii farmashiistaha ama dhakhtarkaaga ka hor inaad wax qaadato marka laga reebo daawooyinkaaga caadiga ah.",
      },
      {
        q:"Maxaa dhacaya haddaan si lama filaan ah u joojiyaa Lamotrigin ama Sertralin?",
        a:"Waa muhiim inaadan weligaaba joojiyin labadaas daawoba si lama filaan ah. Joojinta lama filaan ah ee Lamotrigin waxay kicin kartaa qodob-xanuunno, xitaa haddaad muddo dheer ahayd mid aan qodob-xanuun lahayn. Joojinta lama filaan ah ee Sertralin waxay keeni kartaa sharar, dareenkii gubasho ah ee jirka, dhibaatooyin hurdada iyo isbeddelada xaalada. Labada daawoba waa in si tartiib ah hoos loogu dhigo hagitaanka dhakhtarka.",
      },
      {
        q:"Maxaan sameeyaa haddaan qaatay Paracetamol badan?",
        a:"Si deg-deg ah u wac Giftlinjen lambarka 82 12 12 12 — waa furan yihiin 24 saacadood oo bixiya hagitaan bilaash ah. Ama wac 112 xaaladaha degdega ah. Xad-dhaafka Paracetamol waa cidhibeed, xitaa haddaanad dareensanayn waxba markiiba — dhaawaca beerta waxay dhici kartaa si aamusan 24–72 saacadood gudahood. Ha sugin calaamadaha. Qaado xirmada daawooyinka si shaqaalaha ay u garanayaan waxa iyo tirada aad qaadatay.",
      },
      {
        q:"Ma Atorvastatin keeni kartaa xanuunka muruqyada, goormaana la la xiriiraa dhakhtarka?",
        a:"Haa, waxay keeni kartaa. Xanuunka muruqyada waa saameyn xun la yaqaan ee daawooyinka kolestaroolka sida Atorvastatin. Caadiga ahaan waxaa laga dareemaa xanuun kala firirsan oo dullaaday ama daciifnimo muruqyada — gaar ahaan cududaha iyo gacanaha sare. Khatarsan maaha qof kasta, laakiin waa in aad la xiriirtaa dhakhtarkaaga haddaad dareento xanuun muruq oo joogto ah ama sii kordhaya, daciifnimo muruq ama kaadi madow. Dhakhtarkaagu wuxuu qiimeyn doonaa haddii qadarka la beddelan doono ama nooca kale la isku beddeli doono.",
      },
      {
        q:"Kuma daawadu xanuunta ugu fiican, goormaana la doortaa mid kasta?",
        a:"Waxay ku xidantahay waxa aad ka xanuuneyso. Paracetamol waa xulashada ugu fudud oo ugu naxariis badnaanta — waxay u habboon tahay noocyada badan ee xanuunka sida madax xanuun, qandho iyo xanuun fudud, waxayna ammaan u tahay dadka inta badan. Ibuprofen waa ka xooggan tahay waxayna kaashanaysaa xanuunka barar leh — waxay ku fiican tahay xanuunka ilkaha, muruqyada iyo xubno xanuunka, laakiin waxay irritate gareyn kartaa caloosha mana habboonayn qof kasta. Haddaad qabto dhibaato caloosha, aad qaadanayso daawooyinka dhiig-karka ama aad uur leedahay, Paracetamol waa xulashada ammaan ah. Haddaad shaki qabto, weydii farmashiistaha.",
      },
      {
        q:"Ma qaadan karaa daawooyinkayga caadiga ah haddaan bilaabay daawooyin cusub oo aan qoraal u baahnayn?",
        a:"Maaha had iyo jeer — taasna waa su'aal muhiim aad isku weydiin. Daawooyin badan oo aan qoraal u baahnayn waxay saameyn karaan daawooyinkaaga caadiga ah, iyagoo ka dhigaya mid xooggan, mid daciif ah ama iyagoo sababa saameynta xumida aan la rabin. Tusaale ahaan, Ibuprofen iyo daawooyinka qaarkood ee qufaca waxay saameyn karaan daawooyinka dhiig-karka, qaarkoodna daawooyinka dabiiciga ah waxay saameyn karaan daawooyinka dareere-dhiigga. Mar walba farmashiistaha weydii ka hor intaadan bilaamin wax cusub — waa bilaash, shaqaaluhuna waxay joogaan si kuu caawiyaan su'aalaha noocan ah.",
      },
    ],
  },
  ar: {
    items:[
      {
        q:"ما هو لاموتريجين وكيف يُؤخذ؟",
        a:"لاموتريجين دواء يُستخدم للوقاية من نوبات الصرع لدى المصابين بالصرع، وكذلك لاستقرار المزاج لدى المصابين بالاضطراب ثنائي القطب. من الضروري تناوله في نفس الوقت كل يوم — سواء الصباح أو وجبة العشاء أو أي وقت ثابت يناسبك. يمكن تناوله مع الطعام أو بدونه. إذا فاتتك جرعة، تناولها حال تذكّرك — لكن تجاوزها إذا اقترب موعد الجرعة التالية، ولا تُضاعف الجرعة أبداً. لا توقف لاموتريجين فجأة من تلقاء نفسك — تحدث إلى طبيبك أولاً.",
      },
      {
        q:"هل يمكنني تناول الباراسيتامول والإيبوبروفين معاً، وما الجرعة القصوى؟",
        a:"نعم، يمكن تناولهما معاً لأنهما يعملان بطريقتين مختلفتين في الجسم. للباراسيتامول: الحد الأقصى للجرعة الواحدة قرصان (500 مغ لكل منهما)، وحد أقصى 8 أقراص في 24 ساعة — مع فاصل لا يقل عن 4–6 ساعات. للإيبوبروفين: 1–2 قرص في المرة، وحد أقصى 6 أقراص يومياً بدون وصفة — مع فاصل لا يقل عن 6–8 ساعات. تناول الإيبوبروفين دائماً مع الطعام لتجنب مشاكل المعدة.",
      },
      {
        q:"ما الذي يجب تجنبه أثناء علاج الوارفارين (ماريفان)؟",
        a:"الوارفارين دواء مُرقِّق للدم يحتاج إلى قدر من الانتباه في الحياة اليومية. تجنّب التغيرات المفاجئة والكبيرة في كمية اللفت الأخضر والسبانخ والبروكلي والبقدونس التي تتناولها — إذ تحتوي هذه الخضروات على فيتامين K الذي يمكن أن يؤثر على فعالية الوارفارين. تجنّب أيضاً مسكنات الألم كالإيبوبروفين والديكلوفيناك لأنها تزيد خطر النزيف. اعتدل في تناول الكحول. احرص على الذهاب لفحوصات الدم المنتظمة وأخبر طبيبك وطبيب أسنانك دائماً بأنك تتناول الوارفارين — خاصةً قبل أي عملية جراحية أو إجراء.",
      },
      {
        q:"هل يُؤخذ أتورفاستاتين صباحاً أم مساءً، وهل يمكنني تناول الجريب فروت؟",
        a:"أتورفاستاتين دواء يُخفض الكوليسترول، ويمكن تناوله في أي وقت من اليوم — الأهم هو الالتزام بنفس الوقت يومياً. يمكن تناوله مع الطعام أو بدونه. شيء مهم يجب الانتباه إليه: تجنّب تناول كميات كبيرة من الجريب فروت أو شرب عصيره، لأنه قد يتسبب في تراكم الدواء في الجسم وزيادة خطر الآثار الجانبية — ولا سيما آلام العضلات.",
      },
      {
        q:"ما هو ميتفورمين، ومتى يُؤخذ بالنسبة للوجبات؟",
        a:"ميتفورمين دواء للسكري يساعد جسمك على خفض مستوى السكر في الدم. وهو من أكثر أدوية السكري استخداماً وأفضلها توثيقاً، ويجب تناوله دائماً مع الوجبة أو مباشرة بعدها — وليس على معدة فارغة أبداً. السبب أنه قد يسبب اضطرابات في المعدة كالغثيان والإسهال وآلام البطن، وهي شائعة في البداية. يعتاد الجسم عليه عادةً خلال 2–4 أسابيع.",
      },
      {
        q:"ما هي أدوية ضغط الدم، وكيف يُؤخذ أملوديبين ولوسارتان وإيناليبريل؟",
        a:"تساعد أدوية ضغط الدم على خفض ضغط دمك وحماية قلبك وأوعيتك الدموية مع مرور الوقت. أملوديبين ولوسارتان وإيناليبريل ثلاثة أنواع مختلفة من أدوية ضغط الدم — كل منها يعمل بطريقته الخاصة، لكن الهدف واحد: ضغط دم أكثر صحة. تُؤخذ الثلاثة عادةً مرة واحدة يومياً ويمكن تناولها مع الطعام أو بدونه. الأهم هو تناولها في نفس الوقت كل يوم وعدم تفويت الجرعات — حتى لو لم تشعر بشيء، الدواء يعمل.",
      },
      {
        q:"هل يمكنني تناول الإيبوبروفين إذا كنت آخذ دواء لضغط الدم؟",
        a:"في معظم الحالات لا يُنصح بذلك. يمكن للإيبوبروفين أن يُضعف تأثير دواء ضغط الدم ويجعله أقل فعالية — وقد يرفع ضغط الدم من تلقاء نفسه. كما قد يُجهد الكلى خاصةً مع بعض أنواع أدوية ضغط الدم. الباراسيتامول خيار أكثر أماناً لتسكين الألم إذا كنت تتناول علاجاً لضغط الدم. استشر الصيدلي أو طبيبك دائماً قبل تناول أي شيء إضافي.",
      },
      {
        q:"ماذا يحدث إذا توقفت فجأة عن لاموتريجين أو سيرترالين؟",
        a:"من المهم ألا تتوقف عن أي من هذين الدواءين فجأة. قد يؤدي التوقف المفاجئ عن لاموتريجين إلى نوبات صرع، حتى لو كنت بلا نوبات لفترة طويلة. أما التوقف المفاجئ عن سيرترالين فقد يسبب دواراً وإحساساً بالوخز في الجسم ومشاكل في النوم وتقلبات في المزاج. يجب تخفيض كلا الدواءين تدريجياً وتحت إشراف طبيبك.",
      },
      {
        q:"ماذا أفعل إذا تناولت عدداً كبيراً من أقراص الباراسيتامول؟",
        a:"اتصل فوراً بمركز السموم Giftlinjen على الرقم 82 12 12 12 — مفتوح على مدار الساعة ويقدم إرشادات مجانية. أو اتصل بـ 112 في حالات الطوارئ. الجرعة الزائدة من الباراسيتامول خطيرة حتى لو لم تشعر بشيء في البداية — يمكن أن يحدث تلف الكبد بصمت خلال 24–72 ساعة. لا تنتظر ظهور الأعراض. أحضر عبوة الدواء حتى يعرف الكوادر الطبية ما تناولته بالضبط.",
      },
      {
        q:"هل يمكن لأتورفاستاتين أن يسبب آلام عضلية، ومتى أتصل بطبيبي؟",
        a:"نعم، يمكن ذلك. آلام العضلات من الآثار الجانبية المعروفة لأدوية الكوليسترول كأتورفاستاتين. تُحس عادةً كألم منتشر خفيف أو ضعف في العضلات — خاصةً في الفخذين والذراعين. ليست خطيرة على الجميع، لكن يجب الاتصال بطبيبك إذا عانيت من آلام عضلية مستمرة أو متزايدة، أو ضعف عضلي أو بول داكن. سيُقيّم طبيبك ما إذا كانت الجرعة تحتاج إلى تعديل أو تغيير نوع الدواء.",
      },
      {
        q:"أي مسكن للألم هو الأفضل، ومتى أختار كل منهما؟",
        a:"يعتمد ذلك على سبب الألم. الباراسيتامول هو الخيار الأخف والأكثر لطفاً — يناسب معظم أنواع الألم كالصداع والحمى والآلام الخفيفة، وهو آمن للغالبية العظمى. الإيبوبروفين أقوى ويعمل أيضاً ضد الالتهاب — جيد لآلام الأسنان وآلام العضلات والمفاصل، لكنه قد يُهيج المعدة وليس مناسباً للجميع. إذا كنت تعاني من مشاكل في المعدة أو تتناول أدوية ضغط الدم أو كنتِ حاملاً، فالباراسيتامول هو الخيار الأكثر أماناً. في حال الشك، اسأل الصيدلي.",
      },
      {
        q:"هل يمكنني تناول دوائي المعتاد إذا بدأت دواءً جديداً بدون وصفة؟",
        a:"ليس بالضرورة — وهذا سؤال مهم جداً. كثير من الأدوية التي لا تحتاج وصفة يمكن أن تؤثر على دوائك المعتاد، إما بجعله أقوى أو أضعف أو بالتسبب في آثار جانبية غير مرغوبة. على سبيل المثال، الإيبوبروفين وبعض أدوية السعال قد تؤثر على أدوية ضغط الدم، وبعض العلاجات العشبية قد تؤثر على مرقِّقات الدم. استشر الصيدلية دائماً قبل البدء بأي شيء جديد — الخدمة مجانية والكوادر موجودون تماماً لمساعدتك في مثل هذه الأسئلة.",
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
function MailIcon({size=18,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);}
function StarIcon({size=16,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);}
function QuestionIcon({size=16,color="currentColor"}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>);}

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

// ── Contact Modal ──────────────────────────────────────────────────────────
function ContactModal({language,onClose}){
  const isRtl=language==="ar";
  const navLabels=NAV_LABELS[language]??NAV_LABELS.so;
  const data=CONTACT_DATA[language]??CONTACT_DATA.so;
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const iconEl=<MailIcon size={22} color="rgba(255,255,255,0.95)"/>;
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
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const faqTitle=FAQ_MODAL_TITLE[language]??FAQ_MODAL_TITLE.so;
  const iconEl=<QuestionIcon size={22} color="rgba(255,255,255,0.95)"/>;
  return(
    <ModalShell title={faqTitle} iconEl={iconEl} onClose={onClose} isRtl={isRtl} wide>
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

  const navTabs=useMemo(()=>[
    {key:"me",      iconEl:<img src={P.education} alt="" style={{width:15,height:15,objectFit:"contain"}}/>, label:navLabels.aboutMe},
    {key:"site",    iconEl:<img src={P.work}      alt="" style={{width:15,height:15,objectFit:"contain"}}/>, label:navLabels.aboutSite},
    {key:"faq",     iconEl:<QuestionIcon size={15} color={iconColors.faq}/>,       label:navLabels.faq},
    {key:"feedback",iconEl:<StarIcon     size={15} color={iconColors.feedback}/>,   label:navLabels.feedback},
    {key:"contact", iconEl:<MailIcon     size={15} color={iconColors.contact}/>,    label:navLabels.contact},
  ],[navLabels,iconColors]);

  return(
    <div style={{background:"var(--bg)",color:"var(--text)"}} className="min-h-screen">

      {/* ── Sticky nav — NO pills logo, only the site's own existing logo ── */}
      <div style={{background:"rgba(255,255,255,0.96)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid rgba(0,0,0,0.07)",position:"sticky",top:"58px",zIndex:90}}>
        <div style={{maxWidth:"72rem",margin:"0 auto",padding:"0 1rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:"58px",gap:"8px"}}>
          <div />

          {/* Tab buttons */}
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
