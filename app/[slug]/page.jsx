import { notFound } from "next/navigation";

import { MedicinePage } from "../../src/components/medicine-page";
import { getMedicine, getMedicineSlugs, languages } from "../../src/lib/site";

export async function generateStaticParams() {
  return getMedicineSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const medicine = getMedicine(resolvedParams.slug);

  if (!medicine) {
    return {};
  }

  return {
    title: medicine.title || "Lægemiddelinformation på somalisk",
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

  return <MedicinePage initialLang={lang} medicine={medicine} />;
}
