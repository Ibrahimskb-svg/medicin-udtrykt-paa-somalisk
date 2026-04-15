import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>Siden blev ikke fundet</h1>
      <p>Den ønskede side findes ikke i den migrerede Next.js-app.</p>
      <Link href="/">Til forsiden</Link>
    </main>
  );
}
