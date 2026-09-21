import Image from "next/image";
import { createClient } from "../../../../lib/supabase/server";

type ProjectRow = {
    id: string;
    title: string;
    description?: string | null;
    status?: string | null;
    image_url?: string | null;
    funding_agency?: string | null;
    grant_amount?: string | null;
    link?: string | null;
    created_at?: string | null;
    project_members?: { profiles: { id: string; full_name: string } | null }[];
};

const SECTIONS = [
    { key: "ongoing", label: "Ongoing Projects" },
    { key: "on_hold", label: "On Hold" },
    { key: "completed", label: "Completed Projects" },
];

function ProjectCard({ project }: { project: ProjectRow }) {
    const members = (project.project_members ?? [])
        .map((m) => m.profiles?.full_name)
        .filter(Boolean) as string[];

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {project.image_url && (
                <div className="relative h-48 w-full bg-gray-100">
                    <Image
                        src={project.image_url}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                    />
                </div>
            )}

            <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>

                {project.description && (
                    <p className="text-sm text-gray-600">{project.description}</p>
                )}

                {(project.funding_agency || project.grant_amount) && (
                    <dl className="space-y-1 text-sm">
                        {project.funding_agency && (
                            <div className="flex gap-2">
                                <dt className="font-medium text-gray-700">Funding:</dt>
                                <dd className="text-gray-600">{project.funding_agency}</dd>
                            </div>
                        )}
                        {project.grant_amount && (
                            <div className="flex gap-2">
                                <dt className="font-medium text-gray-700">Grant:</dt>
                                <dd className="text-gray-600">{project.grant_amount}</dd>
                            </div>
                        )}
                    </dl>
                )}

                {members.length > 0 && (
                    <p className="text-xs text-gray-500">Team: {members.join(", ")}</p>
                )}

                {project.link && (
                    <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto text-sm font-medium text-blue-600 hover:underline"
                    >
                        Learn more →
                    </a>
                )}
            </div>
        </div>
    );
}

export default async function ProjectsPage() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("projects")
        .select("*, project_members(profiles(id, full_name))")
        .order("created_at", { ascending: false });

    if (error) console.error("Failed to load projects:", error.message);

    const projects = (data ?? []) as unknown as ProjectRow[];

    return (
        <main className="mx-auto max-w-6xl px-4 py-12 min-h-screen">
            <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">Projects</h1>
            <p className="text-ink-soft mb-12">
                All the projects in our Lab.
            </p>

            {projects.length === 0 && (
                <p className="text-gray-500">No projects yet.</p>
            )}

            {SECTIONS.map(({ key, label }) => {
                const items = projects.filter((p) => (p.status ?? "ongoing") === key);
                if (items.length === 0) return null;
                return (
                    <section key={key} className="mb-12">
                        <h2 className="mb-6 text-xl font-semibold text-gray-800">{label}</h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((p) => (
                                <ProjectCard key={p.id} project={p} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </main>
    );
}