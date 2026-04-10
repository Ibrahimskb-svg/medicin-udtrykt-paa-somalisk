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
  amlodipin:        { da: "Amlodipin",                             en: "Amlodipine",                          ar: "أملوديبين",                               so: "Amlodipin" },
  hjertemagnyl:     { da: "Hjertemagnyl (Acetylsalicylsyre, ASA)", en: "Aspirin (Acetylsalicylic acid, ASA)", ar: "أسبرين (حمض أسيتيل الساليسيليك، ASA)",  so: "Hjertemagnyl (Acetylsalicylsyre, ASA)" },
  zopiclon:         { da: "Imozop (Zopiclon)",                     en: "Imovane (Zopiclone)",                 ar: "إيموفان (زوبيكلون)",                       so: "Imozop (Zopiclon)" },
  lamotrigin:       { da: "Lamotrigin",                            en: "Lamotrigine",                         ar: "لاموتريجين",                               so: "Lamotrigin" },
  pantoprazol:      { da: "Pantoprazol",                           en: "Pantoprazole",                        ar: "بانتوبرازول",                              so: "Pantoprazol" },
  quetiapin:        { da: "Quetiapin",                             en: "Quetiapine",                          ar: "كويتيابين",                                so: "Quetiapin" },
  sertralin:        { da: "Sertralin",                             en: "Sertraline",                          ar: "سيرترالين",                                so: "Sertralin" },
  ventoline:        { da: "Ventoline (Salbutamol)",                en: "Ventolin (Salbutamol)",               ar: "فنتولين (سالبوتامول)",                     so: "Ventoline (Salbutamol)" },
  morfin_injektion: { da: "Morfin (injektion)",                    en: "Morphine (injection)",                ar: "مورفين (حقن)",                             so: "Morfin (irbad)" },
  morfin_tablet:    { da: "Morfin (tablet)",                       en: "Morphine (tablet)",                   ar: "مورفين (قرص)",                             so: "Morfin (kiniin)" },
};

function getDisplayName(slug, language, fallback) {
  const t = SLUG_DISPLAY_NAMES[slug];
  if (!t) return fallback;
  return t[language] ?? t.so ?? fallback;
}

// ── Nav labels ─────────────────────────────────────────────────────────────
const NAV_LABELS = {
  da: { aboutMe: "Om mig", aboutSite: "Om Somalimed", faq: "FAQ", feedback: "Ris & Ros", contact: "Kontakt" },
  en: { aboutMe: "About me", aboutSite: "About Somalimed", faq: "FAQ", feedback: "Feedback", contact: "Contact" },
  so: { aboutMe: "Ku saabsan aniga", aboutSite: "Ku saabsan Somalimed", faq: "Su'aalaha", feedback: "Faallo", contact: "Xiriir" },
  ar: { aboutMe: "نبذة عني", aboutSite: "نبذة عن Somalimed", faq: "الأسئلة الشائعة", feedback: "آراء وملاحظات", contact: "تواصل معي" },
};

// ── Color themes ───────────────────────────────────────────────────────────
const LANG_THEME = {
  so: { primary: "#0D9488", soft: "#F0FDFA", border: "#99f6e4", tagBg: "linear-gradient(135deg,#f0fdfa,#e0f2fe)" },
  da: { primary: "#2563EB", soft: "#EFF6FF", border: "#bfdbfe", tagBg: "linear-gradient(135deg,#eff6ff,#dbeafe)" },
  en: { primary: "#92400E", soft: "#FEF3C7", border: "#fcd34d", tagBg: "linear-gradient(135deg,#fef3c7,#fde68a)" },
  ar: { primary: "#D97706", soft: "#FFFBEB", border: "#fde68a", tagBg: "linear-gradient(135deg,#fffbeb,#fef3c7)" },
};

const BULLET_PALETTES = {
  so: [{ color:"#0D9488",bg:"#F0FDFA"},{color:"#059669",bg:"#ECFDF5"},{color:"#0F766E",bg:"#CCFBF1"},{color:"#0284C7",bg:"#F0F9FF"}],
  da: [{ color:"#2563EB",bg:"#EFF6FF"},{color:"#1D4ED8",bg:"#DBEAFE"},{color:"#3B82F6",bg:"#EFF6FF"},{color:"#0284C7",bg:"#F0F9FF"}],
  en: [{ color:"#92400E",bg:"#FEF3C7"},{color:"#B45309",bg:"#FEF9EE"},{color:"#C2410C",bg:"#FFF7ED"},{color:"#DC2626",bg:"#FEF2F2"}],
  ar: [{ color:"#D97706",bg:"#FFFBEB"},{color:"#B45309",bg:"#FEF3C7"},{color:"#EA580C",bg:"#FFF7ED"},{color:"#F59E0B",bg:"#FFFBEB"}],
};

// ── Contact data ───────────────────────────────────────────────────────────
const CONTACT_DATA = {
  da: {
    title: "Kontakt mig",
    intro: "Har du spørgsmål til et lægemiddel, et forslag til siden eller blot lyst til at skrive? Jeg svarer gerne — skriv til mig på e-mail.",
    emailLabel: "E-mail",
    emailNote: "Svar inden for 1–2 hverdage",
    responseTitle: "Hvad kan du skrive om?",
    topics: ["Spørgsmål om et specifikt lægemiddel", "Forslag til nye emner eller lægemidler", "Fejl eller unøjagtigheder på siden", "Generel feedback eller ros"],
  },
  en: {
    title: "Contact me",
    intro: "Do you have a question about a medicine, a suggestion for the site, or just want to get in touch? I am happy to help — write to me by email.",
    emailLabel: "Email",
    emailNote: "Response within 1–2 working days",
    responseTitle: "What can you write about?",
    topics: ["Questions about a specific medicine", "Suggestions for new topics or medicines", "Errors or inaccuracies on the site", "General feedback or praise"],
  },
  so: {
    title: "Ii xiriir",
    intro: "Ma qabtaa su'aal ku saabsan daawooyin, talooyin ku saabsan bogga, mise waxaad rabaan inaad xiriir la yeeshaan? Waxaan ku faraxsanahay inaan kaa caawiyaa — ii qor emailka.",
    emailLabel: "Emailka",
    emailNote: "Jawaab ayaad helaysaa 1–2 maalmood gudahood",
    responseTitle: "Maxaad ka qori kartaa?",
    topics: ["Su'aalaha ku saabsan daawooyin gaar ah", "Talooyin ku saabsan mawduucyo ama daawooyin cusub", "Khaladaadka ama xog aan saxnayn bogga", "Faallo guud ama amaano"],
  },
  ar: {
    title: "تواصل معي",
    intro: "هل لديك سؤال حول دواء معين، أو اقتراح للموقع، أو تريد فقط التواصل؟ يسعدني مساعدتك — راسلني عبر البريد الإلكتروني.",
    emailLabel: "البريد الإلكتروني",
    emailNote: "سيتم الرد خلال يوم أو يومين عمل",
    responseTitle: "عمَّ يمكنك الكتابة؟",
    topics: ["أسئلة حول دواء معين", "اقتراحات لموضوعات أو أدوية جديدة", "أخطاء أو معلومات غير دقيقة في الموقع", "تعليقات عامة أو إطراء"],
  },
};

