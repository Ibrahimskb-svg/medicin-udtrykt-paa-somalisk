import { SiteIndex } from "../src/components/site-index";
import { languages } from "../src/lib/site";

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  return <SiteIndex initialLang={lang} />;
}
