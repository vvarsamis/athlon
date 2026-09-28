"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Props = {
  clientId: string;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  monthlyFeeEur: number | null;
};

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function SubscriptionCard({
  clientId,
  subscriptionStart,
  subscriptionEnd,
  monthlyFeeEur,
}: Props) {
  const [open, setOpen] = useState(false);

  const now = new Date();
  const start = subscriptionStart ? new Date(subscriptionStart) : null;
  const end = subscriptionEnd ? new Date(subscriptionEnd) : null;
  const daysLeft = end ? daysBetween(now, end) : null;

  const hasSubscription = Boolean(start || end || monthlyFeeEur);
  const isActive = end != null && daysLeft != null && daysLeft >= 0;
  const isExpiringSoon = isActive && daysLeft != null && daysLeft <= 14;
  const isExpired = end != null && daysLeft != null && daysLeft < 0;

  const badgeCls = isExpired
    ? "bg-danger/[0.12] text-danger"
    : isExpiringSoon
    ? "bg-warning/[0.12] text-warning"
    : isActive
    ? "bg-success/[0.12] text-success"
    : "bg-surface-3 text-text-3";

  const badgeText = isExpired
    ? `Έληξε πριν ${Math.abs(daysLeft!)} μέρες`
    : isExpiringSoon
    ? `Λήγει σε ${daysLeft} μέρες`
    : isActive
    ? `Ενεργή · ${daysLeft} μέρες`
    : "Χωρίς συνδρομή";

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-1">
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[14px]">
          <div>
            <h2 className="text-sm font-extrabold tracking-[-0.01em]">Συνδρομή</h2>
            <div className="mt-0.5 text-[11px] font-medium text-text-3">
              Οικονομικά + χρόνος
            </div>
          </div>
          <span className={`rounded-full px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.06em] ${badgeCls}`}>
            {badgeText}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 p-5">
          <SubStat
            label="Έναρξη"
            val={start ? start.toLocaleDateString("el-GR", { day: "numeric", month: "short", year: "numeric" }) : "—"}
          />
          <SubStat
            label="Λήξη"
            val={end ? end.toLocaleDateString("el-GR", { day: "numeric", month: "short", year: "numeric" }) : "—"}
            valClass={isExpired ? "text-danger" : isExpiringSoon ? "text-warning" : ""}
          />
          <SubStat
            label="Μηνιαία"
            val={monthlyFeeEur != null ? `€${monthlyFeeEur}` : "—"}
            valClass="text-accent"
          />
        </div>
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full rounded-[10px] border border-border bg-surface-2 py-2 text-[12px] font-bold text-text-1 hover:border-accent"
          >
            {hasSubscription ? "Επεξεργασία" : "+ Ορισμός συνδρομής"}
          </button>
        </div>
      </div>
      {open && (
        <SubscriptionModal
          clientId={clientId}
          subscriptionStart={subscriptionStart}
          subscriptionEnd={subscriptionEnd}
          monthlyFeeEur={monthlyFeeEur}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function SubStat({
  label,
  val,
  valClass,
}: {
  label: string;
  val: string;
  valClass?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
        {label}
      </div>
      <div className={`mt-1 font-mono text-[14px] font-extrabold ${valClass ?? "text-text-1"}`}>
        {val}
      </div>
    </div>
  );
}

function SubscriptionModal({
  clientId,
  subscriptionStart,
  subscriptionEnd,
  monthlyFeeEur,
  onClose,
}: {
  clientId: string;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  monthlyFeeEur: number | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(subscriptionStart ?? toISODate(new Date()));
  const [endDate, setEndDate] = useState(subscriptionEnd ?? "");
  const [fee, setFee] = useState(monthlyFeeEur != null ? String(monthlyFeeEur) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addMonths(months: number) {
    const base = endDate ? new Date(endDate) : startDate ? new Date(startDate) : new Date();
    const target = new Date(base);
    target.setMonth(target.getMonth() + months);
    setEndDate(toISODate(target));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const feeNum = fee.trim() ? parseFloat(fee) : null;
    const { error: err } = await supabase
      .from("trainer_clients")
      .update({
        subscription_start: startDate || null,
        subscription_end: endDate || null,
        monthly_fee_eur: feeNum,
      })
      .eq("client_id", clientId);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onClose();
    router.refresh();
  }

  async function clearSubscription() {
    setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("trainer_clients")
      .update({
        subscription_start: null,
        subscription_end: null,
        monthly_fee_eur: null,
      })
      .eq("client_id", clientId);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-[#0F0F0F] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
            Συνδρομή
          </div>
          <h2 className="mt-1 text-[16px] font-extrabold">
            Ρύθμιση διάρκειας & χρέωσης
          </h2>
        </div>
        <div className="space-y-3 p-5">
          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
            Έναρξη
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-1 focus:border-accent focus:outline-none"
            />
          </label>
          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
            Λήξη
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-1 focus:border-accent focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => addMonths(1)}
              className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[10px] font-bold text-text-1 hover:border-accent"
            >
              +1 μήνας
            </button>
            <button
              type="button"
              onClick={() => addMonths(3)}
              className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[10px] font-bold text-text-1 hover:border-accent"
            >
              +3 μήνες
            </button>
            <button
              type="button"
              onClick={() => addMonths(6)}
              className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[10px] font-bold text-text-1 hover:border-accent"
            >
              +6 μήνες
            </button>
            <button
              type="button"
              onClick={() => addMonths(12)}
              className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[10px] font-bold text-text-1 hover:border-accent"
            >
              +1 έτος
            </button>
          </div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
            Μηνιαία χρέωση (€)
            <input
              type="text"
              inputMode="decimal"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="π.χ. 60"
              className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-1 focus:border-accent focus:outline-none"
            />
          </label>
        </div>
        {error && (
          <div className="mx-5 mb-3 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
            {error}
          </div>
        )}
        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={clearSubscription}
            disabled={saving}
            className="text-[12px] font-bold text-danger"
          >
            × Καθαρισμός
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-[10px] border border-border bg-surface-1 px-3.5 py-2 text-[13px] font-bold text-text-1"
            >
              Άκυρο
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-[10px] bg-accent px-4 py-2 text-[13px] font-extrabold text-[#0A0A0A] shadow-[0_0_16px_rgba(197,255,0,0.35)] disabled:opacity-50"
            >
              {saving ? "Αποθήκευση..." : "Αποθήκευση"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
