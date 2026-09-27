"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export function PhotoUploader({ userId }: { userId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Επίλεξε εικόνα (JPG, PNG, HEIC).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Η εικόνα ξεπερνά τα 10 MB.");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const photoId = crypto.randomUUID();
    const path = `${userId}/${photoId}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("progress-photos")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (upErr) {
      setUploading(false);
      setError(upErr.message);
      return;
    }

    const { error: insErr } = await supabase.from("progress_photos").insert({
      client_id: userId,
      storage_path: path,
    });
    if (insErr) {
      setUploading(false);
      setError(insErr.message);
      return;
    }

    setUploading(false);
    router.refresh();
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-accent/40 bg-accent/[0.06] px-4 py-4 text-[13px] font-bold text-accent transition-colors hover:bg-accent/[0.12] disabled:opacity-60"
      >
        {uploading ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Ανέβασμα...
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Νέα φωτογραφία προόδου
          </>
        )}
      </button>
      {error && (
        <div className="mt-2 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
          {error}
        </div>
      )}
    </>
  );
}
