"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "../../../lib/supabase/client";
import type { Opportunity } from "@/types/data";

export default function AdminOpportunitiesTab() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", type: "", deadline: "", url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("opportunities").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setItems(data ?? []);
      setLoading(false);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase
      .from("opportunities")
      .insert({ title: form.title, description: form.description || null, type: form.type || null, deadline: form.deadline || null, url: form.url || null })
      .select().single();
    if (error) { setError(error.message); } else { setItems((prev) => [data, ...prev]); setForm({ title: "", description: "", type: "", deadline: "", url: "" }); }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this opportunity?")) return;
    await supabase.from("opportunities").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-serif text-xl font-bold text-ink mb-4">Add Opportunity</h2>
        <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Title</label>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40" placeholder="e.g. PhD Position in Microgrids" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink block mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 cursor-pointer">
                <option value="">Select type</option>
                <option value="PhD">PhD</option>
                <option value="internship">Internship</option>
                <option value="job">Job</option>
                <option value="postdoc">Post Doc</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink block mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">URL</label>
            <input type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40" placeholder="https://..." />
          </div>
          {error && <p className="text-sm text-red-primary font-medium">{error}</p>}
          <button type="submit" disabled={submitting} className="bg-red-primary text-white font-semibold text-sm rounded-lg px-5 py-2.5 disabled:opacity-50 cursor-pointer">
            {submitting ? "Saving..." : "Add Opportunity"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-xl font-bold text-ink mb-4">All Opportunities</h2>
        {loading ? <p className="text-sm text-ink-soft italic">Loading...</p> : items.length === 0 ? <p className="text-sm text-ink-soft italic">No opportunities yet.</p> : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex items-start justify-between gap-4">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-ink">{item.title}</p>
                    {item.type && <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 text-blue-800">{item.type}</span>}
                  </div>
                  {item.description && <p className="text-xs text-ink-soft">{item.description}</p>}
                  {item.deadline && <p className="text-xs text-ink-soft">Deadline: {item.deadline}</p>}
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800">Link</a>}
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