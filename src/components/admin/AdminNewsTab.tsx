"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "../../../lib/supabase/client";
import type { NewsItem } from "@/types/data";

export default function AdminNewsTab() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", body: "", published_at: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("news").select("*").order("published_at", { ascending: false }).then(({ data }) => {
      setItems(data ?? []);
      setLoading(false);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase
      .from("news")
      .insert({ title: form.title, body: form.body || null, published_at: form.published_at || null })
      .select().single();
    if (error) { setError(error.message); } else { setItems((prev) => [data, ...prev]); setForm({ title: "", body: "", published_at: "" }); }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this news item?")) return;
    await supabase.from("news").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-serif text-xl font-bold text-ink mb-4">Add News</h2>
        <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Title</label>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40" placeholder="News headline" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Body</label>
            <textarea rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 resize-none" placeholder="Full news content..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Published Date</label>
            <input type="date" value={form.published_at} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
              className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40" />
          </div>
          {error && <p className="text-sm text-red-primary font-medium">{error}</p>}
          <button type="submit" disabled={submitting} className="bg-red-primary text-white font-semibold text-sm rounded-lg px-5 py-2.5 disabled:opacity-50 cursor-pointer">
            {submitting ? "Saving..." : "Add News"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-xl font-bold text-ink mb-4">All News</h2>
        {loading ? <p className="text-sm text-ink-soft italic">Loading...</p> : items.length === 0 ? <p className="text-sm text-ink-soft italic">No news yet.</p> : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex items-start justify-between gap-4">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="font-semibold text-sm text-ink">{item.title}</p>
                  {item.published_at && <p className="text-xs text-ink-soft">{item.published_at}</p>}
                  {item.body && <p className="text-xs text-ink-soft line-clamp-2">{item.body}</p>}
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-red-primary/80 hover:text-red-primary font-medium shrink-0 cursor-pointer">Delete</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}