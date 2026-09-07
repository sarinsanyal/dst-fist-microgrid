// src/app/publications/page.tsx
import { getPublications } from "@/lib/sheets";
import PublicationsList from "@/components/publications/list";

export default async function PublicationsPage() {
  const publications = await getPublications();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 min-h-screen">
      <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">Publications</h1>
      <p className="text-ink-soft mb-10">
        Research papers and journal articles from the Microgrid Lab.
      </p>
      <PublicationsList publications={publications} />
    </main>
  );
}