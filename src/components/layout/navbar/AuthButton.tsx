import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server"; 

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated state
  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md border border-white/80 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white hover:text-red-primary"
      >
        Login (Members)
      </Link>
    );
  }

  // 2. Fetch profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role") // Adjust 'role' to match your column name (e.g., 'is_admin')
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const targetHref = isAdmin ? "/admin" : "/dashboard";
  const buttonText = isAdmin ? "Admin Dashboard" : "Dashboard";

  // 3. Authenticated state
  return (
    <Link
      href={targetHref}
      className="rounded-md bg-white px-4 py-2 text-sm font-bold text-red-primary transition-colors hover:bg-gray-100 shadow-sm"
    >
      {buttonText}
    </Link>
  );
}