import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getProfile } from "../../../lib/profile";

type PlanRow = {
  id: string;
  name: string;
  subtitle: string | null;
  target_kcal: number | null;
  target_kcal_min: number | null;
  target_kcal_max: number | null;
  created_at: string;
};

export default async function TrainerNutritionPlansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type !== "trainer") {
    redirect("/home");
  }

  const { data: plans } = await supabase
    .from("nutrition_plans")
    .select(
      "id, name, subtitle, target_kcal, target_kcal_min, target_kcal_max, created_at",
    )
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (plans as PlanRow[] | null) ?? [];

  // Meal count per plan + assignment count
  const planIds = rows.map((r) => r.id);
  const mealCounts = new Map<string, number>();
  const assignmentCounts = new Map<string, number>();
  if (planIds.length > 0) {
    const [{ data: meals }, { data: assignments }] = await Promise.all([
      supabase
        .from("nutrition_meals")
        .select("plan_id")
        .in("plan_id", planIds),
      supabase
        .from("trainer_clients")
        .select("assigned_nutrition_plan_id")
        .in("assigned_nutrition_plan_id", planIds),
    ]);
    for (const m of (meals as { plan_id: string }[] | null) ?? []) {
      mealCounts.set(m.plan_id, (mealCounts.get(m.plan_id) ?? 0) + 1);
    }
    for (const a of (assignments as { assigned_nutrition_plan_id: string | null }[] | null) ?? []) {
      if (a.assigned_nutrition_plan_id) {
        assignmentCounts.set(
          a.assigned_nutrition_plan_id,
          (assignmentCounts.get(a.assigned_nutrition_plan_id) ?? 0) + 1,
        );
      }
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border bg-[#080808]">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-6 py-4">
          <Link
            href="/trainer"
            aria-label="Πίσω"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
              Trainer <span className="text-accent">·</span> Διατροφή
            </div>
            <h1 className="text-[17px] font-extrabold tracking-[-0.015em]">
              Τα πλάνα σου ({rows.length})
            </h1>
          </div>
          <Link
            href="/nutrition"
            className="flex items-center gap-2 rounded-[10px] bg-accent px-3.5 py-2.5 text-[13px] font-bold text-[#0A0A0A] shadow-[0_0_20px_rgba(197,255,0,0.3)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Νέο πλάνο
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-6 py-8">
        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => (
              <Link key={p.id} href={`/trainer/nutrition-plans/${p.id}`} className="block transition-transform hover:-translate-y-0.5">
                <PlanCard
                  plan={p}
                  mealCount={mealCounts.get(p.id) ?? 0}
                  assignedTo={assignmentCounts.get(p.id) ?? 0}
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-1 p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/[0.12] text-accent">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-extrabold tracking-[-0.02em]">
        Κανένα πλάνο διατροφής ακόμα
      </h2>
      <p className="mx-auto max-w-md text-sm text-text-2">
        Φτιάξε το πρώτο σου διατροφικό πλάνο. Θα σωθεί εδώ και θα μπορείς να το
        αναθέτεις σε πελάτες.
      </p>
      <Link
        href="/nutrition"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-[#0A0A0A]"
      >
        + Φτιάξε πλάνο
      </Link>
    </div>
  );
}

function PlanCard({
  plan,
  mealCount,
  assignedTo,
}: {
  plan: PlanRow;
  mealCount: number;
  assignedTo: number;
}) {
  const created = new Date(plan.created_at).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
  });
  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-5">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-[100px] w-[100px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/[0.08] px-2 py-[3px] text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#22D3EE]">
          Διατροφή
        </div>
        <div className="text-[18px] font-extrabold leading-tight tracking-[-0.02em]">
          {plan.name}
        </div>
        {plan.subtitle && (
          <div className="mt-1 line-clamp-2 text-xs text-text-2">
            {plan.subtitle}
          </div>
        )}
      </div>
      <div className="relative flex flex-wrap gap-4 text-[11px]">
        {plan.target_kcal && (
          <span className="text-text-2">
            <span className="font-mono font-extrabold text-text-1">
              {plan.target_kcal}
            </span>{" "}
            kcal
            {plan.target_kcal_min && plan.target_kcal_max && (
              <span className="ml-1 text-text-3">
                ({plan.target_kcal_min}-{plan.target_kcal_max})
              </span>
            )}
          </span>
        )}
        {mealCount > 0 && (
          <span className="text-text-2">
            <span className="font-mono font-extrabold text-text-1">
              {mealCount}
            </span>{" "}
            {mealCount === 1 ? "γεύμα" : "γεύματα"}
          </span>
        )}
        <span className="text-text-3">· {created}</span>
      </div>
      <div className="relative flex items-center justify-between border-t border-border pt-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
          {assignedTo === 0
            ? "Χωρίς ανάθεση"
            : `Ανατέθηκε σε ${assignedTo} ${assignedTo === 1 ? "πελάτη" : "πελάτες"}`}
        </div>
      </div>
    </div>
  );
}
