// src/app/people/page.tsx
import Image from "next/image";
import { getMembers } from "@/lib/sheets";
import { Member } from "@/types/data";

const ROLE_ORDER = [
    "Professor",
    "Post Doc Scholar",
    "PhD Student",
    "PG Research Scholar",
    "UG Research Scholar",
];

function MemberCard({ member }: { member: Member }) {
    return (
        <div className="flex flex-col items-center text-center bg-white border border-ink/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-red-primary mb-4">
                {member.photoUrl ? (
                    <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-ink/10 flex items-center justify-center text-3xl text-ink-soft">
                        {member.name.charAt(0)}
                    </div>
                )}
            </div>

            <h3 className="font-serif text-lg font-bold text-ink">{member.name}</h3>
            <p className="text-sm text-red-primary font-semibold mt-0.5">{member.role}</p>

            {member.achievements && (
                <p className="text-xs text-ink-soft mt-2 leading-relaxed line-clamp-3">
                    {member.achievements}
                </p>
            )}

            <div className="flex gap-3 mt-4">
                {member.email && (
                    <a
                        href={`mailto:${member.email}`}
                        className="text-xs text-ink-soft hover:text-red-primary transition-colors"
                    >
                        Email
                    </a>
                )}
                {member.google_scholar && (
                    <a
                        href={member.google_scholar}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-ink-soft hover:text-red-primary transition-colors"
                    >
                        Scholar
                    </a>
                )}
                {member.linkedin && (
                    <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-ink-soft hover:text-red-primary transition-colors"
                    >
                        LinkedIn
                    </a>
                )}
            </div>
        </div>
    );
}

export default async function PeoplePage() {
    const members = await getMembers();

    const grouped = ROLE_ORDER.reduce<Record<string, Member[]>>((acc, role) => {
        const group = members.filter((m) => m.role === role);
        if (group.length > 0) acc[role] = group;
        return acc;
    }, {});

    return (
        <main className="mx-auto max-w-7xl px-6 py-12 min-h-screen">
            <h1 className="font-serif text-4xl font-bold  text-red-primary mb-2">People</h1>
            <p className="text-ink-soft mb-12">The researchers and scholars of Microgrid Lab who make everything possible.</p>

            {Object.entries(grouped).map(([role, members]) => (
                <section key={role} className="mb-14">
                    <h2 className="font-serif text-2xl font-bold text-ink border-b border-ink/10 pb-2 mb-6">
                        {role}s
                    </h2>
                    <div className={`grid gap-6 ${role === "Professor"
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                        }`}>
                        {members.map((member) => (
                            <MemberCard key={member.email || member.name} member={member} />
                        ))}
                    </div>
                </section>
            ))}
        </main>
    );
}