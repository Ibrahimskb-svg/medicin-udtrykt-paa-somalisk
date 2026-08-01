import { languages } from "../../src/lib/site";
import { CookiePolicyContent } from "../../src/components/cookie-policy-content";

export const metadata = {
  title: "Cookiepolitik",
  description: "Somalimeds cookiepolitik — hvilke cookies vi bruger og hvorfor.",
};

export default async function CookiePolitik({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  return <CookiePolicyContent initialLanguage={lang} />;
}
