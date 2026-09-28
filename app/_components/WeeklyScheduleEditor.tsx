"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Program = { id: string; title: string; name: string };
type Plan = { id: string; name: string; target_kcal: number | null };

export type ScheduleRow = {
  day_of_week: number;
  program_id: string | null;
  nutrition_plan_id: string | null;
};

const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];
const DAYS_SHORT = ["Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ", "Κυρ"];

export function WeeklyScheduleEditor({
  clientId,
  programs,
  plans,
  initialSchedule,
}: {
  clientId: string;
  programs: Program[];
  plans: Plan[];
  initialSchedule: ScheduleRow[];
}) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<Record<number, { program_id: string | null; plan_id: string | null }>>(() => {
    const map: Record<number, { program_id: string | null; plan_id: string | null }> = {};
    for (let d = 0; d < 7; d++) map[d] = { program_id: null, plan_id: null };
    for (const row of initialSchedule) {
      map[row.day_of_week] = {
        program_id: row.program_id,
        plan_id: row.nutrition_plan_id,
      };
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setDay(day: number, patch: Partial<{ program_id: string | null; plan_id: string | null }>) {
    setSaved(false);
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  function copyToAll(field: "program_id" | "plan_id", day: number) {
    const val = schedule[day][field];
    setSaved(false);
    setSchedule((prev) => {
      const next = { ...prev };
      for (let d = 0; d < 7; d++) next[d] = { ...next[d], [field]: val };
      return next;
    });
  }

  function copyWeekdays(field: "program_id" | "plan_id", day: number) {
    const val = schedule[day][field];
    setSaved(false);
    setSchedule((prev) => {
      const next = { ...prev };
      for (let d = 0; d < 5; d++) next[d] = { ...next[d], [field]: val };
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();
    // Delete existing + insert new (καθαρός τρόπος με 2 nullable pk fields)
    const { error: delErr } = await supabase
      .from("client_weekly_schedule")
      .delete()
      .eq("client_id", clientId);
    if (delErr) {
      setError(delErr.message);
      setSaving(false);
      return;
    }
    const rows = [];
    for (let d = 0; d < 7; d++) {
      const entry = schedule[d];
      if (entry.program_id || entry.plan_id) {
        rows.push({
          client_id: clientId,
          day_of_week: d,
          program_id: entry.program_id,
          nutrition_plan_id: entry.plan_id,
        });
      }
    }
    if (rows.length > 0) {
      const { error: insErr } = await supabase
        .from("client_weekly_schedule")
        .insert(rows);
      if (insErr) {
        setError(insErr.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  const today = (new Date().getDay() + 6) % 7; // Δευτέρα = 0

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-1">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <div>
          <h2 className="text-sm font-extrabold tracking-[-0.01em]">
            Εβδομαδιαίο πρόγραμμα
          </h2>
          <div className="mt-0.5 text-[11px] font-medium text-text-3">
            Ανά ημέρα · κάθε μέρα μπορεί να έχει διαφορετική άσκηση + διατροφή
          </div>
        </div>
        {saved && (
          <span className="rounded-full bg-success/[0.12] px-2 py-0.5 text-[10px] font-bold text-success">
            ✓ Αποθηκεύτηκε
          </span>
        )}
      </div>
      <div className="p-4">
        {programs.length === 0 && plans.length === 0 && (
          <div className="mb-3 rounded-lg border border-dashed border-border bg-surface-2 px-3 py-3 text-center text-[12px] text-text-3">
            Δεν έχεις φτιάξει προγράμματα ή πλάνα ακόμα. Πήγαινε στο{" "}
            <span className="text-accent">/workout-builder</span> ή{" "}
            <span className="text-accent">/nutrition</span> να φτιάξεις.
          </div>
        )}
        <div className="space-y-2">
          {DAYS.map((dayName, day) => {
            const entry = schedule[day];
            const isToday = day === today;
            return (
              <div
                key={day}
                className={`grid grid-cols-[70px_1fr_1fr] gap-2 rounded-xl border p-2.5 ${
                  isToday
                    ? "border-accent/40 bg-accent/[0.04]"
                    : "border-border bg-surface-2"
                }`}
              >
                <div className="flex flex-col justify-center pl-1">
                  <div className={`text-[12px] font-extrabold ${isToday ? "text-accent" : "text-text-1"}`}>
                    {DAYS_SHORT[day]}
                  </div>
                  {isToday && (
                    <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
                      Σήμερα
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-3">
                    Πρόγραμμα
                  </label>
                  <div className="flex gap-1">
                    <select
                      value={entry.program_id ?? ""}
                      onChange={(e) => setDay(day, { program_id: e.target.value || null })}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-surface-3 px-2 py-1.5 text-[12px] text-text-1 focus:border-accent focus:outline-none"
                    >
                      <option value="">— Ξεκούραση —</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    {entry.program_id && (
                      <>
                        <button
                          type="button"
                          onClick={() => copyToAll("program_id", day)}
                          title="Αντιγραφή σε όλες τις μέρες"
                          className="flex-shrink-0 rounded-lg border border-border bg-surface-3 px-2 text-[10px] font-bold text-text-2 hover:border-accent hover:text-accent"
                        >
                          7×
                        </button>
                        <button
                          type="button"
                          onClick={() => copyWeekdays("program_id", day)}
                          title="Αντιγραφή Δευ-Παρ"
                          className="flex-shrink-0 rounded-lg border border-border bg-surface-3 px-2 text-[10px] font-bold text-text-2 hover:border-accent hover:text-accent"
                        >
                          5×
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-3">
                    Διατροφή
                  </label>
                  <div className="flex gap-1">
                    <select
                      value={entry.plan_id ?? ""}
                      onChange={(e) => setDay(day, { plan_id: e.target.value || null })}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-surface-3 px-2 py-1.5 text-[12px] text-text-1 focus:border-accent focus:outline-none"
                    >
                      <option value="">— Κανένα —</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.target_kcal ? ` (${p.target_kcal} kcal)` : ""}
                        </option>
                      ))}
                    </select>
                    {entry.plan_id && (
                      <>
                        <button
                          type="button"
                          onClick={() => copyToAll("plan_id", day)}
                          title="Αντιγραφή σε όλες τις μέρες"
                          className="flex-shrink-0 rounded-lg border border-border bg-surface-3 px-2 text-[10px] font-bold text-text-2 hover:border-accent hover:text-accent"
                        >
                          7×
                        </button>
                        <button
                          type="button"
                          onClick={() => copyWeekdays("plan_id", day)}
                          title="Αντιγραφή Δευ-Παρ"
                          className="flex-shrink-0 rounded-lg border border-border bg-surface-3 px-2 text-[10px] font-bold text-text-2 hover:border-accent hover:text-accent"
                        >
                          5×
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {error && (
          <div className="mt-3 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
            {error}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-[11px] text-text-3">
            💡 Πάτα <span className="font-bold text-text-2">7×</span> για ίδιο σε όλη την εβδομάδα ή{" "}
            <span className="font-bold text-text-2">5×</span> για Δευ-Παρ.
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-[10px] bg-accent px-4 py-2 text-[13px] font-extrabold text-[#0A0A0A] shadow-[0_0_16px_rgba(197,255,0,0.35)] disabled:opacity-50"
          >
            {saving ? "Αποθήκευση..." : "Αποθήκευση εβδομάδας"}
          </button>
        </div>
      </div>
    </div>
  );
}
