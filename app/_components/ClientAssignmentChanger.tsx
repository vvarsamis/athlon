"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Option = { id: string; label: string; sub: string | null };

export function ClientAssignmentChanger({
  clientId,
  currentId,
  assignmentType,
}: {
  clientId: string;
  currentId: string | null;
  assignmentType: "program" | "nutrition";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignedCol =
    assignmentType === "program"
      ? "assigned_program_id"
      : "assigned_nutrition_plan_id";
  const table = assignmentType === "program" ? "programs" : "nutrition_plans";

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          setError("Δεν είσαι συνδεδεμένος.");
          setLoading(false);
        }
        return;
      }
      const selectFields =
        assignmentType === "program"
          ? "id, title, name"
          : "id, name, subtitle";
      const { data, error: fetchErr } = await supabase
        .from(table)
        .select(selectFields)
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (fetchErr) {
        setError(fetchErr.message);
        setLoading(false);
        return;
      }
      const opts: Option[] = ((data as unknown as Array<{
        id: string;
        title?: string | null;
        name: string;
        subtitle?: string | null;
      }>) ?? []).map((r) => ({
        id: r.id,
        label:
          assignmentType === "program"
            ? (r.title as string) || r.name
            : r.name,
        sub:
          assignmentType === "program"
            ? r.name
            : (r.subtitle as string | null) ?? null,
      }));
      setOptions(opts);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, assignmentType, table]);

  async function chooseOption(newId: string | null) {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: updErr } = await supabase
      .from("trainer_clients")
      .update({ [assignedCol]: newId })
      .eq("client_id", clientId);
    setSaving(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-transparent px-2 py-1.5 text-[11px] font-bold text-text-2 transition-colors hover:border-accent/50 hover:bg-accent/[0.04] hover:text-accent"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        {currentId ? "Άλλαξε" : "Ανάθεση"}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-[#0F0F0F] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-5 py-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
                {assignmentType === "program"
                  ? "Ανάθεση προγράμματος"
                  : "Ανάθεση πλάνου διατροφής"}
              </div>
              <h2 className="mt-1 text-[16px] font-extrabold tracking-[-0.02em]">
                Επίλεξε από τα δικά σου
              </h2>
            </div>
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-text-3">
                Φόρτωση...
              </div>
            ) : options.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <div className="mb-2 text-sm font-bold text-text-1">
                  Δεν έχεις φτιάξει{" "}
                  {assignmentType === "program"
                    ? "προγράμματα"
                    : "πλάνα διατροφής"}{" "}
                  ακόμα.
                </div>
                <div className="text-[12px] text-text-3">
                  Πήγαινε στο{" "}
                  <span className="font-mono text-accent">
                    /{assignmentType === "program" ? "workout-builder" : "nutrition"}
                  </span>{" "}
                  και φτιάξε ένα.
                </div>
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto">
                {options.map((opt) => {
                  const isCurrent = opt.id === currentId;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => !isCurrent && chooseOption(opt.id)}
                      disabled={saving || isCurrent}
                      className={`flex w-full items-center gap-3 border-b border-border px-5 py-3 text-left transition-colors last:border-b-0 ${
                        isCurrent
                          ? "bg-accent/[0.08]"
                          : "hover:bg-surface-2 disabled:opacity-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-extrabold tracking-[-0.01em]">
                          {opt.label}
                        </div>
                        {opt.sub && (
                          <div className="mt-0.5 truncate text-[11px] text-text-3">
                            {opt.sub}
                          </div>
                        )}
                      </div>
                      {isCurrent && (
                        <span className="rounded-full bg-accent/[0.15] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-accent">
                          Τρέχον
                        </span>
                      )}
                    </button>
                  );
                })}
                {currentId && (
                  <button
                    type="button"
                    onClick={() => chooseOption(null)}
                    disabled={saving}
                    className="flex w-full items-center gap-3 border-t border-border px-5 py-3 text-left transition-colors hover:bg-danger/[0.06] disabled:opacity-50"
                  >
                    <div className="text-[12px] font-bold text-danger">
                      × Αφαίρεση ανάθεσης
                    </div>
                  </button>
                )}
              </div>
            )}
            {error && (
              <div className="mx-5 mt-3 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
                {error}
              </div>
            )}
            <div className="flex items-center justify-end border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-[10px] border border-border bg-surface-1 px-3.5 py-2 text-[13px] font-bold text-text-1"
              >
                Κλείσιμο
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
