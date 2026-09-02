// src/components/publications/PublicationsList.tsx
"use client";

import { useState, useMemo } from "react";
import { Publication } from "@/types/data";

function PublicationRow({ pub }: { pub: Publication }) {
    return (
        <div className="border-b border-ink/10 py-5 last:border-0">
            <h3 className="font-serif font-bold text-ink leading-snug">{pub.title}</h3>
            <p className="text-sm text-ink-soft mt-1">{pub.authors}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
                {pub.journal && (
                    <span className="text-xs font-semibold text-red-primary italic">
                        {pub.journal}
                    </span>
                )}
                {pub.year && (
                    <span className="text-xs bg-ink/5 text-ink-soft px-2 py-0.5 rounded-full">
                        {pub.year}
                    </span>
                )}
                {pub.doi && (
                    <span className="text-xs text-ink-soft">
                        DOI: {pub.doi}
                    </span>
                )}
                {pub.url && (
                    <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-red-primary hover:text-red-dark transition-colors"
                    >
                        View paper →
                    </a>
                )}
            </div>
        </div>
    );
}

export default function PublicationsList({ publications }: { publications: Publication[] }) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<"newest" | "oldest">("newest");

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return publications
            .filter((p) =>
                p.title.toLowerCase().includes(q) ||
                p.authors.toLowerCase().includes(q) ||
                p.journal.toLowerCase().includes(q)
            )
            .sort((a, b) =>
                sort === "newest"
                    ? Number(b.year) - Number(a.year)
                    : Number(a.year) - Number(b.year)
            );
    }, [publications, query, sort]);

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <input
                    type="text"
                    placeholder="Search by title, author, or journal..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 border border-ink/20 rounded-lg px-4 py-2.5 text-sm bg-white text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-red-primary/30"
                />
                <div className="relative">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
                        className="appearance-none border border-ink/20 rounded-lg px-4 py-2.5 pr-8 text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/30 cursor-pointer"
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="w-4 h-4 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Count */}
            <p className="text-sm text-ink-soft mb-4">
                {filtered.length} publication{filtered.length !== 1 ? "s" : ""}
                {query && ` matching "${query}"`}
            </p>

            {/* List */}
            {filtered.length > 0 ? (
                <div>
                    {filtered.map((pub, i) => (
                        <PublicationRow key={pub.doi || pub.title || i} pub={pub} />
                    ))}
                </div>
            ) : (
                <p className="text-ink-soft text-sm py-10 text-center">No publications found.</p>
            )}
        </div>
    );
}