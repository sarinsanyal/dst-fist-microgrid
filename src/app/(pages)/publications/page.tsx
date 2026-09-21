import { createClient } from "../../../../lib/supabase/server";
import { Publication } from "@/types/data";

function PublicationCard({ pub }: { pub: Publication }) {
    return (
        <div className="bg-white border border-ink/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-serif text-lg font-bold text-ink leading-snug">
                {pub.title}
            </h3>

            <p className="text-sm text-ink-soft mt-1.5">{pub.authors}</p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-xs text-ink-soft">
                {pub.venue && (
                    <span className="italic">{pub.venue}</span>
                )}
                {pub.venue && pub.year && <span>·</span>}
                {pub.year && <span>{pub.year}</span>}
                {pub.doi && (
                    <>
                        <span>·</span>
                        <span>DOI: {pub.doi}</span>
                    </>
                )}
            </div>

            {pub.url && (
                <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-semibold text-red-primary hover:underline mt-3"
                >
                    View publication →
                </a>
            )}
        </div>
    );
}

export default async function PublicationsPage() {
    const supabase = await createClient();

    const { data: publications } = await supabase
        .from("publications")
        .select(
            "id, title, authors, venue, publication_type, year, doi, url, created_at"
        )
        .order("year", { ascending: false })
        .order("created_at", { ascending: false });

    const items: Publication[] = publications ?? [];

    return (
        <main className="mx-auto max-w-5xl px-6 py-12 min-h-screen">
            <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">
                Publications
            </h1>

            <p className="text-ink-soft mb-10">
                Peer-reviewed papers and research output from the Microgrid Lab.
            </p>

            {items.length === 0 ? (
                <p className="text-sm text-ink-soft">No publications yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((pub) => (
                        <PublicationCard key={pub.id} pub={pub} />
                    ))}
                </div>
            )}
        </main>
    );
}