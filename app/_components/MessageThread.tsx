"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export function MessageThread({
  currentUserId,
  otherUserId,
  otherUserName,
  initialMessages,
}: {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Auto-scroll στο κάτω μέρος όταν έρχεται νέο μήνυμα
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Mark incoming unread as read
  useEffect(() => {
    const unread = messages
      .filter((m) => m.recipient_id === currentUserId && m.read_at == null)
      .map((m) => m.id);
    if (unread.length === 0) return;
    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unread)
      .then(() => {
        setMessages((prev) =>
          prev.map((m) =>
            unread.includes(m.id)
              ? { ...m, read_at: new Date().toISOString() }
              : m,
          ),
        );
      });
  }, [messages, currentUserId, supabase]);

  // Fallback re-fetch: παίρνει ό,τι πρόσθετο υπάρχει μετά το τελευταίο δικό μας
  async function refetchLatest() {
    const lastCreatedAt =
      messages.length > 0
        ? messages[messages.length - 1].created_at
        : new Date(0).toISOString();
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, body, read_at, created_at")
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`,
      )
      .gt("created_at", lastCreatedAt)
      .order("created_at", { ascending: true });
    if (!data || data.length === 0) return;
    setMessages((prev) => {
      const existing = new Set(prev.map((m) => m.id));
      const additions = (data as Message[]).filter((m) => !existing.has(m.id));
      if (additions.length === 0) return prev;
      return [...prev, ...additions];
    });
  }

  // Realtime subscription (2 filters — έναν για incoming, έναν για outgoing echo)
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function subscribe() {
      // Explicit auth sync ώστε το JWT να είναι πάντα available στο realtime
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) {
        supabase.realtime.setAuth(token);
      }
      if (cancelled) return;

      channel = supabase
        .channel(`messages:${currentUserId}:${otherUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `recipient_id=eq.${currentUserId}`,
          },
          (payload) => {
            const m = payload.new as Message;
            if (m.sender_id !== otherUserId) return;
            setMessages((prev) =>
              prev.some((p) => p.id === m.id) ? prev : [...prev, m],
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `sender_id=eq.${currentUserId}`,
          },
          (payload) => {
            const m = payload.new as Message;
            if (m.recipient_id !== otherUserId) return;
            setMessages((prev) =>
              prev.some((p) => p.id === m.id) ? prev : [...prev, m],
            );
          },
        )
        .subscribe();
    }

    subscribe();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, otherUserId]);

  // Fallback strategies:
  //   1. Poll κάθε 5s — guaranteed delivery ακόμα κι αν realtime έχει πρόβλημα
  //   2. Re-fetch αμέσως μόλις γυρίσει το focus/tab
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "visible") refetchLatest();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refetchLatest);
    const interval = window.setInterval(refetchLatest, 5000);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refetchLatest);
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setError(null);
    setSending(true);

    // Optimistic
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: Message = {
      id: tempId,
      sender_id: currentUserId,
      recipient_id: otherUserId,
      body: text,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    const { data, error: sendErr } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        recipient_id: otherUserId,
        body: text,
      })
      .select("id, sender_id, recipient_id, body, read_at, created_at")
      .single();

    setSending(false);
    if (sendErr || !data) {
      setError(sendErr?.message ?? "Αποτυχία αποστολής.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(text);
      return;
    }
    // Replace optimistic με το πραγματικό row
    setMessages((prev) =>
      prev.map((m) => (m.id === tempId ? (data as Message) : m)),
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-2 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <div className="text-[13px] font-bold text-text-2">
              Καμία συζήτηση ακόμα
            </div>
            <div className="mt-1 text-[11px] text-text-3">
              Στείλε το πρώτο μήνυμα στον/στη{" "}
              <span className="font-bold text-text-1">{otherUserName}</span>
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = m.sender_id === currentUserId;
            const prev = i > 0 ? messages[i - 1] : null;
            const showDay =
              !prev ||
              new Date(prev.created_at).toDateString() !==
                new Date(m.created_at).toDateString();
            const time = new Date(m.created_at).toLocaleTimeString("el-GR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div key={m.id}>
                {showDay && (
                  <div className="my-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
                    {formatDay(m.created_at)}
                  </div>
                )}
                <div
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-[13px] ${
                      isMine
                        ? "bg-accent text-[#0A0A0A]"
                        : "bg-surface-2 text-text-1"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words leading-[1.4]">
                      {m.body}
                    </div>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[9px] font-semibold ${
                        isMine ? "text-[#0A0A0A]/60" : "text-text-3"
                      }`}
                    >
                      {time}
                      {isMine && (
                        <span>{m.read_at ? "✓✓" : "✓"}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[11px] text-danger">
          {error}
        </div>
      )}
      <div className="border-t border-border bg-surface-1 px-3 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Γράψε μήνυμα..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-border bg-surface-2 px-3.5 py-2.5 text-[13px] text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || draft.trim().length === 0}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-[#0A0A0A] shadow-[0_0_16px_rgba(197,255,0,0.35)] transition-opacity disabled:opacity-50"
            aria-label="Αποστολή"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Σήμερα";
  if (d.toDateString() === yesterday.toDateString()) return "Χθες";
  return d.toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    year:
      d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}
