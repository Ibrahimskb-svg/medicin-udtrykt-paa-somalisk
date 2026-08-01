"use client";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { formatRevisedDate } from "../lib/format-revised-date";
import { COOKIE_REVISED_ISO } from "../data/legal-revised.generated";
import { LegalLangNav } from "./legal-lang-nav";

const REVISED_PREFIX = { da: "Sidst revideret", en: "Last revised", so: "La cusbooneysiiyay", ar: "آخر مراجعة" };

const TITLE = { da: "Cookiepolitik", en: "Cookie Policy", so: "Siyaasadda Cookies", ar: "سياسة ملفات تعريف الارتباط" };

const CONTENT = {
  da: {
    tableHeaders: ["Cookie / Tjeneste", "Type", "Formål", "Levetid"],
    rows: [
      ["Google Analytics (GA4)", "Statistik", "Analyse af besøg, sider og brugeradfærd. IP-adresser anonymiseres.", "Op til 2 år"],
      ["Crisp Chat", "Funktionel", "Muliggør live chat-support. Husker tidligere samtaler.", "Op til 1 år"],
    ],
    sections: [
      { title: "Hvad er cookies?", body: "Cookies er små tekstfiler, der gemmes på din enhed, når du besøger en hjemmeside. De bruges til at huske dine præferencer og til at indsamle statistik om, hvordan siden bruges." },
      { title: "Hvilke cookies bruger vi?", table: true },
      { title: "Hvem deler vi data med?", body: "Data deles udelukkende med Google (Analytics) og Crisp til de formål, der er beskrevet ovenfor. Ingen data sælges til tredjeparter." },
      { title: "Sådan trækker du dit samtykke tilbage", body: "Du kan til enhver tid slette cookies i din browsers indstillinger og nulstille dit valg ved at slette cookies fra somalimed.dk. Siden vil derefter vise cookiebanneret igen." },
      { title: "Kontakt", body: "Har du spørgsmål til vores cookiebrug, er du velkommen til at kontakte os via chat-funktionen på siden." },
    ],
  },
  en: {
    tableHeaders: ["Cookie / Service", "Type", "Purpose", "Duration"],
    rows: [
      ["Google Analytics (GA4)", "Statistics", "Analysis of visits, pages and user behaviour. IP addresses are anonymised.", "Up to 2 years"],
      ["Crisp Chat", "Functional", "Enables live chat support. Remembers previous conversations.", "Up to 1 year"],
    ],
    sections: [
      { title: "What are cookies?", body: "Cookies are small text files stored on your device when you visit a website. They are used to remember your preferences and to collect statistics about how the site is used." },
      { title: "Which cookies do we use?", table: true },
      { title: "Who do we share data with?", body: "Data is shared only with Google (Analytics) and Crisp for the purposes described above. No data is sold to third parties." },
      { title: "Withdrawing your consent", body: "You can delete cookies at any time in your browser settings. Deleting cookies from somalimed.dk will reset your choice and show the cookie banner again." },
    ],
  },
  so: {
    tableHeaders: ["Cookie / Adeeg", "Nooca", "Ujeedka", "Muddada"],
    rows: [
      ["Google Analytics (GA4)", "Xogta booqashooyinka", "Falanqaynta booqashooyinka, bogagga iyo dhaqdhaqaaqa isticmaalaha. Ciwaannada IP waa la qariyaa.", "Ilaa 2 sano"],
      ["Crisp Chat", "Shaqaynta chatka", "Waxay suurtogalisaa taageerada chat-ka tooska ah. Waxay xasuusataa sheekooyin hore.", "Ilaa 1 sano"],
    ],
    sections: [
      { title: "Maxay yihiin cookies?", body: "Cookies waa faylal yaryar oo qoraal ah oo lagu kaydiyaa qalabkaaga marka aad booqanayso bogga internet-ka. Waxay loo isticmaalaa xasuusinta doortidaada iyo ururin xog ku saabsan sida bogga loo adeegsado." },
      { title: "Cookies kee ayaan isticmaalnaa?", table: true },
      { title: "Xogta ma la wadaagnaa?", body: "Xogta waxaa lala wadaagaa oo keliya Google (Analytics) iyo Crisp ujeedooyinka kor ku xusan. Xog kuma iibsano xisbiyada saddexaad." },
      { title: "Sida aad u bixin karto oggolaanshahaga", body: "Waxaad xaqiijin kartaa cookies-ka browser-kaaga dejintiisa. Tirtirka cookies-ka somalimed.dk wuxuu dib u dejin doona doorashadaada wuxuuna soo bandhigi doonaa banner-ka cookies-ka mar kale." },
    ],
  },
  ar: {
    tableHeaders: ["ملف تعريف الارتباط / الخدمة", "النوع", "الغرض", "المدة"],
    rows: [
      ["Google Analytics (GA4)", "إحصائيات", "تحليل الزيارات والصفحات وسلوك المستخدم. يتم إخفاء هوية عناوين IP.", "حتى سنتين"],
      ["Crisp Chat", "وظيفي", "يتيح دعم الدردشة المباشرة. يتذكر المحادثات السابقة.", "حتى سنة واحدة"],
    ],
    sections: [
      { title: "ما هي ملفات تعريف الارتباط؟", body: "ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة موقع إلكتروني. تُستخدم لتذكر تفضيلاتك وجمع إحصائيات حول كيفية استخدام الموقع." },
      { title: "ما هي ملفات تعريف الارتباط التي نستخدمها؟", table: true },
      { title: "مع من نشارك البيانات؟", body: "تُشارك البيانات فقط مع Google (Analytics) وCrisp للأغراض الموضحة أعلاه. لا تُباع أي بيانات لأطراف ثالثة." },
      { title: "سحب موافقتك", body: "يمكنك حذف ملفات تعريف الارتباط في أي وقت من إعدادات المتصفح. سيؤدي حذف ملفات somalimed.dk إلى إعادة ضبط اختيارك وإظهار شعار الموافقة مجددًا." },
    ],
  },
};

export function CookiePolicyContent({ initialLanguage }) {
  const { language, updateLanguage } = useLanguageRouting({ initialLanguage });
  const data = CONTENT[language] ?? CONTENT.so;
  const isRtl = language === "ar";

  return (
    <main dir={isRtl ? "rtl" : "ltr"} style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px 80px", fontFamily: "system-ui, sans-serif", color: "#1e293b", lineHeight: 1.8 }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0D9488", marginBottom: "8px" }}>{TITLE[language] ?? TITLE.so}</h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
        {REVISED_PREFIX[language] ?? REVISED_PREFIX.so}: {formatRevisedDate(COOKIE_REVISED_ISO, language)}
      </p>

      <LegalLangNav language={language} onChange={updateLanguage} />

      {data.sections.map((s) => (
        <Section key={s.title} title={s.title}>
          {s.table ? <CookieTable headers={data.tableHeaders} rows={data.rows} /> : s.body}
        </Section>
      ))}
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>{title}</h3>
      <div style={{ fontSize: "14px", color: "#334155" }}>{children}</div>
    </div>
  );
}

function CookieTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginTop: "8px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            {headers.map((h) => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "start", fontWeight: 700, borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #e2e8f0", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 12px", verticalAlign: "top" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
