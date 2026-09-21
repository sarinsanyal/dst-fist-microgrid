"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "../../../lib/supabase/client";

export type MemberOption = {
    id: string;
    full_name: string;
    role: string | null;
};

export type DashboardProject = {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    image_url: string | null;
    funding_agency: string | null;
    grant_amount: string | null;
    link: string | null;
    created_by: string | null;
    created_at: string | null;
    member_ids: string[];
};

type FormState = {
    title: string;
    description: string;
    status: string;
    funding_agency: string;
    grant_amount: string;
    link: string;
    image_url: string | null;
    memberIds: string[];
};

type UserProjectsTabProps = {
    initialProjects: DashboardProject[];
    memberOptions: MemberOption[];
    userId: string;
    isAdmin: boolean;
};

const STATUS_OPTIONS = [
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On hold" },
];

const STATUS_STYLES: Record<string, string> = {
    ongoing: "bg-emerald-100 text-emerald-800",
    completed: "bg-ink/5 text-ink-soft",
    on_hold: "bg-amber-100 text-amber-800",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const inputClass =
    "w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-red-primary/40 bg-white";

function emptyForm(defaultMemberIds: string[]): FormState {
    return {
        title: "",
        description: "",
        status: "ongoing",
        funding_agency: "",
        grant_amount: "",
        link: "",
        image_url: null,
        memberIds: defaultMemberIds,
    };
}

export default function UserProjectsTab({
    initialProjects,
    memberOptions,
    userId,
    isAdmin,
}: UserProjectsTabProps) {
    const supabase = createClient();

    const [projects, setProjects] = useState<DashboardProject[]>(initialProjects);
    const [filter, setFilter] = useState<"all" | "mine">("all");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(() => emptyForm([]));
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- member search state ---
    const [memberQuery, setMemberQuery] = useState("");
    const [memberResults, setMemberResults] = useState<MemberOption[]>([]);
    const [searchingMembers, setSearchingMembers] = useState(false);
    const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
    // cache of every profile we've ever seen (initial options + search results)
    // so we can render names for selected chips regardless of source
    const [memberCache, setMemberCache] = useState<Map<string, MemberOption>>(
        () => new Map(memberOptions.map((m) => [m.id, m]))
    );
    const memberBoxRef = useRef<HTMLDivElement | null>(null);

    const memberNameById = new Map(memberOptions.map((m) => [m.id, m.full_name]));
    const canManage = (p: DashboardProject) => isAdmin || p.created_by === userId;
    const visibleProjects =
        filter === "mine" ? projects.filter((p) => p.created_by === userId) : projects;
    const previewSrc = imagePreview ?? form.image_url;

    function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function resetImage() {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(null);
        setImagePreview(null);
    }

    function resetMemberSearch() {
        setMemberQuery("");
        setMemberResults([]);
        setMemberDropdownOpen(false);
    }

    function openAdd() {
        const defaults = memberOptions.some((m) => m.id === userId) ? [userId] : [];
        setEditingId(null);
        setForm(emptyForm(defaults));
        resetImage();
        resetMemberSearch();
        setError(null);
        setShowForm(true);
    }

    function openEdit(p: DashboardProject) {
        setEditingId(p.id);
        setForm({
            title: p.title,
            description: p.description ?? "",
            status: p.status ?? "ongoing",
            funding_agency: p.funding_agency ?? "",
            grant_amount: p.grant_amount ?? "",
            link: p.link ?? "",
            image_url: p.image_url,
            memberIds: p.member_ids,
        });
        resetImage();
        resetMemberSearch();
        setError(null);
        setShowForm(true);
    }

    function closeForm() {
        setShowForm(false);
        setEditingId(null);
        resetImage();
        resetMemberSearch();
        setError(null);
    }

    function addMember(m: MemberOption) {
        setMemberCache((prev) => {
            if (prev.has(m.id)) return prev;
            const next = new Map(prev);
            next.set(m.id, m);
            return next;
        });
        setForm((prev) =>
            prev.memberIds.includes(m.id)
                ? prev
                : { ...prev, memberIds: [...prev.memberIds, m.id] }
        );
        resetMemberSearch();
    }

    function removeMember(id: string) {
        setForm((prev) => ({
            ...prev,
            memberIds: prev.memberIds.filter((m) => m !== id),
        }));
    }

    // debounced live search against profiles table
    useEffect(() => {
        const query = memberQuery.trim();
        if (!query) {
            setMemberResults([]);
            setSearchingMembers(false);
            return;
        }

        setSearchingMembers(true);
        const timeout = setTimeout(async () => {
            const { data, error: searchErr } = await supabase
                .from("profiles")
                .select("id, full_name, role")
                .ilike("full_name", `%${query}%`)
                .eq("status", "approved")
                .limit(8);

            if (!searchErr && data) {
                setMemberResults(data);
                setMemberCache((prev) => {
                    const next = new Map(prev);
                    data.forEach((d) => next.set(d.id, d));
                    return next;
                });
            }
            setSearchingMembers(false);
        }, 300);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberQuery]);

    // close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (memberBoxRef.current && !memberBoxRef.current.contains(e.target as Node)) {
                setMemberDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMAGE_SIZE) {
            alert("Image is too large. Please upload a file smaller than 5 MB.");
            e.target.value = "";
            return;
        }
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            alert("Invalid format. Please upload a JPG, PNG or WebP image.");
            e.target.value = "";
            return;
        }

        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        e.target.value = "";
    }

    function handleRemoveImage() {
        resetImage();
        setField("image_url", null);
    }

    async function uploadImage(file: File): Promise<string> {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${userId}/${Date.now()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
            .from("project-images")
            .upload(path, file, { contentType: file.type });

        if (uploadErr) throw uploadErr;

        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        return data.publicUrl;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (saving) return;

        const title = form.title.trim();
        if (!title) return;

        setSaving(true);
        setError(null);

        try {
            let imageUrl = form.image_url;
            if (imageFile) imageUrl = await uploadImage(imageFile);

            const payload = {
                title,
                description: form.description.trim() || null,
                status: form.status,
                funding_agency: form.funding_agency.trim() || null,
                grant_amount: form.grant_amount.trim() || null,
                link: form.link.trim() || null,
                image_url: imageUrl,
            };

            if (editingId) {
                // ---- EDIT ----
                const { data: updated, error: updateErr } = await supabase
                    .from("projects")
                    .update(payload)
                    .eq("id", editingId)
                    .select("id")
                    .maybeSingle();

                if (updateErr) throw updateErr;
                if (!updated) {
                    throw new Error(
                        "Update was blocked. You may not have permission to edit this project."
                    );
                }

                const previous = projects.find((p) => p.id === editingId)?.member_ids ?? [];
                const toAdd = form.memberIds.filter((id) => !previous.includes(id));
                const toRemove = previous.filter((id) => !form.memberIds.includes(id));

                if (toRemove.length > 0) {
                    const { error: removeErr } = await supabase
                        .from("project_members")
                        .delete()
                        .eq("project_id", editingId)
                        .in("profile_id", toRemove);
                    if (removeErr) throw removeErr;
                }

                if (toAdd.length > 0) {
                    const { error: addErr } = await supabase
                        .from("project_members")
                        .insert(toAdd.map((pid) => ({ project_id: editingId, profile_id: pid })));
                    if (addErr) throw addErr;
                }

                setProjects((prev) =>
                    prev.map((p) =>
                        p.id === editingId ? { ...p, ...payload, member_ids: form.memberIds } : p
                    )
                );
                closeForm();
            } else {
                // ---- ADD ----
                const { data: created, error: insertErr } = await supabase
                    .from("projects")
                    .insert({ ...payload, created_by: userId })
                    .select("id, created_at")
                    .single();

                if (insertErr) throw insertErr;

                let savedMemberIds = form.memberIds;
                let memberError: string | null = null;

                if (form.memberIds.length > 0) {
                    const { error: membersErr } = await supabase
                        .from("project_members")
                        .insert(
                            form.memberIds.map((pid) => ({ project_id: created.id, profile_id: pid }))
                        );
                    if (membersErr) {
                        savedMemberIds = [];
                        memberError = membersErr.message;
                    }
                }

                setProjects((prev) => [
                    {
                        id: created.id,
                        ...payload,
                        created_by: userId,
                        created_at: created.created_at,
                        member_ids: savedMemberIds,
                    },
                    ...prev,
                ]);
                closeForm();

                if (memberError) {
                    setError(
                        `Project saved, but adding members failed: ${memberError}. Edit the project to retry.`
                    );
                }
            }
        } catch (err: unknown) {
            const message = (err as { message?: string }).message;
            setError(message || "Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(project: DashboardProject) {
        if (!window.confirm(`Delete "${project.title}"? This can't be undone.`)) return;

        setDeletingId(project.id);
        setError(null);

        try {
            const { data, error: deleteErr } = await supabase
                .from("projects")
                .delete()
                .eq("id", project.id)
                .select("id");

            if (deleteErr) throw deleteErr;
            if (!data || data.length === 0) {
                throw new Error("Delete was blocked. You can only delete your own projects.");
            }

            setProjects((prev) => prev.filter((p) => p.id !== project.id));
            if (editingId === project.id) closeForm();
        } catch (err: unknown) {
            const message = (err as { message?: string }).message;
            setError(message || "Failed to delete project.");
        } finally {
            setDeletingId(null);
        }
    }

    // profiles to show in the dropdown: search results if there's a query,
    // otherwise a fallback list from the initial approved-members prop,
    // always excluding anyone already selected
    const dropdownOptions = (memberQuery.trim() ? memberResults : memberOptions).filter(
        (m) => !form.memberIds.includes(m.id)
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer ${filter === "all"
                                ? "bg-red-primary text-white"
                                : "text-ink-soft bg-white border border-ink/10"
                            }`}
                    >
                        All projects
                    </button>
                    <button
                        onClick={() => setFilter("mine")}
                        className={`text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer ${filter === "mine"
                                ? "bg-red-primary text-white"
                                : "text-ink-soft bg-white border border-ink/10"
                            }`}
                    >
                        My projects
                    </button>
                </div>

                {!showForm && (
                    <button
                        onClick={openAdd}
                        className="bg-red-primary text-white font-semibold text-sm rounded-lg px-4 py-2 cursor-pointer"
                    >
                        + Add project
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-3">
                    {error}
                </div>
            )}

            {/* Add / Edit form */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-ink/10 rounded-xl p-5 shadow-sm space-y-3"
                >
                    <h3 className="text-sm font-semibold text-ink">
                        {editingId ? "Edit project" : "Add a project"}
                    </h3>

                    <input
                        type="text"
                        required
                        placeholder="Project title..."
                        value={form.title}
                        onChange={(e) => setField("title", e.target.value)}
                        className={inputClass}
                    />

                    <textarea
                        placeholder="Description (optional)..."
                        rows={3}
                        value={form.description}
                        onChange={(e) => setField("description", e.target.value)}
                        className={`${inputClass} resize-none`}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                            value={form.status}
                            onChange={(e) => setField("status", e.target.value)}
                            className={inputClass}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Funding agency (optional)"
                            value={form.funding_agency}
                            onChange={(e) => setField("funding_agency", e.target.value)}
                            className={inputClass}
                        />

                        <input
                            type="text"
                            placeholder="Grant amount (optional)"
                            value={form.grant_amount}
                            onChange={(e) => setField("grant_amount", e.target.value)}
                            className={inputClass}
                        />

                        <input
                            type="url"
                            placeholder="Project link (optional)"
                            value={form.link}
                            onChange={(e) => setField("link", e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-ink">
                            Project image (optional)
                        </label>

                        {previewSrc ? (
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewSrc}
                                    alt="Project preview"
                                    className="h-16 w-24 rounded-lg object-cover border border-ink/10"
                                />
                                <label className="text-[11px] font-medium text-ink-soft hover:text-ink underline cursor-pointer">
                                    Replace
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="text-[11px] font-medium text-ink-soft hover:text-red-primary underline cursor-pointer"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <label className="flex items-center justify-center gap-2 border border-dashed border-ink/20 hover:border-red-primary/50 bg-ink/5 hover:bg-red-primary/5 rounded-lg p-3 cursor-pointer transition-colors text-xs text-ink-soft font-medium">
                                🖼️ Upload image (JPG / PNG / WebP, max 5 MB)
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Members — live search */}
                    <div className="space-y-2" ref={memberBoxRef}>
                        <label className="block text-xs font-semibold text-ink">Team members</label>

                        {/* selected chips */}
                        {form.memberIds.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {form.memberIds.map((id) => {
                                    const name = memberCache.get(id)?.full_name ?? "Unknown user";
                                    return (
                                        <span
                                            key={id}
                                            className="flex items-center gap-1.5 text-xs font-medium pl-3 pr-2 py-1.5 rounded-full bg-red-primary text-white"
                                        >
                                            {name}
                                            <button
                                                type="button"
                                                onClick={() => removeMember(id)}
                                                className="cursor-pointer hover:opacity-70 leading-none"
                                                aria-label={`Remove ${name}`}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        {/* search box */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search members by name..."
                                value={memberQuery}
                                onChange={(e) => {
                                    setMemberQuery(e.target.value);
                                    setMemberDropdownOpen(true);
                                }}
                                onFocus={() => setMemberDropdownOpen(true)}
                                className={inputClass}
                            />

                            {memberDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-ink/10 rounded-lg shadow-lg">
                                    {searchingMembers && (
                                        <p className="px-3 py-2 text-xs text-ink-soft">Searching…</p>
                                    )}

                                    {!searchingMembers && dropdownOptions.length === 0 && (
                                        <p className="px-3 py-2 text-xs text-ink-soft">
                                            {memberQuery.trim()
                                                ? "No matching members found."
                                                : "Type a name to search, or pick from suggestions below."}
                                        </p>
                                    )}

                                    {!searchingMembers &&
                                        dropdownOptions.map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => addMember(m)}
                                                className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-red-primary/5 cursor-pointer flex items-center justify-between"
                                            >
                                                <span>{m.full_name}</span>
                                                {m.role && (
                                                    <span className="text-[10px] text-ink-soft uppercase">
                                                        {m.role}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={saving || !form.title.trim()}
                            className="flex-1 bg-red-primary text-white font-semibold text-sm rounded-lg py-2.5 transition-opacity disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? "Saving..." : editingId ? "Save changes" : "Add project"}
                        </button>
                        <button
                            type="button"
                            onClick={closeForm}
                            disabled={saving}
                            className="px-5 text-sm font-semibold text-ink-soft bg-white border border-ink/10 rounded-lg cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Project list */}
            <div className="space-y-3">
                {visibleProjects.length === 0 && (
                    <p className="text-sm text-ink-soft">
                        {filter === "mine"
                            ? "You haven't added any projects yet."
                            : "No projects yet."}
                    </p>
                )}

                {visibleProjects.map((p) => {
                    const names = p.member_ids
                        .map((id) => memberNameById.get(id) ?? memberCache.get(id)?.full_name)
                        .filter(Boolean) as string[];
                    const status = p.status ?? "ongoing";
                    const isDeleting = deletingId === p.id;

                    return (
                        <div
                            key={p.id}
                            className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex items-start justify-between gap-4"
                        >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                {p.image_url && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={p.image_url}
                                        alt={p.title}
                                        className="h-16 w-24 shrink-0 rounded-lg object-cover border border-ink/10"
                                    />
                                )}

                                <div className="space-y-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold text-ink">{p.title}</p>
                                        <span
                                            className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${STATUS_STYLES[status] ?? "bg-ink/5 text-ink-soft"
                                                }`}
                                        >
                                            {status.replace("_", " ")}
                                        </span>
                                        {p.created_by === userId && (
                                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                                                Yours
                                            </span>
                                        )}
                                    </div>

                                    {p.description && (
                                        <p className="text-xs text-ink-soft whitespace-pre-wrap">
                                            {p.description}
                                        </p>
                                    )}

                                    {(p.funding_agency || p.grant_amount) && (
                                        <p className="text-xs text-ink-soft">
                                            {p.funding_agency && (
                                                <>
                                                    <span className="font-semibold text-ink">Funding:</span>{" "}
                                                    {p.funding_agency}
                                                </>
                                            )}
                                            {p.funding_agency && p.grant_amount && " · "}
                                            {p.grant_amount && (
                                                <>
                                                    <span className="font-semibold text-ink">Grant:</span>{" "}
                                                    {p.grant_amount}
                                                </>
                                            )}
                                        </p>
                                    )}

                                    {names.length > 0 && (
                                        <p className="text-[11px] text-ink-soft pt-1">
                                            Team: {names.join(", ")}
                                        </p>
                                    )}

                                    {p.link && (
                                        <a
                                            href={p.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-xs font-medium text-red-primary hover:underline pt-1"
                                        >
                                            Project link →
                                        </a>
                                    )}
                                </div>
                            </div>

                            {canManage(p) && (
                                <div className="flex gap-3 shrink-0">
                                    <button
                                        onClick={() => openEdit(p)}
                                        disabled={isDeleting}
                                        className="text-xs text-ink-soft hover:text-ink cursor-pointer disabled:opacity-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p)}
                                        disabled={isDeleting}
                                        className="text-xs text-ink-soft hover:text-red-primary cursor-pointer disabled:opacity-50"
                                    >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}