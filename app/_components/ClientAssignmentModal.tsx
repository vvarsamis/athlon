"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type ClientRow = {
  id: string;
  name: string;
  currentTitle: string | null;
  status: string;
};

export function ClientAssignmentModal({
  open,
  onClose,
  assignmentType,
  newItemLabel,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  assignmentType: "program" | "nutrition";
  newItemLabel: string;
  onConfirm: (selectedIds: string[]) => Promise<void>;
}) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignedCol =
    assignmentType === "program"
      ? "assigned_program_id"
      : "assigned_nutrition_plan_id";
  const relTable = assignmentType === "program" ? "programs" : "nutrition_plans";
  const relSelect = assignmentType === "program" ? "title, name" : "name";

  // Load clients + current assignment
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
      const { data, error: fetchErr } = await supabase
        .from("trainer_clients")
        .select(
          `client_id, status, ${assignedCol}, profile:profiles!trainer_clients_client_id_fkey(full_name), assigned:${relTable}!trainer_clients_${assignedCol}_fkey(${relSelect})`,
        )
        .eq("trainer_id", user.id);
      if (cancelled) return;
      if (fetchErr) {
        setError(fetchErr.message);
        setLoading(false);
        return;
      }
      const rows: ClientRow[] = ((data as unknown as Array<{
        client_id: string;
        status: string;
        profile: { full_name: string | null } | null;
        assigned:
          | { title?: string | null; name?: string | null }
          | null;
      }>) ?? []).map((r) => ({
        id: r.client_id,
        name: r.profile?.full_name ?? "Χωρίς όνομα",
        status: r.status,
        currentTitle:
          (r.assigned?.title as string | undefined) ??
          (r.assigned?.name as string | undefined) ??
          null,
      }));
      // Ενεργοί πρώτα, μετά paused
      rows.sort((a, b) => {
        if (a.status === b.status) return a.name.localeCompare(b.name, "el");
        return a.status === "active" ? -1 : 1;
      });
      setClients(rows);
      // Default: όλοι οι active προεπιλεγμένοι
      setSelected(new Set(rows.filter((r) => r.status === "active").map((r) => r.id)));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, assignedCol, relTable, relSelect]);

  if (!open) return null;

  const activeCount = clients.filter((c) => c.status === "active").length;
  const allActiveSelected = activeCount > 0 && clients
    .filter((c) => c.status === "active")
    .every((c) => selected.has(c.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllActive() {
    if (allActiveSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(clients.filter((c) => c.status === "active").map((c) => c.id)));
    }
  }

  async function handleConfirm() {
    setSaving(true);
    setError(null);
    try {
      await onConfirm(Array.from(selected));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Αποτυχία ανάθεσης.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-[#0F0F0F] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
            Ανάθεση σε πελάτες
          </div>
          <h2 className="mt-1 truncate text-[16px] font-extrabold tracking-[-0.02em]">
            {newItemLabel}
          </h2>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-text-3">
            Φόρτωση πελατών...
          </div>
        ) : clients.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <div className="mb-2 text-sm font-bold text-text-1">
              Δεν έχεις πελάτες ακόμα
            </div>
            <div className="text-[12px] text-text-3">
              Το{" "}
              {assignmentType === "program" ? "πρόγραμμα" : "πλάνο"} θα αποθηκευτεί, αλλά δεν θα ανατεθεί πουθενά.
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border px-5 py-2.5 text-[11px] font-semibold">
              <span className="text-text-3">
                Επιλεγμένοι: <span className="font-bold text-text-1">{selected.size}</span> / {clients.length}
              </span>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={toggleAllActive}
                  className="text-accent"
                >
                  {allActiveSelected ? "Ξε-επιλογή" : "Επίλεξε όλους"}
                </button>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {clients.map((c) => {
                const isSelected = selected.has(c.id);
                const isActive = c.status === "active";
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggle(c.id)}
                    className={`flex w-full items-center gap-3 border-b border-border px-5 py-3 text-left transition-colors last:border-b-0 ${
                      isSelected
                        ? "bg-accent/[0.08]"
                        : "hover:bg-surface-2"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-[1.5px] ${
                        isSelected
                          ? "border-accent bg-accent text-[#0A0A0A]"
                          : "border-border bg-surface-2"
                      }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-accent/40 bg-surface-3 text-[13px] font-extrabold text-text-1">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-bold tracking-[-0.01em]">
                          {c.name}
                        </span>
                        {!isActive && (
                          <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-text-3">
                            {c.status}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-text-3">
                        {c.currentTitle
                          ? `Τώρα: ${c.currentTitle}`
                          : `Χωρίς ${assignmentType === "program" ? "πρόγραμμα" : "πλάνο"}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {error && (
          <div className="mx-5 mt-3 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-border bg-surface-1 px-3.5 py-2 text-[13px] font-bold text-text-1"
          >
            Άκυρο
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || loading}
            className="flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2 text-[13px] font-extrabold text-[#0A0A0A] shadow-[0_0_16px_rgba(197,255,0,0.35)] disabled:opacity-50"
          >
            {saving
              ? "Αποθήκευση..."
              : clients.length === 0
              ? "Αποθήκευση χωρίς ανάθεση"
              : selected.size === 0
              ? "Αποθήκευση χωρίς ανάθεση"
              : `Ανάθεση σε ${selected.size}`}
          </button>
        </div>
      </div>
    </div>
  );
}
