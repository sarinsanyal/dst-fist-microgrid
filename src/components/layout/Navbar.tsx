import Link from "next/link";
import Image from "next/image";
import { navLinks } from "@/lib/nav-links";
import MobileMenu from "./MobileMenu";
import { createClient } from "../../../lib/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let targetHref = "/login";
  let buttonText = "Login (Members)";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";
    targetHref = isAdmin ? "/admin" : "/dashboard";
    buttonText = isAdmin ? "Admin Dashboard" : "Dashboard";
  }

  return (
    <header className="sticky font-serif top-0 z-50 bg-red-primary shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 font-serif text-xl font-bold text-white tracking-tight">
          <Image
            src="/logo.png"
            alt="DST FIST Logo"
            width={45}
            height={45}
            priority
          />
          <span>DST FIST - Microgrid Lab</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-white/95 relative
                         after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0
                         after:bg-white after:transition-all after:duration-200
                         hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href={targetHref}
            className="rounded-md bg-white px-4 py-2 text-sm font-bold text-red-primary transition-colors hover:bg-gray-100 shadow-sm"
          >
            {buttonText}
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <MobileMenu targetHref={targetHref} buttonText={buttonText} />
      </div>
    </header>
  );
}