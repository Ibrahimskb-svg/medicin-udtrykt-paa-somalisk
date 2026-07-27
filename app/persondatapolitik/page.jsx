import { PRIVACY_REVISED_ISO } from "../../src/data/legal-revised.generated";
import { formatRevisedDate } from "../../src/lib/format-revised-date";

export const metadata = {
  title: "Persondatapolitik",
  description: "Somalimeds persondatapolitik — hvilke persondata vi behandler, hvorfor, og dine rettigheder.",
  robots: { index: false, follow: true },
};

export default function Persondatapolitik() {
  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px 80px", fontFamily: "system-ui, sans-serif", color: "#1e293b", lineHeight: 1.8 }}>

      {/* DA */}
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0D9488", marginBottom: "8px" }}>Persondatapolitik</h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "32px" }}>Sidst revideret: {formatRevisedDate(PRIVACY_REVISED_ISO, "da")}</p>

      <Section title="Dataansvarlig">
        Ibrahim Dahir Hanaf er dataansvarlig for behandlingen af persondata på somalimed.dk. Kontakt: <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a>.
      </Section>

      <Section title="Hvilke data behandler vi, og hvorfor?">
        <DataTable headers={["Kilde", "Data", "Formål", "Opbevaring"]} rows={[
          ["Kontaktformular", "Navn, by, evt. e-mail og telefon", "For at kunne besvare din henvendelse, ros, ris eller forslag.", "Sendes direkte fra din egen e-mail-app til Ibrahim_skb@live.dk. Gemmes ikke i en database på siden."],
          ["Google Analytics (GA4)", "Anonymiseret besøgsstatistik (IP anonymiseres)", "Forstå hvordan siden bruges, så den kan forbedres.", "Op til 2 år — se detaljer i vores Cookiepolitik."],
          ["Crisp Chat", "Chatbeskeder, hvis du skriver til os", "Besvare spørgsmål via live chat.", "Op til 1 år — se detaljer i vores Cookiepolitik."],
        ]} />
      </Section>

      <Section title="Retsgrundlag">
        Kontaktformularen behandles på baggrund af dit samtykke, ved at du selv vælger at sende den. Statistik (GA4) og chat (Crisp) behandles på baggrund af legitim interesse i at drive og forbedre siden — begge kan du fravælge via cookiebanneret.
      </Section>

      <Section title="Deles dine data med andre?">
        Kontaktformularen sendes udelukkende til Ibrahim Dahir Hanaf. Google og Crisp behandler data som beskrevet i vores Cookiepolitik. Dine data sælges aldrig til tredjeparter.
      </Section>

      <Section title="Dine rettigheder">
        Du har ret til at få indsigt i, rettet eller slettet de data, vi har om dig, samt ret til at gøre indsigelse mod behandlingen. Kontakt <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a> for at gøre brug af dine rettigheder. Du kan også klage til Datatilsynet på <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer" style={{ color: "#0D9488", fontWeight: 600 }}>datatilsynet.dk</a>.
      </Section>

      <Section title="Kontakt">
        Har du spørgsmål til vores behandling af persondata, er du velkommen til at kontakte os via chat-funktionen på siden eller på <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a>.
      </Section>

      <hr style={{ margin: "48px 0 40px", border: "none", borderTop: "1px solid #e2e8f0" }} />

      {/* EN */}
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0D9488", marginBottom: "24px" }}>Privacy Policy (English)</h2>

      <Section title="Data controller">
        Ibrahim Dahir Hanaf is the data controller for personal data processed on somalimed.dk. Contact: <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a>.
      </Section>

      <Section title="What data do we process, and why?">
        <DataTable headers={["Source", "Data", "Purpose", "Storage"]} rows={[
          ["Contact form", "Name, city, optional email and phone", "So we can respond to your message, praise, criticism or suggestion.", "Sent directly from your own email app to Ibrahim_skb@live.dk. Not stored in a database on the site."],
          ["Google Analytics (GA4)", "Anonymised visit statistics (IP anonymised)", "Understand how the site is used, so it can be improved.", "Up to 2 years — see details in our Cookie Policy."],
          ["Crisp Chat", "Chat messages, if you write to us", "Answering questions via live chat.", "Up to 1 year — see details in our Cookie Policy."],
        ]} />
      </Section>

      <Section title="Legal basis">
        The contact form is processed based on your consent, given by choosing to send it. Statistics (GA4) and chat (Crisp) are processed based on legitimate interest in running and improving the site — both can be opted out of via the cookie banner.
      </Section>

      <Section title="Is your data shared with others?">
        The contact form is sent only to Ibrahim Dahir Hanaf. Google and Crisp process data as described in our Cookie Policy. Your data is never sold to third parties.
      </Section>

      <Section title="Your rights">
        You have the right to access, correct or delete the data we hold about you, and the right to object to the processing. Contact <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a> to exercise your rights. You can also file a complaint with the Danish Data Protection Agency at <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer" style={{ color: "#0D9488", fontWeight: 600 }}>datatilsynet.dk</a>.
      </Section>

      <Section title="Contact">
        If you have questions about our processing of personal data, you're welcome to contact us via the chat function on the site or at <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a>.
      </Section>

      <hr style={{ margin: "48px 0 40px", border: "none", borderTop: "1px solid #e2e8f0" }} />

      {/* SO */}
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0D9488", marginBottom: "24px" }}>Siyaasadda Xogta Shakhsiga (Af-Soomaali)</h2>

      <Section title="Ka mas'uulka xogta">
        Ibrahim Dahir Hanaf ayaa ah ka mas'uulka habaynta xogta shakhsiga ee somalimed.dk. La xiriir: <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a>.
      </Section>

      <Section title="Xogtee ayaan habeynaa, iyo sababta?">
        <DataTable headers={["Isha", "Xogta", "Ujeedka", "Kaydinta"]} rows={[
          ["Foomka xiriirka", "Magaca, magaalada, iimaylka iyo lambarka telefoonka haddii aad bixiso", "Si aan uga jawaabno fariintaada, ammaanta, dhaleeceynta ama soo jeedintaada.", "Waxaa laga soo diraa app-kaaga iimaylka si toos ah Ibrahim_skb@live.dk. Kuma kaydsana database ku yaal bogga."],
          ["Google Analytics (GA4)", "Xogta booqashooyinka oo qarsoon (IP-ga waa la qariyaa)", "Fahamka sida bogga loo isticmaalo si loo hagaajiyo.", "Ilaa 2 sano — eeg faahfaahinta Siyaasadda Cookies-keena."],
          ["Crisp Chat", "Fariimaha chatka, haddii aad noo qorto", "Ka jawaabista su'aalaha via chat tooska ah.", "Ilaa 1 sano — eeg faahfaahinta Siyaasadda Cookies-keena."],
        ]} />
      </Section>

      <Section title="Aasaaska sharciga">
        Foomka xiriirka waxaa lagu habeeyaa oggolaanshahaaga, adiga oo doorta inaad diro. Xogta tirakoobka (GA4) iyo chatka (Crisp) waxaa lagu habeeyaa danta sharciga ah ee maaraynta iyo hagaajinta bogga — labadaba waad ka bixi kartaa banner-ka cookies-ka.
      </Section>

      <Section title="Xogtaada ma lala wadaagaa dad kale?">
        Foomka xiriirka waxaa keliya loo diraa Ibrahim Dahir Hanaf. Google iyo Crisp waxay habeeyaan xogta sida ku xusan Siyaasadda Cookies-keena. Xogtaada marnaba lama iibiyo xisbiyada saddexaad.
      </Section>

      <Section title="Xuquuqdaada">
        Waxaad xaq u leedahay inaad aragto, saxdo ama tirtirto xogta aan ku haynay, iyo xaq u leh inaad ka soo horjeesato habaynta. La xiriir <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a> si aad u isticmaasho xuquuqdaada. Waxaad sidoo kale u caban kartaa Datatilsynet (Waaxda Ilaalinta Xogta Danish) ee <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer" style={{ color: "#0D9488", fontWeight: 600 }}>datatilsynet.dk</a>.
      </Section>

      <Section title="La xiriir">
        Haddii aad su'aalo ka qabto habaynta xogtaada shakhsiga, waad la xiriiri kartaa chatka bogga ama <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a>.
      </Section>

      <hr style={{ margin: "48px 0 40px", border: "none", borderTop: "1px solid #e2e8f0" }} />

      {/* AR */}
      <div dir="rtl">
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0D9488", marginBottom: "24px" }}>سياسة الخصوصية (العربية)</h2>

        <Section title="المسؤول عن البيانات">
          إبراهيم ظاهر حنف هو المسؤول عن معالجة البيانات الشخصية على somalimed.dk. للتواصل: <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a>.
        </Section>

        <Section title="ما هي البيانات التي نعالجها، ولماذا؟">
          <DataTable headers={["المصدر", "البيانات", "الغرض", "التخزين"]} rows={[
            ["نموذج التواصل", "الاسم، المدينة، البريد الإلكتروني والهاتف (اختياري)", "للرد على رسالتك أو مدحك أو انتقادك أو اقتراحك.", "يُرسل مباشرة من تطبيق بريدك الإلكتروني إلى Ibrahim_skb@live.dk. لا يُخزَّن في قاعدة بيانات على الموقع."],
            ["Google Analytics (GA4)", "إحصائيات زيارات مجهولة الهوية (يتم إخفاء IP)", "فهم كيفية استخدام الموقع لتحسينه.", "حتى سنتين — راجع التفاصيل في سياسة ملفات تعريف الارتباط."],
            ["Crisp Chat", "رسائل الدردشة، إذا راسلتنا", "الرد على الأسئلة عبر الدردشة المباشرة.", "حتى سنة واحدة — راجع التفاصيل في سياسة ملفات تعريف الارتباط."],
          ]} />
        </Section>

        <Section title="الأساس القانوني">
          تتم معالجة نموذج التواصل بناءً على موافقتك، من خلال اختيارك إرساله. تتم معالجة الإحصائيات (GA4) والدردشة (Crisp) بناءً على المصلحة المشروعة في تشغيل الموقع وتحسينه — يمكن إلغاء الاشتراك في كليهما عبر شعار ملفات تعريف الارتباط.
        </Section>

        <Section title="هل تتم مشاركة بياناتك مع آخرين؟">
          يُرسل نموذج التواصل فقط إلى إبراهيم ظاهر حنف. تعالج Google وCrisp البيانات كما هو موضح في سياسة ملفات تعريف الارتباط. لا تُباع بياناتك أبدًا لأطراف ثالثة.
        </Section>

        <Section title="حقوقك">
          يحق لك الاطلاع على البيانات التي نحتفظ بها عنك أو تصحيحها أو حذفها، ولك الحق في الاعتراض على المعالجة. تواصل عبر <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a> لممارسة حقوقك. يمكنك أيضًا تقديم شكوى إلى الهيئة الدنماركية لحماية البيانات عبر <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer" style={{ color: "#0D9488", fontWeight: 600 }}>datatilsynet.dk</a>.
        </Section>

        <Section title="التواصل">
          إذا كانت لديك أسئلة حول معالجتنا للبيانات الشخصية، فمرحبًا بتواصلك عبر خاصية الدردشة على الموقع أو عبر <a href="mailto:Ibrahim_skb@live.dk" style={{ color: "#0D9488", fontWeight: 600 }}>Ibrahim_skb@live.dk</a>.
        </Section>
      </div>

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

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginTop: "8px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            {headers.map((h) => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
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
