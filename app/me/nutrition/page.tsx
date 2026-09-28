import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getProfile } from "../../../lib/profile";
import NutritionView, { type Meal, type MealFood } from "./NutritionView";

type MealRow = {
  id: string;
  position: number;
  icon: string | null;
  name: string;
  time: string | null;
  notes: string | null;
};

type FoodRow = {
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

export default async function MyNutritionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Trainers shouldn't be here — they use /nutrition builder
  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type === "trainer") {
    redirect("/trainer");
  }

  // Resolve today's meal plan: weekly_schedule πρώτο, μετά fallback στο assigned_nutrition_plan_id
  const today = (new Date().getDay() + 6) % 7; // Δευτέρα = 0
  const [linkRes, scheduleRes] = await Promise.all([
    supabase
      .from("trainer_clients")
      .select("assigned_nutrition_plan_id, trainer_id")
      .eq("client_id", user.id)
      .maybeSingle(),
    supabase
      .from("client_weekly_schedule")
      .select("nutrition_plan_id")
      .eq("client_id", user.id)
      .eq("day_of_week", today)
      .maybeSingle(),
  ]);
  const link = linkRes.data;
  const trainerId = (link as { trainer_id: string | null } | null)?.trainer_id ?? null;

  let meals: Meal[] = [];
  let planName: string | undefined;
  let targetMin: number | null = null;
  let targetMax: number | null = null;

  const planId =
    (scheduleRes.data as { nutrition_plan_id: string | null } | null)?.nutrition_plan_id ??
    (link as { assigned_nutrition_plan_id: string | null } | null)?.assigned_nutrition_plan_id ??
    null;
  if (planId) {
    const { data: plan } = await supabase
      .from("nutrition_plans")
      .select("name, target_kcal_min, target_kcal_max")
      .eq("id", planId)
      .single();
    if (plan) {
      planName = plan.name;
      targetMin = plan.target_kcal_min;
      targetMax = plan.target_kcal_max;
    }

    const { data: mealRows } = await supabase
      .from("nutrition_meals")
      .select("id, position, icon, name, time, notes")
      .eq("plan_id", planId)
      .order("position");

    const { data: foodRows } = await supabase
      .from("nutrition_meal_foods")
      .select("id, meal_id, position, emoji, name, qty, protein_g, carbs_g, fat_g, kcal")
      .in(
        "meal_id",
        ((mealRows as MealRow[] | null) ?? []).map((m) => m.id),
      )
      .order("position");

    const foodsByMeal = new Map<string, MealFood[]>();
    for (const f of (foodRows as FoodRow[] | null) ?? []) {
      const list = foodsByMeal.get(f.meal_id) ?? [];
      list.push({
        emoji: f.emoji ?? "🍽️",
        name: f.name,
        qty: f.qty ?? "",
        p: Number(f.protein_g ?? 0),
        c: Number(f.carbs_g ?? 0),
        f: Number(f.fat_g ?? 0),
        k: Number(f.kcal ?? 0),
      });
      foodsByMeal.set(f.meal_id, list);
    }

    meals = ((mealRows as MealRow[] | null) ?? []).map((m) => ({
      uid: m.id,
      icon: m.icon ?? "🍽️",
      name: m.name,
      time: m.time ?? "—",
      foods: foodsByMeal.get(m.id) ?? [],
      note: m.notes ?? undefined,
    }));
  }

  // Fetch weekly nutrition schedule για το ημερολόγιο διατροφής
  const { data: weekRows } = await supabase
    .from("client_weekly_schedule")
    .select("day_of_week, plan:nutrition_plans(name, target_kcal)")
    .eq("client_id", user.id);
  const weeklyPlans = ((weekRows as unknown as Array<{
    day_of_week: number;
    plan: { name: string; target_kcal: number | null } | null;
  }>) ?? []).map((r) => ({
    day: r.day_of_week,
    planName: r.plan?.name ?? null,
    targetKcal: r.plan?.target_kcal ?? null,
  }));

  const nowDate = new Date();
  const todayIso = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(nowDate.getDate()).padStart(2, "0")}`;

  return (
    <NutritionView
      meals={meals}
      planName={planName}
      targetMin={targetMin}
      targetMax={targetMax}
      userId={user.id}
      trainerId={trainerId}
      weeklyPlans={weeklyPlans}
      todayIso={todayIso}
    />
  );
}
