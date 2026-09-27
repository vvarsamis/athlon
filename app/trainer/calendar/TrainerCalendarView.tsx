"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Client = { id: string; name: string };
type Session = {
  id: string;
  client_id: string;
  program_title: string | null;
  completed_at: string;
  duration_sec: number | null;
};

export function TrainerCalendarView({
  todayIso,
  clients,
  sessions,
}: {
  todayIso: string;
  clients: Client[];
  sessions: Session[];
}) {
  const today = new Date(todayIso);
  // Δευτέρα της εβδομάδας που κοιτάμε
  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(today));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const weekKeys = useMemo(() => weekDays.map(dayKey), [weekDays]);
  const todayKey = dayKey(today);

  // Sessions per (clientId, dayKey)
  const sessionsMap = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const s of sessions) {
      const k = `${s.client_id}|${dayKey(new Date(s.completed_at))}`;
      const arr = map.get(k) ?? [];
      arr.push(s);
      map.set(k, arr);
    }
    return map;
  }, [sessions]);

  // Totals per day (για την γραμμή sums)
  const dailyTotals = useMemo(() => {
    return weekKeys.map((k) =>
      clients.reduce(
        (acc, c) => acc + (sessionsMap.get(`${c.id}|${k}`)?.length ?? 0),
        0,
      ),
    );
  }, [weekKeys, clients, sessionsMap]);

  const weekTotal = dailyTotals.reduce((a, b) => a + b, 0);

  const weekLabel = `${weekDays[0].toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
  })} — ${weekDays[6].toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  function shiftWeek(delta: number) {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() + delta * 7);
      return d;
    });
  }
  function goThisWeek() {
    setWeekStart(mondayOf(today));
  }

  const isThisWeek = dayKey(weekStart) === dayKey(mondayOf(today));

  return (
    <>
      {/* Nav */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
            Εβδομάδα
          </div>
          <div className="mt-0.5 text-[20px] font-extrabold capitalize tracking-[-0.02em]">
            {weekLabel}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftWeek(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
            aria-label="Προηγούμενη"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          {!isThisWeek && (
            <button
              type="button"
              onClick={goThisWeek}
              className="rounded-[10px] border border-accent/40 bg-accent/[0.08] px-3 py-2 text-[11px] font-bold text-accent"
            >
              Αυτή η εβδομάδα
            </button>
          )}
          <button
            type="button"
            onClick={() => shiftWeek(1)}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
            aria-label="Επόμενη"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Συνολικά" val={String(weekTotal)} unit="προπονήσεις" />
        <SummaryCard
          label="Ενεργοί"
          val={String(new Set(sessions.filter((s) => weekKeys.includes(dayKey(new Date(s.completed_at)))).map((s) => s.client_id)).size)}
          unit={`/ ${clients.length} πελάτες`}
        />
        <SummaryCard
          label="Μέσος όρος / μέρα"
          val={(weekTotal / 7).toFixed(1)}
          unit="προπονήσεις"
        />
        <SummaryCard
          label="Καλύτερη μέρα"
          val={String(Math.max(0, ...dailyTotals))}
          unit={
            dailyTotals.some((v) => v > 0)
              ? weekDays[dailyTotals.indexOf(Math.max(...dailyTotals))].toLocaleDateString("el-GR", { weekday: "short" })
              : "—"
          }
        />
      </div>

      {/* Grid */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-1">
        {/* Header row: days */}
        <div className="grid grid-cols-[minmax(160px,1.4fr)_repeat(7,minmax(70px,1fr))] border-b border-border bg-surface-2">
          <div className="border-r border-border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
            Πελάτης
          </div>
          {weekDays.map((d) => {
            const k = dayKey(d);
            const isToday = k === todayKey;
            return (
              <div
                key={k}
                className={`border-r border-border px-2 py-3 text-center last:border-r-0 ${
                  isToday ? "bg-accent/[0.06]" : ""
                }`}
              >
                <div className={`text-[9px] font-bold uppercase tracking-[0.08em] ${isToday ? "text-accent" : "text-text-3"}`}>
                  {d.toLocaleDateString("el-GR", { weekday: "short" })}
                </div>
                <div className={`mt-0.5 font-mono text-[14px] font-extrabold ${isToday ? "text-accent" : "text-text-1"}`}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Client rows */}
        {clients.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[minmax(160px,1.4fr)_repeat(7,minmax(70px,1fr))] border-b border-border last:border-b-0"
          >
            <Link
              href={`/trainer/clients/${c.id}`}
              className="flex items-center gap-2.5 border-r border-border px-4 py-3 transition-colors hover:bg-surface-2"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-accent bg-surface-3 text-[13px] font-extrabold text-text-1">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 truncate text-[13px] font-bold tracking-[-0.01em]">
                {c.name}
              </div>
            </Link>
            {weekKeys.map((k) => {
              const daySessions = sessionsMap.get(`${c.id}|${k}`) ?? [];
              const isToday = k === todayKey;
              return (
                <div
                  key={k}
                  className={`flex items-center justify-center border-r border-border p-2 last:border-r-0 ${
                    isToday ? "bg-accent/[0.04]" : ""
                  }`}
                >
                  {daySessions.length > 0 ? (
                    <div
                      title={daySessions
                        .map((s) => s.program_title ?? "Προπόνηση")
                        .join(" · ")}
                      className="flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-success/[0.15] px-1.5 text-[11px] font-extrabold text-success"
                    >
                      {daySessions.length === 1 ? "✓" : `${daySessions.length}✓`}
                    </div>
                  ) : (
                    <span className="text-[11px] text-text-3">·</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-text-3">
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded bg-success/[0.15] px-1 text-[9px] font-extrabold text-success">
            ✓
          </span>
          Ολοκληρωμένη προπόνηση
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-accent/[0.06]" />
          Σήμερα
        </div>
      </div>
    </>
  );
}

function SummaryCard({
  label,
  val,
  unit,
}: {
  label: string;
  val: string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5 font-mono text-[24px] font-extrabold leading-none tracking-[-0.03em]">
        {val}
        {unit && (
          <span className="text-[11px] font-semibold text-text-3">{unit}</span>
        )}
      </div>
    </div>
  );
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function mondayOf(d: Date): Date {
  const m = new Date(d);
  const dow = (m.getDay() + 6) % 7; // Monday = 0
  m.setDate(m.getDate() - dow);
  m.setHours(0, 0, 0, 0);
  return m;
}
