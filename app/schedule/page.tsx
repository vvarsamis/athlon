import { redirect } from "next/navigation";
import { PhoneFrame } from "../_components/PhoneFrame";
import { BottomNav } from "../_components/BottomNav";
import {
  CalendarView,
  type AssignedProgram,
  type CalendarSession,
} from "../_components/CalendarView";
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
      "assigned_program_id, program:programs(id, name, title, estimated_duration_min, estimated_kcal)",
    )
    .eq("client_id", user.id)
    .maybeSingle();
  const programBasic =
    (
      link as {
        program: {
          id: string;
          name: string;
          title: string;
          estimated_duration_min: number | null;
          estimated_kcal: number | null;
        } | null;
      } | null
    )?.program ?? null;

  let assignedProgram: AssignedProgram = null;
  if (programBasic) {
    const { count } = await supabase
      .from("program_exercises")
      .select("id", { count: "exact", head: true })
      .eq("program_id", programBasic.id);
    assignedProgram = {
      id: programBasic.id,
      name: programBasic.name,
      title: programBasic.title,
      duration_min: programBasic.estimated_duration_min,
      kcal: programBasic.estimated_kcal,
      exerciseCount: count ?? 0,
    };
  }

  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

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
