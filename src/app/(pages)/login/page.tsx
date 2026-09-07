"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsResend, setNeedsResend] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsResend(false);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setError("Please confirm your email first — check your inbox for the link.");
          setNeedsResend(true);
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setCheckEmail(true);
    }

    setLoading(false);
  }

  async function handleResend() {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setCheckEmail(true);
      setNeedsResend(false);
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16 min-h-screen flex flex-col justify-center">
      <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">
        {mode === "login" ? "Sign in" : "Create your account"}
      </h1>
      <p className="text-ink-soft mb-10">
        {mode === "login"
          ? "Track your tasks for the Microgrid Lab."
          : "Set up access to the Microgrid Lab tracker."}
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-4"
      >
        {mode === "signup" && (
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40"
              placeholder="Jane Doe"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-ink block mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink block mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-primary font-medium">{error}</p>
        )}

        {needsResend && (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-ink-soft hover:text-ink underline cursor-pointer"
          >
            Resend confirmation email
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-primary text-white font-semibold text-sm rounded-lg py-2.5 disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </button>
      </form>

      {checkEmail ? (
        <p className="text-sm text-ink-soft mt-6 text-center">
          Check <span className="font-semibold text-ink">{email}</span> for a
          confirmation link before signing in.
        </p>
      ) : (
        <button
          onClick={() => {
            setError(null);
            setNeedsResend(false);
            setMode(mode === "login" ? "signup" : "login");
          }}
          className="text-sm text-ink-soft mt-6 text-center hover:text-ink cursor-pointer"
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      )}
    </main>
  );
}