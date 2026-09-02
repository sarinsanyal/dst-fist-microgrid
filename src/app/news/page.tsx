// src/app/news/page.tsx
import Image from "next/image";
import { getNews } from "@/lib/sheets";
import { NewsItem } from "@/types/data";

function NewsCard({ item }: { item: NewsItem }) {
    return (
        <div className="flex flex-col bg-white border border-ink/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {item.image_url && (
                <div className="relative w-full h-48">
                    <Image
                        src={item.image_url}
                        alt={item.headline}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-2 mb-2">
                    {item.category && (
                        <span className="text-xs font-bold text-red-primary uppercase tracking-wide">
                            {item.category}
                        </span>
                    )}
                    {item.date && (
                        <span className="text-xs text-ink-soft">{item.date}</span>
                    )}
                </div>

                <h3 className="font-serif text-lg font-bold text-ink leading-snug">
                    {item.headline}
                </h3>

                {item.summary && (
                    <p className="text-sm text-ink-soft mt-2 leading-relaxed flex-1">
                        {item.summary}
                    </p>
                )}

                {item.link && (
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-sm font-bold text-red-primary hover:text-red-dark transition-colors"
                    >
                        Read more →
                    </a>
                )}
            </div>
        </div>
    );
}

export default async function NewsPage() {
    const news = await getNews();

    const sorted = [...news].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <main className="mx-auto max-w-7xl px-6 py-12 min-h-screen">
            <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">News</h1>
            <p className="text-ink-soft mb-12">
                Latest updates and announcements from the Microgrid Lab.
            </p>

            {sorted.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {sorted.map((item, i) => (
                        <NewsCard key={item.headline + i} item={item} />
                    ))}
                </div>
            ) : (
                <p className="text-ink-soft text-sm py-10 text-center">
                    No news available at the moment.
                </p>
            )}
        </main>
    );
}