import { SiteIndex } from "../src/components/site-index";
import { languages } from "../src/lib/site";

// Samme fiks som på lægemiddelsiderne: canonical skal pege på sig selv per
// sprog, ellers folder Google alle 4 sprogversioner af forsiden sammen til én.
export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  const canonicalPath = lang === "so" ? "/" : `/?lang=${lang}`;

  return {
    alternates: {
      canonical: canonicalPath,
      languages: {
        ...Object.fromEntries(languages.map((l) => [l, `/?lang=${l}`])),
        "x-default": "/",
      },
    },
  };
}

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";

  return <SiteIndex initialLang={lang} />;
}
