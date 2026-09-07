import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server"; // Server import
import TaskBoard from "@/components/dashboard/TaskBoard";
import SignOutButton from "@/components/dashboard/SignOutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, profiles:assigned_to(full_name)")
    .order("due_date", { ascending: true, nullsFirst: false });

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

      <TaskBoard initialTasks={tasks ?? []} userId={user.id} />
    </main>
  );
}