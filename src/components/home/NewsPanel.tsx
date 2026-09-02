import Link from "next/link";
import { getNews } from "@/lib/sheets";
import { NewsItem } from "@/types/data";

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <li className="border-b border-ink/10 pb-3 last:border-0">
      <p className="text-xs font-bold text-red-primary uppercase tracking-wide">{item.category}</p>
      <p className="font-serif font-semibold leading-snug mt-1">{item.headline}</p>
      <p className="text-xs text-ink-soft mt-1">{item.date}</p>
    </li>
  );
}

export default async function NewsPanel() {
  const news = await getNews();
  const latest = news.slice(0, 5);

  return (
    <aside className="flex flex-col h-145 border border-ink/10 rounded-md p-5">
      <h2 className="font-serif text-xl font-bold mb-4">Latest News</h2>
      <ul className="flex-1 overflow-y-auto space-y-3">
        {latest.map((item, i) => <NewsRow key={i} item={item} />)}
      </ul>
      <Link
        href="/news"
        className="mt-4 text-sm font-bold text-red-primary hover:text-red-dark transition-colors"
      >
        View all news
      </Link>
    </aside>
  );
}