// ── FAQ data — 10 questions, all 4 languages, professionally written ───────
const FAQ_DATA = {
  da: {
    title: "Ofte stillede spørgsmål",
    items: [
      {
        q: "Hvor mange tabletter skal jeg tage?",
        a: "Det afhænger af det konkrete lægemiddel og din læges anvisning — det er altid det vigtigste udgangspunkt. Som en generel vejledning tages mange lægemidler én gang dagligt, mens andre tages to gange. Nogle skal tages på tom mave, andre med mad. For eksempel tages Pantoprazol typisk 30 minutter før et måltid for bedst virkning. Læs altid indlægssedlen og følg din læges eller apotekspersonalets anvisning.",
      },
      {
        q: "Hvor mange timer skal der gå mellem doserne?",
        a: "Det afhænger af lægemidlet. For Paracetamol gælder det, at der skal gå mindst 4–6 timer mellem hver dosis, og at du højst må tage 2 tabletter ad gangen og maksimalt 8 tabletter i løbet af ét døgn. Overskrides dette, kan det belaste leveren alvorligt. For andre smertestillende som Ibuprofen og Diclofenac er dosisintervallet typisk 6–8 timer. Følg altid den anbefalede dosis og tidsinterval.",
      },
      {
        q: "Hvilke bivirkninger kan jeg opleve?",
        a: "Bivirkninger varierer fra lægemiddel til lægemiddel. De hyppigst rapporterede er hovedpine, træthed og svimmelhed — disse er ofte milde og forbigående. Nogle lægemidler kan give mave-tarm-gener som kvalme eller diarre, mens andre kan påvirke søvnen. Oplever du kraftige eller vedvarende bivirkninger, bør du altid kontakte din læge eller apotek. Det er vigtigt at huske, at ikke alle oplever bivirkninger.",
      },
      {
        q: "Hvad skal jeg huske, når jeg tager blodtryksmedicin?",
        a: "Blodtryksmedicin virker bedst, når du kombinerer den med en sund livsstil. Det er en god idé at begrænse dit saltindtag, da salt kan øge blodtrykket. Spis gerne 300–450 g fisk om ugen og op til 800 g frugt og grønt dagligt — særligt grøntsager med grønne blade som spinat, rucola og selleri, da de indeholder nitrat, som har en blodtrykssænkende effekt. Husk desuden at tage din medicin regelmæssigt, selvom du ikke mærker nogen symptomer. Forhøjet blodtryk er ofte lydløst og giver sjældent mærkbare gener — men det kan over tid skade hjerte, nyrer og blodkar, hvis det ikke behandles.",
      },
      {
        q: "Hvad sker der, hvis jeg glemmer at tage min blodtryksmedicin?",
        a: "En enkelt glemt dosis er sjældent farlig, men det er vigtigt ikke at gøre det til en vane. Forhøjet blodtryk mærkes sjældent direkte — men ubehandlet kan det over tid stille og roligt skade blodkar, hjerte og nyrer uden at du opdager det. Tag din medicin, så snart du husker det — men tag aldrig dobbelt dosis for at kompensere. Hvis du ofte glemmer det, kan det hjælpe at tage medicinen på et fast tidspunkt hver dag, fx om morgenen.",
      },
      {
        q: "Kan jeg tage Ibuprofen og Paracetamol samtidig?",
        a: "Ja, det er faktisk muligt at kombinere de to, da de virker på forskellig vis i kroppen. Paracetamol virker primært i centralnervesystemet, mens Ibuprofen er et antiinflammatorisk middel. Kombination kan i visse situationer give bedre smertelindring end et enkelt præparat alene. Det er dog vigtigt, at du holder dig til de anbefalede doser for hvert enkelt lægemiddel og ikke overskrider maksimaldosis. Tal med din apotek eller læge, hvis du er i tvivl.",
      },
      {
        q: "Hvornår skal jeg tage min sovemedicin, og kan den skabe afhængighed?",
        a: "Sovemedicin som Zopiclon (Imozop) bør tages umiddelbart inden sengetid og kun, når du har mulighed for at sove i mindst 7–8 timer. Medicinen virker hurtigt og kan give en følelse af træthed allerede inden du lægger dig. Zopiclon kan ved længerevarende brug skabe psykisk og fysisk afhængighed og bør ikke anvendes over lange perioder uden lægelig vurdering. Tal altid med din læge, hvis du har brugt sovemedicin i mere end 2–4 uger.",
      },
      {
        q: "Hvad skal jeg undgå, når jeg tager blodfortyndende medicin?",
        a: "Blodfortyndende medicin som Marevan (Warfarin), Eliquis eller Xarelto kræver særlig opmærksomhed. Du bør undgå pludselige ændringer i dit indtagelse af K-vitaminrige fødevarer som grønkål, spinat og broccoli, da disse kan påvirke virkningen af Marevan. Undgå desuden at tage smertestillende som Ibuprofen eller Diclofenac uden lægelig anbefaling, da kombinationen kan øge blødningsrisikoen. Fortæl altid din læge og tandlæge, at du er i blodfortyndende behandling — særligt inden operationer eller indgreb.",
      },
      {
        q: "Kan jeg drikke alkohol, mens jeg tager medicin?",
        a: "Det afhænger meget af lægemidlet. Generelt frarådes alkohol under medicinsk behandling, da det kan forstærke eller svække medicinens virkning og øge risikoen for bivirkninger. For eksempel bør du absolut undgå alkohol, hvis du tager smertestillende som Paracetamol i høje doser, da kombinationen kan skade leveren. Alkohol frarådes også ved brug af sovemedicin, antidepressiva og blodtryksmedicin. Spørg altid din apotek eller læge, hvis du er usikker.",
      },
      {
        q: "Hvad gør jeg, hvis jeg har fået for meget medicin?",
        a: "Kontakt straks 1813 (lægevagten) eller ring 112 i akutte tilfælde. Du kan også kontakte Giftlinjen på telefon 82 12 12 12, som er åben hele døgnet og giver gratis vejledning ved forgiftning eller overdosis. Vær rolig, og forsøg at have informationer om det pågældende lægemiddel og den mængde, du har taget, klar til personalet.",
      },
    ],
  },
  en: {
    title: "Frequently Asked Questions",
    items: [
      {
        q: "How many tablets should I take?",
        a: "This depends on the specific medicine and your doctor's instructions — always follow the guidance you have been given. As a general rule, many medicines are taken once daily while others are taken twice a day. Some must be taken on an empty stomach, others with food. For example, Pantoprazole is typically taken 30 minutes before a meal for the best effect. Always read the patient leaflet and follow the advice of your doctor or pharmacist.",
      },
      {
        q: "How many hours should pass between doses?",
        a: "It depends on the medicine. For Paracetamol, at least 4–6 hours must pass between doses. You should take no more than 2 tablets at a time and no more than 8 tablets within a 24-hour period. Exceeding this can cause serious liver damage. For other pain relievers such as Ibuprofen and Diclofenac, the dosing interval is typically 6–8 hours. Always follow the recommended dose and timing.",
      },
      {
        q: "What side effects might I experience?",
        a: "Side effects vary between medicines. The most commonly reported are headache, fatigue and dizziness — these are often mild and temporary. Some medicines can cause gastrointestinal issues such as nausea or diarrhoea, while others may affect sleep. If you experience severe or persistent side effects, always contact your doctor or pharmacist. It is important to remember that not everyone experiences side effects.",
      },
      {
        q: "What should I keep in mind when taking blood pressure medicine?",
        a: "Blood pressure medicine works best when combined with a healthy lifestyle. It is a good idea to reduce your salt intake, as salt can raise blood pressure. Aim to eat 300–450 g of fish per week and up to 800 g of fruit and vegetables daily — particularly leafy green vegetables such as spinach, rocket and celery, which contain nitrates that help lower blood pressure. Remember to take your medicine regularly even when you feel no symptoms. High blood pressure is often silent and rarely causes noticeable discomfort — yet over time it can quietly damage your heart, kidneys and blood vessels if left untreated.",
      },
      {
        q: "What happens if I forget to take my blood pressure medicine?",
        a: "A single missed dose is rarely dangerous, but it is important not to make it a habit. High blood pressure is rarely felt directly — yet when left untreated, it can gradually and silently damage blood vessels, the heart and kidneys without you noticing. Take your medicine as soon as you remember — but never take a double dose to make up for a missed one. If you often forget, it may help to take your medicine at a fixed time each day, for example in the morning.",
      },
      {
        q: "Can I take Ibuprofen and Paracetamol at the same time?",
        a: "Yes, it is actually possible to combine the two, as they work differently in the body. Paracetamol acts primarily in the central nervous system, while Ibuprofen is an anti-inflammatory medicine. In certain situations, combining them can provide better pain relief than either medicine alone. It is important, however, to stick to the recommended dose for each medicine and not exceed the maximum dose. Speak to your pharmacist or doctor if you are unsure.",
      },
      {
        q: "When should I take sleeping medicine, and can it cause dependency?",
        a: "Sleeping medicine such as Zopiclone (Imovane) should be taken immediately before bedtime and only when you have the opportunity to sleep for at least 7–8 hours. It works quickly and may cause drowsiness before you even lie down. With prolonged use, Zopiclone can cause both psychological and physical dependency and should not be used for extended periods without medical assessment. Always speak to your doctor if you have been using sleeping medicine for more than 2–4 weeks.",
      },
      {
        q: "What should I avoid when taking blood-thinning medicine?",
        a: "Blood-thinning medicines such as Warfarin (Marevan), Eliquis or Xarelto require particular attention. Avoid sudden changes in your intake of foods rich in vitamin K such as kale, spinach and broccoli, as these can affect how Warfarin works. Also avoid taking pain relievers such as Ibuprofen or Diclofenac without medical advice, as the combination can increase the risk of bleeding. Always inform your doctor and dentist that you are on blood-thinning treatment — particularly before surgery or procedures.",
      },
      {
        q: "Can I drink alcohol while taking medicine?",
        a: "It depends greatly on the medicine. Alcohol is generally discouraged during medical treatment, as it can strengthen or weaken the effect of the medicine and increase the risk of side effects. For example, alcohol should be completely avoided when taking high doses of Paracetamol, as the combination can damage the liver. Alcohol is also discouraged when using sleeping medicine, antidepressants and blood pressure medicine. Always ask your pharmacist or doctor if you are unsure.",
      },
      {
        q: "What should I do if I have taken too much medicine?",
        a: "Contact emergency services or your local poison control centre immediately. In Denmark you can call the Poison Information Centre (Giftlinjen) on 82 12 12 12, which is open around the clock and provides free guidance in cases of poisoning or overdose. Stay calm and try to have information about the medicine and the amount taken ready for medical staff.",
      },
    ],
  },
  so: {
    title: "Su'aalaha inta badan la isweydiiyo",
    items: [
      {
        q: "Imisa kiniin ayaan qaadan karaa?",
        a: "Tani waxay ku xidantahay daawooyinka gaarka ah iyo tilmaamaha dhakhtarkaaga — taasi waa had iyo jeer meesha ugu muhiimsan ee laga bilaabo. Sida guud, daawooyin badan waxaa lagu qaadaa mar maalintii, halka kuwa kale lagu qaado laba jeer. Qaarkood waa in lagu qaataa calool madhan, halka kuwa kale lagu qaado cuntada. Tusaale ahaan, Pantoprazol waxaa caadiga ah lagu qaadaa 30 daqiiqo ka hor wajiga cuntada si awoodeeda ugu fiican. Mar walba akhri warqadda macluumaadka oo raac tilmaamaha dhakhtarkaaga ama farmashiistaha.",
      },
      {
        q: "Immisa saacadood ayaa u dhexaysa labada qaad?",
        a: "Tani waxay ku xidantahay daawooyinka. Paracetamol, ugu yaraan 4–6 saacadood ayaa u dhexaysan doonta labada qaad. Hal mar ma qaadan kartid ka badan 2 kiniin, mana gaadhi kartid 8 kiniin 24 saacadood gudahood. Haddaad xadka ka baxdo, waxay si xun u saamayn kartaa beer. Xanuun-daawooyinka kale sida Ibuprofen iyo Diclofenac, waqtiga u dhexeeya waa inta badan 6–8 saacadood. Mar walba raac qadarka la talinayo iyo waqtiga u dhexeeya.",
      },
      {
        q: "Waa maxay saameynta xumida ee laga yaabo in la arko?",
        a: "Saameynta xumida waxay kala duwan tahay daawo kasta. Kuwii inta badan la soo sheego waa madax xanuun, daali, iyo sharar — inta badan waa fudud oo ku meel gaadha. Daawooyin qaarkood waxay keeni karaan dhibaatooyin caloosha ah sida dareeraha ama shuban, halka kuwa kale ay saamayn karaan hurdada. Haddaad dareento saameyn xun oo xooggan ama joogtaysa, mar walba la xiriir dhakhtarkaaga ama farmashiistaha. Waa muhiim in la ogaado in aanay dadka dhammaan saameynta xumida dareensanayn.",
      },
      {
        q: "Maxaan xusuusan karaa marka aan qaadanayo daawooyinka dhiig-karka?",
        a: "Daawooyinka dhiig-karka waxay si wanaagsan u shaqeeyaan marka la isku daro nolol caafimaad leh. Waa fikrad wanaagsan in la yareeyo isticmaalka cusbo, maadaama cusbo uu kordhin karo dhiig-karka. Isku day inaad cunno 300–450 g kalluun toddobaadkii iyo ilaa 800 g khudaar iyo midho maalintii — gaar ahaan khudaarka caleenta cagaaran ee sida isbinaash, rucola iyo karafas, kuwaas oo ka kooban nayitrate kaas oo dhiig-karka dhimaya. Xusuusnow inaad qaadato dawahaaga si joogto ah xitaa haddaanad calaamad dareensanayn. Dhiig-karka sarreeya badanaa waa aamusan yahay mana keeno xanuun la dareeyo — laakiin waqti ka dib, si tartiib ah ayuu u waxyeeli karaa wadnaha, kelyaha iyo xididdada dhiigga haddaan la daweyn.",
      },
      {
        q: "Maxaa dhici karaa haddaan hilmaamo inaan qaato daawooyinka dhiig-karka?",
        a: "Dosis keli ah oo la hilmaamay badanaa khatarsan maaha, laakiin waa muhiim inaanay caado noqon. Dhiig-karka sarreeya badanaa si toos ah laguma dareeyo — laakiin haddaan la daweyn, si tartiib ah oo aamusan ayuu u waxyeeli karaa xididdada dhiigga, wadnaha iyo kelyaha adigoon ogaan. Qaado dawahaaga markii aad xasuusato — laakiin ha qaadin dosis labanlaab ah si aad u badeshid midkii la hilmaamay. Haddaad badanaa hilmaamaysid, waxaa caawin karta inaad qaadato dawahaaga wakht go'an maalin kasta, tusaale ahaan subaxdii.",
      },
      {
        q: "Ma qaadan karaa Ibuprofen iyo Paracetamol isla mar?",
        a: "Haa, run ahaantii waa suurtagal in labada la isku daro, maadaama ay si kala duwan ugu shaqeeyaan jirka. Paracetamol waxay si gaar ah ugu shaqaysaa nidaamka xididdada maskaxda, halka Ibuprofen ay tahay daawada ka hortaga barar. Isku darka, xaaladaha qaarkood, wuxuu bixin karaa xanuun-daaweyn ka wanaagsan mid keli ah oo ka mid ah labada. Laakiin waa muhiim inaad raacdo qadarka la talinayo ee dawo kasta oo aanad xadka ka bixin. Hadaad shaki qabto, la tasho farmashiistaha ama dhakhtarkaaga.",
      },
      {
        q: "Goorma ayaan qaadan karaa daawooyinka hurdada, miyayna isu keeni afhayeen?",
        a: "Daawooyinka hurdada sida Zopiclon (Imozop) waa in lagu qaataa si toos ah ka hor jiifka oo keliya marka aad fursad u haysatid inaad seexato ugu yaraan 7–8 saacadood. Waxay si dhakhso ah u shaqaysaa waxayna keeni kartaa daali xitaa ka hor inta aanad jiifin. Haddaa si joogto ah loo isticmaalo, Zopiclon waxay sababi kartaa afhayeen maskaxeed iyo jireed, mana loo isticmaali karo muddooyin dheer la'aanta qiimaynta caafimaadka. Mar walba la hadal dhakhtarkaaga haddaad isticmaashay daawooyinka hurdada muddo ka badan 2–4 todobaad.",
      },
      {
        q: "Maxaan ka fogaan karaa marka aan qaadanayo daawooyinka dareere-dhiigga?",
        a: "Daawooyinka dareere-dhiigga sida Marevan (Warfarin), Eliquis ama Xarelto waxay u baahan yihiin dareen gaar ah. Iska ilaali isbedelada lama filaan ah ee cuntada ka kooban vitamin K sida canabka cagaaran, isbinaashka iyo barootiinka, maadaama ay saameyn karaan sida Marevan u shaqayso. Sidoo kale iska ilaali qaadista xanuun-daawooyinka sida Ibuprofen ama Diclofenac la'aanta talinimada caafimaad, maadaama isku darku kordhin karo khatarta dhiig-baxa. Mar walba u sheeg dhakhtarkaaga iyo dacawooyaha ilkaha inaad ku jirto daawaynta dareere-dhiigga — gaar ahaan ka hor qalliimada ama falalka caafimaadka.",
      },
      {
        q: "Ma cabi karaa khamri marka aan qaadanayo daawooyin?",
        a: "Tani waxay aad ugu xidantahay daawooyinka. Guud ahaan, khamriga laguma talinayo inta lagu jiro daawaynta caafimaadka, maadaama uu kordhin karo ama yareeyn karo awooda daawada oo kordhin karo khatarta saameynta xumida. Tusaale ahaan, khamriga waa in laga fogaado gabi ahaanba marka la qaadanayo Paracetamol qadaro sarreeya, maadaama isku darku waxyeeli karo beer. Khamriga sidoo kale laguma talinayo marka la isticmaalayo daawooyinka hurdada, ka-hortagga murugada iyo daawooyinka dhiig-karka. Mar walba weydii farmashiistaha ama dhakhtarkaaga haddaad shaki qabto.",
      },
      {
        q: "Maxaan sameeyaa haddaan qaatay daawooyin badan?",
        a: "Si degdeg ah u la xiriir adeegga xaaladaha degdega ah ama xarunta macluumaadka sumowga ee gobolkaaga. Adoo ku nool Denmark, waxaad wici kartaa Giftlinjen (xarunta macluumaadka sumowga) lambarka 82 12 12 12, kaas oo furan 24 saacadood oo bixiya hagitaan bilaash ah xaaladaha sumowga ama xad-dhaafka. Joogso xasilloon, iyana isku day inaad diyaarsatid macluumaadka ku saabsan daawooyinka iyo tirada aad qaadatay si aad xoghayaasha caafimaadka ugu soo bandhigto.",
      },
    ],
  },
  ar: {
    title: "الأسئلة الشائعة",
    items: [
      {
        q: "كم عدد الأقراص التي يجب أن أتناولها؟",
        a: "يعتمد ذلك على الدواء المحدد وتعليمات طبيبك — وهذا دائماً هو المرجع الأساسي. كقاعدة عامة، تُؤخذ كثير من الأدوية مرة واحدة يومياً، في حين تُؤخذ أخرى مرتين. بعضها يجب أن يُؤخذ على معدة فارغة، والبعض الآخر مع الطعام. على سبيل المثال، يُؤخذ بانتوبرازول عادةً قبل 30 دقيقة من الوجبة لتحقيق أفضل تأثير. اقرأ دائماً نشرة الدواء واتبع إرشادات طبيبك أو الصيدلي.",
      },
      {
        q: "كم عدد الساعات التي يجب أن تمر بين الجرعات؟",
        a: "يتوقف ذلك على الدواء. بالنسبة للباراسيتامول، يجب أن يمر ما لا يقل عن 4–6 ساعات بين كل جرعة وأخرى، ولا يجوز تناول أكثر من قرصين في المرة الواحدة أو أكثر من 8 أقراص خلال 24 ساعة. تجاوز ذلك قد يلحق أذىً بالغاً بالكبد. أما بالنسبة لمسكنات الألم الأخرى كالإيبوبروفين والديكلوفيناك، فالفترة الفاصلة بين الجرعات تبلغ عادةً 6–8 ساعات. اتبع دائماً الجرعة الموصى بها والتوقيت المحدد.",
      },
      {
        q: "ما الآثار الجانبية التي قد أعاني منها؟",
        a: "تتفاوت الآثار الجانبية من دواء لآخر. الأكثر شيوعاً هي الصداع والتعب والدوخة — وهي في الغالب خفيفة وعابرة. قد تسبب بعض الأدوية اضطرابات في الجهاز الهضمي كالغثيان أو الإسهال، في حين تؤثر أخرى على النوم. إذا عانيت من آثار جانبية شديدة أو مستمرة، تواصل دائماً مع طبيبك أو الصيدلي. من المهم أن تعلم أن ليس الجميع يعانون من آثار جانبية.",
      },
      {
        q: "ما الذي يجب أن أضعه في الحسبان عند تناول دواء ضغط الدم؟",
        a: "تعمل أدوية ضغط الدم بشكل أفضل عند دمجها بأسلوب حياة صحي. من المستحسن تقليل تناول الملح، إذ يمكن أن يرفع ضغط الدم. احرص على تناول 300–450 جرام من الأسماك أسبوعياً وما يصل إلى 800 جرام من الفواكه والخضروات يومياً — ولا سيما الخضروات ذات الأوراق الخضراء كالسبانخ والجرجير والكرفس، لاحتوائها على النيترات التي تساعد في خفض ضغط الدم. تذكر أن تتناول دواءك بانتظام حتى وإن لم تشعر بأعراض. ارتفاع ضغط الدم غالباً صامت ونادراً ما يسبب إزعاجاً ملحوظاً — لكنه مع مرور الوقت قد يتلف القلب والكلى والأوعية الدموية بشكل تدريجي إذا لم يُعالَج.",
      },
      {
        q: "ماذا يحدث إذا نسيت تناول دواء ضغط الدم؟",
        a: "نسيان جرعة واحدة نادراً ما يكون خطيراً، لكن من المهم ألا يصبح ذلك عادة. نادراً ما يُحسّ بارتفاع ضغط الدم بشكل مباشر — لكن إذا ترك دون علاج، فإنه يمكن أن يتلف الأوعية الدموية والقلب والكلى بصمت وتدريج دون أن تشعر بذلك. تناول دواءك حال تذكّره — لكن لا تتناول جرعة مضاعفة لتعويض ما فاتك. إذا كنت تنسى كثيراً، قد يساعدك تناول الدواء في وقت ثابت كل يوم، كالصباح مثلاً.",
      },
      {
        q: "هل يمكنني تناول الإيبوبروفين والباراسيتامول معاً في الوقت ذاته؟",
        a: "نعم، يمكن الجمع بينهما فعلاً، إذ يعملان بطريقتين مختلفتين في الجسم. يعمل الباراسيتامول أساساً على الجهاز العصبي المركزي، بينما يُعدّ الإيبوبروفين دواءً مضاداً للالتهابات. قد يوفر الجمع بينهما في بعض الحالات تخفيفاً أفضل للألم مقارنة بأي منهما منفرداً. غير أنه من الضروري الالتزام بالجرعة الموصى بها لكل دواء وعدم تجاوز الحد الأقصى. استشر الصيدلي أو طبيبك إذا كنت في شك.",
      },
      {
        q: "متى يجب تناول حبوب النوم، وهل يمكن أن تسبب إدماناً؟",
        a: "ينبغي تناول حبوب النوم كالزوبيكلون (إيموفان) مباشرة قبل النوم وفقط عندما يتوفر لديك وقت للنوم لمدة 7–8 ساعات على الأقل. يعمل الدواء بسرعة وقد يسبب النعاس قبل أن تستلقي. عند الاستخدام المطوّل، يمكن أن يسبب الزوبيكلون اعتماداً نفسياً وجسدياً، ولا يجوز استخدامه لفترات طويلة دون تقييم طبي. تحدث دائماً مع طبيبك إذا كنت تستخدم حبوب النوم لأكثر من 2–4 أسابيع.",
      },
      {
        q: "ما الذي يجب تجنبه عند تناول أدوية تخفيف الدم؟",
        a: "تستلزم أدوية تخفيف الدم كالوارفارين (ماريفان) وإليكويس وزاريلتو عناية خاصة. تجنّب التغييرات المفاجئة في تناول الأطعمة الغنية بفيتامين K كاللفت الأخضر والسبانخ والبروكلي، إذ يمكن أن تؤثر على مفعول الوارفارين. كذلك، تجنّب تناول مسكنات الألم كالإيبوبروفين أو الديكلوفيناك دون توصية طبية، لأن الجمع بينها قد يزيد من خطر النزيف. أخبر طبيبك وطبيب أسنانك دائماً بأنك تتلقى علاجاً بمميّعات الدم — لا سيما قبل أي عملية جراحية أو إجراء طبي.",
      },
      {
        q: "هل يمكنني شرب الكحول أثناء تناول الدواء؟",
        a: "يعتمد ذلك اعتماداً كبيراً على نوع الدواء. يُنصح بشكل عام بتجنب الكحول أثناء العلاج الدوائي، إذ يمكن أن يُعزز أو يُضعف مفعول الدواء ويزيد من مخاطر الآثار الجانبية. على سبيل المثال، يجب تجنب الكحول كلياً عند تناول جرعات عالية من الباراسيتامول، لأن الجمع بينهما يمكن أن يتلف الكبد. كما يُنصح بتجنب الكحول عند استخدام حبوب النوم ومضادات الاكتئاب وأدوية ضغط الدم. استشر دائماً الصيدلي أو طبيبك إذا كنت في شك.",
      },
      {
        q: "ماذا أفعل إذا تناولت كمية زائدة من الدواء؟",
        a: "تواصل فوراً مع خدمات الطوارئ أو مركز السموم في منطقتك. في الدنمارك يمكنك الاتصال بخط معلومات السموم (Giftlinjen) على الرقم 82 12 12 12، المفتوح على مدار الساعة ويقدم إرشادات مجانية في حالات التسمم أو الجرعات الزائدة. حافظ على هدوئك وحاول أن يكون لديك معلومات عن الدواء وكمية ما تناولته جاهزةً للكوادر الطبية.",
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

// ── About Me bullets ───────────────────────────────────────────────────────
const ABOUT_ME_BULLETS = {
  da: [
    { icon:"education", text:"Bachelor i Kemi og Medicinalbiologi samt uddannet Farmakonom" },
    { icon:"work",      text:"Daglig praksis på privatapotek og vagtapotek" },
    { icon:"pills",     text:"Brobygger mellem faglig viden og mennesker med forskellig baggrund" },
    { icon:"school",    text:"Brænder for klar, tryg og tilgængelig lægemiddelinformation" },
  ],
  en: [
    { icon:"education", text:"Bachelor's degree in Chemistry & Medicinal Biology, trained Pharmaconomist" },
    { icon:"work",      text:"Daily practice in both community pharmacy and emergency pharmacy" },
    { icon:"pills",     text:"Bridge-builder between professional knowledge and diverse communities" },
    { icon:"school",    text:"Passionate about clear, trustworthy and accessible medicine information" },
  ],
  so: [
    { icon:"education", text:"Shahaadada koowaad ee Kimistari iyo Bayoolajiga Dawooyinka, waxaan sidoo kale ahay farmashiiste tababaran" },
    { icon:"work",      text:"Shaqo maalinleh oo ku saabsan farmashiyaha bulshada iyo farmashiyaha xaaladaha degdega ah" },
    { icon:"pills",     text:"Waxaan ka shaqeeyaa in aqoonta xirfadeedka lagu gaarsiiyo dadka asalkoodu kala duwan yahay" },
    { icon:"school",    text:"Waxaan aad u xiiseynayaa macluumaadka daawooyinka ee cad, la aamin karo oo dhammaanba u fududaada" },
  ],
  ar: [
    { icon:"education", text:"بكالوريوس في الكيمياء وعلم الأحياء الدوائي، وحاصل على تأهيل فارماكونوم" },
    { icon:"work",      text:"ممارسة يومية في الصيدلية الخاصة وصيدلية المناوبة" },
    { icon:"pills",     text:"جسر بين المعرفة المتخصصة والمجتمعات ذات الخلفيات المتنوعة" },
    { icon:"school",    text:"شغف حقيقي بتقديم معلومات دوائية واضحة وموثوقة وسهلة الوصول للجميع" },
  ],
};

const ABOUT_ME_META = {
  da: { name:"Ibrahim Dahir Hanaf",  title:"Farmakonom & naturvidenskabelig formidler" },
  en: { name:"Ibrahim Dahir Hanaf",  title:"Pharmaconomist & science communicator" },
  so: { name:"Ibraahim Dahir Xanaf", title:"Farmashiiste & xog-ogaal caafimaad" },
  ar: { name:"إبراهيم ظاهر حنف",    title:"فارماكونوم ومتخصص في التواصل العلمي" },
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

// ── Medicine maps ──────────────────────────────────────────────────────────
const SLUG_ICON={amlodipin:"blood-pressure.png",enalapril:"blood-pressure.png",losartan:"blood-pressure.png",metoprolol:"blood-pressure.png",eliquis:"line.png",marevan:"line.png",xarelto:"line.png",hjertemagnyl:"line.png",atorvastatin:"cholesterol.png",metformin:"blood-test.png",insulin:"blood-test.png",ventoline:"lungs.png",symbicort:"lungs.png",sertralin:"mental-health.png",quetiapin:"mental-health.png",lamotrigin:"brain.png",melatonin:"nighttime.png",zopiclon:"nighttime.png",paracetamol:"download.png",ibuprofen:"download.png",diclofenac:"download.png",naproxen:"download.png",morfin_tablet:"download.png",morfin_injektion:"download.png",pantoprazol:"stomach.png"};
const SLUG_STYLE={amlodipin:{color:"#DC2626",bg:"#FEF2F2"},enalapril:{color:"#DC2626",bg:"#FEF2F2"},losartan:{color:"#DC2626",bg:"#FEF2F2"},metoprolol:{color:"#E11D48",bg:"#FFF1F2"},eliquis:{color:"#7C3AED",bg:"#F5F3FF"},marevan:{color:"#7C3AED",bg:"#F5F3FF"},xarelto:{color:"#7C3AED",bg:"#F5F3FF"},hjertemagnyl:{color:"#6D28D9",bg:"#EDE9FE"},atorvastatin:{color:"#D97706",bg:"#FFFBEB"},metformin:{color:"#0284C7",bg:"#F0F9FF"},insulin:{color:"#0284C7",bg:"#F0F9FF"},ventoline:{color:"#0D9488",bg:"#F0FDFA"},symbicort:{color:"#0D9488",bg:"#F0FDFA"},sertralin:{color:"#8B5CF6",bg:"#F5F3FF"},quetiapin:{color:"#A855F7",bg:"#FAF5FF"},lamotrigin:{color:"#7C3AED",bg:"#F5F3FF"},melatonin:{color:"#4F46E5",bg:"#EEF2FF"},zopiclon:{color:"#6366F1",bg:"#EEF2FF"},paracetamol:{color:"#F59E0B",bg:"#FFFBEB"},ibuprofen:{color:"#EF4444",bg:"#FEF2F2"},diclofenac:{color:"#EF4444",bg:"#FEF2F2"},naproxen:{color:"#EF4444",bg:"#FEF2F2"},morfin_tablet:{color:"#059669",bg:"#ECFDF5"},morfin_injektion:{color:"#059669",bg:"#ECFDF5"},pantoprazol:{color:"#10B981",bg:"#ECFDF5"}};
const DEFAULT_STYLE={color:"#0D9488",bg:"#F0FDFA"};
const CATEGORY_PILL_ICON={"forhøjet blodtryk":{icon:"blood-pressure.png",color:"#DC2626",bg:"#FEF2F2"},"blodtryk & hjertebanken":{icon:"blood-pressure.png",color:"#E11D48",bg:"#FFF1F2"},"blodfortyndende":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"blodpropforebyggelse":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"kolesterol":{icon:"cholesterol.png",color:"#D97706",bg:"#FFFBEB"},"diabetes":{icon:"blood-test.png",color:"#0284C7",bg:"#F0F9FF"},"astma":{icon:"lungs.png",color:"#0D9488",bg:"#F0FDFA"},"depression & angst":{icon:"mental-health.png",color:"#8B5CF6",bg:"#F5F3FF"},"psykose & bipolar":{icon:"mental-health.png",color:"#A855F7",bg:"#FAF5FF"},"epilepsi & bipolar":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"søvn":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"søvnløshed":{icon:"nighttime.png",color:"#6366F1",bg:"#EEF2FF"},"smertestillende":{icon:"download.png",color:"#059669",bg:"#ECFDF5"},"smerter og feber":{icon:"download.png",color:"#F59E0B",bg:"#FFFBEB"},"smerter og betændelse":{icon:"download.png",color:"#EF4444",bg:"#FEF2F2"},"mavesyre og halsbrand":{icon:"stomach.png",color:"#10B981",bg:"#ECFDF5"},"dhiig-karka":{icon:"blood-pressure.png",color:"#DC2626",bg:"#FEF2F2"},"dhiig-karka & wadne garaac":{icon:"blood-pressure.png",color:"#E11D48",bg:"#FFF1F2"},"dhiig-khafiifiye":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"dhiig-xinjir ka hortag":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"kolestarool":{icon:"cholesterol.png",color:"#D97706",bg:"#FFFBEB"},"sonkoroow":{icon:"blood-test.png",color:"#0284C7",bg:"#F0F9FF"},"neef-mareenka":{icon:"lungs.png",color:"#0D9488",bg:"#F0FDFA"},"niyad-jab & welwel":{icon:"mental-health.png",color:"#8B5CF6",bg:"#F5F3FF"},"cilad dhimirka & laba-cirifood":{icon:"mental-health.png",color:"#A855F7",bg:"#FAF5FF"},"suuxdin & laba-cirifood":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"hurdo":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"hurdo la'aan":{icon:"nighttime.png",color:"#6366F1",bg:"#EEF2FF"},"xanuun baabi'iye":{icon:"download.png",color:"#059669",bg:"#ECFDF5"},"xanuun & qandho":{icon:"download.png",color:"#F59E0B",bg:"#FFFBEB"},"xanuun & barar":{icon:"download.png",color:"#EF4444",bg:"#FEF2F2"},"gaastriga iyo laab-jeexa":{icon:"stomach.png",color:"#10B981",bg:"#ECFDF5"},"high blood pressure":{icon:"blood-pressure.png",color:"#DC2626",bg:"#FEF2F2"},"blood pressure & palpitations":{icon:"blood-pressure.png",color:"#E11D48",bg:"#FFF1F2"},"blood thinner":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"blood clot prevention":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"cholesterol":{icon:"cholesterol.png",color:"#D97706",bg:"#FFFBEB"},"asthma":{icon:"lungs.png",color:"#0D9488",bg:"#F0FDFA"},"depression & anxiety":{icon:"mental-health.png",color:"#8B5CF6",bg:"#F5F3FF"},"psychosis & bipolar":{icon:"mental-health.png",color:"#A855F7",bg:"#FAF5FF"},"epilepsy & bipolar":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"sleep":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"insomnia":{icon:"nighttime.png",color:"#6366F1",bg:"#EEF2FF"},"pain relief":{icon:"download.png",color:"#059669",bg:"#ECFDF5"},"pain and fever":{icon:"download.png",color:"#F59E0B",bg:"#FFFBEB"},"pain and inflammation":{icon:"download.png",color:"#EF4444",bg:"#FEF2F2"},"stomach acid and heartburn":{icon:"stomach.png",color:"#10B981",bg:"#ECFDF5"},"ارتفاع ضغط الدم":{icon:"blood-pressure.png",color:"#DC2626",bg:"#FEF2F2"},"ضغط الدم وخفقان القلب":{icon:"blood-pressure.png",color:"#E11D48",bg:"#FFF1F2"},"مميع للدم":{icon:"line.png",color:"#7C3AED",bg:"#F5F3FF"},"الوقاية من الجلطات":{icon:"line.png",color:"#6D28D9",bg:"#EDE9FE"},"الكوليسترول":{icon:"cholesterol.png",color:"#D97706",bg:"#FFFBEB"},"السكري":{icon:"blood-test.png",color:"#0284C7",bg:"#F0F9FF"},"الربو":{icon:"lungs.png",color:"#0D9488",bg:"#F0FDFA"},"الاكتئاب والقلق":{icon:"mental-health.png",color:"#8B5CF6",bg:"#F5F3FF"},"الذهان وثنائي القطب":{icon:"mental-health.png",color:"#A855F7",bg:"#FAF5FF"},"الصرع وثنائي القطب":{icon:"brain.png",color:"#7C3AED",bg:"#F5F3FF"},"النوم":{icon:"nighttime.png",color:"#4F46E5",bg:"#EEF2FF"},"الأرق":{icon:"nighttime.png",color:"#6366F1",bg:"#EEF2FF"},"مسكن ألم":{icon:"download.png",color:"#059669",bg:"#ECFDF5"},"ألم وحمى":{icon:"download.png",color:"#F59E0B",bg:"#FFFBEB"},"ألم والتهاب":{icon:"download.png",color:"#EF4444",bg:"#FEF2F2"},"حموضة المعدة وحرقة المعدة":{icon:"stomach.png",color:"#10B981",bg:"#ECFDF5"}};

function getPillMeta(l){return CATEGORY_PILL_ICON[l]||{icon:"download.png",color:"#0D9488",bg:"#F0FDFA"};}
function capitalize(s){if(!s)return s;return s.charAt(0).toUpperCase()+s.slice(1);}
function buildCategoryPills(language){const seen=new Set(),pills=[];for(const item of indexData.items){const label=indexData.subtitles[item.slug]?.[language]||indexData.subtitles[item.slug]?.so||"";if(!label||seen.has(label))continue;seen.add(label);pills.push({label,language});}return pills;}

// ── SVG Icons ──────────────────────────────────────────────────────────────
function SearchIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7.5"/><path d="m20 20-4.2-4.2"/></svg>);}
function ShieldIcon(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>);}
function MailIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);}
function StarIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);}
function QuestionIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>);}
function PhoneIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.09 6.09l1.27-.89a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>);}

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
      <div onClick={(e)=>e.stopPropagation()} style={{background:"#f8fafc",borderRadius:"28px",width:"100%",maxWidth:wide?"640px":"560px",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 40px 100px rgba(0,0,0,0.28)",direction:isRtl?"rtl":"ltr"}}>
        <div style={{background:"var(--heroBg)",borderRadius:"28px 28px 0 0",padding:"22px 24px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
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
    <li style={{display:"flex",alignItems:"center",gap:"14px",background:"#fff",borderRadius:"16px",padding:"13px 16px",border:`1.5px solid ${palette.color}22`,boxShadow:`0 2px 8px ${palette.color}10`}}>
      <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:46,height:46,borderRadius:"13px",flexShrink:0,background:palette.bg,border:`1.5px solid ${palette.color}30`,boxShadow:`0 2px 8px ${palette.color}20`}}>
        <img src={P[bullet.icon]} alt="" style={{width:28,height:28,objectFit:"contain"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>
      </span>
      <span style={{fontSize:"15px",color:"#1e293b",lineHeight:1.6,fontWeight:500}}>{bullet.text}</span>
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
  const iconEl=<div style={{color:"rgba(255,255,255,0.9)"}}><MailIcon/></div>;
  return(
    <ModalShell title={navLabels.contact} iconEl={iconEl} onClose={onClose} isRtl={isRtl}>
      <p style={{fontSize:"15px",color:"#475569",lineHeight:1.7,margin:"0 0 20px",textAlign:isRtl?"right":"left"}}>{data.intro}</p>
      {/* Email button */}
      <a href="mailto:Ibrahim_skb@live.dk" style={{display:"flex",alignItems:"center",gap:"12px",padding:"16px 20px",borderRadius:"18px",background:theme.tagBg,border:`1.5px solid ${theme.border}`,textDecoration:"none",marginBottom:"20px",transition:"all 0.2s"}}>
        <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:44,height:44,borderRadius:"12px",background:theme.primary,flexShrink:0}}>
          <span style={{color:"#fff"}}><MailIcon/></span>
        </span>
        <div>
          <p style={{fontWeight:700,fontSize:"15px",color:theme.primary,margin:0}}>Ibrahim_skb@live.dk</p>
          <p style={{fontSize:"13px",color:"#64748b",margin:"2px 0 0"}}>{data.emailNote}</p>
        </div>
      </a>
      {/* Topics */}
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
  const [open,setOpen]=useState(null);
  const isRtl=language==="ar";
  const data=FAQ_DATA[language]??FAQ_DATA.so;
  const navLabels=NAV_LABELS[language]??NAV_LABELS.so;
  const theme=LANG_THEME[language]??LANG_THEME.so;
  const iconEl=<div style={{color:"rgba(255,255,255,0.9)"}}><QuestionIcon/></div>;
  return(
    <ModalShell title={navLabels.faq} iconEl={iconEl} onClose={onClose} isRtl={isRtl} wide>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {data.items.map((item,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:"16px",border:`1.5px solid ${open===i?theme.primary+"55":"#e5e7eb"}`,overflow:"hidden",boxShadow:open===i?`0 4px 16px ${theme.primary}15`:"0 1px 3px rgba(0,0,0,0.04)",transition:"all 0.2s"}}>
            <button type="button" onClick={()=>setOpen(open===i?null:i)} style={{width:"100%",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px",padding:"15px 18px",background:"none",border:"none",cursor:"pointer",textAlign:isRtl?"right":"left"}}>
              <span style={{fontWeight:700,fontSize:"15px",color:open===i?theme.primary:"#0f172a",lineHeight:1.4,flex:1}}>{item.q}</span>
              <span style={{flexShrink:0,width:26,height:26,borderRadius:"50%",background:open===i?theme.primary:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",color:open===i?"#fff":theme.primary,fontSize:"17px",fontWeight:700,transition:"all 0.2s",marginTop:"1px"}}>
                {open===i?"−":"+"}
              </span>
            </button>
            {open===i&&(
              <div style={{padding:"0 18px 16px",fontSize:"14px",color:"#475569",lineHeight:1.75,borderTop:`1px solid ${theme.primary}20`}}>{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

// ── Feedback Modal ─────────────────────────────────────────────────────────
function FeedbackModal({language,onClose}){
  const [type,setType]=useState("praise");
  const [msg,setMsg]=useState("");
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
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
  const iconEl=<div style={{color:"rgba(255,255,255,0.9)"}}><StarIcon/></div>;
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

  const navTabs=[
    {key:"me",    iconEl:<img src={P.education} alt="" style={{width:15,height:15,objectFit:"contain"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>, label:navLabels.aboutMe},
    {key:"site",  iconEl:<img src={P.work}      alt="" style={{width:15,height:15,objectFit:"contain"}} onError={(e)=>{e.currentTarget.style.display="none";}}/>, label:navLabels.aboutSite},
    {key:"faq",   iconEl:<QuestionIcon/>,  label:navLabels.faq},
    {key:"feedback",iconEl:<StarIcon/>,    label:navLabels.feedback},
    {key:"contact", iconEl:<MailIcon/>,   label:navLabels.contact},
  ];

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
                  <span style={{display:"flex",alignItems:"center",opacity:active?1:0.65}}>{iconEl}</span>
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
