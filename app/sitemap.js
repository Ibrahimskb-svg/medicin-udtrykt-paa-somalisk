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

  const now = new Date().toISOString();

  // Frontpage for each language
  const frontpageUrls = languages.map((lang) => ({
    url: `${baseUrl}/?lang=${lang}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
  }));

  // Medicine pages for each language
  const medicineUrls = medicines.flatMap((slug) =>
    languages.map((lang) => ({
      url: `${baseUrl}/${slug}?lang=${lang}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }))
  );

  return [...frontpageUrls, ...medicineUrls];
}
