import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getProfile } from "../../../../lib/profile";

type Plan = {
  id: string;
  name: string;
  subtitle: string | null;
  target_kcal: number | null;
  target_kcal_min: number | null;
  target_kcal_max: number | null;
  created_at: string;
};

type Meal = {
  id: string;
  position: number;
  icon: string | null;
  name: string;
  time: string | null;
  notes: string | null;
};

type Food = {
  id: string;
  meal_id: string;
  position: number;
  emoji: string | null;
  name: string;
  qty: string | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  kcal: number | null;
};

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type !== "trainer") {
    redirect("/home");
  }

  const { data: p } = await supabase
    .from("nutrition_plans")
    .select("id, name, subtitle, target_kcal, target_kcal_min, target_kcal_max, created_at")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .maybeSingle();
  if (!p) redirect("/trainer/nutrition-plans");
  const plan = p as Plan;

  const { data: mealsData } = await supabase
    .from("nutrition_meals")
    .select("id, position, icon, name, time, notes")
    .eq("plan_id", id)
    .order("position", { ascending: true });
  const meals = (mealsData as Meal[] | null) ?? [];
  const mealIds = meals.map((m) => m.id);

  let foods: Food[] = [];
  if (mealIds.length > 0) {
    const { data: foodsData } = await supabase
      .from("nutrition_meal_foods")
      .select("id, meal_id, position, emoji, name, qty, protein_g, carbs_g, fat_g, kcal")
      .in("meal_id", mealIds)
      .order("position", { ascending: true });
    foods = (foodsData as Food[] | null) ?? [];
  }

  const foodsByMeal = new Map<string, Food[]>();
  for (const f of foods) {
    const arr = foodsByMeal.get(f.meal_id) ?? [];
    arr.push(f);
    foodsByMeal.set(f.meal_id, arr);
  }

  // Assigned clients
  const { data: assignedData } = await supabase
    .from("trainer_clients")
    .select("client_id, profile:profiles!trainer_clients_client_id_fkey(full_name)")
    .eq("trainer_id", user.id)
    .eq("assigned_nutrition_plan_id", id);
  const assigned = (assignedData as
    | { client_id: string; profile: { full_name: string | null } | null }[]
    | null) ?? [];

  // Totals
  const total = foods.reduce(
    (acc, f) => {
      acc.p += Number(f.protein_g ?? 0);
      acc.c += Number(f.carbs_g ?? 0);
      acc.f += Number(f.fat_g ?? 0);
      acc.k += Number(f.kcal ?? 0);
      return acc;
    },
    { p: 0, c: 0, f: 0, k: 0 },
  );

  const created = new Date(plan.created_at).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border bg-[#080808]">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-6 py-4">
          <Link
            href="/trainer/nutrition-plans"
            aria-label="Πίσω"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
              Trainer <span className="text-accent">·</span> Πλάνο διατροφής
            </div>
            <h1 className="truncate text-[17px] font-extrabold tracking-[-0.015em]">
              {plan.name}
            </h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-6 py-8">
        {/* Header */}
        <div className="relative mb-6 overflow-hidden rounded-[22px] border border-[#303030] bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-7">
          <div
            className="pointer-events-none absolute -right-[60px] -top-[60px] h-[280px] w-[280px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/[0.08] px-2 py-[3px] text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#22D3EE]">
              Διατροφή
            </div>
            <h2 className="text-[32px] font-extrabold leading-tight tracking-[-0.03em]">
              {plan.name}
            </h2>
            {plan.subtitle && (
              <p className="mt-2 text-sm text-text-2">{plan.subtitle}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-6 text-[12px]">
              <StatChip
                label="Σύνολο ημέρας"
                val={`${Math.round(total.k)} kcal`}
                sub={
                  plan.target_kcal_min && plan.target_kcal_max
                    ? `Στόχος: ${plan.target_kcal_min}-${plan.target_kcal_max}`
                    : plan.target_kcal
                    ? `Στόχος: ${plan.target_kcal}`
                    : null
                }
              />
              <StatChip label="Πρωτεΐνες" val={`${Math.round(total.p)}g`} />
              <StatChip label="Υδατάνθρακες" val={`${Math.round(total.c)}g`} />
              <StatChip label="Λιπαρά" val={`${Math.round(total.f)}g`} />
              <StatChip label="Γεύματα" val={String(meals.length)} />
              <StatChip label="Ανατέθηκε σε" val={`${assigned.length} ${assigned.length === 1 ? "πελάτη" : "πελάτες"}`} />
              <StatChip label="Δημιουργήθηκε" val={created} />
            </div>
          </div>
        </div>

        {/* Assigned to */}
        {assigned.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface-1">
            <div className="border-b border-border px-[22px] py-[14px] text-sm font-extrabold">
              Ανατέθηκε σε
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {assigned.map((a) => (
                <Link
                  key={a.client_id}
                  href={`/trainer/clients/${a.client_id}`}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-[12px] font-bold text-text-1 transition-colors hover:border-accent"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-accent/40 bg-surface-3 text-[10px] font-extrabold">
                    {(a.profile?.full_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  {a.profile?.full_name ?? "Πελάτης"}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Meals */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-1">
          <div className="border-b border-border px-[22px] py-[14px] text-sm font-extrabold">
            Γεύματα ({meals.length})
          </div>
          {meals.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-3">
              Κανένα γεύμα σε αυτό το πλάνο.
            </div>
          ) : (
            <div>
              {meals.map((m) => (
                <MealRow key={m.id} meal={m} foods={foodsByMeal.get(m.id) ?? []} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatChip({
  label,
  val,
  sub,
}: {
  label: string;
  val: string;
  sub?: string | null;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[16px] font-extrabold text-text-1">
        {val}
      </div>
      {sub && (
        <div className="mt-0.5 text-[10px] text-text-3">{sub}</div>
      )}
    </div>
  );
}

function MealRow({ meal, foods }: { meal: Meal; foods: Food[] }) {
  const total = foods.reduce(
    (acc, f) => {
      acc.p += Number(f.protein_g ?? 0);
      acc.c += Number(f.carbs_g ?? 0);
      acc.f += Number(f.fat_g ?? 0);
      acc.k += Number(f.kcal ?? 0);
      return acc;
    },
    { p: 0, c: 0, f: 0, k: 0 },
  );

  return (
    <div className="border-b border-border p-5 last:border-b-0">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/[0.12] text-lg">
          {meal.icon || "🍽️"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-extrabold tracking-[-0.01em]">
            {meal.name}
            {meal.time && (
              <span className="ml-2 font-mono text-[11px] font-semibold text-text-3">
                {meal.time}
              </span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-text-3">
            {Math.round(total.k)} kcal · {Math.round(total.p)}P · {Math.round(total.c)}C · {Math.round(total.f)}F
          </div>
        </div>
      </div>
      {foods.length > 0 && (
        <div className="space-y-1.5 pl-13">
          {foods.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[12px]"
            >
              <span className="text-base">{f.emoji}</span>
              <span className="min-w-0 flex-1 truncate font-bold">{f.name}</span>
              {f.qty && (
                <span className="font-mono text-[11px] text-text-3">{f.qty}</span>
              )}
              <span className="flex-shrink-0 font-mono text-[11px] text-text-2">
                {f.kcal ? Math.round(Number(f.kcal)) : "—"} kcal
              </span>
            </div>
          ))}
        </div>
      )}
      {meal.notes && (
        <div className="mt-3 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[11px] italic text-text-3">
          {meal.notes}
        </div>
      )}
    </div>
  );
}
