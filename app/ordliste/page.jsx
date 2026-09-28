import { languages } from "../../src/lib/site";
import { PharmacyGlossaryContent } from "../../src/components/pharmacy-glossary-content";

export const metadata = {
  title: "Forstå dit apoteksbesøg — ordliste",
  description: "Ordliste over danske apoteks- og receptord (recept, tilskud, generisk substitution m.fl.) forklaret på somali, dansk, engelsk og arabisk.",
};

export default async function Ordliste({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  return <PharmacyGlossaryContent initialLanguage={lang} />;
}
