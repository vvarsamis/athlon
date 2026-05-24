"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PhoneFrame } from "../_components/PhoneFrame";

type SetState = "done" | "active" | "pending";

type WorkoutSet = {
  num: string;
  reps: string;
  repsUnit: string;
  weight: string;
};

const initialSets: WorkoutSet[] = [
  { num: "01", reps: "12", repsUnit: "reps", weight: "22.5" },
  { num: "02", reps: "10", repsUnit: "reps", weight: "25.0" },
  { num: "03", reps: "10", repsUnit: "target", weight: "25.0" },
];

export default function WorkoutPage() {
  const [doneIdx, setDoneIdx] = useState(2); // first 2 sets are done initially
  const [restActive, setRestActive] = useState(true);

  const states: SetState[] = initialSets.map((_, i) => {
    if (i < doneIdx) return "done";
    if (i === doneIdx) return "active";
    return "pending";
  });

  const completedCount = doneIdx;
  const totalSets = initialSets.length;
  const allDone = doneIdx >= totalSets;

  // overall workout progress: 3/7 exercises + sets within current exercise
  const overallExercise = 3; // current exercise index (1-based)
  const totalExercises = 7;
  const exerciseProgress = (completedCount / totalSets) * (1 / totalExercises);
  const progressPct = Math.min(
    100,
    Math.round(((overallExercise - 1) / totalExercises + exerciseProgress) * 100),
  );

  function completeCurrentSet() {
    if (doneIdx < totalSets) {
      setDoneIdx((i) => i + 1);
      setRestActive(true);
    }
  }

  function toggleSet(i: number) {
    if (i < doneIdx) {
      setDoneIdx(i); // uncheck this and following
    } else if (i === doneIdx) {
      completeCurrentSet();
    }
  }

  return (
    <PhoneFrame>
      <div className="relative z-[1] pb-12">
        <StatusBar />
        <Header progressPct={progressPct} />

        <div className="px-5 pt-4">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="font-mono text-[11px] font-extrabold tracking-[0.05em] text-accent">
              ΑΣΚΗΣΗ 03
            </span>
            <span className="text-text-3">·</span>
            <div className="flex gap-1.5">
              <MuscleTag>Στήθος</MuscleTag>
              <MuscleTag>Ώμοι</MuscleTag>
            </div>
          </div>
          <h2 className="mb-4 text-[28px] font-extrabold leading-[1.08] tracking-[-0.025em]">
            Πιέσεις με αλτήρες
            <br />
            σε επικλινή πάγκο
          </h2>
        </div>

        <ExerciseVisual />

        <SetsList sets={initialSets} states={states} onToggle={toggleSet} />

        <CompleteButton
          allDone={allDone}
          onComplete={completeCurrentSet}
          completedCount={completedCount}
          totalSets={totalSets}
        />

        <TrainerNote />

        {restActive && doneIdx > 0 && !allDone && (
          <RestTimer onSkip={() => setRestActive(false)} />
        )}

        <NextExercise />
      </div>
    </PhoneFrame>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[50px] items-center justify-between px-8 pt-4 text-[13px] font-bold">
      <span>14:08</span>
      <span className="font-mono text-xs text-accent">● ENERGY 87%</span>
    </div>
  );
}

function Header({ progressPct }: { progressPct: number }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 pb-3.5 pt-2">
      <Link
        href="/home"
        aria-label="Πίσω"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[13px] border border-border bg-surface-1 text-text-1"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
      <div className="flex flex-1 flex-col items-center gap-1.5">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-3">
          PUSH · ΠΡΩΤΟΚΟΛΛΟ 2 · 3/7
        </div>
        <div className="h-1 w-full overflow-hidden rounded-sm bg-surface-3">
          <div
            className="h-full rounded-sm bg-accent shadow-[0_0_8px_var(--accent)] transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        aria-label="Επιλογές"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[13px] border border-border bg-surface-1 text-text-1"
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
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </button>
    </div>
  );
}

function MuscleTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-surface-2 px-2 py-[3px] text-[10px] font-semibold tracking-[0.03em] text-text-2">
      {children}
    </span>
  );
}

function ExerciseVisual() {
  return (
    <div className="relative mx-5 flex h-[280px] items-center justify-center overflow-hidden rounded-[20px] border border-border bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(197,255,0,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="absolute left-3 top-3 z-[2] flex items-center gap-1.5 rounded-full border border-border bg-black/65 px-2.5 py-[5px] text-[9px] font-extrabold uppercase tracking-[0.12em] backdrop-blur-md">
        <span
          className="h-1.5 w-1.5 rounded-full bg-danger shadow-[0_0_6px_var(--danger)]"
          style={{ animation: "accent-pulse 1.4s ease-in-out infinite" }}
        />
        Demo
      </div>

      <div className="relative z-[1] h-60 w-60">
        <Image
          src="https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg"
          alt="Incline dumbbell press — start"
          fill
          unoptimized
          sizes="240px"
          className="rounded-2xl bg-white object-contain"
          style={{
            filter: "contrast(1.05) brightness(1.05)",
            animation: "frame-cycle 1.6s steps(1) infinite",
            animationDelay: "0s",
          }}
        />
        <Image
          src="https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/1.jpg"
          alt="Incline dumbbell press — end"
          fill
          unoptimized
          sizes="240px"
          className="rounded-2xl bg-white object-contain"
          style={{
            filter: "contrast(1.05) brightness(1.05)",
            animation: "frame-cycle 1.6s steps(1) infinite",
            animationDelay: "0.8s",
          }}
        />
      </div>

      <div className="absolute bottom-3 left-3 z-[2] flex items-center gap-[7px] rounded-full border border-accent/25 bg-black/65 px-[11px] py-[7px] text-[9px] font-extrabold uppercase tracking-[0.12em] text-accent backdrop-blur-md">
        <span
          className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]"
          style={{ animation: "accent-pulse 1.8s ease-in-out infinite" }}
        />
        Ενεργοί · Στήθος · Ώμοι · Τρικέφαλα
      </div>

      <div className="absolute bottom-3 right-3 z-[2] flex gap-1.5">
        <VisualBtn label="Αναπαραγωγή GIF">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
        </VisualBtn>
        <VisualBtn label="Βίντεο τεχνικής">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
        </VisualBtn>
      </div>
    </div>
  );
}

function VisualBtn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-black/60 text-text-1 backdrop-blur-md"
    >
      {children}
    </button>
  );
}

function SetsList({
  sets,
  states,
  onToggle,
}: {
  sets: WorkoutSet[];
  states: SetState[];
  onToggle: (i: number) => void;
}) {
  return (
    <div className="px-5 pb-4 pt-6">
      <div className="grid grid-cols-[36px_1fr_1fr_60px] gap-2 px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
        <span>ΣΕΤ</span>
        <span>ΕΠΑΝ.</span>
        <span>ΒΑΡΟΣ</span>
        <span />
      </div>
      {sets.map((s, i) => (
        <SetRow key={s.num} set={s} state={states[i]} onClick={() => onToggle(i)} />
      ))}
    </div>
  );
}

