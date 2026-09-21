import { createClient } from "../../../../lib/supabase/server";

type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  deadline: string | null;
  url: string | null;
  created_at: string;
};

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const isExpired = opportunity.deadline
    ? new Date(opportunity.deadline) < new Date()
    : false;

  return (
    <div
      className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${
        isExpired ? "border-ink/10 opacity-60" : "border-ink/10"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-ink leading-snug">
            {opportunity.title}
          </h3>

          {opportunity.type && (
            <span className="inline-block mt-1 text-xs font-semibold bg-red-primary/10 text-red-primary px-2 py-0.5 rounded-full capitalize">
              {opportunity.type}
            </span>
          )}
        </div>

        {opportunity.deadline && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-ink-soft">Deadline</p>
            <p
              className={`text-xs font-bold ${
                isExpired ? "text-ink-soft" : "text-red-primary"
              }`}
            >
              {isExpired
                ? "Closed"
                : new Date(opportunity.deadline).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
            </p>
          </div>
        )}
      </div>

      {opportunity.description && (
        <p className="text-sm text-ink-soft leading-relaxed">
          {opportunity.description}
        </p>
      )}

      {opportunity.url && !isExpired && (
        <a
          href={opportunity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-bold text-white bg-red-primary hover:bg-red-dark transition-colors px-4 py-2 rounded-lg"
        >
          Apply now →
        </a>
      )}
    </div>
  );
}

export default async function OpportunitiesPage() {
  const supabase = await createClient();

  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("id, title, description, type, deadline, url, created_at")
    .order("deadline", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Failed to fetch opportunities:", error);
  }

  const allOpportunities = opportunities ?? [];

  const open = allOpportunities.filter((opportunity) =>
    opportunity.deadline
      ? new Date(opportunity.deadline) >= new Date()
      : true
  );

  const closed = allOpportunities.filter((opportunity) =>
    opportunity.deadline
      ? new Date(opportunity.deadline) < new Date()
      : false
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 min-h-screen">
      <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">
        Opportunities
      </h1>

      <p className="text-ink-soft mb-12">
        Open positions and research opportunities at the Microgrid Lab.
      </p>

      {open.length > 0 && (
        <section className="mb-14">
          <h2 className="font-serif text-2xl font-bold text-ink border-b border-ink/10 pb-2 mb-6">
            Open Opportunities
          </h2>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {open.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
              />
            ))}
          </div>
        </section>
      )}

      {closed.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl font-bold text-ink border-b border-ink/10 pb-2 mb-6">
            Closed Opportunities
          </h2>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {closed.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
              />
            ))}
          </div>
        </section>
      )}

      {open.length === 0 && closed.length === 0 && (
        <p className="text-ink-soft text-sm py-10 text-center">
          No opportunities available at the moment.
        </p>
      )}
    </main>
  );
}