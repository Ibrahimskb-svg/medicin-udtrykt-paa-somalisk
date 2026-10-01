export default function sitemap() {
  const baseUrl = "https://www.somalimed.dk";

  const languages = ["so", "da", "en", "ar"];

  const medicines = [
    "amlodipin","atorvastatin","diclofenac","eliquis","enalapril",
    "hjertemagnyl","ibuprofen","insulin","lamotrigin","losartan",
    "marevan","melatonin","metformin","metoprolol","morfin_injektion",
    "morfin_tablet","naproxen","pantoprazol","paracetamol","quetiapin",
    "sertralin","symbicort","ventoline","xarelto","zopiclon",
  ];

  // Frontpage for each language
  const frontpageUrls = languages.map((lang) => ({
    url: `${baseUrl}/?lang=${lang}`,
    changeFrequency: "weekly",
    priority: 1.0,
  }));

  // Pharmacy-term glossary for each language
  const glossaryUrls = languages.map((lang) => ({
    url: `${baseUrl}/ordliste?lang=${lang}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Medicine pages for each language
  const medicineUrls = medicines.flatMap((slug) =>
    languages.map((lang) => ({
      url: `${baseUrl}/${slug}?lang=${lang}`,
        changeFrequency: "monthly",
      priority: 0.8,
    }))
  );

  return [...frontpageUrls, ...glossaryUrls, ...medicineUrls];
}
