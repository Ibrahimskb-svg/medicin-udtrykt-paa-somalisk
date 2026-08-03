"use client";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { formatRevisedDate } from "../lib/format-revised-date";
import { COOKIE_REVISED_ISO } from "../data/legal-revised.generated";
import { LegalLangNav } from "./legal-lang-nav";
import { Section, SECTION_COLORS } from "./legal-section";

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
      { title: "Hvilke cookies bruger jeg?", table: true },
      { title: "Hvem deler jeg data med?", body: "Data deles udelukkende med Google (Analytics) og Crisp til de formål, der er beskrevet ovenfor. Ingen data sælges til tredjeparter." },
      { title: "Sådan trækker du dit samtykke tilbage", body: "Du kan til enhver tid slette cookies i din browsers indstillinger og nulstille dit valg ved at slette cookies fra somalimed.dk. Siden vil derefter vise cookiebanneret igen." },
      { title: "Kontakt", body: "Har du spørgsmål til min cookiebrug, er du velkommen til at kontakte mig via chat-funktionen på siden." },
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
      { title: "Which cookies do I use?", table: true },
      { title: "Who do I share data with?", body: "Data is shared only with Google (Analytics) and Crisp for the purposes described above. No data is sold to third parties." },
      { title: "Withdrawing your consent", body: "You can delete cookies at any time in your browser settings. Deleting cookies from somalimed.dk will reset your choice and show the cookie banner again." },
    ],
  },
  so: {
    tableHeaders: ["Cookie / Adeeg", "Nooca", "Ujeeddada", "Muddada"],
    rows: [
      ["Google Analytics (GA4)", "Xogta booqashada", "Waxaa loo isticmaalaa falanqaynta booqashooyinka, bogagga la booqdo iyo sida isticmaalayaashu u adeegsadaan bogga. Cinwaannada IP-ga waa la qariyaa.", "Ilaa 2 sano"],
      ["Crisp Chat", "Adeegga chat-ka", "Wuxuu suurtageliyaa wada sheekaysiga tooska ah (chat) wuxuuna xasuustaa wada sheekaysiyadii hore.", "Ilaa 1 sano"],
    ],
    sections: [
      { title: "Waa maxay cookies?", body: "Cookies waa faylal yar yar oo lagu kaydiyo qalabkaaga marka aad booqato bog internet. Waxaa loo isticmaalaa in lagu xasuusto doorashooyinkaaga iyo in lagu ururiyo xog ku saabsan sida bogga loo isticmaalo." },
      { title: "Cookies-ka aan isticmaalo", table: true },
      { title: "Ciddee ayaan xogta la wadaagaa?", body: "Xogta waxaa lala wadaagaa oo keliya Google (Analytics) iyo Crisp, ujeedooyinka kor lagu sharaxay awgood. Wax xog ah lagama iibiyo cid saddexaad." },
      { title: "Sida aad ula noqon karto oggolaanshahaaga", body: "Waxaad mar kasta ka tirtiri kartaa cookies-ka dejimaha biraawsarkaaga. Marka aad ka tirtirto cookies-ka somalimed.dk, doorashadaadii hore waa la tirtirayaa, bogguna wuxuu mar kale ku tusi doonaa ogeysiiska cookies-ka." },
      { title: "Xiriir", body: "Haddii aad qabto wax su'aalo ah oo ku saabsan isticmaalka cookies-ka, waxaad ila soo xiriiri kartaa adeegga wada sheekaysiga (chat-ka) ee bogga." },
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
      { title: "ما هي ملفات تعريف الارتباط التي أستخدمها؟", table: true },
      { title: "مع من أشارك البيانات؟", body: "تُشارك البيانات فقط مع Google (Analytics) وCrisp للأغراض الموضحة أعلاه. لا تُباع أي بيانات لأطراف ثالثة." },
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
      <p style={{ fontSize: "13px", color: "#556173", marginBottom: "20px" }}>
        {REVISED_PREFIX[language] ?? REVISED_PREFIX.so}: {formatRevisedDate(COOKIE_REVISED_ISO, language)}
      </p>

      <LegalLangNav language={language} onChange={updateLanguage} />

      {data.sections.map((s, i) => {
        const color = SECTION_COLORS[i % SECTION_COLORS.length];
        return (
          <Section key={s.title} title={s.title} color={color} index={i + 1}>
            {s.table ? <CookieTable headers={data.tableHeaders} rows={data.rows} color={color} /> : s.body}
          </Section>
        );
      })}
    </main>
  );
}

function CookieTable({ headers, rows, color }) {
  return (
    <div style={{ overflowX: "auto", marginTop: "8px", borderRadius: "10px", border: `1.5px solid ${color}33` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: `${color}17` }}>
            {headers.map((h) => (
              <th key={h} style={{ padding: "9px 12px", textAlign: "start", fontWeight: 700, color, borderBottom: `2px solid ${color}55`, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #e2e8f0", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "9px 12px", verticalAlign: "top" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
