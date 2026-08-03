"use client";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { formatRevisedDate } from "../lib/format-revised-date";
import { PRIVACY_REVISED_ISO } from "../data/legal-revised.generated";
import { LegalLangNav } from "./legal-lang-nav";
import { Section, SECTION_COLORS } from "./legal-section";

const REVISED_PREFIX = { da: "Sidst revideret", en: "Last revised", so: "La cusbooneysiiyay", ar: "آخر مراجعة" };

const TITLE = { da: "Persondatapolitik", en: "Privacy Policy", so: "Siyaasadda Xogta Shakhsiga", ar: "سياسة الخصوصية" };

// #0D9488 giver kun 3.38:1 mod sidens baggrund som almindelig 14px tekst (WCAG AA kræver 4.5:1) — mørknet til #0a766d, samme justering som legal-section.jsx.
const MAIL = <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0a766d", fontWeight: 600 }}>Ibrahim_skb@live.dk</a>;
const DT_DA = <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer" style={{ color: "#0a766d", fontWeight: 600 }}>datatilsynet.dk</a>;

const CONTENT = {
  da: {
    tableHeaders: ["Kilde", "Data", "Formål", "Opbevaring"],
    rows: [
      ["Kontaktformular", "Navn, by, evt. e-mail og telefon", "For at kunne besvare din henvendelse, ros, ris eller forslag.", "Sendes direkte fra din egen e-mail-app til Ibrahim_skb@live.dk. Gemmes ikke i en database på siden."],
      ["Google Analytics (GA4)", "Anonymiseret besøgsstatistik (IP anonymiseres)", "Forstå hvordan siden bruges, så den kan forbedres.", "Op til 2 år — se detaljer i min Cookiepolitik."],
      ["Crisp Chat", "Chatbeskeder, hvis du skriver til mig", "Besvare spørgsmål via live chat.", "Op til 1 år — se detaljer i min Cookiepolitik."],
    ],
    sections: [
      { title: "Dataansvarlig", body: <>Ibrahim Dahir Hanaf er dataansvarlig for behandlingen af persondata på somalimed.dk. Kontakt: {MAIL}.</> },
      { title: "Hvilke data behandler jeg, og hvorfor?", table: true },
      { title: "Retsgrundlag", body: "Kontaktformularen behandles på baggrund af dit samtykke, ved at du selv vælger at sende den. Statistik (GA4) og chat (Crisp) behandles på baggrund af legitim interesse i at drive og forbedre siden — begge kan du fravælge via cookiebanneret." },
      { title: "Deles dine data med andre?", body: "Kontaktformularen sendes udelukkende til Ibrahim Dahir Hanaf. Google og Crisp behandler data som beskrevet i min Cookiepolitik. Dine data sælges aldrig til tredjeparter." },
      { title: "Dine rettigheder", body: <>Du har ret til at få indsigt i, rettet eller slettet de data, jeg har om dig, samt ret til at gøre indsigelse mod behandlingen. Kontakt {MAIL} for at gøre brug af dine rettigheder. Du kan også klage til Datatilsynet på {DT_DA}.</> },
      { title: "Kontakt", body: <>Har du spørgsmål til min behandling af persondata, er du velkommen til at kontakte mig via chat-funktionen på siden eller på {MAIL}.</> },
    ],
  },
  en: {
    tableHeaders: ["Source", "Data", "Purpose", "Storage"],
    rows: [
      ["Contact form", "Name, city, optional email and phone", "So I can respond to your message, praise, criticism or suggestion.", "Sent directly from your own email app to Ibrahim_skb@live.dk. Not stored in a database on the site."],
      ["Google Analytics (GA4)", "Anonymised visit statistics (IP anonymised)", "Understand how the site is used, so it can be improved.", "Up to 2 years — see details in my Cookie Policy."],
      ["Crisp Chat", "Chat messages, if you write to me", "Answering questions via live chat.", "Up to 1 year — see details in my Cookie Policy."],
    ],
    sections: [
      { title: "Data controller", body: <>Ibrahim Dahir Hanaf is the data controller for personal data processed on somalimed.dk. Contact: {MAIL}.</> },
      { title: "What data do I process, and why?", table: true },
      { title: "Legal basis", body: "The contact form is processed based on your consent, given by choosing to send it. Statistics (GA4) and chat (Crisp) are processed based on legitimate interest in running and improving the site — both can be opted out of via the cookie banner." },
      { title: "Is your data shared with others?", body: "The contact form is sent only to Ibrahim Dahir Hanaf. Google and Crisp process data as described in my Cookie Policy. Your data is never sold to third parties." },
      { title: "Your rights", body: <>You have the right to access, correct or delete the data I hold about you, and the right to object to the processing. Contact {MAIL} to exercise your rights. You can also file a complaint with the Danish Data Protection Agency at {DT_DA}.</> },
      { title: "Contact", body: <>If you have questions about my processing of personal data, you're welcome to contact me via the chat function on the site or at {MAIL}.</> },
    ],
  },
  so: {
    tableHeaders: ["Isha", "Xogta", "Ujeeddada", "Kaydinta"],
    rows: [
      ["Foomka xiriirka", "Magaca, magaalada, email-ka iyo lambarka telefoonka (haddii aad bixiso)", "Si aan uga jawaabo fariintaada, ammaanta, dhaleeceynta ama soo jeedintaada.", "Fariinta waxaa si toos ah looga diraa email-kaaga kuna socotaa Ibrahim_skb@live.dk. Laguma kaydiyo keydka xogta (database-ka) ee bogga."],
      ["Google Analytics (GA4)", "Tirakoobka booqashooyinka oo aan lagu aqoonsan karin qofka (IP-ga waa la qariyaa)", "Si aan u fahmo sida bogga loo isticmaalo loona sii horumariyo.", "Ilaa 2 sano — faahfaahinta ka eeg Siyaasadda Cookies-ka."],
      ["Crisp Chat", "Fariimaha chat-ka (haddii aad ila soo xiriirto)", "Si aan uga jawaabo su'aalahaaga iyada oo loo marayo chat-ka tooska ah.", "Ilaa 1 sano — faahfaahinta ka eeg Siyaasadda Cookies-ka."],
    ],
    sections: [
      { title: "Mas'uulka xogta shakhsiga", body: <>Ibraahim Dahir Xanaf ayaa mas'uul ka ah xogta shakhsiga ee lagu ururiyo laguna habeeyo somalimed.dk. La xiriir: {MAIL}</> },
      { title: "Xogtee ayaan ururiyaa, maxaase loo ururiyaa?", table: true },
      { title: "Aasaaska sharciyeed", body: "Foomka xiriirka waxaa lagu habeeyaa oggolaanshahaaga, maadaama aad adigu dooranayso inaad ii soo dirto. Tirakoobka (GA4) iyo Crisp Chat waxaa lagu habeeyaa dano sharci ah oo la xiriira maamulka iyo horumarinta bogga. Waxaad ka diidi kartaa labadaba adiga oo adeegsanaya ogeysiiska cookies-ka." },
      { title: "Xogtaada ma lala wadaagaa cid kale?", body: "Foomka xiriirka waxaa loo diraa oo keliya Ibraahim Dahir Xanaf. Google iyo Crisp waxay xogta u habeeyaan sida lagu sharaxay Siyaasadda Cookies-ka. Wax xog ah lagama iibiyo cid saddexaad." },
      { title: "Xuquuqdaada", body: <>Waxaad xaq u leedahay inaad codsato inaad aragto, saxdo ama tirtirto xogta aan kaa hayo. Waxa kale oo aad xaq u leedahay inaad ka soo horjeedsato habaynta xogtaada. Si aad u isticmaasho xuquuqdaada, kala xiriir {MAIL}.<br /><br />Waxaad sidoo kale cabasho u gudbin kartaa Datatilsynet adiga oo booqanaya {DT_DA}.</> },
      { title: "Xiriir", body: <>Haddii aad qabto wax su'aalo ah oo ku saabsan habaynta xogtaada shakhsiga, waxaad ila soo xiriiri kartaa adeegga wada sheekaysiga (chat-ka) ee bogga ama email-ka: {MAIL}.</> },
    ],
  },
  ar: {
    tableHeaders: ["المصدر", "البيانات", "الغرض", "التخزين"],
    rows: [
      ["نموذج التواصل", "الاسم، المدينة، البريد الإلكتروني والهاتف (اختياري)", "للرد على رسالتك أو مدحك أو انتقادك أو اقتراحك.", "يُرسل مباشرة من تطبيق بريدك الإلكتروني إلى Ibrahim_skb@live.dk. لا يُخزَّن في قاعدة بيانات على الموقع."],
      ["Google Analytics (GA4)", "إحصائيات زيارات مجهولة الهوية (يتم إخفاء IP)", "فهم كيفية استخدام الموقع لتحسينه.", "حتى سنتين — راجع التفاصيل في سياسة ملفات تعريف الارتباط."],
      ["Crisp Chat", "رسائل الدردشة، إذا راسلتني", "الرد على الأسئلة عبر الدردشة المباشرة.", "حتى سنة واحدة — راجع التفاصيل في سياسة ملفات تعريف الارتباط."],
    ],
    sections: [
      { title: "المسؤول عن البيانات", body: <>إبراهيم ظاهر حنف هو المسؤول عن معالجة البيانات الشخصية على somalimed.dk. للتواصل: {MAIL}.</> },
      { title: "ما هي البيانات التي أعالجها، ولماذا؟", table: true },
      { title: "الأساس القانوني", body: "تتم معالجة نموذج التواصل بناءً على موافقتك، من خلال اختيارك إرساله. تتم معالجة الإحصائيات (GA4) والدردشة (Crisp) بناءً على المصلحة المشروعة في تشغيل الموقع وتحسينه — يمكن إلغاء الاشتراك في كليهما عبر شعار ملفات تعريف الارتباط." },
      { title: "هل تتم مشاركة بياناتك مع آخرين؟", body: "يُرسل نموذج التواصل فقط إلى إبراهيم ظاهر حنف. تعالج Google وCrisp البيانات كما هو موضح في سياسة ملفات تعريف الارتباط. لا تُباع بياناتك أبدًا لأطراف ثالثة." },
      { title: "حقوقك", body: <>يحق لك الاطلاع على البيانات التي أحتفظ بها عنك أو تصحيحها أو حذفها، ولك الحق في الاعتراض على المعالجة. تواصل عبر {MAIL} لممارسة حقوقك. يمكنك أيضًا تقديم شكوى إلى الهيئة الدنماركية لحماية البيانات عبر {DT_DA}.</> },
      { title: "التواصل", body: <>إذا كانت لديك أسئلة حول معالجتي للبيانات الشخصية، فمرحبًا بتواصلك عبر خاصية الدردشة على الموقع أو عبر {MAIL}.</> },
    ],
  },
};

export function PersondatapolitikContent({ initialLanguage }) {
  const { language, updateLanguage } = useLanguageRouting({ initialLanguage });
  const data = CONTENT[language] ?? CONTENT.so;
  const isRtl = language === "ar";

  return (
    <main dir={isRtl ? "rtl" : "ltr"} style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px 80px", fontFamily: "system-ui, sans-serif", color: "#1e293b", lineHeight: 1.8 }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0D9488", marginBottom: "8px" }}>{TITLE[language] ?? TITLE.so}</h1>
      <p style={{ fontSize: "13px", color: "#556173", marginBottom: "20px" }}>
        {REVISED_PREFIX[language] ?? REVISED_PREFIX.so}: {formatRevisedDate(PRIVACY_REVISED_ISO, language)}
      </p>

      <LegalLangNav language={language} onChange={updateLanguage} />

      {data.sections.map((s, i) => {
        const color = SECTION_COLORS[i % SECTION_COLORS.length];
        return (
          <Section key={s.title} title={s.title} color={color} index={i + 1}>
            {s.table ? <DataTable headers={data.tableHeaders} rows={data.rows} color={color} /> : s.body}
          </Section>
        );
      })}
    </main>
  );
}

function DataTable({ headers, rows, color }) {
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
