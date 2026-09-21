"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "../../../lib/supabase/client";
import type { Publication } from "@/types/data";

const PUBLICATION_TYPES = [
  "Journal Article",
  "Conference Paper",
  "Book Chapter",
  "Workshop Paper",
  "Review Article",
  "Preprint",
  "Thesis / Dissertation",
  "Technical Report",
  "Other",
];

type FormState = {
  title: string;
  authors: string[];
  venue: string;
  publication_type: string;
  year: string;
  doi: string;
  url: string;
};

export default function AdminPublicationsTab() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FormState>({
    title: "",
    authors: [],
    venue: "",
    publication_type: "Journal Article",
    year: "",
    doi: "",
    url: "",
  });

  const [authorInput, setAuthorInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("publications")
      .select("*")
      .order("year", { ascending: false })
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, [supabase]);

  function addAuthor(raw: string) {
    const value = raw.trim();

    if (!value) return;

    setForm((prev) => ({
      ...prev,
      authors: prev.authors.includes(value)
        ? prev.authors
        : [...prev.authors, value],
    }));

    setAuthorInput("");
  }

  function removeAuthor(author: string) {
    setForm((prev) => ({
      ...prev,
      authors: prev.authors.filter((a) => a !== author),
    }));
  }

  function handleAuthorKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAuthor(authorInput);
    }

    if (
      e.key === "Backspace" &&
      authorInput === "" &&
      form.authors.length > 0
    ) {
      setForm((prev) => ({
        ...prev,
        authors: prev.authors.slice(0, -1),
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.authors.length === 0) {
      setError("Please add at least one author.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase
      .from("publications")
      .insert({
        title: form.title,
        authors: form.authors.join(", "),
        venue: form.venue || null,
        publication_type: form.publication_type,
        year: form.year ? parseInt(form.year) : null,
        doi: form.doi || null,
        url: form.url || null,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else {
      setItems((prev) => [data, ...prev]);

      setForm({
        title: "",
        authors: [],
        venue: "",
        publication_type: "Journal Article",
        year: "",
        doi: "",
        url: "",
      });

      setAuthorInput("");
    }

    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this publication?")) return;

    const { error } = await supabase
      .from("publications")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setError(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-serif text-xl font-bold text-ink mb-4">
          Add Publication
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-4"
        >
          <Field
            label="Title"
            required
            value={form.title}
            onChange={(v) =>
              setForm((f) => ({ ...f, title: v }))
            }
          />

          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">
              Authors
            </label>

            <div className="w-full border border-ink/10 rounded-lg px-2 py-2 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-red-primary/40">
              {form.authors.map((author) => (
                <span
                  key={author}
                  className="inline-flex items-center gap-1 bg-red-primary/10 text-red-primary text-xs font-medium rounded-full px-2.5 py-1"
                >
                  {author}

                  <button
                    type="button"
                    onClick={() => removeAuthor(author)}
                    className="text-red-primary/60 hover:text-red-primary cursor-pointer leading-none"
                    aria-label={`Remove ${author}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                onKeyDown={handleAuthorKeyDown}
                onBlur={() => addAuthor(authorInput)}
                placeholder={
                  form.authors.length === 0
                    ? "e.g. Smith J., Doe A."
                    : "Add another author"
                }
                className="flex-1 min-w-32 text-sm text-ink focus:outline-none py-0.5"
              />
            </div>

            <p className="text-xs text-ink-soft mt-1">
              Press Enter or comma to add each author.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink block mb-1.5">
                Publication Type
              </label>

              <select
                required
                value={form.publication_type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    publication_type: e.target.value,
                  }))
                }
                className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 bg-white"
              >
                {PUBLICATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Venue"
              value={form.venue}
              onChange={(v) =>
                setForm((f) => ({ ...f, venue: v }))
              }
              placeholder="Journal, conference, publisher, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Year"
              value={form.year}
              onChange={(v) =>
                setForm((f) => ({ ...f, year: v }))
              }
              placeholder="2024"
            />

            <Field
              label="DOI"
              value={form.doi}
              onChange={(v) =>
                setForm((f) => ({ ...f, doi: v }))
              }
              placeholder="10.xxxx/..."
            />
          </div>

          <Field
            label="URL"
            value={form.url}
            onChange={(v) =>
              setForm((f) => ({ ...f, url: v }))
            }
            placeholder="https://..."
          />

          {error && (
            <p className="text-sm text-red-primary font-medium">
              {error}
            </p>
          )}

          <SubmitBtn
            loading={submitting}
            label="Add Publication"
          />
        </form>
      </section>

      <section>
        <h2 className="font-serif text-xl font-bold text-ink mb-4">
          All Publications
        </h2>

        {loading ? (
          <p className="text-sm text-ink-soft italic">
            Loading...
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-ink-soft italic">
            No publications yet.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-semibold text-sm text-ink">
                    {item.title}
                  </p>

                  <p className="text-xs text-ink-soft">
                    {item.authors}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.publication_type && (
                      <span className="inline-flex items-center bg-red-primary/10 text-red-primary text-[10px] font-medium rounded-full px-2 py-0.5">
                        {item.publication_type}
                      </span>
                    )}

                    {(item.venue || item.year) && (
                      <p className="text-xs text-ink-soft">
                        {[item.venue, item.year]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline hover:text-blue-800"
                    >
                      Link
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
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

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-ink block mb-1.5">
        {label}
      </label>

      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40"
      />
    </div>
  );
}

function SubmitBtn({
  loading,
  label,
}: {
  loading: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="bg-red-primary text-white font-semibold text-sm rounded-lg px-5 py-2.5 disabled:opacity-50 cursor-pointer"
    >
      {loading ? "Saving..." : label}
    </button>
  );
}