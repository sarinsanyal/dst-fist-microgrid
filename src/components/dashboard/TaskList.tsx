
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url, specialties, group_name")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  let tasksQuery = supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });

  if (!isAdmin) {
    tasksQuery = tasksQuery.eq("assigned_to", user.id);
  }

  const { data: tasks } = await tasksQuery;

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: projectMembers } = await supabase
    .from("project_members")
    .select("project_id, profile_id");

  const { data: memberOptions } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("status", "approved")
    .order("full_name", { ascending: true });

  const initialProjects = (projects ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    image_url: project.image_url,
    funding_agency: project.funding_agency,
    grant_amount: project.grant_amount,
    link: project.link,
    created_by: project.created_by,
    created_at: project.created_at,
    member_ids: (projectMembers ?? [])
      .filter((member) => member.project_id === project.id)
      .map((member) => member.profile_id),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 min-h-screen">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">
            My tasks
          </h1>

          <p className="text-ink-soft">
            {profile?.full_name
              ? `Welcome back, ${profile.full_name}.`
              : "Welcome back."}
          </p>
        </div>

        <SignOutButton />
      </div>

      <TaskDashboardContainer
        initialTasks={tasks ?? []}
        initialProjects={initialProjects}
        memberOptions={memberOptions ?? []}
        profile={profile as any}
        userId={user.id}
        isAdmin={isAdmin}
      />
    </main>
  );
}
