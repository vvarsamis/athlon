import Link from "next/link";
import { PhoneFrame } from "../_components/PhoneFrame";
import { BottomNav } from "../_components/BottomNav";

const weekDays = ["Δ", "Τ", "Τ", "Π", "Π", "Σ", "Κ"];

const upcoming = [
  { day: "Σήμερα · Δευτ. 25 Μαϊ", title: "Push · Πρωτόκολλο 2", subtitle: "60' · 7 ασκήσεις", state: "today" as const, href: "/workout" },
  { day: "Αύριο · Τρ. 26 Μαϊ", title: "Pull · Πρωτόκολλο 2", subtitle: "55' · 6 ασκήσεις", state: "next" as const, href: "/workout" },
  { day: "Τετ. 27 Μαϊ", title: "Ξεκούραση", subtitle: "Active recovery προαιρετικό", state: "rest" as const, href: "#" },
  { day: "Πέμ. 28 Μαϊ", title: "Legs · Πρωτόκολλο 1", subtitle: "70' · 8 ασκήσεις", state: "next" as const, href: "/workout" },
  { day: "Παρ. 29 Μαϊ", title: "Push · Πρωτόκολλο 2", subtitle: "60' · 7 ασκήσεις", state: "next" as const, href: "/workout" },
];

export default function SchedulePage() {
  return (
    <PhoneFrame>
      <div className="relative z-[1] pb-[120px]">
        <div className="flex h-[50px] items-center justify-between px-8 pt-4 text-[13px] font-bold">
          <span>14:03</span>
          <span className="font-mono text-xs text-accent">● ENERGY 87%</span>
        </div>

        <header className="px-5 pb-4 pt-2">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
            Πρόγραμμα εβδομάδας
          </div>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.025em]">
            Μάιος 2026
          </h1>
        </header>

        <div className="mx-5 mt-2 rounded-2xl border border-border bg-surface-1 p-4">
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map((d, i) => {
              const isToday = i === 0;
              const isDone = i < 0;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 ${
                    isToday ? "bg-accent text-[#0A0A0A]" : "bg-surface-2"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.06em] ${
                      isToday ? "text-[#0A0A0A]" : "text-text-3"
                    }`}
                  >
                    {d}
                  </span>
                  <span
                    className={`font-mono text-base font-extrabold ${
                      isToday ? "text-[#0A0A0A]" : "text-text-1"
                    }`}
                  >
                    {25 + i}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isToday
                        ? "bg-[#0A0A0A]"
                        : isDone
                        ? "bg-success"
                        : "bg-surface-3"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 pt-6 pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
          Επόμενες προπονήσεις
        </div>

        <div className="mx-5 flex flex-col gap-2">
          {upcoming.map((it, i) => (
            <Link
              key={i}
              href={it.href}
              className={`flex items-center justify-between rounded-2xl border bg-surface-1 px-4 py-3.5 transition-colors hover:border-accent ${
                it.state === "today"
                  ? "border-accent shadow-[0_0_0_1px_var(--accent-dim)]"
                  : it.state === "rest"
                  ? "border-dashed border-surface-3"
                  : "border-border"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
                  {it.day}
                </div>
                <div
                  className={`mt-1 text-[15px] font-bold tracking-[-0.01em] ${
                    it.state === "today" ? "text-accent" : "text-text-1"
                  }`}
                >
                  {it.title}
                </div>
                <div className="mt-0.5 text-xs text-text-2">{it.subtitle}</div>
              </div>
              {it.state !== "rest" && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-3"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      </div>
      <BottomNav active="schedule" />
    </PhoneFrame>
  );
}
