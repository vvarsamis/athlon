"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type CalendarSession = {
  id: string;
  program_title: string | null;
  program_name: string | null;
  completed_at: string | null;
  duration_sec: number | null;
};

export type AssignedProgram = {
  id: string;
  name: string;
  title: string;
  duration_min: number | null;
  kcal: number | null;
  exerciseCount: number;
} | null;

export function CalendarView({
  todayIso,
  sessions,
  assignedProgram,
}: {
  todayIso: string;
  sessions: CalendarSession[];
  assignedProgram: AssignedProgram;
}) {
  const today = new Date(todayIso);
  const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedIso, setSelectedIso] = useState<string>(dayKey(today));

  // Group sessions by day
  const sessionsByDay = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    for (const s of sessions) {
      if (!s.completed_at) continue;
      const key = dayKey(new Date(s.completed_at));
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [sessions]);

  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString(
    "el-GR",
    { month: "long", year: "numeric" },
  );

  const cells = buildMonthGrid(viewMonth.year, viewMonth.month);
  const todayKey = dayKey(today);
  const selectedSessions = sessionsByDay.get(selectedIso) ?? [];
  const selectedDate = new Date(selectedIso);
  const isSelectedToday = selectedIso === todayKey;
  const isSelectedFuture = selectedDate > today && !isSelectedToday;

  function goPrev() {
    setViewMonth((v) => {
      const m = v.month - 1;
      return m < 0
        ? { year: v.year - 1, month: 11 }
        : { year: v.year, month: m };
    });
  }
  function goNext() {
    setViewMonth((v) => {
      const m = v.month + 1;
      return m > 11
        ? { year: v.year + 1, month: 0 }
        : { year: v.year, month: m };
    });
  }
  function goToday() {
    setViewMonth({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedIso(todayKey);
  }

  const isCurrentMonth =
    viewMonth.year === today.getFullYear() && viewMonth.month === today.getMonth();

  return (
    <>
      {/* Today card */}
      <TodayCard
        assignedProgram={assignedProgram}
        completedToday={(sessionsByDay.get(todayKey) ?? []).length > 0}
      />

      {/* Month header */}
      <div className="mx-5 mt-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-3">
            Ημερολόγιο
          </div>
          <div className="mt-0.5 text-[18px] font-extrabold capitalize tracking-[-0.02em]">
            {monthLabel}
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
            aria-label="Προηγούμενος μήνας"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={goToday}
              className="flex h-9 items-center justify-center rounded-[10px] border border-accent/40 bg-accent/[0.08] px-3 text-[11px] font-bold text-accent"
            >
              Σήμερα
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
            aria-label="Επόμενος μήνας"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="mx-5 mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-text-3">
        {["Δ", "Τ", "Τ", "Π", "Π", "Σ", "Κ"].map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="mx-5 mt-2 grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          if (!cell) {
            return <div key={Math.random()} className="aspect-square" />;
          }
          const key = cell.iso;
          const hasSession = sessionsByDay.has(key);
          const sessionCount = sessionsByDay.get(key)?.length ?? 0;
          const isTodayCell = key === todayKey;
          const isSelected = key === selectedIso;
          const isFuture = new Date(key) > today && !isTodayCell;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedIso(key)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-[13px] font-bold transition-colors ${
                isSelected
                  ? "bg-accent text-[#0A0A0A]"
                  : isTodayCell
                  ? "border border-accent bg-accent/[0.08] text-accent"
                  : hasSession
                  ? "bg-surface-2 text-text-1"
                  : isFuture
                  ? "text-text-3"
                  : "text-text-2 hover:bg-surface-2"
              }`}
            >
              <span>{cell.day}</span>
              {hasSession && (
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${
                    isSelected ? "bg-[#0A0A0A]" : "bg-accent"
                  }`}
                />
              )}
              {sessionCount > 1 && (
                <span
                  className={`absolute right-1 top-1 font-mono text-[8px] font-extrabold ${
                    isSelected ? "text-[#0A0A0A]" : "text-accent"
                  }`}
                >
                  {sessionCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mx-5 mt-3 flex items-center gap-4 text-[10px] font-semibold text-text-3">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Προπόνηση
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-md border border-accent bg-accent/[0.08]" />
          Σήμερα
        </div>
      </div>

      {/* Selected day details */}
      <div className="mx-5 mt-5 rounded-2xl border border-border bg-surface-1 p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-3">
              {isSelectedToday ? "Σήμερα" : isSelectedFuture ? "Μελλοντικά" : "Ιστορικό"}
            </div>
            <div className="mt-0.5 text-[16px] font-extrabold capitalize tracking-[-0.02em]">
              {selectedDate.toLocaleDateString("el-GR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
          </div>
          {selectedSessions.length > 0 && (
            <span className="rounded-full bg-success/[0.12] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-success">
              {selectedSessions.length} ολοκληρώθηκε
            </span>
          )}
        </div>

        {selectedSessions.length > 0 ? (
          <div className="space-y-2">
            {selectedSessions.map((s) => {
              const time = s.completed_at
                ? new Date(s.completed_at).toLocaleTimeString("el-GR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";
              const durationMin =
                s.duration_sec != null ? Math.round(s.duration_sec / 60) : null;
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-success/[0.12] text-success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-extrabold tracking-[-0.01em]">
                      {s.program_title ?? "Προπόνηση"}
                    </div>
                    <div className="mt-0.5 text-[11px] text-text-3">
                      {[s.program_name, time, durationMin ? `${durationMin}'` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : isSelectedToday && assignedProgram ? (
          <div className="rounded-xl border border-accent/20 bg-accent/[0.06] p-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
              Πρόγραμμα σήμερα
            </div>
            <div className="text-[14px] font-extrabold tracking-[-0.01em]">
              {assignedProgram.title}
            </div>
            <div className="mt-0.5 text-[11px] text-text-3">
              {[
                assignedProgram.name,
                assignedProgram.duration_min ? `${assignedProgram.duration_min}'` : null,
                assignedProgram.exerciseCount > 0
                  ? `${assignedProgram.exerciseCount} ασκήσεις`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
            <Link
              href="/workout"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[12px] font-extrabold text-[#0A0A0A]"
            >
              Ξεκίνα προπόνηση
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        ) : isSelectedFuture && assignedProgram ? (
          <div className="rounded-xl border border-border bg-surface-2 p-4 text-[12px] text-text-3">
            Το πρόγραμμά σου <strong className="font-bold text-text-1">{assignedProgram.title}</strong> θα είναι διαθέσιμο και αυτή την ημέρα.
          </div>
        ) : (
          <div className="py-3 text-center text-[12px] text-text-3">
            {isSelectedFuture ? "Δεν έχει προγραμματιστεί κάτι." : "Δεν έγινε προπόνηση αυτή την ημέρα."}
          </div>
        )}
      </div>
    </>
  );
}

function TodayCard({
  assignedProgram,
  completedToday,
}: {
  assignedProgram: AssignedProgram;
  completedToday: boolean;
}) {
  if (!assignedProgram) {
    return (
      <div className="mx-5 mt-2 rounded-2xl border border-dashed border-border bg-surface-1 p-5 text-center">
        <div className="text-[12px] text-text-3">
          Δεν έχεις ανατεθεί ακόμα πρόγραμμα από τον προπονητή σου.
        </div>
      </div>
    );
  }
  if (completedToday) {
    return (
      <div className="mx-5 mt-2 flex items-center gap-3 rounded-2xl border border-success/20 bg-success/[0.06] p-5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-success/[0.15] text-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-success">
            Ολοκληρώθηκε σήμερα
          </div>
          <div className="mt-0.5 truncate text-[14px] font-extrabold">
            {assignedProgram.title}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-5 mt-2 rounded-2xl border border-accent/30 bg-gradient-to-br from-[#1A1A0F] to-[#0A0A0A] p-5">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
        Σήμερα
      </div>
      <div className="text-[20px] font-extrabold leading-tight tracking-[-0.025em]">
        {assignedProgram.title}
      </div>
      <div className="mt-1 text-[12px] text-text-2">
        {[
          assignedProgram.name,
          assignedProgram.duration_min ? `${assignedProgram.duration_min}'` : null,
          assignedProgram.exerciseCount > 0
            ? `${assignedProgram.exerciseCount} ασκήσεις`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </div>
      <Link
        href="/workout"
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[13px] font-extrabold text-[#0A0A0A] shadow-[0_0_16px_rgba(197,255,0,0.35)]"
      >
        Ξεκίνα προπόνηση
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </div>
  );
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildMonthGrid(
  year: number,
  month: number,
): Array<{ day: number; iso: string } | null> {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();
  // Monday = 0
  const firstDayOfWeek = (first.getDay() + 6) % 7;
  const cells: Array<{ day: number; iso: string } | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      iso: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
