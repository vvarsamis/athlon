"use client";

import { useMemo, useState } from "react";
import { PhoneFrame } from "../../_components/PhoneFrame";
import { BottomNav } from "../../_components/BottomNav";

type MealFood = {
  emoji: string;
  name: string;
  qty: string;
  p: number;
  c: number;
  f: number;
  k: number;
};

type Meal = {
  uid: string;
  icon: string;
  name: string;
  time: string;
  foods: MealFood[];
  note?: string;
};

const meals: Meal[] = [
  {
    uid: "meal-1",
    icon: "☀️",
    name: "Πρωινό",
    time: "08:00",
    foods: [
      { emoji: "🌾", name: "Βρώμη", qty: "80g", p: 10, c: 54, f: 6, k: 303 },
      { emoji: "🍌", name: "Μπανάνα", qty: "120g", p: 1, c: 28, f: 0, k: 107 },
      { emoji: "💪", name: "Whey", qty: "25g", p: 21, c: 2, f: 1, k: 102 },
    ],
    note: "Βρώμη βρασμένη με νερό + κανέλα. Ξεκίνα με τη whey.",
  },
  {
    uid: "meal-2",
    icon: "🥜",
    name: "Σνακ",
    time: "11:00",
    foods: [
      { emoji: "🥛", name: "Γιαούρτι 2%", qty: "150g", p: 15, c: 6, f: 3, k: 120 },
      { emoji: "🌰", name: "Αμύγδαλα", qty: "15g", p: 3, c: 2, f: 8, k: 92 },
    ],
  },
  {
    uid: "meal-3",
    icon: "🍽️",
    name: "Μεσημεριανό",
    time: "13:30",
    foods: [
      { emoji: "🍗", name: "Κοτόπουλο στήθος", qty: "200g", p: 46, c: 0, f: 3, k: 220 },
      { emoji: "🍚", name: "Ρύζι basmati", qty: "150g", p: 4, c: 42, f: 0.6, k: 195 },
      { emoji: "🥗", name: "Σαλάτα μεικτή", qty: "200g", p: 3, c: 15, f: 0, k: 65 },
      { emoji: "🫙", name: "Ελαιόλαδο", qty: "15ml", p: 0, c: 0, f: 13, k: 120 },
    ],
  },
  {
    uid: "meal-4",
    icon: "⚡",
    name: "Pre-workout",
    time: "17:00",
    foods: [
      { emoji: "🍌", name: "Μπανάνα", qty: "150g", p: 2, c: 35, f: 0, k: 134 },
      { emoji: "💪", name: "Whey", qty: "30g", p: 25, c: 2, f: 1, k: 122 },
      { emoji: "☕", name: "Καφές μαύρος", qty: "1 φλ", p: 0, c: 0, f: 0, k: 5 },
    ],
    note: "40' πριν την προπόνηση.",
  },
  {
    uid: "meal-5",
    icon: "🌙",
    name: "Βραδινό",
    time: "20:00",
    foods: [
      { emoji: "🐟", name: "Σολομός", qty: "200g", p: 40, c: 0, f: 26, k: 416 },
      { emoji: "🥔", name: "Πατάτα ψητή", qty: "200g", p: 4, c: 38, f: 0, k: 170 },
      { emoji: "🥦", name: "Μπρόκολο ατμού", qty: "150g", p: 4, c: 10, f: 0.5, k: 51 },
      { emoji: "🧀", name: "Φέτα", qty: "30g", p: 4, c: 1, f: 6, k: 79 },
    ],
  },
];

const targetKcal = { min: 2150, max: 2250 };

