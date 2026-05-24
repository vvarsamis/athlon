import Image from "next/image";
import Link from "next/link";

type FoodItem = {
  emoji: string;
  name: string;
  per: string;
  p: string;
  c: string;
  f: string;
  kcal: string;
};

const popularFoods: FoodItem[] = [
  { emoji: "🍗", name: "Κοτόπουλο στήθος", per: "100g", p: "23P", c: "0C", f: "1.5F", kcal: "110" },
  { emoji: "🥚", name: "Αυγό (ολόκληρο)", per: "1 τεμ", p: "6P", c: "0.6C", f: "5F", kcal: "78" },
  { emoji: "🥛", name: "Ελληνικό γιαούρτι 2%", per: "100g", p: "10P", c: "4C", f: "2F", kcal: "80" },
  { emoji: "🌾", name: "Βρώμη", per: "100g", p: "13P", c: "68C", f: "7F", kcal: "379" },
  { emoji: "🍚", name: "Ρύζι basmati (μαγειρ.)", per: "100g", p: "2.7P", c: "28C", f: "0.4F", kcal: "130" },
  { emoji: "🍌", name: "Μπανάνα", per: "100g", p: "1.1P", c: "23C", f: "0.3F", kcal: "89" },
];

const greekFoods: FoodItem[] = [
  { emoji: "🧀", name: "Φέτα", per: "100g", p: "14P", c: "4C", f: "21F", kcal: "264" },
  { emoji: "🫒", name: "Ελιές Καλαμών", per: "100g", p: "1P", c: "6C", f: "15F", kcal: "154" },
  { emoji: "🫙", name: "Ελαιόλαδο εξτρα παρθένο", per: "10ml", p: "0P", c: "0C", f: "9F", kcal: "81" },
  { emoji: "🐟", name: "Σολομός", per: "100g", p: "20P", c: "0C", f: "13F", kcal: "208" },
];

type MealFood = {
  emoji: string;
  name: string;
  qty: string;
  p: string;
  c: string;
  f: string;
  k: string;
};

type Meal = {
  icon: string;
  name: string;
  time: string;
  kcal: string;
  p: string;
  c: string;
  f: string;
  foodCount?: number;
  expanded?: boolean;
  foods?: MealFood[];
  notes?: string;
};

const meals: Meal[] = [
  {
    icon: "☀️",
    name: "Πρωινό",
    time: "08:00",
    kcal: "480",
    p: "32g P",
    c: "52g C",
    f: "12g F",
    expanded: true,
    foods: [
      { emoji: "🌾", name: "Βρώμη", qty: "80g", p: "10P", c: "54C", f: "6F", k: "303k" },
      { emoji: "🍌", name: "Μπανάνα", qty: "120g", p: "1P", c: "28C", f: "0F", k: "107k" },
      { emoji: "💪", name: "Πρωτεΐνη whey", qty: "25g", p: "21P", c: "2C", f: "1F", k: "102k" },
    ],
    notes:
      "Βρώμη βρασμένη με νερό + μισό κουτάλι του γλυκού κανέλα. Banana ώριμη. Whey ανακάτεψέ την στο τέλος για να μην αλλοιωθεί.",
  },
  {
    icon: "🥜",
    name: "Σνακ",
    time: "11:00",
    kcal: "220",
    p: "15g P",
    c: "18g C",
    f: "8g F",
    foodCount: 3,
  },
  {
    icon: "🍽️",
    name: "Μεσημεριανό",
    time: "13:30",
    kcal: "620",
    p: "45g P",
    c: "60g C",
    f: "15g F",
    foodCount: 4,
  },
  {
    icon: "⚡",
    name: "Pre-workout",
    time: "17:00",
    kcal: "280",
    p: "28g P",
    c: "35g C",
    f: "3g F",
    foodCount: 3,
  },
  {
    icon: "🌙",
    name: "Βραδινό",
    time: "20:00",
    kcal: "600",
    p: "45g P",
    c: "55g C",
    f: "35g F",
    foodCount: 4,
  },
];

export default function NutritionPlannerPage() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
        <Library />
        <main className="mx-auto w-full max-w-[920px] px-6 pb-12 pt-8 md:px-10">
          <PlanHeader />
          <div className="mt-6 flex flex-col gap-3">
            {meals.map((m) => (
              <MealCard key={m.name + m.time} meal={m} />
            ))}
          </div>
          <AddMealButton />
          <AiTip />
          <BottomBar />
        </main>
      </div>
    </div>
  );
}

