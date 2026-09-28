// Skranke-kort — hurtige, store to-sidede kort til brug ansigt til ansigt
// med en kunde ved skranken. Somaliske oversættelser er gennemgået og
// godkendt af Ibrahim (native speaker) ord for ord — ret dem IKKE uden at
// spørge ham først. Arabiske oversættelser er et førsteudkast og er endnu
// ikke gennemgået af en modersmålstalende — flag det tydeligt i UI'en.
export const COUNTER_CARD_CATEGORIES = [
  {
    id: "sikkerhed",
    color: "rose",
    icon: "shield",
    label: { da: "Sikkerhedsspørgsmål", en: "Safety questions", so: "Su'aalaha nabadgelyada", ar: "أسئلة السلامة" },
    phrases: [
      { da: "Er du gravid?", en: "Are you pregnant?", so: "Miyaad uur leedahay?", ar: "هل أنتِ حامل؟" },
      { da: "Ammer du?", en: "Are you breastfeeding?", so: "Ma nuujisaa?", ar: "هل ترضعين؟" },
      { da: "Har du feber?", en: "Do you have a fever?", so: "Ma qandho qabtaa?", ar: "هل لديك حمى؟" },
      { da: "Er du allergisk over for noget?", en: "Are you allergic to anything?", so: "Ma qabtaa xasaasiyad?", ar: "هل لديك حساسية من أي شيء؟" },
      { da: "Har du andre sygdomme?", en: "Do you have any other illnesses?", so: "Ma qabtaa cudur kale?", ar: "هل لديك أمراض أخرى؟" },
      { da: "Tager du anden medicin?", en: "Are you taking any other medicine?", so: "Ma qaadataa daawo kale?", ar: "هل تتناول أدوية أخرى؟" },
    ],
  },
  {
    id: "dosering",
    color: "sky",
    icon: "clock",
    label: { da: "Doseringsbesked", en: "Dosing instructions", so: "Fariinta qiyaasta", ar: "تعليمات الجرعة" },
    phrases: [
      { da: "Tag denne med mad", en: "Take this with food", so: "Daawadaan waxaa lagu qaadan karaa, adigoo cunto la qaadanaya.", ar: "تناول هذا مع الطعام" },
      { da: "Tag denne uden mad", en: "Take this without food", so: "Daawadaan waxaa lagu qaadan karaa, adigoon cunto cunin.", ar: "تناول هذا على معدة فارغة" },
      { da: "Kan tages med eller uden mad", en: "Can be taken with or without food", so: "Waxaa lagu qaadan karaa adigoon cunto cunin ama adigoo cunto la qaadanaya.", ar: "يمكن تناوله مع الطعام أو بدونه" },
      { da: "Tag denne om morgenen", en: "Take this in the morning", so: "Qaado tan subaxdii", ar: "تناول هذا صباحًا" },
      { da: "Tag denne om aftenen", en: "Take this in the evening", so: "Qaado tan fiidkii", ar: "تناول هذا مساءً" },
      { da: "Tag denne 2 gange dagligt", en: "Take this twice daily", so: "Qaado tan 2 jeer maalintii", ar: "تناول هذا مرتين يوميًا" },
      { da: "Tag denne efter behov", en: "Take this as needed", so: "Qaado tan marka loo baahdo", ar: "تناول هذا عند الحاجة" },
    ],
  },
  {
    id: "advarsel",
    color: "amber",
    icon: "alert",
    label: { da: "Advarsel", en: "Warning", so: "Digniin", ar: "تحذير" },
    phrases: [
      { da: "Undgå at udsætte dig for solen efter denne medicin", en: "Avoid sun exposure after this medicine", so: "Ha isu bandhigin qorraxda ka dib marka aad qaadato daawadan.", ar: "تجنب التعرض لأشعة الشمس بعد تناول هذا الدواء" },
      { da: "Kør ikke bil efter denne medicin", en: "Don't drive after this medicine", so: "Ha wadin baabuur ka dib marka aad qaadato daawadan.", ar: "لا تقُد السيارة بعد تناول هذا الدواء" },
      { da: "Drik ikke alkohol mens du tager denne medicin", en: "Don't drink alcohol while taking this medicine", so: "Ha cabin khamri inta aad qaadanayso daawadan.", ar: "لا تشرب الكحول أثناء تناول هذا الدواء" },
      { da: "Denne medicin kan medføre træthed eller søvnighed", en: "This medicine can cause fatigue or drowsiness", so: "Daawadani waxay keeni kartaa daal ama hurdo.", ar: "قد يسبب هذا الدواء التعب أو النعاس" },
    ],
  },
];
