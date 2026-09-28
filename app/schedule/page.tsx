import { redirect } from "next/navigation";
import { PhoneFrame } from "../_components/PhoneFrame";
import { BottomNav } from "../_components/BottomNav";
import {
  CalendarView,
  type AssignedProgram,
  type CalendarSession,
} from "../_components/CalendarView";
import { WeeklyPlanStrip } from "../_components/WeeklyPlanStrip";
import { createClient } from "../../lib/supabase/server";
import { getProfile } from "../../lib/profile";

export default async function SchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type === "trainer") {
    redirect("/trainer");
  }

  // Sessions τελευταίων 3 μηνών (για να γεμίσει το grid + το ιστορικό)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const { data: sessionsData } = await supabase
    .from("workout_sessions")
    .select("id, program_title, program_name, completed_at, duration_sec")
    .eq("client_id", user.id)
    .not("completed_at", "is", null)
    .gte("completed_at", threeMonthsAgo.toISOString())
    .order("completed_at", { ascending: false });
  const sessions = (sessionsData as CalendarSession[] | null) ?? [];

  // Assigned program
  const { data: link } = await supabase
    .from("trainer_clients")
    .select(
      "assigned_program_id",
    )
    .eq("client_id", user.id)
    .maybeSingle();

  // Resolve today's program: weekly πρώτο, μετά fallback
  const nowDate = new Date();
  const today = (nowDate.getDay() + 6) % 7; // Δευτέρα = 0
  const { data: scheduleRow } = await supabase
    .from("client_weekly_schedule")
    .select("program_id")
    .eq("client_id", user.id)
    .eq("day_of_week", today)
    .maybeSingle();
  const todayProgramId =
    (scheduleRow as { program_id: string | null } | null)?.program_id ??
    (link as { assigned_program_id: string | null } | null)?.assigned_program_id ??
    null;

  let assignedProgram: AssignedProgram = null;
  if (todayProgramId) {
    const { data: programBasic } = await supabase
      .from("programs")
      .select("id, name, title, estimated_duration_min, estimated_kcal")
      .eq("id", todayProgramId)
      .maybeSingle();
    if (programBasic) {
      const { count } = await supabase
        .from("program_exercises")
        .select("id", { count: "exact", head: true })
        .eq("program_id", (programBasic as { id: string }).id);
      const p = programBasic as {
        id: string;
        name: string;
        title: string;
        estimated_duration_min: number | null;
        estimated_kcal: number | null;
      };
      assignedProgram = {
        id: p.id,
        name: p.name,
        title: p.title,
        duration_min: p.estimated_duration_min,
        kcal: p.estimated_kcal,
        exerciseCount: count ?? 0,
      };
    }
  }

  const todayIso = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(nowDate.getDate()).padStart(2, "0")}`;

  // Fetch όλη την εβδομάδα για preview strip
  const { data: weekRows } = await supabase
    .from("client_weekly_schedule")
    .select(
      "day_of_week, program:programs(title), plan:nutrition_plans(name)",
    )
    .eq("client_id", user.id);
  const weekDays = ((weekRows as unknown as Array<{
    day_of_week: number;
    program: { title: string } | null;
    plan: { name: string } | null;
  }>) ?? []).map((r) => ({
    day: r.day_of_week,
    programTitle: r.program?.title ?? null,
    planName: r.plan?.name ?? null,
  }));

  return (
    <PhoneFrame>
      <div className="relative z-[1] pb-[120px]">
        <StatusBar />
        <header className="px-5 pb-3 pt-2">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
            Ημερολόγιο
          </div>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.025em]">
            Οι προπονήσεις σου
          </h1>
        </header>

        <WeeklyPlanStrip days={weekDays} today={today} />

        <CalendarView
          todayIso={todayIso}
          sessions={sessions}
          assignedProgram={assignedProgram}
        />
      </div>
      <BottomNav active="schedule" userId={user.id} />
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
