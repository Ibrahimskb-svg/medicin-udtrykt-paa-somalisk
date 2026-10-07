// Ordliste over danske apoteks- og receptord, som patienter møder i praksis,
// men sjældent får forklaret. "term" er den oversatte betegnelse på hvert
// sprog — det danske originalord vises kun via sprogvælgeren (ikke gentaget
// i parentes), da det ellers er redundant og ser uprofessionelt ud.
export const pharmacyGlossary = [
  {
    id: "recept",
    term: { da: "Recept", en: "Prescription", so: "Warqad dhakhtareed", ar: "وصفة طبية" },
    explanation: {
      da: "Lægens skriftlige godkendelse af, at du må få en bestemt medicin. Uden recept kan apoteket ikke udlevere receptpligtig medicin.",
      en: "The doctor's written approval that you may receive a specific medicine. Without a prescription, the pharmacy cannot hand out prescription-only medicine.",
      so: "Waa oggolaanshaha qoraal ah ee dhakhtarku kuu siiyo si aad daawo gaar ah u heshid. Warqad dhakhtareed la'aan farmashiyuhu ma kuu siin karo daawooyinka loo baahan yahay warqad dhakhtareed.",
      ar: "هي الموافقة الخطية من الطبيب على حصولك على دواء معين. بدون وصفة، لا يمكن للصيدلية صرف الأدوية التي تتطلب وصفة طبية.",
    },
  },
  {
    id: "e-recept",
    term: { da: "E-recept", en: "E-prescription", so: "Warqad dhakhtareed elektaroonig ah", ar: "الوصفة الإلكترونية" },
    explanation: {
      da: "Lægen sender recepten elektronisk direkte til apoteket. Du behøver ikke selv have papiret med — apoteket kan finde den, når du opgiver dit CPR-nummer.",
      en: "The doctor sends the prescription electronically straight to the pharmacy. You don't need to bring any paper — the pharmacy can look it up when you give your CPR number.",
      so: "Dhakhtarku wuxuu si toos ah elektaroonig ahaan ugu diraa warqadda farmashiyaha. Uma baahnid inaad warqad la timaaddo — farmashiyuhu wuu ka helayaa markaad siiso lambarkaaga CPR.",
      ar: "يرسل الطبيب الوصفة إلكترونيًا مباشرة إلى الصيدلية. لست بحاجة لإحضار أي ورقة — يمكن للصيدلية إيجادها عند إعطاء رقم الـ CPR الخاص بك.",
    },
  },
  {
    id: "tilskud",
    term: { da: "Tilskud", en: "Reimbursement", so: "Kaalmada daawada", ar: "الدعم المالي" },
    explanation: {
      da: "Staten betaler en del af prisen på visse recepter, så du selv betaler mindre. Hvor meget afhænger af, hvor meget du har brugt på medicin det seneste år.",
      en: "The state pays part of the price on certain prescriptions, so you pay less yourself. How much depends on how much you've spent on medicine in the past year.",
      so: "Waa kaalmada kharashka daawada ee dawladdu bixiso — dawladdu waxay bixisaa qayb ka mid ah qiimaha daawooyinka qaar, si aad adigu wax yar bixiso. Qadarka waxa saameeya inta lacag ee aad ku bixisay daawooyin sanadkii ugu dambeeyay.",
      ar: "تدفع الدولة جزءًا من سعر بعض الوصفات، لتدفع أنت أقل. المبلغ يعتمد على مقدار ما أنفقته على الأدوية في العام الماضي.",
    },
  },
  {
    id: "generisk-substitution",
    term: { da: "Generisk substitution", en: "Generic substitution", so: "Beddelka daawo la mid ah", ar: "الاستبدال بالدواء المكافئ" },
    explanation: {
      da: "Apoteket giver dig ofte et billigere mærke med præcis samme aktive stof og virkning som det, lægen skrev — kun navnet og æsken ser anderledes ud.",
      en: "The pharmacy often gives you a cheaper brand with the exact same active ingredient and effect as the one the doctor wrote — only the name and box look different.",
      so: "Farmashiyuhu inta badan wuxuu ku siin karaa nooc qaali ka yar oo leh isla maaddada firfircoon iyo saameynta uu dhakhtarku qoray — magaca iyo baakadka oo kaliya ayaa ka duwan.",
      ar: "غالبًا ما تعطيك الصيدلية علامة تجارية أرخص تحتوي على نفس المادة الفعالة والتأثير الذي وصفه الطبيب تمامًا — فقط الاسم والعلبة يبدوان مختلفين.",
    },
  },
  {
    id: "haandkoeb",
    term: { da: "Håndkøbsmedicin", en: "Over-the-counter medicine", so: "Daawo aan u baahnayn warqad dhakhtareed", ar: "دواء بدون وصفة طبية" },
    explanation: {
      da: "Medicin du kan købe uden recept — men det er ikke ufarligt bare fordi det er frit tilgængeligt. Spørg altid, hvis du er i tvivl om det passer sammen med din anden medicin.",
      en: "Medicine you can buy without a prescription — but it isn't harmless just because it's freely available. Always ask if you're unsure whether it fits with your other medicine.",
      so: "Daawo aad iibsan karto warqad dhakhtareed la'aan — laakiin taasi macnaheedu maaha inaysan waxyeello lahayn. Had iyo jeer weydii haddii aad shaki qabto in ay la shaqeyn karto daawooyinkaaga kale.",
      ar: "دواء يمكنك شراؤه بدون وصفة طبية — لكن هذا لا يعني أنه غير ضار لمجرد أنه متاح بحرية. اسأل دائمًا إذا كنت غير متأكد من توافقه مع أدويتك الأخرى.",
    },
  },
  {
    id: "receptpligtig",
    term: { da: "Receptpligtig medicin", en: "Prescription-only medicine", so: "Daawo loo baahan yahay warqad dhakhtareed", ar: "دواء يتطلب وصفة طبية" },
    explanation: {
      da: "Medicin apoteket kun må udlevere, hvis du har en gyldig recept fra en læge — typisk fordi den kræver kontrol eller kan være farlig ved forkert brug.",
      en: "Medicine the pharmacy may only hand out if you have a valid prescription from a doctor — usually because it needs supervision or can be dangerous if used incorrectly.",
      so: "Daawo farmashiyuhu ku siin karo kaliya haddii aad haysato warqad dhakhtareed oo sax ah — sida caadiga ah sababtoo ah waxay u baahan tahay kormeer ama waxay noqon kartaa mid khatar ah haddii si qalad ah loo isticmaalo.",
      ar: "دواء لا يمكن للصيدلية صرفه إلا إذا كان لديك وصفة طبية سارية من طبيب — عادةً لأنه يحتاج إلى متابعة أو قد يكون خطيرًا عند استخدامه بشكل خاطئ.",
    },
  },
  {
    id: "medicinkort",
    term: { da: "Fælles Medicinkort (FMK)", en: "Shared Medication Record (FMK)", so: "Kaarka daawada guud (FMK)", ar: "بطاقة الأدوية المشتركة (FMK)" },
    explanation: {
      da: "Et fælles, opdateret overblik over al din medicin, som din læge, dit apotek og hospitalet kan se — så alle ved præcis, hvad du tager, selv hvis du selv glemmer det.",
      en: "A shared, up-to-date overview of all your medicine that your doctor, pharmacy and the hospital can see — so everyone knows exactly what you take, even if you forget.",
      so: "Waa liis wadaag ah oo cusboonaysiiyay oo ka kooban dhammaan daawooyinkaaga, kaas oo dhakhtarkaaga, farmashiyahaaga iyo isbitaalku ay arki karaan — si qof kastaa u ogaado waxa aad qaadanayso, xitaa haddii aad adigu illowdo.",
      ar: "نظرة عامة مشتركة ومحدّثة على جميع أدويتك يمكن لطبيبك وصيدليتك والمستشفى رؤيتها — ليعرف الجميع بالضبط ما تتناوله، حتى لو نسيت أنت نفسك.",
    },
  },
  {
    id: "doseringsaeske",
    term: { da: "Doseringsæske / doseringskort", en: "Dosette box / dosage card", so: "Sanduuqa/kaarka doosaha daawada", ar: "علبة/بطاقة الجرعات" },
    explanation: {
      da: "En æske eller pose, hvor apoteket fordeler din medicin i færdige poser efter tidspunkt på dagen — så du undgår at tælle piller selv. Spørg dit apotek, om du kan få det.",
      en: "A box or bag where the pharmacy sorts your medicine into ready pouches by time of day — so you don't have to count pills yourself. Ask your pharmacy if you can get this.",
      so: "Waa sanduuq ama kiish, kaas oo farmashigu ku qaybiyo daawooyinkaaga kiishash diyaar ah sida waqtiga maalinta — si aadan u baahnayn inaad kiniinnada tirisid adiga qudhaadu. Weydii farmashiyahaaga haddii aad heli karto.",
      ar: "علبة أو كيس تقوم فيه الصيدلية بترتيب أدويتك في أكياس جاهزة حسب وقت اليوم — حتى لا تضطر لعدّ الحبوب بنفسك. اسأل صيدليتك إن كان بإمكانك الحصول عليها.",
    },
  },
  {
    id: "indlaegsseddel",
    term: { da: "Indlægsseddel", en: "Package leaflet", so: "Warqadda ku jirta baakadka daawada", ar: "النشرة الداخلية للدواء" },
    explanation: {
      da: "Den lille foldede papirseddel inde i æsken, skrevet af producenten på dansk, med alle detaljer om medicinen. Somalimed er ikke en erstatning for den, men et lettere supplement.",
      en: "The small folded paper inside the box, written by the manufacturer in Danish, with all the details about the medicine. Somalimed doesn't replace it, but is an easier supplement.",
      so: "Waa warqadda yar ee laalaaban ee ku jirta baakadka, oo uu qoray warshaddu af-Deenish, oo ka kooban faahfaahin dhammaystiran oo ku saabsan daawada. Somalimed ma beddesho, laakiin waa kaalmo dheeraad ah oo fudud.",
      ar: "هي الورقة الصغيرة المطوية داخل العلبة، مكتوبة من الشركة المصنعة باللغة الدنماركية، وتحتوي على كل التفاصيل عن الدواء. لا يحل Somalimed محلها، بل هو مكمّل أسهل لها.",
    },
  },
  {
    id: "bivirkning",
    term: { da: "Bivirkning", en: "Side effect", so: "Waxyeello", ar: "عرض جانبي" },
    explanation: {
      da: "En uønsket virkning af medicinen, ud over den, den er tiltænkt. De fleste bivirkninger er milde og forsvinder — men fortæl altid apoteket eller lægen, hvis noget føles forkert.",
      en: "An unwanted effect of the medicine, beyond what it's intended for. Most side effects are mild and go away — but always tell the pharmacy or doctor if something feels wrong.",
      so: "Waa saameyn aan la doonayn oo daawadu keento, oo ka baxsan ujeeddadeeda. Inta badan waxyeelooyinku waa kuwo fudud oo baaba'a — laakiin had iyo jeer u sheeg farmashiyaha ama dhakhtarka haddii wax khaldan dareemayso.",
      ar: "هو تأثير غير مرغوب فيه للدواء، بخلاف الغرض المقصود منه. معظم الأعراض الجانبية خفيفة وتزول — لكن أخبر دائمًا الصيدلية أو الطبيب إذا شعرت بشيء غير طبيعي.",
    },
  },
  {
    id: "interaktion",
    term: { da: "Interaktion", en: "Interaction", so: "Isdhexgal", ar: "تفاعل دوائي" },
    explanation: {
      da: "Når to eller flere slags medicin påvirker hinanden, så virkningen bliver stærkere, svagere eller anderledes end forventet. Fortæl altid apoteket al den medicin, du tager.",
      en: "When two or more medicines affect each other, so the effect becomes stronger, weaker or different than expected. Always tell the pharmacy about all the medicine you take.",
      so: "Marka laba ama in ka badan oo daawooyin ah ay saameeyaan midba midka kale, taas oo saameynta ka dhigaysa mid xoog badan, mid daciif ah ama mid ka duwan sidii la filayay. Had iyo jeer u sheeg farmashiyaha dhammaan daawooyinka aad qaadanayso.",
      ar: "عندما يؤثر دواءان أو أكثر على بعضهما، فيصبح المفعول أقوى أو أضعف أو مختلفًا عما هو متوقع. أخبر دائمًا الصيدلية بجميع الأدوية التي تتناولها.",
    },
  },
  {
    id: "sundhedskort",
    term: { da: "Sundhedskort (det gule kort)", en: "Health insurance card (yellow card)", so: "Kaarka caafimaadka (kaarka jaale)", ar: "بطاقة التأمين الصحي (البطاقة الصفراء)" },
    explanation: {
      da: "Dit personlige ID hos læge, apotek og sygehus — vis det (eller dit CPR-nummer), når du henter medicin, så systemet kan finde din recept og dit tilskud.",
      en: "Your personal ID with the doctor, pharmacy and hospital — show it (or your CPR number) when picking up medicine, so the system can find your prescription and reimbursement.",
      so: "Waa aqoonsigaaga shaqsi ahaaneed ee dhakhtarka, farmashiyaha iyo isbitaalka — tus (ama lambarkaaga CPR) markaad daawo qaadanayso, si nidaamku u helo warqaddaada iyo kaalmadaada lacageed.",
      ar: "هي بطاقة هويتك الشخصية لدى الطبيب والصيدلية والمستشفى — أظهرها (أو رقم الـ CPR الخاص بك) عند استلام الدواء، حتى يجد النظام وصفتك ودعمك المالي.",
    },
  },
  {
    id: "kronikertilskud",
    term: { da: "Kronikertilskud", en: "Chronic-illness reimbursement", so: "Kaalmo dheeraad ah oo cudur joogto ah", ar: "دعم مرضى الأمراض المزمنة" },
    explanation: {
      da: "Ekstra tilskud til dig, der har et kronisk behov for meget medicin, så din egenbetaling får et loft. Spørg dit apotek, om du opfylder kravene.",
      en: "Extra reimbursement for you if you have a chronic need for a lot of medicine, so your own payment gets a ceiling. Ask your pharmacy if you meet the requirements.",
      so: "Waa kaalmo dheeraad ah oo loogu talagalay dadka si joogto ah u qaadanaya daawo badan, si lacagta aad adigu bixinayso ay gaarto xad. Weydii farmashiyahaaga haddii aad buuxinayso shuruudaha.",
      ar: "دعم مالي إضافي لك إذا كنت تحتاج بشكل مزمن إلى الكثير من الأدوية، بحيث يكون لمساهمتك المالية حد أقصى. اسأل صيدليتك إن كنت تستوفي الشروط.",
    },
  },
  {
    id: "holdbarhed",
    term: { da: "Holdbarhedsdato / udløbsdato", en: "Expiry date", so: "Taariikhda dhicitaanka", ar: "تاريخ انتهاء الصلاحية" },
    explanation: {
      da: "Datoen trykt på æsken, som viser, hvor længe medicinen er sikker at bruge. Brug aldrig medicin efter den dato — aflever den i stedet på apoteket.",
      en: "The date printed on the box showing how long the medicine is safe to use. Never use medicine after that date — hand it in to the pharmacy instead.",
      so: "Waa taariikhda ku daabacan baakadka, oo tusaysa inta ay daawadu ammaan ku tahay in la isticmaalo. Waligaa ha isticmaalin daawo taariikhdeedu dhaafay — ku celi farmashiyaha.",
      ar: "التاريخ المطبوع على العلبة الذي يوضح المدة التي يكون فيها الدواء آمنًا للاستخدام. لا تستخدم أبدًا دواءً بعد ذلك التاريخ — بل أعده إلى الصيدلية.",
    },
  },
  {
    id: "apoteksforbeholdt",
    term: { da: "Apoteksforbeholdt medicin", en: "Pharmacy-only medicine", so: "Daawo gaar u ah farmashiyaha", ar: "دواء مخصص للصيدليات فقط" },
    explanation: {
      da: "Medicin du ikke behøver recept til, men som kun må sælges på et apotek — ikke i supermarkedet — fordi apotekspersonalet skal kunne vejlede dig om den.",
      en: "Medicine you don't need a prescription for, but which may only be sold at a pharmacy — not in a supermarket — because pharmacy staff need to be able to advise you on it.",
      so: "Daawo aan u baahnayn warqad dhakhtareed, laakiin oo la iibin karo kaliya farmashiyaha — ma aha dukaanka guud — sababtoo ah shaqaalaha farmashiyaha waa inay ku talin karaan sida loo isticmaalo.",
      ar: "دواء لا يحتاج إلى وصفة طبية، لكن لا يُباع إلا في الصيدلية — وليس في السوبر ماركت — لأن موظفي الصيدلية يجب أن يتمكنوا من إرشادك بشأنه.",
    },
  },
];
