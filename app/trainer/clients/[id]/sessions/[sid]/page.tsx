import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../../../lib/supabase/server";
import { getProfile } from "../../../../../../lib/profile";

type Session = {
  id: string;
  client_id: string;
  program_title: string | null;
  program_name: string | null;
  started_at: string;
  completed_at: string | null;
  duration_sec: number | null;
  notes: string | null;
};

type SessionSet = {
  id: string;
  exercise_position: number;
  exercise_name: string;
  set_number: number;
  target_reps: string | null;
  target_weight_kg: string | null;
  actual_reps: number | null;
  actual_weight_kg: number | null;
  done_at: string | null;
};

export default async function ClientSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string; sid: string }>;
}) {
  const { id: clientId, sid } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type !== "trainer") {
    redirect("/home");
  }

  // Verify trainer↔client
  const { data: rel } = await supabase
    .from("trainer_clients")
    .select("client_id, profile:profiles!trainer_clients_client_id_fkey(full_name)")
    .eq("trainer_id", user.id)
    .eq("client_id", clientId)
    .maybeSingle();
  if (!rel) redirect("/trainer/clients");
  const clientName =
    (rel as unknown as { profile: { full_name: string | null } | null }).profile?.full_name ??
    "Πελάτης";

  // Fetch session
  const { data: sess } = await supabase
    .from("workout_sessions")
    .select(
      "id, client_id, program_title, program_name, started_at, completed_at, duration_sec, notes",
    )
    .eq("id", sid)
    .eq("client_id", clientId)
    .maybeSingle();
  if (!sess) redirect(`/trainer/clients/${clientId}`);
  const session = sess as Session;

  const { data: setsData } = await supabase
    .from("workout_session_sets")
    .select(
      "id, exercise_position, exercise_name, set_number, target_reps, target_weight_kg, actual_reps, actual_weight_kg, done_at",
    )
    .eq("session_id", sid)
    .order("exercise_position", { ascending: true })
    .order("set_number", { ascending: true });
  const sets = (setsData as SessionSet[] | null) ?? [];

  // Group by exercise
  const byExercise = new Map<number, SessionSet[]>();
  for (const s of sets) {
    const arr = byExercise.get(s.exercise_position) ?? [];
    arr.push(s);
    byExercise.set(s.exercise_position, arr);
  }
  const exerciseIndices = Array.from(byExercise.keys()).sort((a, b) => a - b);

  const dateLabel = session.completed_at
    ? new Date(session.completed_at).toLocaleDateString("el-GR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Δεν ολοκληρώθηκε";
  const timeLabel = session.completed_at
    ? new Date(session.completed_at).toLocaleTimeString("el-GR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const durationMin =
    session.duration_sec != null && session.duration_sec > 0
      ? Math.round(session.duration_sec / 60)
      : null;

  // Volume calc (kg × reps summed)
  const totalVolume = sets.reduce(
    (acc, s) =>
      s.actual_reps != null && s.actual_weight_kg != null
        ? acc + s.actual_reps * Number(s.actual_weight_kg)
        : acc,
    0,
  );
  const totalReps = sets.reduce((acc, s) => acc + (s.actual_reps ?? 0), 0);

  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border bg-[#080808]">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-6 py-4">
          <Link
            href={`/trainer/clients/${clientId}`}
            aria-label="Πίσω"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
              {clientName} <span className="text-accent">·</span> Προπόνηση
            </div>
            <h1 className="truncate text-[17px] font-extrabold tracking-[-0.015em]">
              {session.program_title ?? "Προπόνηση"}
            </h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[900px] px-6 py-8">
        {/* Header card */}
        <div className="relative mb-6 overflow-hidden rounded-[22px] border border-[#303030] bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-6">
          <div
            className="pointer-events-none absolute -right-[60px] -top-[60px] h-[240px] w-[240px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(197,255,0,0.08) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            {session.program_name && (
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/[0.08] px-2 py-[3px] text-[9px] font-extrabold uppercase tracking-[0.1em] text-accent">
                {session.program_name}
              </div>
            )}
            <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em]">
              {session.program_title ?? "Προπόνηση"}
            </h2>
            <div className="mt-1 text-[13px] capitalize text-text-2">
              {dateLabel}
              {timeLabel && ` · ${timeLabel}`}
            </div>
            <div className="mt-5 flex flex-wrap gap-6 text-[12px]">
              {durationMin != null && (
                <StatChip label="Διάρκεια" val={`${durationMin}'`} />
              )}
              <StatChip label="Σετ" val={String(sets.length)} />
              <StatChip label="Ασκήσεις" val={String(exerciseIndices.length)} />
              {totalReps > 0 && (
                <StatChip label="Επαναλήψεις" val={String(totalReps)} />
              )}
              {totalVolume > 0 && (
                <StatChip label="Όγκος" val={`${Math.round(totalVolume)} kg`} />
              )}
            </div>
          </div>
        </div>

        {/* Exercises */}
        {sets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-1 p-8 text-center text-sm text-text-3">
            Δεν καταγράφηκαν σετ σε αυτή τη προπόνηση.
          </div>
        ) : (
          <div className="space-y-4">
            {exerciseIndices.map((exIdx) => {
              const exSets = byExercise.get(exIdx) ?? [];
              const first = exSets[0];
              return (
                <div
                  key={exIdx}
                  className="overflow-hidden rounded-2xl border border-border bg-surface-1"
                >
                  <div className="flex items-center gap-3 border-b border-border px-5 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/[0.12] font-mono text-[12px] font-extrabold text-accent">
                      {String(exIdx + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0 flex-1 truncate text-[14px] font-extrabold tracking-[-0.01em]">
                      {first?.exercise_name ?? "Άσκηση"}
                    </div>
                    <div className="font-mono text-[11px] text-text-3">
                      {exSets.length} {exSets.length === 1 ? "σετ" : "σετ"}
                    </div>
                  </div>
                  <div className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 border-b border-border bg-surface-2 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
                    <span>#</span>
                    <span>Στόχος</span>
                    <span>Έγιναν</span>
                    <span>Βάρος</span>
                  </div>
                  {exSets.map((s) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-[40px_1fr_1fr_1fr] gap-2 border-b border-border px-5 py-2.5 last:border-b-0"
                    >
                      <span className="font-mono text-[13px] font-extrabold text-text-2">
                        {String(s.set_number).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-[13px] text-text-3">
                        {s.target_reps ?? "—"}
                      </span>
                      <span className={`font-mono text-[13px] font-extrabold ${s.actual_reps != null ? "text-text-1" : "text-text-3"}`}>
                        {s.actual_reps ?? "—"}
                      </span>
                      <span className={`font-mono text-[13px] font-extrabold ${s.actual_weight_kg != null ? "text-accent" : "text-text-3"}`}>
                        {s.actual_weight_kg != null ? `${s.actual_weight_kg} kg` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function StatChip({ label, val }: { label: string; val: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[16px] font-extrabold text-text-1">
        {val}
      </div>
    </div>
  );
}
