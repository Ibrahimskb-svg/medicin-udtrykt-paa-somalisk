import { languages } from "../../src/lib/site";
import { PharmacyGlossaryContent } from "../../src/components/pharmacy-glossary-content";

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  const canonicalPath = lang === "so" ? "/ordliste" : `/ordliste?lang=${lang}`;

  return {
    title: "Forstå dit apoteksbesøg — ordliste",
    description: "Ordliste over danske apoteks- og receptord (recept, tilskud, generisk substitution m.fl.) forklaret på somalisk, dansk, engelsk og arabisk.",
    alternates: {
      canonical: canonicalPath,
      languages: {
        ...Object.fromEntries(languages.map((l) => [l, `/ordliste?lang=${l}`])),
        "x-default": "/ordliste",
      },
    },
  };
}

export default async function Ordliste({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  const initialView = resolvedSearchParams?.view === "cards" ? "cards" : "list";
  return <PharmacyGlossaryContent initialLanguage={lang} initialView={initialView} />;
}
