// src/app/not-found.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirects to home after 3 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-24 flex flex-col min-h-screen items-center justify-center text-center">
      <span className="text-xs font-bold text-red-primary uppercase tracking-wide mb-2">
        404 Error
      </span>

      <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">
        Page Not Found
      </h1>

      <p className="text-ink-soft mb-8">
        The page you are looking for does not exist. Redirecting to Home in 3 seconds...
      </p>

      <Link
        href="/"
        className="text-sm font-bold text-red-primary hover:text-red-dark transition-colors"
      >
        Click here if you are not redirected automatically →
      </Link>
    </main>
  );
}