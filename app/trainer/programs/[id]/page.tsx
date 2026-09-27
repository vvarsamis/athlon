import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getProfile } from "../../../../lib/profile";

type Program = {
  id: string;
  name: string;
  title: string;
  subtitle: string | null;
  estimated_duration_min: number | null;
  estimated_kcal: number | null;
  created_at: string;
};

type Exercise = {
  id: string;
  position: number;
  name: string;
  image_url: string | null;
  tags: string[] | null;
  sets: string | null;
  reps: string | null;
  rest_seconds: number | null;
  tempo: string | null;
  notes: string | null;
};

export default async function ProgramDetailPage({
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

  // Fetch program (verify owner)
  const { data: prog } = await supabase
    .from("programs")
    .select("id, name, title, subtitle, estimated_duration_min, estimated_kcal, created_at")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .maybeSingle();
  if (!prog) redirect("/trainer/programs");
  const program = prog as Program;

  // Exercises
  const { data: exData } = await supabase
    .from("program_exercises")
    .select("id, position, name, image_url, tags, sets, reps, rest_seconds, tempo, notes")
    .eq("program_id", id)
    .order("position", { ascending: true });
  const exercises = (exData as Exercise[] | null) ?? [];

  // Assigned clients
  const { data: assignedData } = await supabase
    .from("trainer_clients")
    .select("client_id, profile:profiles!trainer_clients_client_id_fkey(full_name)")
    .eq("trainer_id", user.id)
    .eq("assigned_program_id", id);
  const assigned = (assignedData as
    | { client_id: string; profile: { full_name: string | null } | null }[]
    | null) ?? [];

  const created = new Date(program.created_at).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border bg-[#080808]">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-6 py-4">
          <Link
            href="/trainer/programs"
            aria-label="Πίσω"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
              Trainer <span className="text-accent">·</span> Πρόγραμμα
            </div>
            <h1 className="truncate text-[17px] font-extrabold tracking-[-0.015em]">
              {program.title}
            </h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-6 py-8">
        {/* Header card */}
        <div className="relative mb-6 overflow-hidden rounded-[22px] border border-[#303030] bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-7">
          <div
            className="pointer-events-none absolute -right-[60px] -top-[60px] h-[280px] w-[280px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(197,255,0,0.08) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/[0.08] px-2 py-[3px] text-[9px] font-extrabold uppercase tracking-[0.1em] text-accent">
              {program.name}
            </div>
            <h2 className="text-[32px] font-extrabold leading-tight tracking-[-0.03em]">
              {program.title}
            </h2>
            {program.subtitle && (
              <p className="mt-2 text-sm text-text-2">{program.subtitle}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-6 text-[12px]">
              <StatChip label="Ασκήσεις" val={String(exercises.length)} />
              {program.estimated_duration_min && (
                <StatChip label="Διάρκεια" val={`${program.estimated_duration_min}'`} />
              )}
              {program.estimated_kcal && (
                <StatChip label="Κατανάλωση" val={`${program.estimated_kcal} kcal`} />
              )}
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

        {/* Exercises */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-1">
          <div className="border-b border-border px-[22px] py-[14px] text-sm font-extrabold">
            Ασκήσεις ({exercises.length})
          </div>
          {exercises.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-3">
              Καμία άσκηση σε αυτό το πρόγραμμα.
            </div>
          ) : (
            <div>
              {exercises.map((ex, i) => (
                <ExerciseRow key={ex.id} num={i + 1} ex={ex} />
              ))}
            </div>
          )}
        </div>
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

function ExerciseRow({ num, ex }: { num: number; ex: Exercise }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border p-4 last:border-b-0">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/[0.12] font-mono text-[13px] font-extrabold text-accent">
        {String(num).padStart(2, "0")}
      </div>
      {ex.image_url ? (
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
          <Image
            src={ex.image_url}
            alt={ex.name}
            fill
            unoptimized
            sizes="56px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-text-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="4" x2="6" y2="20" />
            <line x1="18" y1="4" x2="18" y2="20" />
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-extrabold tracking-[-0.01em]">
          {ex.name}
        </div>
        {ex.tags && ex.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {ex.tags.map((t, i) => (
              <span
                key={i}
                className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-text-3"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {ex.notes && (
          <div className="mt-2 text-[11px] italic text-text-3">{ex.notes}</div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-[11px]">
        {ex.sets && (
          <NumChip label="Σετ" val={ex.sets} />
        )}
        {ex.reps && (
          <NumChip label="Επαν." val={ex.reps} />
        )}
        {ex.rest_seconds != null && (
          <NumChip label="Ξεκούραση" val={`${ex.rest_seconds}s`} />
        )}
        {ex.tempo && (
          <NumChip label="Tempo" val={ex.tempo} />
        )}
      </div>
    </div>
  );
}

function NumChip({ label, val }: { label: string; val: string }) {
  return (
    <div className="text-center">
      <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-text-3">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[13px] font-extrabold text-text-1">
        {val}
      </div>
    </div>
  );
}
