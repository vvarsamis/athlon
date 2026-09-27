"use client";

import { useEffect, useState, type ReactNode } from "react";

type Variant = "primary" | "quick";

export function InviteClientButton({
  code,
  variant = "primary",
  children,
  className,
}: {
  code: string;
  variant?: Variant;
  children?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? defaultClass(variant)}
      >
        {children ?? "+ Νέος πελάτης"}
      </button>
      {open && <InviteModal code={code} onClose={() => setOpen(false)} />}
    </>
  );
}

function defaultClass(variant: Variant) {
  if (variant === "quick") {
    return "flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-surface-2 p-4 text-left text-text-1 transition-all hover:border-accent hover:bg-surface-1";
  }
  return "flex items-center gap-[7px] rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-[13px] font-bold text-text-1 hover:border-[#303030]";
}

function InviteModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

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
        return;
      } catch {
        // fall through
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-border bg-surface-1 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Κλείσιμο"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-text-3 hover:bg-surface-2 hover:text-text-1"
        >
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/[0.12] text-accent">
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>

        <h2 className="mb-2 text-2xl font-extrabold tracking-[-0.02em]">
          Πρόσκλησε πελάτη
        </h2>
        <p className="mb-6 text-sm leading-[1.55] text-text-2">
          Δώσε στον αθλητή σου τον παρακάτω κωδικό. Στο signup θα τον βάλει
          στο πεδίο <strong className="text-text-1">&quot;Κωδικός Προπονητή&quot;</strong> και
          θα συνδεθεί αυτόματα μαζί σου.
        </p>

        <div className="mb-5 rounded-2xl border border-accent/30 bg-accent/[0.06] p-5 text-center">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
            Ο κωδικός σου
          </div>
          <div className="font-mono text-[32px] font-extrabold tracking-[0.08em] text-accent">
            {code}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="rounded-xl border border-border bg-surface-2 px-3 py-3 text-sm font-bold text-text-1 hover:border-accent"
          >
            {copied ? "✓ Αντιγράφτηκε" : "Αντιγραφή κωδικού"}
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-xl bg-accent px-3 py-3 text-sm font-bold text-[#0A0A0A] shadow-[0_0_20px_rgba(197,255,0,0.3)]"
          >
            Μοιράσου
          </button>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-surface-2 p-3 text-[11px] leading-[1.5] text-text-3">
          Ο πελάτης πάει στο{" "}
          <span className="font-mono text-text-2">athlon-psi.vercel.app/signup</span>
          , διαλέγει &quot;Αθλητής&quot;, και βάζει τον κωδικό.
        </div>
      </div>
    </div>
  );
}