function SetRow({
  set,
  state,
  onClick,
}: {
  set: WorkoutSet;
  state: SetState;
  onClick: () => void;
}) {
  const base =
    "mb-2 grid grid-cols-[36px_1fr_1fr_60px] items-center gap-2 rounded-2xl border px-3 py-3.5 transition-all cursor-pointer";
  const variant =
    state === "done"
      ? "border-border bg-surface-1 opacity-60"
      : state === "active"
      ? "border-accent bg-surface-2 shadow-[0_0_0_1px_var(--accent),0_0_24px_rgba(197,255,0,0.15)]"
      : "border-border bg-surface-1";
  const numColor = state === "active" ? "text-accent" : "text-text-2";
  const valColor =
    state === "active"
      ? "text-accent"
      : state === "done"
      ? "text-text-2"
      : "text-text-1";
  return (
    <button type="button" onClick={onClick} className={`w-full text-left ${base} ${variant}`}>
      <div className={`font-mono text-sm font-extrabold ${numColor}`}>
        {set.num}
      </div>
      <div className={`font-mono text-base font-bold ${valColor}`}>
        {set.reps}
        <span className="ml-[3px] text-[11px] font-semibold text-text-3">
          {set.repsUnit}
        </span>
      </div>
      <div className={`font-mono text-base font-bold ${valColor}`}>
        {set.weight}
        <span className="ml-[3px] text-[11px] font-semibold text-text-3">
          kg
        </span>
      </div>
      <div
        className={`ml-auto flex h-7 w-7 items-center justify-center rounded-lg border-[1.5px] ${
          state === "done"
            ? "border-accent bg-accent text-[#0A0A0A]"
            : state === "active"
            ? "border-accent"
            : "border-surface-3"
        }`}
      >
        {state === "done" && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </button>
  );
}

function CompleteButton({
  allDone,
  onComplete,
  completedCount,
  totalSets,
}: {
  allDone: boolean;
  onComplete: () => void;
  completedCount: number;
  totalSets: number;
}) {
  if (allDone) {
    return (
      <Link
        href="/home"
        className="mx-5 mt-4 flex w-[calc(100%-40px)] items-center justify-center gap-2.5 rounded-2xl border border-accent bg-accent/[0.12] p-4 text-[13px] font-extrabold uppercase tracking-[0.06em] text-accent"
      >
        Άσκηση ολοκληρώθηκε ✓ Συνέχεια
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onComplete}
      className="mx-5 mt-4 flex w-[calc(100%-40px)] items-center justify-center gap-2.5 rounded-2xl bg-accent p-4 text-[13px] font-extrabold uppercase tracking-[0.06em] text-[#0A0A0A] shadow-[0_0_36px_rgba(197,255,0,0.35)] hover:shadow-[0_0_50px_rgba(197,255,0,0.55)]"
    >
      Ολοκλήρωση σετ {completedCount + 1}/{totalSets}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
  );
}

function TrainerNote() {
  return (
    <div
      className="mx-5 mt-4 rounded-2xl border border-accent/20 p-4"
      style={{
        background:
          "linear-gradient(155deg, rgba(197,255,0,0.06) 0%, transparent 100%)",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FFB800] text-[10px] font-extrabold text-[#0A0A0A]">
          ΘΑ
        </div>
        <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">
          Σημείωση Θάνου
        </div>
      </div>
      <div className="text-[13px] leading-[1.55] text-text-2">
        Στο 3ο σετ, αφού τελειώσεις τις επαναλήψεις, βγάλε{" "}
        <strong className="font-bold text-text-1">10 μισές κάτω</strong> και{" "}
        <strong className="font-bold text-text-1">10 μισές πάνω</strong>. Drop
        set στο τέλος.
      </div>
    </div>
  );
}

function RestTimer({ onSkip }: { onSkip: () => void }) {
  const [seconds, setSeconds] = useState(120);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="mx-5 mt-4 flex items-center justify-between rounded-2xl border border-[#2E2E2E] bg-gradient-to-br from-[#1F1F1F] to-[#111] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-border bg-surface-2 text-accent">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
            Ξεκούραση
          </div>
          <div className="mt-0.5 font-mono text-[22px] font-extrabold tracking-[-0.02em]">
            {mm}:{ss}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="rounded-[10px] border border-border bg-surface-2 px-4 py-2.5 text-xs font-bold text-text-1 hover:border-accent hover:text-accent"
      >
        Παράλειψη
      </button>
    </div>
  );
}

function NextExercise() {
  return (
    <div className="mx-5 mb-8 mt-4 flex items-center justify-between rounded-2xl border border-dashed border-surface-3 bg-surface-1 px-[18px] py-3.5">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
          Επόμενη άσκηση
        </div>
        <div className="mt-[3px] text-sm font-bold tracking-[-0.01em]">
          04. Πιέσεις ώμων με αλτήρες
        </div>
      </div>
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
    </div>
  );
}
