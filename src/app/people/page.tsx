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
    // Parse comma-separated achievements into an array
    const achievementList = member.achievements
        ? member.achievements.split(",").map((item) => item.trim()).filter(Boolean)
        : [];

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

            {/* Bulleted Achievements List */}
            {achievementList.length > 0 && (
                <ul className="text-xs text-ink-soft mt-3 space-y-1 text-left w-full list-disc list-inside">
                    {achievementList.map((item, i) => (
                        <li key={i} className="leading-snug">
                            {item}
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex gap-3 mt-auto pt-4">
                {member.email && (
                    <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-red-primary transition-colors"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                            />
                        </svg>
                        <span>Email</span>
                    </a>
                )}
                {member.google_scholar && (
                    <a
                        href={member.google_scholar}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-red-primary transition-colors"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 14l9-5-9-5-9 5 9 5z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                            />
                        </svg>
                        <span>Scholar</span>
                    </a>
                )}

                {member.linkedin && (
                    <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-red-primary transition-colors"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                        </svg>
                        <span>LinkedIn</span>
                    </a>
                )}
            </div>
        </div>
    );
}

export default async function PeoplePage() {
    const members = await getMembers();

    // Group members strictly by role
    const grouped = ROLE_ORDER.reduce<Record<string, Member[]>>((acc, role) => {
        const group = members.filter((m) => m.role === role);
        if (group.length > 0) acc[role] = group;
        return acc;
    }, {});

    return (
        <main className="mx-auto max-w-7xl px-6 py-12 min-h-screen">
            <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">People</h1>
            <p className="text-ink-soft mb-12">
                The researchers and scholars of Microgrid Lab who make everything possible.
            </p>

            {Object.entries(grouped).map(([role, membersList]) => (
                <section key={role} className="mb-14">
                    <h2 className="font-serif text-2xl font-bold text-ink border-b border-ink/10 pb-2 mb-6">
                        {role === "Professor" ? "Faculty" : `${role}s`}
                    </h2>
                    <div
                        className={`grid gap-6 ${role === "Professor"
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                            }`}
                    >
                        {membersList.map((member) => (
                            <MemberCard key={member.email || member.name} member={member} />
                        ))}
                    </div>
                </section>
            ))}
        </main>
    );
}