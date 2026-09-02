"use client";

import { useState } from "react";
import Link from "next/link";
import { navLinks } from "@/lib/nav-links";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col justify-center items-center gap-1.5 w-8 h-8"
        aria-label="Toggle menu"
      >
        <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-20 left-0 right-0 bg-red-primary border-t border-white/10 shadow-lg z-50">
          <nav className="flex flex-col mx-auto max-w-7xl px-6 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-bold text-white/95 py-3 border-b border-white/10 last:border-0 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}