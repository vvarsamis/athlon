"use client";

import { useMemo, useState } from "react";

export type WeeklyPlanInfo = {
  day: number; // 0=Δευτέρα .. 6=Κυριακή
  planName: string | null;
  targetKcal: number | null;
};

export function NutritionCalendarView({
  todayIso,
  weeklyPlans,
}: {
  todayIso: string;
  weeklyPlans: WeeklyPlanInfo[];
}) {
  const today = new Date(todayIso);
  const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedIso, setSelectedIso] = useState<string>(dayKey(today));

  const weeklyByDay = useMemo(() => {
    const map = new Map<number, WeeklyPlanInfo>();
    for (const w of weeklyPlans) map.set(w.day, w);
    return map;
  }, [weeklyPlans]);

  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString(
    "el-GR",
    { month: "long", year: "numeric" },
  );

  const cells = buildMonthGrid(viewMonth.year, viewMonth.month);
  const todayKey = dayKey(today);
  const selectedDate = new Date(selectedIso);
  const isSelectedToday = selectedIso === todayKey;
  const isSelectedFuture = selectedDate > today && !isSelectedToday;
  const selectedDow = (selectedDate.getDay() + 6) % 7;
  const selectedPlan = weeklyByDay.get(selectedDow);

  function goPrev() {
    setViewMonth((v) => {
      const m = v.month - 1;
      return m < 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: m };
    });
  }
  function goNext() {
    setViewMonth((v) => {
      const m = v.month + 1;
      return m > 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: m };
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
      <div className="mx-5 mt-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-3">
            Ημερολόγιο διατροφής
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
            aria-label="Προηγούμενος"
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
            aria-label="Επόμενος"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mx-5 mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-text-3">
        {["Δ", "Τ", "Τ", "Π", "Π", "Σ", "Κ"].map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>

      <div className="mx-5 mt-2 grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          if (!cell) return <div key={Math.random()} className="aspect-square" />;
          const key = cell.iso;
          const dow = (new Date(key).getDay() + 6) % 7;
          const hasPlan = weeklyByDay.get(dow)?.planName != null;
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
                  : hasPlan
                  ? "bg-surface-2 text-text-1"
                  : isFuture
                  ? "text-text-3"
                  : "text-text-2 hover:bg-surface-2"
              }`}
            >
              <span>{cell.day}</span>
              {hasPlan && (
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${
                    isSelected ? "bg-[#0A0A0A]" : "bg-accent"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mx-5 mt-3 flex items-center gap-4 text-[10px] font-semibold text-text-3">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Πλάνο διατροφής
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-md border border-accent bg-accent/[0.08]" />
          Σήμερα
        </div>
      </div>

      <div className="mx-5 mt-5 rounded-2xl border border-border bg-surface-1 p-5">
        <div className="mb-3">
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
        {selectedPlan?.planName ? (
          <div className={`rounded-xl border p-4 ${isSelectedToday ? "border-accent/20 bg-accent/[0.06]" : "border-border bg-surface-2"}`}>
            <div className={`mb-2 text-[11px] font-bold uppercase tracking-[0.1em] ${isSelectedToday ? "text-accent" : "text-text-3"}`}>
              Πλάνο διατροφής
            </div>
            <div className="text-[14px] font-extrabold tracking-[-0.01em]">
              {selectedPlan.planName}
            </div>
            {selectedPlan.targetKcal != null && (
              <div className="mt-0.5 text-[11px] text-text-3">
                Στόχος: <span className="font-mono font-bold text-text-2">{selectedPlan.targetKcal} kcal</span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface-2 p-4 text-center text-[12px] text-text-3">
            Δεν έχει ανατεθεί πλάνο για αυτή τη μέρα.
          </div>
        )}
      </div>
    </>
  );
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number): Array<{ day: number; iso: string } | null> {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();
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