function TopBar() {
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
          Cut Πλάνο · 2200 kcal
          <button
            type="button"
            aria-label="Μετονομασία"
            className="text-text-3 hover:text-accent"
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </h1>
      </div>
      <div className="hidden items-center gap-1.5 text-[11px] font-semibold text-text-3 lg:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_var(--success)]" />
        Αποθηκεύτηκε <strong className="text-text-2">πριν 8 δευτ.</strong>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-[10px] bg-transparent px-3.5 py-2.5 text-[13px] font-bold text-text-2 hover:bg-surface-1 hover:text-text-1 md:flex"
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
            <rect x="6" y="2" width="12" height="20" rx="2" />
            <line x1="6" y1="6" x2="18" y2="6" />
          </svg>
          Λίστα ψωνίων
        </button>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-[10px] border border-border bg-surface-1 px-3.5 py-2.5 text-[13px] font-bold text-text-1 hover:border-[#303030] lg:flex"
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
          </svg>
          Αποθήκευση ως template
        </button>
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
    </div>
  );
}

function Library() {
  const filters = ["Όλα", "Πρωτεΐνες", "Υδατάνθρακες", "Λιπαρά", "Λαχανικά", "Φρούτα"];
  return (
    <aside className="sticky top-16 hidden max-h-[calc(100vh-64px)] overflow-y-auto border-r border-border bg-[#0C0C0C] p-5 md:block">
      <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-text-3">
        Βιβλιοθήκη τροφίμων
      </h2>
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
          <span
            key={f}
            className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${
              i === 0
                ? "border-accent bg-accent/[0.12] text-accent"
                : "border-border bg-surface-1 text-text-2 hover:border-[#303030]"
            }`}
          >
            {f}
          </span>
        ))}
      </div>

      <FoodSection title="Τα πιο δημοφιλή" count="28" items={popularFoods} />
      <FoodSection title="Ελληνικά / Μεσογειακά" count="42" items={greekFoods} />
    </aside>
  );
}

function FoodSection({
  title,
  count,
  items,
}: {
  title: string;
  count: string;
  items: FoodItem[];
}) {
  return (
    <>
      <div className="mb-2 mt-3.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-text-3">
        <span>{title}</span>
        <span className="font-mono font-extrabold">{count}</span>
      </div>
      <div className="mb-2 flex flex-col gap-1.5">
        {items.map((it, i) => (
          <div
            key={i}
            className="group flex cursor-grab items-center gap-2.5 rounded-[10px] border border-border bg-surface-1 px-3 py-2.5 transition-all hover:translate-x-0.5 hover:border-accent"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-surface-3 text-base">
              {it.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold leading-tight tracking-[-0.01em]">
                {it.name}
              </div>
              <div className="mt-0.5 font-mono text-[10px] font-semibold text-text-3">
                {it.per} · <span className="text-[#22D3EE]">{it.p}</span>{" "}
                <span className="text-warning">{it.c}</span>{" "}
                <span className="text-[#F87171]">{it.f}</span> · {it.kcal}kcal
              </div>
            </div>
            <button
              type="button"
              aria-label="Πρόσθεσε"
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
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function PlanHeader() {
  return (
    <div className="mb-6">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/[0.12] px-2.5 py-[5px] text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />
        Cut · Επίπεδο: Μέτριο
      </div>
      <input
        defaultValue="Cut Πλάνο · 2200 kcal"
        className="mb-2 w-full border-0 bg-transparent text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-text-1 outline-none"
      />
      <div className="text-sm leading-[1.5] text-text-2">
        Διάρκεια: 4 εβδομάδες · 5 γεύματα/ημέρα · συμβατό με πρωινή προπόνηση
      </div>
      <DailyStats />
    </div>
  );
}

function DailyStats() {
  const avatars = [
    "https://randomuser.me/api/portraits/men/45.jpg",
    "https://randomuser.me/api/portraits/men/55.jpg",
  ];
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
            2200<span className="ml-1 text-base font-semibold text-text-3">kcal</span>
          </div>
          <div className="mt-1.5 text-xs font-bold text-success">
            ✓ Στον στόχο: 2150-2250 kcal
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
            Ανατεθειμένο σε
          </span>
          {avatars.map((a, i) => (
            <Image
              key={a}
              src={a}
              alt=""
              width={30}
              height={30}
              className={`h-[30px] w-[30px] rounded-full border-[1.5px] border-accent object-cover ${
                i > 0 ? "-ml-2" : ""
              }`}
            />
          ))}
          <div className="-ml-2 flex h-[30px] w-[30px] items-center justify-center rounded-full border-[1.5px] border-[#303030] bg-surface-3 font-mono text-[10px] font-extrabold text-text-2">
            +2
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="mb-3 flex h-2.5 overflow-hidden rounded-[10px] bg-surface-3">
          <div className="h-full bg-[#22D3EE]" style={{ width: "30%" }} />
          <div className="h-full bg-warning" style={{ width: "40%" }} />
          <div className="h-full bg-[#F87171]" style={{ width: "30%" }} />
        </div>
        <div className="flex flex-wrap gap-6">
          <MacroLegend dotClass="bg-[#22D3EE]" label="Πρωτεΐνες" val="165" pct="30" />
          <MacroLegend dotClass="bg-warning" label="Υδατάνθρακες" val="220" pct="40" />
          <MacroLegend dotClass="bg-[#F87171]" label="Λιπαρά" val="73" pct="30" />
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
  val: string;
  pct: string;
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

function MealCard({ meal }: { meal: Meal }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-surface-1 ${
        meal.expanded
          ? "border-accent shadow-[0_0_0_1px_var(--accent-dim)]"
          : "border-border"
      }`}
    >
      <div className="flex cursor-pointer items-center gap-3.5 p-4">
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
              {meal.kcal} kcal
            </span>
            <span className="font-mono font-bold text-[#22D3EE]">{meal.p}</span>
            <span className="font-mono font-bold text-warning">{meal.c}</span>
            <span className="font-mono font-bold text-[#F87171]">{meal.f}</span>
            {meal.foodCount && (
              <span className="text-text-3">· {meal.foodCount} τρόφιμα</span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={meal.expanded ? "Σύμπτυξη" : "Επέκταση"}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border text-text-3 hover:border-[#303030] hover:text-text-1"
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
              {meal.expanded ? (
                <polyline points="18 15 12 9 6 15" />
              ) : (
                <polyline points="6 9 12 15 18 9" />
              )}
            </svg>
          </button>
          <button
            type="button"
            aria-label="Διαγραφή"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border text-text-3 hover:border-danger hover:text-danger"
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
          </button>
        </div>
      </div>

      {meal.expanded && meal.foods && (
        <div className="border-t border-border px-4 pb-4 pl-[74px] pt-3.5">
          {meal.foods.map((food, i) => (
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
                <span className="text-[#22D3EE]">{food.p}</span>
                <span className="text-warning">{food.c}</span>
                <span className="text-[#F87171]">{food.f}</span>
                <span className="font-extrabold text-text-2">{food.k}</span>
              </div>
              <button
                type="button"
                aria-label="Αφαίρεση"
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
          ))}
          <div className="mt-2 flex cursor-pointer items-center gap-2 border-t border-dashed border-border pt-3 text-xs font-semibold text-text-3 hover:text-accent">
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Πρόσθεσε τρόφιμο · σύρε από τη βιβλιοθήκη ή κλικ εδώ
          </div>
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

function AddMealButton() {
  return (
    <button
      type="button"
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
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
        </svg>
      </div>
      <div>
        <div className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">
          ⚡ AI Coach
        </div>
        <div className="text-[13px] leading-[1.5] text-text-2">
          Ο <strong className="font-bold text-text-1">Βασίλης</strong> έχει
          στόχο cutting και κάνει 4-5 προπονήσεις την εβδομάδα. Με βάση το
          βάρος του (84 kg) και την προπόνηση δύναμης, σου προτείνω να
          ανεβάσεις την{" "}
          <strong className="font-bold text-text-1">πρωτεΐνη στα 180g</strong>{" "}
          (2.1 g/kg) για να προστατέψει τη μυϊκή μάζα στο deficit. Διαφορά: +60
          kcal που μπορούν να αφαιρεθούν από τα fats.
        </div>
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-accent bg-accent px-2.5 py-1.5 text-[11px] font-bold text-[#0A0A0A]"
          >
            Εφάρμοσε τη σύσταση
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] font-bold text-text-1"
          >
            Άγνοια
          </button>
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
