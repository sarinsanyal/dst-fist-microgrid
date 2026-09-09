import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import TaskDashboardContainer from "./TaskDashboardContainer";
import SignOutButton from "./SignOutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch full profile required by TaskDashboardContainer
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url, specialties, group_name")
    .eq("id", user.id)
    .single();

  let tasksQuery = supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });

  const isAdmin = profile?.role === "admin";
  
  if (!isAdmin) {
    tasksQuery = tasksQuery.eq("assigned_to", user.id);
  }

  const { data: tasks } = await tasksQuery;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 min-h-screen">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">
            My tasks
          </h1>
          <p className="text-ink-soft">
            {profile?.full_name ? `Welcome back, ${profile.full_name}.` : "Welcome back."}
          </p>
        </div>
        <SignOutButton />
      </div>

      <TaskDashboardContainer
        initialTasks={tasks ?? []}
        profile={profile as any}
        userId={user.id}
        isAdmin={isAdmin}
      />
    </main>
  );
}