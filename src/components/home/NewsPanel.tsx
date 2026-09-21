import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";

type NewsItem = {
  id: string;
  title: string;
  body: string;
  published_at: string | null;
  created_at: string;
};

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <li className="border-b border-ink/10 pb-3 last:border-0">
      <p className="font-serif font-semibold leading-snug mt-1">
        {item.title}
      </p>

      <p className="text-xs text-ink-soft mt-1">
        {new Date(item.published_at || item.created_at).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )}
      </p>
    </li>
  );
}

export default async function NewsPanel() {
  const supabase = await createClient();

  const { data: news, error } = await supabase
    .from("news")
    .select("id, title, body, published_at, created_at")
    .order("published_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching news:", error);
  }

  return (
    <aside className="flex flex-col h-145 border border-ink/10 rounded-md p-5">
      <h2 className="font-serif text-xl font-bold mb-4">Latest News</h2>

      <ul className="flex-1 overflow-y-auto space-y-3">
        {news?.map((item) => (
          <NewsRow key={item.id} item={item} />
        ))}
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