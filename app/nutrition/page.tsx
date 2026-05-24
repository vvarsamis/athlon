"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type FoodItem = {
  emoji: string;
  name: string;
  per: string;
  p: number;
  c: number;
  f: number;
  kcal: number;
};

const popularFoods: FoodItem[] = [
  { emoji: "🍗", name: "Κοτόπουλο στήθος", per: "100g", p: 23, c: 0, f: 1.5, kcal: 110 },
  { emoji: "🥚", name: "Αυγό (ολόκληρο)", per: "1 τεμ", p: 6, c: 0.6, f: 5, kcal: 78 },
  { emoji: "🥛", name: "Ελληνικό γιαούρτι 2%", per: "100g", p: 10, c: 4, f: 2, kcal: 80 },
  { emoji: "🌾", name: "Βρώμη", per: "100g", p: 13, c: 68, f: 7, kcal: 379 },
  { emoji: "🍚", name: "Ρύζι basmati (μαγειρ.)", per: "100g", p: 2.7, c: 28, f: 0.4, kcal: 130 },
  { emoji: "🍌", name: "Μπανάνα", per: "100g", p: 1.1, c: 23, f: 0.3, kcal: 89 },
];

const greekFoods: FoodItem[] = [
  { emoji: "🧀", name: "Φέτα", per: "100g", p: 14, c: 4, f: 21, kcal: 264 },
  { emoji: "🫒", name: "Ελιές Καλαμών", per: "100g", p: 1, c: 6, f: 15, kcal: 154 },
  { emoji: "🫙", name: "Ελαιόλαδο εξτρα παρθένο", per: "10ml", p: 0, c: 0, f: 9, kcal: 81 },
  { emoji: "🐟", name: "Σολομός", per: "100g", p: 20, c: 0, f: 13, kcal: 208 },
];

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
  notes?: string;
};

const initialMeals: Meal[] = [
  {
    uid: "meal-1",
    icon: "☀️",
    name: "Πρωινό",
    time: "08:00",
    foods: [
      { emoji: "🌾", name: "Βρώμη", qty: "80g", p: 10, c: 54, f: 6, k: 303 },
      { emoji: "🍌", name: "Μπανάνα", qty: "120g", p: 1, c: 28, f: 0, k: 107 },
      { emoji: "💪", name: "Πρωτεΐνη whey", qty: "25g", p: 21, c: 2, f: 1, k: 102 },
    ],
    notes:
      "Βρώμη βρασμένη με νερό + μισό κουτάλι του γλυκού κανέλα. Banana ώριμη. Whey ανακάτεψέ την στο τέλος για να μην αλλοιωθεί.",
  },
  {
    uid: "meal-2",
    icon: "🥜",
    name: "Σνακ",
    time: "11:00",
    foods: [
      { emoji: "🥛", name: "Ελληνικό γιαούρτι 2%", qty: "150g", p: 15, c: 6, f: 3, k: 120 },
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
      { emoji: "💪", name: "Πρωτεΐνη whey", qty: "30g", p: 25, c: 2, f: 1, k: 122 },
      { emoji: "☕", name: "Καφές μαύρος", qty: "1 τεμ", p: 0, c: 0, f: 0, k: 5 },
    ],
  },
  {
    uid: "meal-5",
    icon: "🌙",
    name: "Βραδινό",
    time: "20:00",
    foods: [
      { emoji: "🐟", name: "Σολομός", qty: "200g", p: 40, c: 0, f: 26, k: 416 },
      { emoji: "🥔", name: "Πατάτα ψητή", qty: "200g", p: 4, c: 38, f: 0, k: 170 },
      { emoji: "🥦", name: "Μπρόκολο στον ατμό", qty: "150g", p: 4, c: 10, f: 0.5, k: 51 },
      { emoji: "🧀", name: "Φέτα", qty: "30g", p: 4, c: 1, f: 6, k: 79 },
    ],
  },
];

