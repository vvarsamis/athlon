import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getProfile } from "../../../lib/profile";
import { TrainerCalendarView } from "./TrainerCalendarView";

export default async function TrainerCalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type !== "trainer") {
    redirect("/home");
  }

  // Πελάτες
  const { data: clientsData } = await supabase
    .from("trainer_clients")
    .select(
      "client_id, status, profile:profiles!trainer_clients_client_id_fkey(full_name)",
    )
    .eq("trainer_id", user.id)
    .eq("status", "active");
  const clients =
    (clientsData as
      | {
          client_id: string;
          status: string;
          profile: { full_name: string | null } | null;
        }[]
      | null) ?? [];

  // Sessions του τελευταίου μηνός (καλύπτει multiple weeks views)
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setDate(now.getDate() - 45);

  const clientIds = clients.map((c) => c.client_id);
  let sessions: {
    id: string;
    client_id: string;
    program_title: string | null;
    completed_at: string;
    duration_sec: number | null;
  }[] = [];
  if (clientIds.length > 0) {
    const { data } = await supabase
      .from("workout_sessions")
      .select("id, client_id, program_title, completed_at, duration_sec")
      .in("client_id", clientIds)
      .not("completed_at", "is", null)
      .gte("completed_at", monthAgo.toISOString())
      .order("completed_at", { ascending: false });
    sessions =
      (data as
        | {
            id: string;
            client_id: string;
            program_title: string | null;
            completed_at: string;
            duration_sec: number | null;
          }[]
        | null) ?? [];
  }

  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

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
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
              Trainer <span className="text-accent">·</span> Ημερολόγιο
            </div>
            <h1 className="text-[17px] font-extrabold tracking-[-0.015em]">
              Εβδομαδιαία επισκόπηση
            </h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-6 py-8">
        {clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-1 p-12 text-center">
            <div className="mb-2 text-xl font-extrabold">Κανένας πελάτης</div>
            <div className="text-sm text-text-2">
              Θα δεις εδώ agenda μόλις μπουν πελάτες στο σύστημα.
            </div>
          </div>
        ) : (
          <TrainerCalendarView
            todayIso={todayIso}
            clients={clients.map((c) => ({
              id: c.client_id,
              name: c.profile?.full_name ?? "Χωρίς όνομα",
            }))}
            sessions={sessions}
          />
        )}
      </main>
    </div>
  );
}
