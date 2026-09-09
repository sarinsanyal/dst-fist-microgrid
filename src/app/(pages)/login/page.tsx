"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";

type Mode = "login" | "signup";
type Group = { id: string; name: string };

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Specialties tag input
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState("");

  // Group search/select
  const [groupsList, setGroupsList] = useState<Group[]>([]);
  const [groupQuery, setGroupQuery] = useState("");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  const router = useRouter();

  // Memoize client so it isn't recreated on every keystroke
  const supabase = useMemo(() => createClient(), []);

  // Only fetch groups when switching to signup mode
  useEffect(() => {
    if (mode === "signup" && groupsList.length === 0) {
      supabase
        .from("groups")
        .select("id, name")
        .order("name")
        .then(({ data }) => {
          if (data) setGroupsList(data);
        });
    }
  }, [mode, groupsList.length, supabase]);

  async function findOrCreateGroupId(rawName: string): Promise<string | null> {
    const name = rawName.trim();
    if (!name) return null;

    const { data: existing } = await supabase
      .from("groups")
      .select("id")
      .ilike("name", name)
      .maybeSingle();
    if (existing) return existing.id;

    const { data: created, error } = await supabase
      .from("groups")
      .insert({ name })
      .select("id")
      .single();

    if (error) {
      const { data: retry } = await supabase
        .from("groups")
        .select("id")
        .ilike("name", name)
        .maybeSingle();
      return retry?.id ?? null;
    }

    return created.id;
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  function addSpecialty(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setSpecialties((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setSpecialtyInput("");
  }

  function handleSpecialtyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSpecialty(specialtyInput);
    } else if (e.key === "Backspace" && specialtyInput === "" && specialties.length > 0) {
      setSpecialties((prev) => prev.slice(0, -1));
    }
  }

  function removeSpecialty(value: string) {
    setSpecialties((prev) => prev.filter((s) => s !== value));
  }

  const filteredGroups = groupsList.filter((g) =>
    g.name.toLowerCase().includes(groupQuery.toLowerCase())
  );
  const exactMatch = groupsList.some(
    (g) => g.name.toLowerCase() === groupQuery.trim().toLowerCase()
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      // 1. Sign in the user
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // 2. Fetch user's role from profiles
      if (authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        // 3. Redirect based on role
        const targetPath = profile?.role === "admin" ? "/admin" : "/dashboard";
        window.location.href = targetPath;
        return;
      }
    } else {
      // Signup Mode
      const finalSpecialties = specialtyInput.trim()
        ? [...specialties, specialtyInput.trim()]
        : specialties;

      const { data, error } = await supabase.auth.signUp({
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

      if (data.user) {
        let avatarUrl: string | null = null;

        if (avatarFile) {
          const ext = avatarFile.name.split(".").pop() || "jpg";
          const filePath = `${data.user.id}/${Date.now()}.${ext}`;

          const { error: uploadErr } = await supabase.storage
            .from("avatars")
            .upload(filePath, avatarFile, { upsert: true, contentType: avatarFile.type });

          if (!uploadErr) {
            const { data: pubData } = supabase.storage
              .from("avatars")
              .getPublicUrl(filePath);
            avatarUrl = pubData.publicUrl;
          }
        }

        const groupId = await findOrCreateGroupId(groupQuery);

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            full_name: fullName,
            specialties: finalSpecialties,
            group_id: groupId,
            ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
          });

        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }

        // New signups default to /dashboard
        window.location.href = "/dashboard";
        return;
      }
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
          <>
            <div className="flex flex-col items-center justify-center mb-2">
              <label className="cursor-pointer group flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full border border-ink/10 bg-ink/5 overflow-hidden flex items-center justify-center relative">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-ink-soft font-light">
                      {fullName ? fullName[0].toUpperCase() : "+"}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/30 text-white text-[10px] font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Upload
                  </div>
                </div>
                <span className="text-xs text-ink-soft font-medium">
                  {avatarPreview ? "Change Photo" : "Add Profile Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

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

            <div className="relative">
              <label className="text-xs font-semibold text-ink block mb-1.5">
                Group
              </label>
              <input
                type="text"
                value={groupQuery}
                onChange={(e) => {
                  setGroupQuery(e.target.value);
                  setShowGroupDropdown(true);
                }}
                onFocus={() => setShowGroupDropdown(true)}
                onBlur={() => setTimeout(() => setShowGroupDropdown(false), 150)}
                className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40"
                placeholder="Search or create a group"
              />
              {showGroupDropdown && groupQuery.trim() && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-ink/10 rounded-lg shadow-md max-h-48 overflow-y-auto">
                  {filteredGroups.map((g) => (
                    <button
                      type="button"
                      key={g.id}
                      onMouseDown={() => {
                        setGroupQuery(g.name);
                        setShowGroupDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-ink/5 cursor-pointer"
                    >
                      {g.name}
                    </button>
                  ))}
                  {!exactMatch && (
                    <button
                      type="button"
                      onMouseDown={() => setShowGroupDropdown(false)}
                      className="w-full text-left px-3 py-2 text-sm text-red-primary font-medium hover:bg-ink/5 cursor-pointer"
                    >
                      + Create &quot;{groupQuery.trim()}&quot;
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1.5">
                Specialties
              </label>
              <div className="w-full border border-ink/10 rounded-lg px-2 py-2 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-red-primary/40">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 bg-red-primary/10 text-red-primary text-xs font-medium rounded-full px-2.5 py-1"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(s)}
                      className="cursor-pointer text-red-primary/70 hover:text-red-primary"
                      aria-label={`Remove ${s}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyDown={handleSpecialtyKeyDown}
                  onBlur={() => addSpecialty(specialtyInput)}
                  placeholder={specialties.length === 0 ? "e.g. solar, battery storage" : ""}
                  className="flex-1 min-w-25 text-sm text-ink focus:outline-none py-0.5"
                />
              </div>
              <p className="text-xs text-ink-soft mt-1">
                Press Enter or comma to add each one.
              </p>
            </div>
          </>
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-ink/10 rounded-lg px-3 py-2 pr-16 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-ink-soft hover:text-ink cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-primary font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-primary text-white font-semibold text-sm rounded-lg py-2.5 cursor-pointer disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <button
        onClick={() => {
          setError(null);
          setMode(mode === "login" ? "signup" : "login");
        }}
        className="text-sm text-ink-soft mt-4 text-center hover:text-ink cursor-pointer"
      >
        {mode === "login"
          ? "New here? Create an account"
          : "Already have an account? Sign in"}
      </button>
    </main>
  );
}