"use client";

import { useState, useMemo } from "react";
import { createClient } from "../../../lib/supabase/client";

const DESIGNATION_OPTIONS = [
    "Professor",
    "Post Doc Scholar",
    "PhD Scholar",
    "PG Research Student",
    "UG Research Student",
];

type PendingUser = {
    id: string;
    full_name: string;
    email?: string;
    specialties?: string[];
    avatar_url?: string | null;
    created_at?: string;
    designation?: string;
    groups?: { name: string }[] | null;
};

type ApprovedUser = {
    id: string;
    full_name: string;
    email?: string;
    role: string;
    avatar_url?: string | null;
    status: string;
    designation?: string;
    groups?: { name: string } | null;
};

export default function AdminUsersTab({ initialPending }: { initialPending: PendingUser[] }) {
    const supabase = useMemo(() => createClient(), []);
    const [pending, setPending] = useState<PendingUser[]>(initialPending);
    const [approved, setApproved] = useState<ApprovedUser[]>([]);
    const [loadedApproved, setLoadedApproved] = useState(false);
    const [selectedDesignations, setSelectedDesignations] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState<string | null>(null);
    const [savingDesignation, setSavingDesignation] = useState<string | null>(null);
    const [designationSaved, setDesignationSaved] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function loadApproved() {
        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, email, role, avatar_url, status, designation, groups:group_id(name)")
            .eq("status", "approved")
            .neq("role", "admin")
            .order("full_name");

        if (error) {
            setError(error.message);
            return;
        }

        setApproved((data as unknown as ApprovedUser[]) ?? []);
        setLoadedApproved(true);
    }

    async function handleApprove(userId: string) {
        const designation = selectedDesignations[userId] || "UG Research Student";

        setProcessing(userId);
        setError(null);

        const { error } = await supabase
            .from("profiles")
            .update({
                status: "approved",
                role: "user",
                designation,
            })
            .eq("id", userId);

        if (error) {
            setError(error.message);
        } else {
            setPending((prev) => prev.filter((u) => u.id !== userId));

            if (loadedApproved) {
                const user = pending.find((u) => u.id === userId);

                if (user) {
                    setApproved((prev) => [
                        ...prev,
                        {
                            id: user.id,
                            full_name: user.full_name,
                            email: user.email,
                            role: "user",
                            designation,
                            avatar_url: user.avatar_url,
                            status: "approved",
                            groups: user.groups?.[0]
                                ? { name: user.groups[0].name }
                                : null,
                        },
                    ]);
                }
            }
        }

        setProcessing(null);
    }

    async function handleReject(userId: string) {
        if (!confirm("Reject and delete this user? This cannot be undone.")) return;

        setProcessing(userId);
        setError(null);

        const res = await fetch("/api/admin/remove-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        if (res.ok) {
            setPending((prev) => prev.filter((u) => u.id !== userId));
        } else {
            setError("Failed to reject user.");
        }

        setProcessing(null);
    }

    async function handleRemoveApproved(userId: string) {
        if (!confirm("Remove this member? This deletes their account and all their tasks.")) return;

        setProcessing(userId);

        const res = await fetch("/api/admin/remove-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        if (res.ok) {
            setApproved((prev) => prev.filter((u) => u.id !== userId));
        } else {
            setError("Failed to remove user.");
        }

        setProcessing(null);
    }

    async function handleDesignationChange(userId: string, newDesignation: string) {
        const user = approved.find((u) => u.id === userId);
        if (!user) return;

        const previousDesignation = user.designation || "";

        setSavingDesignation(userId);
        setDesignationSaved(null);
        setError(null);

        const { error } = await supabase
            .from("profiles")
            .update({ designation: newDesignation })
            .eq("id", userId);

        if (error) {
            setError(error.message);

            setApproved((prev) =>
                prev.map((u) =>
                    u.id === userId
                        ? { ...u, designation: previousDesignation }
                        : u
                )
            );
        } else {
            setApproved((prev) =>
                prev.map((u) =>
                    u.id === userId
                        ? { ...u, designation: newDesignation }
                        : u
                )
            );

            setDesignationSaved(userId);

            setTimeout(() => {
                setDesignationSaved((current) =>
                    current === userId ? null : current
                );
            }, 1800);
        }

        setSavingDesignation(null);
    }

    return (
        <div className="space-y-10">
            {error && (
                <p className="text-sm text-red-primary font-medium">
                    {error}
                </p>
            )}

            <section>
                <h2 className="font-serif text-xl font-bold text-ink mb-1">
                    Pending Approval
                </h2>

                <p className="text-xs text-ink-soft mb-4">
                    {pending.length} account(s) awaiting review.
                </p>

                {pending.length === 0 ? (
                    <p className="text-sm text-ink-soft italic">
                        No pending accounts.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {pending.map((user) => (
                            <div
                                key={user.id}
                                className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.full_name}
                                            className="w-10 h-10 rounded-full object-cover border border-ink/10 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-red-primary/10 text-red-primary font-bold text-sm flex items-center justify-center shrink-0">
                                            {user.full_name?.[0]?.toUpperCase()}
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-ink">
                                            {user.full_name}
                                        </p>

                                        <p className="text-xs text-ink-soft truncate">
                                            {user.email}
                                        </p>

                                        {user.groups?.[0]?.name && (
                                            <p className="text-xs text-ink-soft">
                                                {user.groups[0].name}
                                            </p>
                                        )}

                                        {user.specialties && user.specialties.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {user.specialties.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="text-[10px] bg-red-primary/10 text-red-primary px-2 py-0.5 rounded-full font-medium"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                    <select
                                        value={
                                            selectedDesignations[user.id] ||
                                            user.designation ||
                                            "UG Research Student"
                                        }
                                        onChange={(e) =>
                                            setSelectedDesignations((prev) => ({
                                                ...prev,
                                                [user.id]: e.target.value,
                                            }))
                                        }
                                        className="border border-ink/10 rounded-lg px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 cursor-pointer"
                                    >
                                        {DESIGNATION_OPTIONS.map((designation) => (
                                            <option
                                                key={designation}
                                                value={designation}
                                            >
                                                {designation}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => handleApprove(user.id)}
                                        disabled={processing === user.id}
                                        className="text-xs bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                                    >
                                        {processing === user.id ? "..." : "Approve"}
                                    </button>

                                    <button
                                        onClick={() => handleReject(user.id)}
                                        disabled={processing === user.id}
                                        className="text-xs text-red-primary font-semibold px-3 py-1.5 rounded-lg border border-red-primary/30 hover:bg-red-primary/5 disabled:opacity-50 cursor-pointer"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-serif text-xl font-bold text-ink mb-1">
                            Approved Members
                        </h2>

                        <p className="text-xs text-ink-soft">
                            Change designations or remove members.
                        </p>
                    </div>

                    {!loadedApproved && (
                        <button
                            onClick={loadApproved}
                            className="text-xs font-semibold text-red-primary border border-red-primary/30 px-3 py-1.5 rounded-lg hover:bg-red-primary/5 cursor-pointer"
                        >
                            Load members
                        </button>
                    )}
                </div>

                {loadedApproved && (
                    approved.length === 0 ? (
                        <p className="text-sm text-ink-soft italic">
                            No approved members yet.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {approved.map((user) => {
                                const isSavingDesignation =
                                    savingDesignation === user.id;

                                const wasDesignationSaved =
                                    designationSaved === user.id;

                                return (
                                    <div
                                        key={user.id}
                                        className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.full_name}
                                                    className="w-10 h-10 rounded-full object-cover border border-ink/10 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-red-primary/10 text-red-primary font-bold text-sm flex items-center justify-center shrink-0">
                                                    {user.full_name?.[0]?.toUpperCase()}
                                                </div>
                                            )}

                                            <div>
                                                <p className="font-semibold text-sm text-ink">
                                                    {user.full_name}
                                                </p>

                                                <p className="text-xs text-ink-soft">
                                                    {user.email}
                                                </p>

                                                {user.groups?.name && (
                                                    <p className="text-xs text-ink-soft">
                                                        {user.groups.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="flex items-center gap-1.5">
                                                <select
                                                    value={
                                                        user.designation ||
                                                        "UG Research Student"
                                                    }
                                                    disabled={isSavingDesignation}
                                                    onChange={(e) =>
                                                        handleDesignationChange(
                                                            user.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border border-ink/10 rounded-lg px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    {DESIGNATION_OPTIONS.map(
                                                        (designation) => (
                                                            <option
                                                                key={designation}
                                                                value={designation}
                                                            >
                                                                {designation}
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                                {isSavingDesignation && (
                                                    <span
                                                        className="w-3.5 h-3.5 border-2 border-ink/20 border-t-red-primary rounded-full animate-spin"
                                                        aria-label="Saving designation"
                                                    />
                                                )}

                                                {wasDesignationSaved && (
                                                    <span className="text-[10px] text-emerald-600 font-semibold">
                                                        Saved
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleRemoveApproved(user.id)
                                                }
                                                disabled={
                                                    processing === user.id ||
                                                    isSavingDesignation
                                                }
                                                className="text-xs text-red-primary/80 hover:text-red-primary font-medium disabled:opacity-50 cursor-pointer"
                                            >
                                                {processing === user.id
                                                    ? "..."
                                                    : "Remove"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </section>
        </div>
    );
}