export default function NutritionPlannerPage() {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [expandedUid, setExpandedUid] = useState<string | null>("meal-1");

  const totals = useMemo(() => {
    return meals.reduce(
      (acc, m) => {
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
  }, [meals]);

  const macroKcal = totals.p * 4 + totals.c * 4 + totals.f * 9;
  const pPct = macroKcal > 0 ? Math.round(((totals.p * 4) / macroKcal) * 100) : 0;
  const cPct = macroKcal > 0 ? Math.round(((totals.c * 4) / macroKcal) * 100) : 0;
  const fPct = Math.max(0, 100 - pPct - cPct);

  function addFoodToExpandedMeal(food: FoodItem) {
    const target = expandedUid ?? meals[0]?.uid;
    if (!target) return;
    setMeals((prev) =>
      prev.map((m) =>
        m.uid === target
          ? {
              ...m,
              foods: [
                ...m.foods,
                {
                  emoji: food.emoji,
                  name: food.name,
                  qty: food.per,
                  p: Math.round(food.p),
                  c: Math.round(food.c),
                  f: Math.round(food.f),
                  k: food.kcal,
                },
              ],
            }
          : m,
      ),
    );
  }

  function removeFood(mealUid: string, foodIdx: number) {
    setMeals((prev) =>
      prev.map((m) =>
        m.uid === mealUid
          ? { ...m, foods: m.foods.filter((_, i) => i !== foodIdx) }
          : m,
      ),
    );
  }

  function deleteMeal(uid: string) {
    setMeals((prev) => prev.filter((m) => m.uid !== uid));
    if (expandedUid === uid) setExpandedUid(null);
  }

  function addMeal() {
    const uid = `meal-${Date.now()}`;
    setMeals((prev) => [
      ...prev,
      {
        uid,
        icon: "🍴",
        name: "Νέο γεύμα",
        time: "—",
        foods: [],
      },
    ]);
    setExpandedUid(uid);
  }

  function toggleExpand(uid: string) {
    setExpandedUid((cur) => (cur === uid ? null : uid));
  }

  return (
    <div className="min-h-screen">
      <TopBar totalKcal={totals.kcal} />
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
        <Library onAdd={addFoodToExpandedMeal} expandedMealName={meals.find((m) => m.uid === expandedUid)?.name ?? null} />
        <main className="mx-auto w-full max-w-[920px] px-6 pb-12 pt-8 md:px-10">
          <PlanHeader totals={totals} pPct={pPct} cPct={cPct} fPct={fPct} />
          <div className="mt-6 flex flex-col gap-3">
            {meals.map((m) => (
              <MealCard
                key={m.uid}
                meal={m}
                expanded={expandedUid === m.uid}
                onToggle={() => toggleExpand(m.uid)}
                onDelete={() => deleteMeal(m.uid)}
                onRemoveFood={(idx) => removeFood(m.uid, idx)}
              />
            ))}
          </div>
          <AddMealButton onClick={addMeal} />
          <AiTip />
          <BottomBar />
        </main>
      </div>
    </div>
  );
}

function TopBar({ totalKcal }: { totalKcal: number }) {
  return (
    <div className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-[#080808] px-6">
      <Link
        href="/trainer"
        aria-label="Πίσω"
        className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
      >
        <svg
          width="16"
          height="16"
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
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
          Πλάνο διατροφής <span className="text-accent">·</span> Επεξεργασία
        </div>
        <h1 className="flex items-center gap-2 text-[17px] font-extrabold tracking-[-0.015em]">
          Cut Πλάνο · <span className="font-mono text-accent">{totalKcal}</span> kcal
        </h1>
      </div>
      <div className="hidden items-center gap-1.5 text-[11px] font-semibold text-text-3 lg:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_var(--success)]" />
        Αποθηκεύτηκε <strong className="text-text-2">τοπικά</strong>
      </div>
      <button
        type="button"
        className="flex items-center gap-2 rounded-[10px] bg-accent px-3.5 py-2.5 text-[13px] font-bold text-[#0A0A0A] shadow-[0_0_20px_rgba(197,255,0,0.3)] hover:shadow-[0_0_32px_rgba(197,255,0,0.5)]"
      >
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
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        Ανάθεση
      </button>
    </div>
  );
}

function Library({
  onAdd,
  expandedMealName,
}: {
  onAdd: (food: FoodItem) => void;
  expandedMealName: string | null;
}) {
  const filters = ["Όλα", "Πρωτεΐνες", "Υδατάνθρακες", "Λιπαρά", "Λαχανικά", "Φρούτα"];
  const [activeFilter, setActiveFilter] = useState(0);
  return (
    <aside className="sticky top-16 hidden max-h-[calc(100vh-64px)] overflow-y-auto border-r border-border bg-[#0C0C0C] p-5 md:block">
      <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-text-3">
        Βιβλιοθήκη τροφίμων
      </h2>
      {expandedMealName ? (
        <div className="mb-3 rounded-[10px] border border-accent/30 bg-accent/[0.06] px-3 py-2 text-[11px] font-bold text-accent">
          Προσθήκη στο: {expandedMealName}
        </div>
      ) : (
        <div className="mb-3 rounded-[10px] border border-dashed border-border bg-surface-1 px-3 py-2 text-[11px] font-bold text-text-3">
          Άνοιξε ένα γεύμα για να προσθέσεις
        </div>
      )}
      <div className="relative mb-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-3"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Αναζήτηση τροφίμου..."
          className="w-full rounded-[10px] border border-border bg-surface-1 py-2.5 pl-9 pr-3 text-[13px] text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none"
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((f, i) => (
          <button
            type="button"
            key={f}
            onClick={() => setActiveFilter(i)}
            className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${
              i === activeFilter
                ? "border-accent bg-accent/[0.12] text-accent"
                : "border-border bg-surface-1 text-text-2 hover:border-[#303030]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <FoodSection title="Τα πιο δημοφιλή" count="28" items={popularFoods} onAdd={onAdd} />
      <FoodSection title="Ελληνικά / Μεσογειακά" count="42" items={greekFoods} onAdd={onAdd} />
    </aside>
  );
}

function FoodSection({
  title,
  count,
  items,
  onAdd,
}: {
  title: string;
  count: string;
  items: FoodItem[];
  onAdd: (food: FoodItem) => void;
}) {
  return (
    <>
      <div className="mb-2 mt-3.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-text-3">
        <span>{title}</span>
        <span className="font-mono font-extrabold">{count}</span>
      </div>
      <div className="mb-2 flex flex-col gap-1.5">
        {items.map((it, i) => (
          <button
            type="button"
            key={i}
            onClick={() => onAdd(it)}
            className="group flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border border-border bg-surface-1 px-3 py-2.5 text-left transition-all hover:translate-x-0.5 hover:border-accent"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-surface-3 text-base">
              {it.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold leading-tight tracking-[-0.01em]">
                {it.name}
              </div>
              <div className="mt-0.5 font-mono text-[10px] font-semibold text-text-3">
                {it.per} · <span className="text-[#22D3EE]">{it.p}P</span>{" "}
                <span className="text-warning">{it.c}C</span>{" "}
                <span className="text-[#F87171]">{it.f}F</span> · {it.kcal}kcal
              </div>
            </div>
            <span
              aria-hidden
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[7px] border border-[#303030] bg-transparent text-text-2 group-hover:border-accent group-hover:bg-accent group-hover:text-[#0A0A0A]"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function PlanHeader({
  totals,
  pPct,
  cPct,
  fPct,
}: {
  totals: { kcal: number; p: number; c: number; f: number };
  pPct: number;
  cPct: number;
  fPct: number;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/[0.12] px-2.5 py-[5px] text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />
        Cut · Επίπεδο: Μέτριο
      </div>
      <input
        defaultValue="Cut Πλάνο · Βασίλης"
        className="mb-2 w-full border-0 bg-transparent text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-text-1 outline-none"
      />
      <div className="text-sm leading-[1.5] text-text-2">
        Διάρκεια: 4 εβδομάδες · {totals.kcal} kcal/ημέρα · συμβατό με πρωινή
        προπόνηση
      </div>
      <DailyStats totals={totals} pPct={pPct} cPct={cPct} fPct={fPct} />
    </div>
  );
}

function DailyStats({
  totals,
  pPct,
  cPct,
  fPct,
}: {
  totals: { kcal: number; p: number; c: number; f: number };
  pPct: number;
  cPct: number;
  fPct: number;
}) {
  const inTarget = totals.kcal >= 2150 && totals.kcal <= 2250;
  return (
    <div className="relative mt-[18px] overflow-hidden rounded-[18px] border border-[#303030] bg-gradient-to-br from-[#1F1F1F] to-[#111] p-5">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-[180px] w-[180px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(197,255,0,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="relative mb-[18px] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-3">
            Σύνολο ημέρας
          </div>
          <div className="mt-1 font-mono text-[42px] font-extrabold leading-none tracking-[-0.03em]">
            {totals.kcal}
            <span className="ml-1 text-base font-semibold text-text-3">kcal</span>
          </div>
          <div
            className={`mt-1.5 text-xs font-bold ${
              inTarget ? "text-success" : "text-warning"
            }`}
          >
            {inTarget ? "✓" : "!"} Στόχος: 2150-2250 kcal
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="mb-3 flex h-2.5 overflow-hidden rounded-[10px] bg-surface-3">
          <div className="h-full bg-[#22D3EE] transition-[width]" style={{ width: `${pPct}%` }} />
          <div className="h-full bg-warning transition-[width]" style={{ width: `${cPct}%` }} />
          <div className="h-full bg-[#F87171] transition-[width]" style={{ width: `${fPct}%` }} />
        </div>
        <div className="flex flex-wrap gap-6">
          <MacroLegend dotClass="bg-[#22D3EE]" label="Πρωτεΐνες" val={Math.round(totals.p)} pct={pPct} />
          <MacroLegend dotClass="bg-warning" label="Υδατάνθρακες" val={Math.round(totals.c)} pct={cPct} />
          <MacroLegend dotClass="bg-[#F87171]" label="Λιπαρά" val={Math.round(totals.f)} pct={fPct} />
        </div>
      </div>
    </div>
  );
}

function MacroLegend({
  dotClass,
  label,
  val,
  pct,
}: {
  dotClass: string;
  label: string;
  val: number;
  pct: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-[3px] ${dotClass}`} />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
          {label}
        </div>
        <div className="mt-0.5 flex items-baseline gap-1 font-mono text-sm font-extrabold">
          {val}
          <span className="font-semibold text-text-3">g</span>
          <span className="text-[11px] font-semibold text-text-3">· {pct}%</span>
        </div>
      </div>
    </div>
  );
}

function MealCard({
  meal,
  expanded,
  onToggle,
  onDelete,
  onRemoveFood,
}: {
  meal: Meal;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onRemoveFood: (idx: number) => void;
}) {
  const totals = meal.foods.reduce(
    (acc, f) => ({
      kcal: acc.kcal + f.k,
      p: acc.p + f.p,
      c: acc.c + f.c,
      f: acc.f + f.f,
    }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  );
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-surface-1 ${
        expanded
          ? "border-accent shadow-[0_0_0_1px_var(--accent-dim)]"
          : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-3.5 p-4 text-left"
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
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-2">
            <span className="font-mono font-extrabold text-accent">
              {totals.kcal} kcal
            </span>
            <span className="font-mono font-bold text-[#22D3EE]">
              {Math.round(totals.p)}g P
            </span>
            <span className="font-mono font-bold text-warning">
              {Math.round(totals.c)}g C
            </span>
            <span className="font-mono font-bold text-[#F87171]">
              {Math.round(totals.f)}g F
            </span>
            <span className="text-text-3">· {meal.foods.length} τρόφιμα</span>
          </div>
        </div>
        <div className="flex gap-1">
          <span
            aria-hidden
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border text-text-3"
          >
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
              {expanded ? (
                <polyline points="18 15 12 9 6 15" />
              ) : (
                <polyline points="6 9 12 15 18 9" />
              )}
            </svg>
          </span>
          <span
            role="button"
            aria-label="Διαγραφή"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-lg border border-border text-text-3 hover:border-danger hover:text-danger"
          >
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
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pl-[74px] pt-3.5">
          {meal.foods.length === 0 ? (
            <div className="py-4 text-center text-[13px] text-text-3">
              Άδειο γεύμα — πάτα ένα τρόφιμο στη βιβλιοθήκη για να προσθέσεις.
            </div>
          ) : (
            meal.foods.map((food, i) => (
              <div
                key={i}
                className="grid grid-cols-[24px_1fr_70px_auto_30px] items-center gap-2.5 border-b border-dashed border-border py-2.5 last:border-b-0"
              >
                <div className="text-center text-lg">{food.emoji}</div>
                <div className="text-sm font-semibold">{food.name}</div>
                <div className="text-right font-mono text-[13px] font-bold text-text-2">
                  {food.qty}
                </div>
                <div className="flex justify-end gap-3 font-mono text-[11px] font-bold">
                  <span className="text-[#22D3EE]">{food.p}P</span>
                  <span className="text-warning">{food.c}C</span>
                  <span className="text-[#F87171]">{food.f}F</span>
                  <span className="font-extrabold text-text-2">{food.k}k</span>
                </div>
                <button
                  type="button"
                  aria-label="Αφαίρεση"
                  onClick={() => onRemoveFood(i)}
                  className="bg-transparent p-1 text-text-3 hover:text-danger"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))
          )}
          {meal.notes && (
            <div className="mt-3 rounded-[10px] border border-border bg-surface-2 p-3">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
                Σημείωση γεύματος
              </div>
              <textarea
                defaultValue={meal.notes}
                className="min-h-[50px] w-full resize-y border-0 bg-transparent p-0 text-[13px] leading-[1.5] text-text-1 outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddMealButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#303030] bg-transparent p-[18px] text-[13px] font-bold text-text-2 transition-all hover:border-accent hover:bg-accent/[0.03] hover:text-accent"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Πρόσθεσε γεύμα
    </button>
  );
}

function AiTip() {
  return (
    <div
      className="mt-[18px] flex items-start gap-3 rounded-2xl border border-accent/20 p-4"
      style={{
        background:
          "linear-gradient(155deg, rgba(197,255,0,0.06) 0%, transparent 100%)",
      }}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-accent/[0.12] text-accent">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
        </svg>
      </div>
      <div>
        <div className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">
          ⚡ AI Coach
        </div>
        <div className="text-[13px] leading-[1.5] text-text-2">
          Ο <strong className="font-bold text-text-1">Βασίλης</strong> έχει
          στόχο cutting και 4-5 προπονήσεις/εβδ. Στόχος πρωτεΐνης:{" "}
          <strong className="font-bold text-text-1">~180g</strong> (2.1 g/kg)
          για να προστατέψει τη μυϊκή μάζα στο deficit.
        </div>
      </div>
    </div>
  );
}

function BottomBar() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-1 px-[22px] py-[18px]">
      <div className="flex items-center gap-2.5 text-[13px] text-text-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-3"
        >
          <rect x="6" y="2" width="12" height="20" rx="2" />
          <line x1="6" y1="6" x2="18" y2="6" />
        </svg>
        Auto-generated{" "}
        <strong className="font-bold text-text-1">
          λίστα ψωνίων για 7 ημέρες
        </strong>{" "}
        διαθέσιμη με 1 κλικ
      </div>
      <button
        type="button"
        className="flex items-center gap-2 rounded-[10px] bg-accent px-3.5 py-2.5 text-[13px] font-bold text-[#0A0A0A] shadow-[0_0_20px_rgba(197,255,0,0.3)] hover:shadow-[0_0_32px_rgba(197,255,0,0.5)]"
      >
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
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        Ανάθεση στον Βασίλη
      </button>
    </div>
  );
}
