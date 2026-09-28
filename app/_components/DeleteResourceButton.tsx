"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

type ResourceType = "program" | "plan";

export function DeleteResourceButton({
  resourceType,
  resourceId,
  resourceName,
  redirectTo,
}: {
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const table = resourceType === "program" ? "programs" : "nutrition_plans";
  const label =
    resourceType === "program" ? "πρόγραμμα" : "πλάνο διατροφής";

  async function doDelete() {
    setDeleting(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.from(table).delete().eq("id", resourceId);
    if (err) {
      setError(err.message);
      setDeleting(false);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="flex items-center gap-2 rounded-[10px] border border-danger/30 bg-danger/[0.06] px-3.5 py-2.5 text-[13px] font-bold text-danger hover:bg-danger/[0.12]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
        Διαγραφή
      </button>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => !deleting && setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-[#0F0F0F] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-5 py-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-danger">
                Επιβεβαίωση διαγραφής
              </div>
              <h2 className="mt-1 text-[16px] font-extrabold">
                Διαγραφή {label};
              </h2>
            </div>
            <div className="px-5 py-4 text-[13px] text-text-2">
              Θα διαγραφεί οριστικά το <strong className="font-bold text-text-1">{resourceName}</strong>{" "}
              μαζί με όλες τις {resourceType === "program" ? "ασκήσεις" : "γεύματα και τα τρόφιμα"} του.
              <div className="mt-2 text-[12px] text-text-3">
                Οι πελάτες στους οποίους έχει ανατεθεί θα χάσουν την ανάθεση αλλά το ιστορικό τους διατηρείται.
              </div>
            </div>
            {error && (
              <div className="mx-5 mb-3 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
                {error}
              </div>
            )}
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="rounded-[10px] border border-border bg-surface-1 px-3.5 py-2 text-[13px] font-bold text-text-1"
              >
                Άκυρο
              </button>
              <button
                type="button"
                onClick={doDelete}
                disabled={deleting}
                className="rounded-[10px] bg-danger px-4 py-2 text-[13px] font-extrabold text-white disabled:opacity-50"
              >
                {deleting ? "Διαγραφή..." : "Ναι, διαγραφή"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
