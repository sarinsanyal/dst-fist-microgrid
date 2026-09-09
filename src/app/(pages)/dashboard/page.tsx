import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import TaskBoard from "@/components/dashboard/TaskBoard";
import SignOutButton from "@/components/dashboard/SignOutButton";
import AvatarUpload from "@/components/dashboard/AvatarUpload";
import ReportGenerator from "@/components/dashboard/ReportGenerator";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url, specialties, groups:group_id(name)")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // 2. Fix for #4: Filter tasks based on Role
  let tasksQuery = supabase
    .from("tasks")
    .select("*, profiles:assigned_to(full_name)")
    .order("due_date", { ascending: true, nullsFirst: false });

  if (!isAdmin) {
    // Non-admins only see tasks assigned to them
    tasksQuery = tasksQuery.eq("assigned_to", user.id);
  }

  const { data: tasks } = await tasksQuery;

  function extractGroupName(groups: unknown): string | undefined {
    if (!groups) return undefined;
    if (Array.isArray(groups)) {
      const first = groups[0] as { name?: string } | undefined;
      return first?.name;
    }
    return (groups as { name?: string }).name;
  }

  const groupName = extractGroupName(profile?.groups);
  const specialties = profile?.specialties ?? [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 pb-6 border-b border-ink/10">
        <div className="flex items-start gap-4">
          <AvatarUpload
            userId={user.id}
            initialAvatarUrl={profile?.avatar_url ?? null}
            fullName={profile?.full_name ?? null}
          />

          <div className="space-y-2">
            <div>
              <h1 className="font-serif text-3xl font-bold text-red-primary">
                {profile?.full_name ?? "User"}
              </h1>
              <p className="text-xs text-ink-soft">
                Role: <span className="font-semibold text-ink capitalize">{profile?.role ?? "Member"}</span>
              </p>
            </div>

            {/* Separated Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Group Badge */}
              {groupName && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium rounded-md px-2.5 py-1">
                  <span className="text-[10px] uppercase font-bold text-blue-500">Group:</span>
                  <span>{groupName}</span>
                </div>
              )}

              {/* Specialties Badges */}
              {specialties.map((s: string) => (
                <div
                  key={s}
                  className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium rounded-md px-2.5 py-1"
                >
                  <span className="text-[10px] uppercase font-bold text-emerald-500">Skill:</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Feature #3: Automated PDF Generator */}
          <ReportGenerator tasks={tasks ?? []} profile={profile} />
          <SignOutButton />
        </div>
      </div>

      {/* Task Board */}
      <TaskBoard initialTasks={tasks ?? []} userId={user.id} isAdmin={isAdmin} />
    </main>
  );
}