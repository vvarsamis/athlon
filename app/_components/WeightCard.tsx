"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "../../lib/supabase/client";

type Props = {
  latestKg: number | null;
  monthAgoKg: number | null;
};

export function WeightCard({ latestKg, monthAgoKg }: Props) {
  const [open, setOpen] = useState(false);

  const delta =
    latestKg != null && monthAgoKg != null
      ? Math.round((latestKg - monthAgoKg) * 10) / 10
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-border bg-surface-1 p-4 text-left hover:border-accent"
      >
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
          Σωματικό βάρος
        </div>
        {latestKg != null ? (
          <>
            <div className="flex items-baseline gap-1">
              <div className="font-mono text-[26px] font-extrabold tracking-[-0.03em]">
                {latestKg}
              </div>
              <div className="text-[13px] font-semibold text-text-3">kg</div>
            </div>
            <div
              className={`mt-1.5 flex items-center gap-1 text-[11px] font-bold ${
                delta == null
                  ? "text-text-3"
                  : delta < 0
                  ? "text-accent"
                  : delta > 0
                  ? "text-warning"
                  : "text-text-3"
              }`}
            >
              {delta == null
                ? "Πάτα να προσθέσεις νέα"
                : delta === 0
                ? "= αυτό το μήνα"
                : delta < 0
                ? `↓ ${Math.abs(delta)} kg αυτό το μήνα`
                : `↑ ${delta} kg αυτό το μήνα`}
            </div>
          </>
        ) : (
          <>
            <div className="font-mono text-[16px] font-bold text-text-3">
              — kg
            </div>
            <div className="mt-1.5 text-[11px] font-medium text-accent">
              + Πρόσθεσε πρώτη μέτρηση
            </div>
          </>
        )}
      </button>
      {open && (
        <WeightModal
          latestKg={latestKg}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function WeightModal({
  latestKg,
  onClose,
}: {
  latestKg: number | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [weight, setWeight] = useState<string>(
    latestKg != null ? String(latestKg) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const w = parseFloat(weight.replace(",", "."));
    if (isNaN(w) || w < 20 || w > 400) {
      setError("Βάλε λογικό βάρος (20-400 kg).");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSaving(false);
      setError("Δεν είσαι συνδεδεμένος.");
      return;
    }
    const { error: insErr } = await supabase.from("weigh_ins").insert({
      client_id: userId,
      weight_kg: w,
    });
    if (insErr) {
      setSaving(false);
      setError(insErr.message);
      return;
    }
    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-border bg-surface-1 p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Κλείσιμο"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-text-3 hover:bg-surface-2 hover:text-text-1"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/[0.12] text-accent">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h2 className="mb-2 text-xl font-extrabold tracking-[-0.02em]">
          Νέα μέτρηση βάρους
        </h2>
        <p className="mb-5 text-[13px] leading-[1.55] text-text-2">
          Καταγράφεις το βάρος σου {new Date().toLocaleDateString("el-GR", { day: "numeric", month: "long" })}.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
              Βάρος (kg)
            </label>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="π.χ. 82.4"
              className="w-full border-0 bg-transparent p-0 font-mono text-[32px] font-extrabold text-text-1 outline-none placeholder:text-text-3"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent p-4 text-sm font-extrabold uppercase tracking-[0.04em] text-[#0A0A0A] shadow-[0_0_32px_rgba(197,255,0,0.25)] disabled:opacity-60"
          >
            {saving ? "Αποθήκευση..." : "Αποθήκευση"}
          </button>
        </form>
      </div>
    </div>
  );
}