export default function MyNutritionPage() {
  const [eaten, setEaten] = useState<Set<string>>(new Set());

  const eatenTotals = useMemo(() => {
    return meals.reduce(
      (acc, m) => {
        if (!eaten.has(m.uid)) return acc;
        for (const f of m.foods) {
          acc.kcal += f.k;
          acc.p += f.p;
          acc.c += f.c;
          acc.f += f.f;
        }
        return acc;
      },
      { kcal: 0, p: 0, c: 0, f: 0 },
    );
  }, [eaten]);

  const totalKcal = useMemo(() => {
    return meals.reduce(
      (sum, m) => sum + m.foods.reduce((a, f) => a + f.k, 0),
      0,
    );
  }, []);

  const kcalPct = Math.min(100, Math.round((eatenTotals.kcal / totalKcal) * 100));

  function toggleEaten(uid: string) {
    setEaten((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  return (
    <PhoneFrame>
      <div className="relative z-[1] pb-[120px]">
        <StatusBar />

        <header className="px-5 pb-4 pt-2">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
            Το σημερινό σου πλάνο
          </div>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.025em]">
            Cut · 2200 kcal
          </h1>
        </header>

        <DailyProgress
          eatenKcal={eatenTotals.kcal}
          totalKcal={totalKcal}
          pct={kcalPct}
          p={Math.round(eatenTotals.p)}
          c={Math.round(eatenTotals.c)}
          f={Math.round(eatenTotals.f)}
          inTarget={
            eatenTotals.kcal >= targetKcal.min &&
            eatenTotals.kcal <= targetKcal.max
          }
        />

        <div className="mx-5 mt-6 mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
          Γεύματα ημέρας
        </div>

        <div className="mx-5 flex flex-col gap-2.5">
          {meals.map((m) => (
            <MealRow
              key={m.uid}
              meal={m}
              eaten={eaten.has(m.uid)}
              onToggle={() => toggleEaten(m.uid)}
            />
          ))}
        </div>

        <TrainerNote />
      </div>
      <BottomNav active="nutrition" />
    </PhoneFrame>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[50px] items-center justify-between px-8 pt-4 text-[13px] font-bold">
      <span>14:03</span>
      <span className="font-mono text-xs text-accent">● ENERGY 87%</span>
    </div>
  );
}

function DailyProgress({
  eatenKcal,
  totalKcal,
  pct,
  p,
  c,
  f,
  inTarget,
}: {
  eatenKcal: number;
  totalKcal: number;
  pct: number;
  p: number;
  c: number;
  f: number;
  inTarget: boolean;
}) {
  return (
    <div className="relative mx-5 overflow-hidden rounded-[18px] border border-[#303030] bg-gradient-to-br from-[#1F1F1F] to-[#111] p-5">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-[180px] w-[180px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(197,255,0,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="relative mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
          Έφαγες μέχρι τώρα
        </div>
        <div className="text-[11px] font-semibold text-text-3">
          {pct}% του πλάνου
        </div>
      </div>
      <div className="relative flex items-baseline gap-1.5 font-mono text-[36px] font-extrabold leading-none tracking-[-0.03em]">
        {eatenKcal}
        <span className="text-base font-semibold text-text-3">/ {totalKcal} kcal</span>
      </div>
      {inTarget && (
        <div className="relative mt-1 text-xs font-bold text-success">
          ✓ Στον στόχο
        </div>
      )}
      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-accent shadow-[0_0_8px_var(--accent)] transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="relative mt-4 grid grid-cols-3 gap-3">
        <MacroChip color="text-[#22D3EE]" label="Πρωτεΐνη" val={p} />
        <MacroChip color="text-warning" label="Υδατ." val={c} />
        <MacroChip color="text-[#F87171]" label="Λιπαρά" val={f} />
      </div>
    </div>
  );
}

function MacroChip({
  color,
  label,
  val,
}: {
  color: string;
  label: string;
  val: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-3 py-2">
      <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-text-3">
        {label}
      </div>
      <div
        className={`mt-0.5 flex items-baseline gap-1 font-mono text-lg font-extrabold ${color}`}
      >
        {val}
        <span className="text-[10px] font-semibold text-text-3">g</span>
      </div>
    </div>
  );
}

function MealRow({
  meal,
  eaten,
  onToggle,
}: {
  meal: Meal;
  eaten: boolean;
  onToggle: () => void;
}) {
  const totals = meal.foods.reduce(
    (acc, f) => ({
      kcal: acc.kcal + f.k,
      p: acc.p + f.p,
    }),
    { kcal: 0, p: 0 },
  );
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-surface-1 transition-all ${
        eaten
          ? "border-success/40 opacity-70"
          : "border-border"
      }`}
    >
      <div className="flex items-center gap-3 p-3.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[11px] bg-surface-2 text-[22px]">
            {meal.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-base font-extrabold tracking-[-0.01em]">
              {meal.name}
              <span className="ml-2 font-mono text-xs font-semibold text-text-3">
                {meal.time}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-2">
              <span className="font-mono font-extrabold text-accent">
                {totals.kcal} kcal
              </span>
              <span className="text-text-3">
                {meal.foods.length} τρόφιμα
              </span>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-label={eaten ? "Ξεμαρκάρισμα" : "Έφαγα"}
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-[1.5px] transition-colors ${
            eaten
              ? "border-success bg-success text-[#0A0A0A]"
              : "border-surface-3 text-text-3 hover:border-accent hover:text-accent"
          }`}
        >
          {eaten ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 pb-3.5 pt-3">
          {meal.foods.map((food, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-dashed border-border py-2 last:border-b-0"
            >
              <span className="text-lg">{food.emoji}</span>
              <span className="flex-1 text-sm font-semibold">{food.name}</span>
              <span className="font-mono text-xs font-bold text-text-2">
                {food.qty}
              </span>
              <span className="font-mono text-xs font-extrabold text-accent">
                {food.k}k
              </span>
            </div>
          ))}
          {meal.note && (
            <div className="mt-3 rounded-lg border border-accent/20 bg-accent/[0.05] p-3 text-[12px] leading-[1.5] text-text-2">
              <strong className="font-extrabold text-accent">Οδηγία:</strong>{" "}
              {meal.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TrainerNote() {
  return (
    <div
      className="mx-5 mt-6 rounded-2xl border border-accent/20 p-4"
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
          Από τον Θάνο
        </div>
      </div>
      <div className="text-[13px] leading-[1.55] text-text-2">
        Θυμήσου να πίνεις{" "}
        <strong className="font-bold text-text-1">3-3.5L νερό</strong> την
        ημέρα, ειδικά τις μέρες προπόνησης.
      </div>
    </div>
  );
}
