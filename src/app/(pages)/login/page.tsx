"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";

type Mode = "login" | "signup";
type Group = { id: string; name: string };

const PENDING_KEY_PREFIX = "pending_profile_";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsResend, setNeedsResend] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Specialties tag input
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState("");

  // Group search/select
  const [groupsList, setGroupsList] = useState<Group[]>([]);
  const [groupQuery, setGroupQuery] = useState("");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("groups")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setGroupsList(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If there's a pending signup (avatar/specialties/group saved before email confirmation),
  // finish it off the next time this user successfully logs in.
  useEffect(() => {
    async function completePendingProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const key = PENDING_KEY_PREFIX + user.email;
      const raw = localStorage.getItem(key);
      if (!raw) return;

      try {
        const pending = JSON.parse(raw) as {
          fullName: string;
          specialties: string[];
          avatarDataUrl: string | null;
          groupName: string;
        };

        let avatarUrl: string | null = null;
        if (pending.avatarDataUrl) {
          const blob = await (await fetch(pending.avatarDataUrl)).blob();
          const ext = blob.type.split("/")[1] || "jpg";
          const path = `${user.id}/${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(path, blob, { upsert: true, contentType: blob.type });
          if (!uploadError) {
            const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
            avatarUrl = pub.publicUrl;
          }
        }

        const groupId = await findOrCreateGroupId(pending.groupName);

        await supabase
          .from("profiles")
          .update({
            full_name: pending.fullName || null,
            avatar_url: avatarUrl,
            specialties: pending.specialties,
            group_id: groupId,
          })
          .eq("id", user.id);

        localStorage.removeItem(key);
      } catch {
        // Non-fatal — leave the pending entry so we retry on next login.
      }
    }

    completePendingProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // Likely a race with someone else creating the same group — check again.
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
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
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

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
    setNeedsResend(false);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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

      const avatarDataUrl = avatarFile ? await fileToDataUrl(avatarFile) : null;

      if (data.session && data.user) {
        // Email confirmation is off — we're authenticated right away, do it all now.
        let avatarUrl: string | null = null;
        if (avatarFile) {
          const ext = avatarFile.name.split(".").pop() || "jpg";
          const path = `${data.user.id}/${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
          if (!uploadError) {
            const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
            avatarUrl = pub.publicUrl;
          }
        }

        const groupId = await findOrCreateGroupId(groupQuery);

        await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            avatar_url: avatarUrl,
            specialties: finalSpecialties,
            group_id: groupId,
          })
          .eq("id", data.user.id);
      } else {
        // Email confirmation required — stash for completion after first login.
        localStorage.setItem(
          PENDING_KEY_PREFIX + email,
          JSON.stringify({
            fullName,
            specialties: finalSpecialties,
            avatarDataUrl,
            groupName: groupQuery,
          })
        );
      }

      setCheckEmail(true);
    }

    setLoading(false);
  }

  async function handleResend() {
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
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
          <>
            {/* Avatar upload */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-full border border-ink/10 bg-ink/5 overflow-hidden flex items-center justify-center cursor-pointer shrink-0"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-ink-soft">Photo</span>
                )}
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-red-primary font-medium cursor-pointer hover:underline"
                >
                  {avatarPreview ? "Change photo" : "Upload photo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
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

            {/* Group search/select */}
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

            {/* Specialties tag input */}
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
                  className="flex-1 min-w-[100px] text-sm text-ink focus:outline-none py-0.5"
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
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-ink-soft hover:text-ink cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
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
          className="w-full bg-red-primary text-white font-semibold text-sm rounded-lg py-2.5 cursor-pointer disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </button>
      </form>

      {checkEmail && (
        <p className="text-sm text-ink-soft mt-6 text-center">
          Check <span className="font-semibold text-ink">{email}</span> for a
          confirmation link before signing in.
        </p>
      )}

      <button
        onClick={() => {
          setError(null);
          setNeedsResend(false);
          setCheckEmail(false);
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