// src/app/projects/page.tsx
import Image from "next/image";
import { getProjects } from "@/lib/sheets";
import { Project } from "@/types/data";

const STATUS_COLORS: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    Completed: "bg-ink/10 text-ink-soft",
    Ongoing: "bg-blue-100 text-blue-800",
};

function ProjectCard({ project }: { project: Project }) {
    const statusStyle = STATUS_COLORS[project.status] ?? "bg-ink/10 text-ink-soft";

    return (
        <div className="flex flex-col bg-white border border-ink/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {project.imageUrl && (
                <div className="relative w-full h-48">
                    <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="flex flex-col flex-1 p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-serif text-lg font-bold text-ink leading-snug">
                        {project.title}
                    </h3>
                    {project.status && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${statusStyle}`}>
                            {project.status}
                        </span>
                    )}
                </div>

                <p className="text-sm text-ink-soft leading-relaxed flex-1">
                    {project.description}
                </p>

                <div className="mt-4 pt-4 border-t border-ink/10 flex flex-col gap-1">
                    {project.funding_agency && (
                        <p className="text-xs text-ink-soft">
                            <span className="font-semibold text-ink">Funded by:</span>{" "}
                            {project.funding_agency}
                        </p>
                    )}
                    {project.grant_amount && (
                        <p className="text-xs text-ink-soft">
                            <span className="font-semibold text-ink">Grant:</span>{" "}
                            {project.grant_amount}
                        </p>
                    )}
                </div>

                {project.link && (
                    <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-sm font-bold text-red-primary hover:text-red-dark transition-colors"
                    >
                        Learn more →
                    </a>
                )}
            </div>
        </div>
    );
}

export default async function ProjectsPage() {
    const projects = await getProjects();

    const active = projects.filter((p) => p.status === "Active" || p.status === "Ongoing");
    const completed = projects.filter((p) => p.status === "Completed");

    return (
        <main className="mx-auto max-w-7xl px-6 py-12 min-h-screen">
            <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">Projects</h1>
            <p className="text-ink-soft mb-12">
                Research projects funded and undertaken by the Microgrid Lab.
            </p>

            {active.length > 0 && (
                <section className="mb-14">
                    <h2 className="font-serif text-2xl font-bold text-ink border-b border-ink/10 pb-2 mb-6">
                        Active Projects
                    </h2>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {active.map((project) => (
                            <ProjectCard key={project.title} project={project} />
                        ))}
                    </div>
                </section>
            )}

            {completed.length > 0 && (
                <section className="mb-14">
                    <h2 className="font-serif text-2xl font-bold text-ink border-b border-ink/10 pb-2 mb-6">
                        Completed Projects
                    </h2>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {completed.map((project) => (
                            <ProjectCard key={project.title} project={project} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}