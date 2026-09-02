import Link from "next/link";
import { navLinks } from "@/lib/nav-links";
import MobileMenu from "./MobileMenu";
import Image from 'next/image';

export default function Navbar() {
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
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}