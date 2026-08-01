// Hurtig-hop mellem de 4 sprogsektioner på juridiske sider (cookie- og
// persondatapolitik), som bevidst viser alle 4 sprog stablet på én side
// (fuld gennemsigtighed, uanset hvilket sprog man kommer fra). Disse
// pile-knapper gør det tydeligt at det IKKE er ét blandet dokument, men 4
// adskilte, fuldstændige sprogversioner man kan hoppe direkte til.
const TABS = [
  { id: "lang-da", label: "Dansk", theme: "#2563EB", soft: "#EFF6FF" },
  { id: "lang-en", label: "English", theme: "#92400E", soft: "#FEF3C7" },
  { id: "lang-so", label: "Soomaali", theme: "#0D9488", soft: "#F0FDFA" },
  { id: "lang-ar", label: "العربية", theme: "#D97706", soft: "#FFF7ED" },
];

export function LegalLangNav() {
  return (
    <nav
      aria-label="Hop til sprog / Jump to language"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        margin: "0 0 32px",
        padding: "12px 14px",
        borderRadius: "14px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      {TABS.map((t) => (
        <a
          key={t.id}
          href={`#${t.id}`}
          style={{
            padding: "5px 13px",
            borderRadius: "999px",
            fontSize: "12.5px",
            fontWeight: 700,
            color: t.theme,
            background: t.soft,
            border: `1.5px solid ${t.theme}`,
            textDecoration: "none",
          }}
        >
          {t.label}
        </a>
      ))}
    </nav>
  );
}
