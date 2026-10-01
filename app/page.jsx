import { SiteIndex } from "../src/components/site-index";
import { getIndexData, languages, uiText } from "../src/lib/site";

// Samme fiks som på lægemiddelsiderne: canonical skal pege på sig selv per
// sprog, ellers folder Google alle 4 sprogversioner af forsiden sammen til én.
export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  const canonicalPath = lang === "so" ? "/" : `/?lang=${lang}`;

  // Titel og beskrivelse på sidens eget sprog (samme tekster som overskriften på siden).
  // Somalisk er standardsiden og beholder layoutets titel uændret.
  let localized = {};
  if (lang !== "so") {
    const t = getIndexData().translations[lang];
    const ui = uiText[lang];
    if (t?.hdrTitle) {
      localized = {
        title: `SomaliMed – ${t.hdrTitle}`,
        ...(t.hdrSubtitle ? { description: `${t.hdrSubtitle} — ${ui?.heroFormatValue ?? ""}`.replace(/ — $/, "") } : {}),
      };
    }
  }

  return {
    ...localized,
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
