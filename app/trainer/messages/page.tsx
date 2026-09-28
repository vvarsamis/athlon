import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getProfile } from "../../../lib/profile";
import { BroadcastMessageButton } from "../../_components/BroadcastMessageButton";

type ClientRow = {
  client_id: string;
  joined_at: string;
  profile: { full_name: string | null } | null;
};

type MessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export default async function TrainerMessagesPage() {
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
      "client_id, joined_at, profile:profiles!trainer_clients_client_id_fkey(full_name)",
    )
    .eq("trainer_id", user.id)
    .order("joined_at", { ascending: false });
  const clients = (clientsData as ClientRow[] | null) ?? [];

  // Όλα τα μηνύματα του trainer (σε ένα query) — μετά groupάρω per client
  const { data: msgsData } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, read_at, created_at")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });
  const msgs = (msgsData as MessageRow[] | null) ?? [];

  const latestPerClient = new Map<string, MessageRow>();
  const unreadPerClient = new Map<string, number>();
  for (const m of msgs) {
    const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
    if (!latestPerClient.has(otherId)) {
      latestPerClient.set(otherId, m);
    }
    if (m.recipient_id === user.id && m.read_at == null) {
      unreadPerClient.set(otherId, (unreadPerClient.get(otherId) ?? 0) + 1);
    }
  }

  // Ταξινομώ: πρώτα όσοι έχουν unread, μετά με πιο πρόσφατο μήνυμα, μετά οι υπόλοιποι
  const sorted = [...clients].sort((a, b) => {
    const unA = unreadPerClient.get(a.client_id) ?? 0;
    const unB = unreadPerClient.get(b.client_id) ?? 0;
    if (unA !== unB) return unB - unA;
    const lA = latestPerClient.get(a.client_id)?.created_at ?? "";
    const lB = latestPerClient.get(b.client_id)?.created_at ?? "";
    return lB.localeCompare(lA);
  });

  const totalUnread = Array.from(unreadPerClient.values()).reduce(
    (s, n) => s + n,
    0,
  );

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
              Trainer <span className="text-accent">·</span> Μηνύματα
            </div>
            <h1 className="text-[17px] font-extrabold tracking-[-0.015em]">
              Inbox {totalUnread > 0 && (
                <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-extrabold text-[#0A0A0A]">
                  {totalUnread} νέα
                </span>
              )}
            </h1>
          </div>
          <BroadcastMessageButton className="flex items-center gap-2 rounded-[10px] bg-accent px-3.5 py-2.5 text-[13px] font-bold text-[#0A0A0A] shadow-[0_0_20px_rgba(197,255,0,0.3)] hover:shadow-[0_0_32px_rgba(197,255,0,0.5)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            Ομαδικό μήνυμα
          </BroadcastMessageButton>
        </div>
      </div>

      <main className="mx-auto max-w-[820px] px-6 py-8">
        {clients.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-1">
            {sorted.map((c) => {
              const name = c.profile?.full_name ?? "Χωρίς όνομα";
              const latest = latestPerClient.get(c.client_id);
              const unread = unreadPerClient.get(c.client_id) ?? 0;
              const preview = latest
                ? (latest.sender_id === user.id ? "Εσύ: " : "") + latest.body
                : "Δεν έχει ξεκινήσει συζήτηση";
              const when = latest ? relativeTime(latest.created_at) : "";
              return (
                <Link
                  key={c.client_id}
                  href={`/trainer/clients/${c.client_id}`}
                  className="flex items-center gap-3.5 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-surface-2"
                >
                  <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-accent bg-surface-3 text-[15px] font-extrabold text-text-1">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-[14px] tracking-[-0.01em] ${unread > 0 ? "font-extrabold text-text-1" : "font-bold text-text-1"}`}>
                        {name}
                      </span>
                      {when && (
                        <span className="flex-shrink-0 font-mono text-[10px] font-semibold text-text-3">
                          {when}
                        </span>
                      )}
                    </div>
                    <div className={`mt-0.5 truncate text-[12px] ${unread > 0 ? "font-semibold text-text-2" : "text-text-3"}`}>
                      {preview}
                    </div>
                  </div>
                  {unread > 0 && (
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-extrabold text-[#0A0A0A]">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            })}
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-extrabold tracking-[-0.02em]">
        Καμία συζήτηση ακόμα
      </h2>
      <p className="mx-auto max-w-md text-sm text-text-2">
        Θα δεις εδώ όλες τις συζητήσεις με τους πελάτες σου μόλις μπουν στο σύστημα.
      </p>
    </div>
  );
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return "τώρα";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}λ`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}ω`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD}μ`;
  return new Date(iso).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
  });
}
