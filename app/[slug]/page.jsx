import { notFound } from "next/navigation";

import { MedicinePage } from "../../src/components/medicine-page";
import { getMedicine, getMedicineSlugs, getIndexData, languages } from "../../src/lib/site";
import { LAST_REVISED_ISO } from "../../src/data/last-revised.generated";

export async function generateStaticParams() {
  return getMedicineSlugs().map((slug) => ({ slug }));
}

// A few languages' drugName already has " – <subtitle>" baked in (data
// inconsistency in site-data.js) — append the subtitle only when it isn't
// already part of the name, so titles never duplicate it.
function buildPageTitle(drugName, subtitle) {
  if (!subtitle) return drugName;
  if (drugName.toLowerCase().includes(subtitle.toLowerCase())) return drugName;
  return `${drugName} – ${subtitle}`;
}

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const medicine = getMedicine(resolvedParams.slug);

  if (!medicine) {
    return {};
  }

  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  const data = medicine.translations[lang] || medicine.translations.so;
  const subtitle = getIndexData().subtitles?.[medicine.slug]?.[lang];
  const title = buildPageTitle(data.drugName, subtitle) || medicine.title;

  return {
    title: title || "Lægemiddelinformation på somalisk",
    description: data.introBox,
    alternates: {
      canonical: `/${medicine.slug}`,
      languages: Object.fromEntries(languages.map((l) => [l, `/${medicine.slug}?lang=${l}`])),
    },
  };
}

export default async function DrugPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const medicine = getMedicine(resolvedParams.slug);

  if (!medicine) {
    notFound();
  }

  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  const data = medicine.translations[lang] || medicine.translations.so;
  const subtitle = getIndexData().subtitles?.[medicine.slug]?.[lang];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: buildPageTitle(data.drugName, subtitle),
    url: `https://www.somalimed.dk/${medicine.slug}?lang=${lang}`,
    inLanguage: lang,
    lastReviewed: LAST_REVISED_ISO,
    reviewedBy: {
      "@type": "Person",
      name: "Ibrahim Dahir Hanaf",
      jobTitle: "Pharmaconomist",
    },
    audience: { "@type": "PatientsAudience" },
    about: {
      "@type": "Drug",
      name: data.drugName,
      nonProprietaryName: data.drugName,
      dosageForm: data.drugForm,
      description: data.introBox,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MedicinePage initialLang={lang} medicine={medicine} />
    </>
  );
}
