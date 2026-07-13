export const metadata = {
  title: "Cookiepolitik | SomaliMed",
  description: "Somalimeds cookiepolitik — hvilke cookies vi bruger og hvorfor.",
};

export default function CookiePolitik() {
  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px 80px", fontFamily: "system-ui, sans-serif", color: "#1e293b", lineHeight: 1.8 }}>

      {/* DA */}
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0D9488", marginBottom: "8px" }}>Cookiepolitik</h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "32px" }}>Sidst revideret: 13. juli 2026</p>

      <Section title="Hvad er cookies?">
        Cookies er små tekstfiler, der gemmes på din enhed, når du besøger en hjemmeside. De bruges til at huske dine præferencer og til at indsamle statistik om, hvordan siden bruges.
      </Section>

      <Section title="Hvilke cookies bruger vi?">
        <CookieTable rows={[
          ["Google Analytics (GA4)", "Statistik", "Analyse af besøg, sider og brugeradfærd. IP-adresser anonymiseres.", "Op til 2 år"],
          ["Crisp Chat", "Funktionel", "Muliggør live chat-support. Husker tidligere samtaler.", "Op til 1 år"],
        ]} />
      </Section>

      <Section title="Hvem deler vi data med?">
        Data deles udelukkende med Google (Analytics) og Crisp til de formål, der er beskrevet ovenfor. Ingen data sælges til tredjeparter.
      </Section>

      <Section title="Sådan trækker du dit samtykke tilbage">
        Du kan til enhver tid slette cookies i din browsers indstillinger og nulstille dit valg ved at slette cookies fra somalimed.dk. Siden vil derefter vise cookiebanneret igen.
      </Section>

      <Section title="Kontakt">
        Har du spørgsmål til vores cookiebrug, er du velkommen til at kontakte os via chat-funktionen på siden.
      </Section>

      <hr style={{ margin: "48px 0 40px", border: "none", borderTop: "1px solid #e2e8f0" }} />

      {/* EN */}
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0D9488", marginBottom: "24px" }}>Cookie Policy (English)</h2>

      <Section title="What are cookies?">
        Cookies are small text files stored on your device when you visit a website. They are used to remember your preferences and to collect statistics about how the site is used.
      </Section>

      <Section title="Which cookies do we use?">
        <CookieTable rows={[
          ["Google Analytics (GA4)", "Statistics", "Analysis of visits, pages and user behaviour. IP addresses are anonymised.", "Up to 2 years"],
          ["Crisp Chat", "Functional", "Enables live chat support. Remembers previous conversations.", "Up to 1 year"],
        ]} />
      </Section>

      <Section title="Who do we share data with?">
        Data is shared only with Google (Analytics) and Crisp for the purposes described above. No data is sold to third parties.
      </Section>

      <Section title="Withdrawing your consent">
        You can delete cookies at any time in your browser settings. Deleting cookies from somalimed.dk will reset your choice and show the cookie banner again.
      </Section>

      <hr style={{ margin: "48px 0 40px", border: "none", borderTop: "1px solid #e2e8f0" }} />

      {/* SO */}
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0D9488", marginBottom: "24px" }}>Siyaasadda Cookies (Af-Soomaali)</h2>

      <Section title="Maxay yihiin cookies?">
        Cookies waa faylal yaryar oo qoraal ah oo lagu kaydiyaa qalabkaaga marka aad booqanayso bogga internet-ka. Waxay loo isticmaalaa xasuusinta doortidaada iyo ururin xog ku saabsan sida bogga loo adeegsado.
      </Section>

      <Section title="Cookies kee ayaan isticmaalnaa?">
        <CookieTable rows={[
          ["Google Analytics (GA4)", "Xogta booqashooyinka", "Falanqaynta booqashooyinka, bogagga iyo dhaqdhaqaaqa isticmaalaha. Ciwaannada IP waa la qariyaa.", "Ilaa 2 sano"],
          ["Crisp Chat", "Shaqaynta chatka", "Waxay suurtogalisaa taageerada chat-ka tooska ah. Waxay xasuusataa sheekooyin hore.", "Ilaa 1 sano"],
        ]} />
      </Section>

      <Section title="Xogta ma la wadaagnaa?">
        Xogta waxaa lala wadaagaa oo keliya Google (Analytics) iyo Crisp ujeedooyinka kor ku xusan. Xog kuma iibsano xisbiyada saddexaad.
      </Section>

      <Section title="Sida aad u bixin karto oggolaanshahaga">
        Waxaad xaqiijin kartaa cookies-ka browser-kaaga dejintiisa. Tirtirka cookies-ka somalimed.dk wuxuu dib u dejin doona doorashadaada wuxuuna soo bandhigi doonaa banner-ka cookies-ka mar kale.
      </Section>

      <hr style={{ margin: "48px 0 40px", border: "none", borderTop: "1px solid #e2e8f0" }} />

      {/* AR */}
      <div dir="rtl">
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0D9488", marginBottom: "24px" }}>سياسة ملفات تعريف الارتباط (العربية)</h2>

        <Section title="ما هي ملفات تعريف الارتباط؟">
          ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة موقع إلكتروني. تُستخدم لتذكر تفضيلاتك وجمع إحصائيات حول كيفية استخدام الموقع.
        </Section>

        <Section title="ما هي ملفات تعريف الارتباط التي نستخدمها؟">
          <CookieTable rows={[
            ["Google Analytics (GA4)", "إحصائيات", "تحليل الزيارات والصفحات وسلوك المستخدم. يتم إخفاء هوية عناوين IP.", "حتى سنتين"],
            ["Crisp Chat", "وظيفي", "يتيح دعم الدردشة المباشرة. يتذكر المحادثات السابقة.", "حتى سنة واحدة"],
          ]} />
        </Section>

        <Section title="مع من نشارك البيانات؟">
          تُشارك البيانات فقط مع Google (Analytics) وCrisp للأغراض الموضحة أعلاه. لا تُباع أي بيانات لأطراف ثالثة.
        </Section>

        <Section title="سحب موافقتك">
          يمكنك حذف ملفات تعريف الارتباط في أي وقت من إعدادات المتصفح. سيؤدي حذف ملفات somalimed.dk إلى إعادة ضبط اختيارك وإظهار شعار الموافقة مجددًا.
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

function CookieTable({ rows }) {
  const headers = rows[0].length === 4
    ? ["Cookie", "Type", "Formål", "Levetid"]
    : ["Cookie", "Type", "Purpose", "Duration"];
  return (
    <div style={{ overflowX: "auto", marginTop: "8px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            {["Cookie / Tjeneste", "Type", "Formål / Purpose", "Levetid / Duration"].map(h => (
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
