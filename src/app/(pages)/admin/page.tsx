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

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, profiles:assigned_to(full_name)")
    .order("due_date", { ascending: true, nullsFirst: false });

  return (
    <AdminDashboardClient
      initialTasks={tasks ?? []}
      rollups={rollups ?? []}
    />
  );
}