import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getProfile } from "../../lib/profile";
import WorkoutView, { type WorkoutExercise } from "./WorkoutView";

type ExerciseRow = {
  id: string;
  position: number;
  name: string;
  image_url: string | null;
  tags: string[] | null;
  sets: string | null;
  reps: string | null;
  rest_seconds: number | null;
  notes: string | null;
};

export default async function WorkoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Trainers δεν βλέπουν την οθόνη προπόνησης — πάνε πίσω στο dashboard
  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type === "trainer") {
    redirect("/trainer");
  }

  // Βρες το assigned program
  const { data: link } = await supabase
    .from("trainer_clients")
    .select("assigned_program_id")
    .eq("client_id", user.id)
    .maybeSingle();

  const programId = (link as { assigned_program_id: string | null } | null)
    ?.assigned_program_id ?? null;

  let programName: string | null = null;
  let programTitle: string | null = null;
  let exercises: WorkoutExercise[] = [];

  if (programId) {
    const { data: prog } = await supabase
      .from("programs")
      .select("name, title")
      .eq("id", programId)
      .single();
    programName = prog?.name ?? null;
    programTitle = prog?.title ?? null;

    const { data: exRows } = await supabase
      .from("program_exercises")
      .select(
        "id, position, name, image_url, tags, sets, reps, rest_seconds, notes",
      )
      .eq("program_id", programId)
      .order("position");

    exercises = ((exRows as ExerciseRow[] | null) ?? []).map((e) => ({
      id: e.id,
      position: e.position,
      name: e.name,
      image_url: e.image_url,
      tags: e.tags ?? [],
      sets: e.sets,
      reps: e.reps,
      rest_seconds: e.rest_seconds,
      notes: e.notes,
    }));
  }

  return (
    <WorkoutView
      programId={programId}
      programName={programName}
      programTitle={programTitle}
      exercises={exercises}
    />
  );
}
