import { SiteIndex } from "../src/components/site-index";
import { getIndexData, languages, uiText } from "../src/lib/site";
import { FAQ_DATA } from "../src/data/faq-data";

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

// FAQPage-strukturerede data: gør det muligt for Google at vise Ibrahims
// egne svar direkte i søgeresultaterne (fx under "Kan jeg tage Paracetamol
// og Ibuprofen samtidig?"), i stedet for at folk først skal ind på siden og
// åbne FAQ-modalen. Bruger den samme FAQ_DATA som selve modalen viser, så
// det synlige indhold og det Google ser altid stemmer overens.
function buildFaqJsonLd(lang) {
  const data = FAQ_DATA[lang] ?? FAQ_DATA.so;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.bullets.join(" "),
      },
    })),
  };
}

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang) ? resolvedSearchParams.lang : "so";
  const faqJsonLd = buildFaqJsonLd(lang);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteIndex initialLang={lang} />
    </>
  );
}
