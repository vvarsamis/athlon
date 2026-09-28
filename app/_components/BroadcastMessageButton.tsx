"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Client = { id: string; name: string; status: string };

export function BroadcastMessageButton({
  children,
  className,
  asDiv,
}: {
  children: React.ReactNode;
  className?: string;
  asDiv?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Trigger = asDiv ? "div" : "button";
  return (
    <>
      <Trigger
        onClick={() => setOpen(true)}
        className={className ?? "flex items-center gap-2 rounded-[10px] border border-accent/30 bg-accent/[0.08] px-3.5 py-2.5 text-[13px] font-bold text-accent"}
        {...(asDiv ? { role: "button", tabIndex: 0 } : { type: "button" as const })}
      >
        {children}
      </Trigger>
      {open && <BroadcastModal onClose={() => setOpen(false)} />}
    </>
  );
}

function BroadcastModal({ onClose }: { onClose: () => void }) {
  const [body, setBody] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
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
      const { data } = await supabase
        .from("trainer_clients")
        .select(
          "client_id, status, profile:profiles!trainer_clients_client_id_fkey(full_name)",
        )
        .eq("trainer_id", user.id);
      if (cancelled) return;
      const rows = ((data as unknown as {
        client_id: string;
        status: string;
        profile: { full_name: string | null } | null;
      }[]) ?? []).map((r) => ({
        id: r.client_id,
        name: r.profile?.full_name ?? "Χωρίς όνομα",
        status: r.status,
      }));
      rows.sort((a, b) => {
        if (a.status === b.status) return a.name.localeCompare(b.name, "el");
        return a.status === "active" ? -1 : 1;
      });
      setClients(rows);
      setSelected(new Set(rows.filter((r) => r.status === "active").map((r) => r.id)));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const activeCount = clients.filter((c) => c.status === "active").length;
  const allActiveSelected =
    activeCount > 0 && clients.filter((c) => c.status === "active").every((c) => selected.has(c.id));

  function toggleAllActive() {
    if (allActiveSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(clients.filter((c) => c.status === "active").map((c) => c.id)));
    }
  }

  async function send() {
    const text = body.trim();
    if (!text) { setError("Γράψε ένα μήνυμα."); return; }
    if (selected.size === 0) { setError("Επίλεξε τουλάχιστον έναν πελάτη."); return; }
    setSending(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setSending(false); setError("Δεν είσαι συνδεδεμένος."); return; }

    const rows = Array.from(selected).map((clientId) => ({
      sender_id: user.id,
      recipient_id: clientId,
      body: text,
    }));
    const { error: err } = await supabase.from("messages").insert(rows);
    setSending(false);
    if (err) { setError(err.message); return; }
    setSentCount(rows.length);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => !sending && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-[#0F0F0F] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
            Ομαδικό μήνυμα
          </div>
          <h2 className="mt-1 text-[16px] font-extrabold">
            {sentCount != null ? "Στάλθηκε! 🚀" : "Στείλε σε πολλούς πελάτες"}
          </h2>
        </div>

        {sentCount != null ? (
          <div className="p-5 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/[0.12] text-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="text-[15px] font-extrabold">
              Στάλθηκε σε {sentCount} {sentCount === 1 ? "πελάτη" : "πελάτες"}
            </div>
            <div className="mt-1 text-[12px] text-text-3">
              Οι πελάτες θα λάβουν notification στα κινητά τους.
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-xl bg-accent px-4 py-2 text-[13px] font-extrabold text-[#0A0A0A]"
            >
              Κλείσιμο
            </button>
          </div>
        ) : (
          <>
            <div className="p-5">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
                Το μήνυμα
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="π.χ. Καλημέρα! Την Παρασκευή δεν θα υπάρχει διαθέσιμη σειρά, ας μεταφέρουμε την προπόνηση."
                rows={4}
                maxLength={2000}
                className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-1 focus:border-accent focus:outline-none"
              />
              <div className="mt-1 text-right text-[10px] text-text-3">
                {body.length}/2000
              </div>
            </div>
            <div className="border-t border-border px-5 py-3">
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold">
                <span className="text-text-3">
                  Παραλήπτες: <span className="font-bold text-text-1">{selected.size}</span> / {clients.length}
                </span>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllActive}
                    className="text-accent"
                  >
                    {allActiveSelected ? "Ξε-επιλογή όλων" : "Επίλεξε όλους"}
                  </button>
                )}
              </div>
              {loading ? (
                <div className="py-4 text-center text-[12px] text-text-3">Φόρτωση πελατών...</div>
              ) : clients.length === 0 ? (
                <div className="py-4 text-center text-[12px] text-text-3">
                  Δεν έχεις πελάτες ακόμα.
                </div>
              ) : (
                <div className="max-h-[220px] overflow-y-auto">
                  {clients.map((c) => {
                    const isSelected = selected.has(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggle(c.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${isSelected ? "bg-accent/[0.06]" : "hover:bg-surface-2"}`}
                      >
                        <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-[1.5px] ${isSelected ? "border-accent bg-accent text-[#0A0A0A]" : "border-border bg-surface-2"}`}>
                          {isSelected && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-accent/40 bg-surface-3 text-[11px] font-extrabold text-text-1">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 truncate text-[12px] font-bold">
                          {c.name}
                        </div>
                        {c.status !== "active" && (
                          <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[9px] font-bold uppercase text-text-3">
                            {c.status}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {error && (
              <div className="mx-5 mb-3 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
                {error}
              </div>
            )}
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="rounded-[10px] border border-border bg-surface-1 px-3.5 py-2 text-[13px] font-bold text-text-1"
              >
                Άκυρο
              </button>
              <button
                type="button"
                onClick={send}
                disabled={sending || loading || body.trim().length === 0 || selected.size === 0}
                className="flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2 text-[13px] font-extrabold text-[#0A0A0A] shadow-[0_0_16px_rgba(197,255,0,0.35)] disabled:opacity-50"
              >
                {sending ? "Αποστολή..." : `📢 Στείλε σε ${selected.size}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
