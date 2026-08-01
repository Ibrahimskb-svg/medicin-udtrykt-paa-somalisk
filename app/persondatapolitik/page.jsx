import { languages } from "../../src/lib/site";
import { PersondatapolitikContent } from "../../src/components/persondatapolitik-content";

export const metadata = {
  title: "Persondatapolitik",
  description: "Somalimeds persondatapolitik — hvilke persondata vi behandler, hvorfor, og dine rettigheder.",
  robots: { index: false, follow: true },
};

export default async function Persondatapolitik({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  return <PersondatapolitikContent initialLanguage={lang} />;
}
