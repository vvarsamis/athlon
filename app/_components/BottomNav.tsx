"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createClient } from "../../lib/supabase/client";

type Item = {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
};

const items: Item[] = [
  {
    key: "home",
    href: "/home",
    label: "Αρχική",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "schedule",
    href: "/schedule",
    label: "Πρόγραμμα",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: "nutrition",
    href: "/me/nutrition",
    label: "Διατροφή",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.84.63-3.53 1.68-4.88l11.2 11.2C15.53 19.37 13.84 20 12 20z" />
      </svg>
    ),
  },
  {
    key: "progress",
    href: "/progress",
    label: "Πρόοδος",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
  },
  {
    key: "messages",
    href: "/me/messages",
    label: "Μηνύματα",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

type Props = {
  active: Item["key"];
  userId?: string;
};

export function BottomNav({ active, userId }: Props) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    let cancelled = false;

    async function refreshCount() {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .is("read_at", null);
      if (!cancelled) setUnread(count ?? 0);
    }

    // Initial fetch
    refreshCount();

    // Realtime: new incoming + read updates
    const channel = supabase
      .channel(`bottomnav-unread-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          if (cancelled) return;
          setUnread((c) => c + 1);
          const m = payload.new as { body: string };
          if (
            active !== "messages" &&
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification("Νέο μήνυμα από τον προπονητή σου", {
                body: m.body.slice(0, 120),
                icon: "/favicon.ico",
                tag: "athlon-message",
              });
            } catch {
              // ignore
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          if (cancelled) return;
          const oldRow = payload.old as { read_at: string | null } | null;
          const newRow = payload.new as { read_at: string | null } | null;
          if (oldRow && newRow && !oldRow.read_at && newRow.read_at) {
            setUnread((c) => Math.max(0, c - 1));
          }
        },
      )
      .subscribe();

    // Fallback: re-fetch όταν επιστρέφει το tab σε visible
    function onVisibility() {
      if (document.visibilityState === "visible") refreshCount();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refreshCount);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refreshCount);
    };
  }, [userId, active]);

  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-[rgba(10,10,10,0.92)] px-2 pb-[22px] pt-3 backdrop-blur-2xl">
      {items.map((item) => {
        const isActive = item.key === active;
        const showBadge = item.key === "messages" && unread > 0;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] transition-colors ${
              isActive ? "text-accent" : "text-text-3"
            }`}
          >
            <span
              className={`relative h-[22px] w-[22px] ${
                isActive
                  ? "[&>svg]:drop-shadow-[0_0_6px_rgba(197,255,0,0.6)]"
                  : ""
              }`}
            >
              {item.icon}
              {showBadge && (
                <span className="absolute -right-2 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] font-extrabold text-[#0A0A0A] shadow-[0_0_8px_rgba(197,255,0,0.6)]">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
