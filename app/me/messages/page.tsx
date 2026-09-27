import Link from "next/link";
import { redirect } from "next/navigation";
import { PhoneFrame } from "../../_components/PhoneFrame";
import { BottomNav } from "../../_components/BottomNav";
import { MessageThread, type Message } from "../../_components/MessageThread";
import { createClient } from "../../../lib/supabase/server";
import { getProfile } from "../../../lib/profile";

export default async function ClientMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type === "trainer") {
    redirect("/trainer");
  }

  // Βρες τον trainer του
  const { data: tc } = await supabase
    .from("trainer_clients")
    .select(
      "trainer_id, trainer:profiles!trainer_clients_trainer_id_fkey(full_name)",
    )
    .eq("client_id", user.id)
    .maybeSingle();

  const trainerId = (tc as { trainer_id: string } | null)?.trainer_id ?? null;
  const trainerName =
    (tc as { trainer: { full_name: string | null } | null } | null)?.trainer
      ?.full_name ?? "Προπονητής";

  let messages: Message[] = [];
  if (trainerId) {
    const { data: messagesData } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, body, read_at, created_at")
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${trainerId}),and(sender_id.eq.${trainerId},recipient_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: true })
      .limit(200);
    messages = (messagesData as Message[] | null) ?? [];
  }

  return (
    <PhoneFrame>
      <div className="relative z-[1] flex h-full flex-col pb-[90px]">
        <StatusBar />
        <header className="border-b border-border px-5 pb-3 pt-2">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              aria-label="Πίσω"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
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
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-3">
                Μηνύματα
              </div>
              <div className="truncate text-[17px] font-extrabold tracking-[-0.02em]">
                {trainerName}
              </div>
            </div>
          </div>
        </header>

        {trainerId ? (
          <div className="flex-1 overflow-hidden">
            <MessageThread
              currentUserId={user.id}
              otherUserId={trainerId}
              otherUserName={trainerName}
              initialMessages={messages}
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-text-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="mb-1 text-base font-extrabold">
              Δεν έχεις προπονητή ακόμα
            </div>
            <div className="text-[12px] text-text-3">
              Ζήτα από τον προπονητή σου κωδικό πρόσκλησης και χρησιμοποίησέ τον
              στο signup για να συνδεθείτε.
            </div>
          </div>
        )}
      </div>
      <BottomNav active="messages" />
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
