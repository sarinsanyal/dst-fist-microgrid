"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "../../../lib/supabase/client";


type Member = { id: string; full_name: string; avatar_url?: string | null };
type Project = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  profiles?: { full_name: string } | null;
  project_members?: { profile_id: string; profiles: { full_name: string } | null }[];
};

export default function AdminProjectsTab() {
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", status: "ongoing" });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: proj }, { data: mem }] = await Promise.all([
        supabase
          .from("projects")
          .select("id, title, description, status, created_by, created_at, profiles:created_by(full_name), project_members(profile_id, profiles:profile_id(full_name))")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("status", "approved")
          .neq("role", "admin")
          .order("full_name"),
      ]);
      setProjects((proj as unknown as Project[]) ?? []);
      setMembers(mem ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data: proj, error: projErr } = await supabase
      .from("projects")
      .insert({ title: form.title, description: form.description || null, status: form.status })
      .select("id, title, description, status, created_by, created_at")
      .single();

    if (projErr || !proj) {
      setError(projErr?.message ?? "Failed to create project.");
      setSubmitting(false);
      return;
    }

    if (selectedMembers.length > 0) {
      await supabase.from("project_members").insert(
        selectedMembers.map((pid) => ({ project_id: proj.id, profile_id: pid }))
      );
    }

    setProjects((prev) => [{ ...proj, project_members: selectedMembers.map((pid) => ({ profile_id: pid, profiles: members.find((m) => m.id === pid) ? { full_name: members.find((m) => m.id === pid)!.full_name } : null })) }, ...prev]);
    setForm({ title: "", description: "", status: "ongoing" });
    setSelectedMembers([]);
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleMember(id: string) {
    setSelectedMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-serif text-xl font-bold text-ink mb-4">Add Project</h2>
        <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40"
              placeholder="Project title"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 resize-none"
              placeholder="Brief description"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 cursor-pointer"
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">Add Members</label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer transition-colors ${
                    selectedMembers.includes(m.id)
                      ? "bg-red-primary text-white border-red-primary"
                      : "border-ink/10 text-ink-soft hover:border-red-primary/40"
                  }`}
                >
                  {m.full_name}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-primary font-medium">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-red-primary text-white font-semibold text-sm rounded-lg px-5 py-2.5 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Adding..." : "Add Project"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-xl font-bold text-ink mb-4">All Projects</h2>
        {loading ? (
          <p className="text-sm text-ink-soft italic">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-ink-soft italic">No projects yet.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-ink">{p.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      p.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                      p.status === "on_hold" ? "bg-amber-100 text-amber-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>{p.status}</span>
                  </div>
                  {p.description && <p className="text-xs text-ink-soft">{p.description}</p>}
                  {p.project_members && p.project_members.length > 0 && (
                    <p className="text-xs text-ink-soft">
                      Members: {p.project_members.map((pm) => pm.profiles?.full_name).filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs text-red-primary/80 hover:text-red-primary font-medium shrink-0 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}