"use client";

import { useState } from "react";

export function InviteCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  if (!code) return null;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function onShare() {
    const text = `Σε προσκαλώ στο Athlon με τον κωδικό: ${code}\nhttps://athlon-psi.vercel.app/signup`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ text });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {
        // user canceled or unsupported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/20 p-4"
      style={{
        background:
          "linear-gradient(90deg, rgba(197,255,0,0.06) 0%, transparent 60%)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent/[0.12] text-accent">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-3">
            Ο κωδικός σου
          </div>
          <div className="font-mono text-[22px] font-extrabold tracking-[0.05em] text-accent">
            {code}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-text-2 max-w-[220px] hidden sm:block">
          Δώσε τον κωδικό σε αθλητή για να συνδεθεί μαζί σου
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-[10px] border border-border bg-surface-1 px-3 py-2 text-xs font-bold text-text-1 hover:border-accent"
        >
          {copied ? "✓ Αντιγράφτηκε" : "Αντιγραφή"}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="rounded-[10px] bg-accent px-3 py-2 text-xs font-bold text-[#0A0A0A] shadow-[0_0_16px_rgba(197,255,0,0.25)] hover:shadow-[0_0_24px_rgba(197,255,0,0.4)]"
        >
          {shared ? "✓ Στάλθηκε" : "Μοιράσου"}
        </button>
      </div>
    </div>
  );
}
