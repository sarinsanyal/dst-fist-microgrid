import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: rollups } = await supabase
    .from("task_rollups")
    .select("*")
    .order("full_name");

  // Fetch avatar_url and join group name via group_id
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, avatar_url, groups:group_id(name)");

  type ProfileQueryResult = {
    id: string;
    avatar_url: string | null;
    groups: { name: string } | null;
  };

  const profileMap = new Map(
    ((profiles as unknown as ProfileQueryResult[]) || []).map((p) => [
      p.id,
      {
        avatar_url: p.avatar_url,
        group_name: p.groups?.name ?? null,
      },
    ])
  );

  const enrichedRollups = (rollups ?? []).map((r) => {
    const profileInfo = profileMap.get(r.user_id);
    return {
      ...r,
      avatar_url: r.avatar_url || profileInfo?.avatar_url || null,
      group_name: profileInfo?.group_name || null,
    };
  });

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, profiles:assigned_to(full_name, avatar_url)")
    .order("due_date", { ascending: true, nullsFirst: false });

  return (
    <AdminDashboardClient
      initialTasks={tasks ?? []}
      rollups={enrichedRollups}
    />
  );
}