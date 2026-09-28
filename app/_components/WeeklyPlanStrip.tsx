const DAYS_SHORT = ["Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ", "Κυρ"];

export type WeeklyPlanDay = {
  day: number; // 0=Δευτέρα .. 6=Κυριακή
  programTitle: string | null;
  planName: string | null;
};

export function WeeklyPlanStrip({
  days,
  today,
}: {
  days: WeeklyPlanDay[];
  today: number;
}) {
  const byDay = new Map<number, WeeklyPlanDay>();
  for (const d of days) byDay.set(d.day, d);

  const hasAnything = days.some((d) => d.programTitle || d.planName);
  if (!hasAnything) return null;

  return (
    <div className="mx-5 mt-5 rounded-2xl border border-border bg-surface-1 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
          Εβδομαδιαίο πλάνο
        </div>
        <div className="text-[10px] font-semibold text-text-3">
          Ανά ημέρα
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS_SHORT.map((name, dayIdx) => {
          const d = byDay.get(dayIdx);
          const isToday = dayIdx === today;
          const isRest = !d?.programTitle;
          return (
            <div
              key={dayIdx}
              className={`flex flex-col items-center gap-1 rounded-xl border p-1.5 ${
                isToday
                  ? "border-accent bg-accent/[0.08]"
                  : "border-border bg-surface-2"
              }`}
            >
              <div
                className={`text-[9px] font-bold uppercase tracking-[0.08em] ${
                  isToday ? "text-accent" : "text-text-3"
                }`}
              >
                {name}
              </div>
              {isRest ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-3 text-text-3">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
              ) : (
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold ${isToday ? "bg-accent text-[#0A0A0A]" : "bg-surface-3 text-accent"}`}>
                  💪
                </div>
              )}
              <div
                className={`w-full truncate text-center text-[9px] font-bold leading-tight ${
                  isRest ? "text-text-3" : isToday ? "text-accent" : "text-text-2"
                }`}
              >
                {d?.programTitle
                  ? truncate(d.programTitle, 8)
                  : "Rest"}
              </div>
            </div>
          );
        })}
      </div>
      {/* Full list προαιρετικά (compact) */}
      <div className="mt-3 space-y-1.5">
        {DAYS_SHORT.map((name, dayIdx) => {
          const d = byDay.get(dayIdx);
          const isToday = dayIdx === today;
          return (
            <div
              key={dayIdx}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] ${
                isToday
                  ? "border-accent/40 bg-accent/[0.04]"
                  : "border-border bg-surface-2"
              }`}
            >
              <span className={`w-10 flex-shrink-0 font-extrabold ${isToday ? "text-accent" : "text-text-2"}`}>
                {DAYS_SHORT[dayIdx]}
              </span>
              <span className="min-w-0 flex-1 truncate text-text-1">
                {d?.programTitle ?? "— Ξεκούραση —"}
              </span>
              {d?.planName && (
                <span className="ml-auto flex-shrink-0 truncate text-[10px] font-bold text-text-3">
                  🍽️ {truncate(d.planName, 14)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
