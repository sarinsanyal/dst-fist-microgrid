"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

interface AvatarUploadProps {
  userId: string;
  initialAvatarUrl: string | null;
  fullName: string | null;
}

export default function AvatarUpload({
  userId,
  initialAvatarUrl,
  fullName,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${userId}/${Date.now()}.${ext}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 3. Update profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Error updating avatar");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative group shrink-0">
      <label className="cursor-pointer block">
        <div className="w-16 h-16 rounded-full border border-ink/10 bg-ink/5 overflow-hidden flex items-center justify-center relative">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={fullName ?? "Profile photo"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-ink-soft font-semibold">
              {fullName?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 text-white text-[10px] font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? "Uploading..." : "Edit"}
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}