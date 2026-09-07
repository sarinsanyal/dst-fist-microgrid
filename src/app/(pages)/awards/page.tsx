// src/app/awards/page.tsx
import { getAwards } from "@/lib/sheets";
import { Award } from "@/types/data";

function AwardRow({ award }: { award: Award }) {
  return (
    <div className="relative pl-8 pb-10 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-0 top-2 bottom-0 w-px bg-ink/10 last:hidden" />
      {/* Timeline dot */}
      <div className="absolute -left-1 top-2 w-2.5 h-2.5 rounded-full bg-red-primary border-2 border-paper" />

      <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-ink leading-snug">
              {award.title}
            </h3>
            <p className="text-sm text-red-primary font-semibold mt-0.5">
              {award.recipient}
            </p>
          </div>
          {award.year && (
            <span className="shrink-0 text-xs font-bold bg-ink/5 text-ink-soft px-3 py-1 rounded-full">
              {award.year}
            </span>
          )}
        </div>

        {award.organization && (
          <p className="text-xs text-ink-soft mt-2">
            <span className="font-semibold text-ink">Awarded by:</span>{" "}
            {award.organization}
          </p>
        )}

        {award.description && (
          <p className="text-sm text-ink-soft mt-3 leading-relaxed">
            {award.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default async function AwardsPage() {
  const awards = await getAwards();

  const sorted = [...awards].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 min-h-screen">
      <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">Awards</h1>
      <p className="text-ink-soft mb-12">
        Recognitions and honours received by the Microgrid Lab and its members.
      </p>

      <div className="relative ml-2">
        {sorted.map((award, i) => (
          <AwardRow key={award.title + award.year + i} award={award} />
        ))}
      </div>
    </main>
  );
}