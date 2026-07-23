// Apoteker med personale, der taler somali og/eller arabisk.
// Tilføj nye apoteker her — én linje pr. apotek.
// contacts: liste over kontaktpersoner. Hver kontakt har:
//   - speaks: det sprog PERSONEN taler ("so" eller "ar")
//   - names: personens fornavn(e) stavet korrekt for hvert visningssprog (so/da/en/ar)
// (kun fornavne, ikke fulde navne, af hensyn til kollegernes privatliv)
export const PHARMACIES = [
  {
    name: "Nørrebro Apotek",
    city: "København N",
    postalCode: "2200",
    phone: "+45 35 39 83 82",
    contacts: [
      {
        speaks: "so",
        names: { so: ["Cabdullahi", "Cabdishakur"], da: ["Abdullahi", "Abdishakur"], en: ["Abdullahi", "Abdishakur"], ar: ["عبد الله", "عبد الشكور"] },
      },
    ],
  },
  {
    name: "Lyngby Løve Apotek",
    city: "Kongens Lyngby",
    postalCode: "2800",
    phone: "+45 45 87 08 20",
    contacts: [
      {
        speaks: "ar",
        names: { so: ["Ahmed"], da: ["Ahmed"], en: ["Ahmed"], ar: ["أحمد"] },
      },
    ],
  },
  {
    name: "Budolfi Apotek",
    city: "Aalborg",
    postalCode: "9000",
    phone: "+45 98 12 06 77",
    contacts: [
      {
        speaks: "so",
        names: { so: ["Maxammad"], da: ["Mohamed"], en: ["Mohamed"], ar: ["محمد"] },
      },
    ],
  },
  {
    name: "Taastrup Apotek",
    city: "Taastrup",
    postalCode: "2630",
    phone: "+45 43 99 00 98",
    contacts: [
      {
        speaks: "so",
        names: { so: ["Yacquub"], da: ["Yakub"], en: ["Yakub"], ar: ["يعقوب"] },
      },
    ],
  },
  {
    name: "Aarhus City Vest Apotek",
    city: "Brabrand",
    postalCode: "8220",
    phone: "+45 86 25 15 33",
    contacts: [
      {
        speaks: "so",
        names: { so: ["Cabdirisaaq"], da: ["Abdirizak"], en: ["Abdirizak"], ar: ["عبد الرزاق"] },
      },
    ],
  },
];
