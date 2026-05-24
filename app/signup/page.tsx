"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AthlonLogo } from "../_components/AthlonLogo";
import { PhoneFrame } from "../_components/PhoneFrame";
import { createClient } from "../../lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
      },
    });
    setLoading(false);
    if (error) {
      setError(translateError(error.message));
      return;
    }
    if (data.session) {
      // email confirmation OFF — user is logged in immediately
      router.push("/home");
      router.refresh();
    } else {
      // email confirmation ON
      setInfo(
        "Σου στείλαμε email επιβεβαίωσης. Άνοιξέ το για να ενεργοποιήσεις τον λογαριασμό σου.",
      );
    }
  }

  return (
    <PhoneFrame>
      <div className="relative z-[1] flex min-h-screen sm:min-h-[880px] flex-col px-7 pb-10 pt-20">
        <div className="mb-12 mt-6">
          <AthlonLogo />
        </div>

        <div className="mb-8">
          <h1 className="mb-1.5 text-[26px] font-extrabold tracking-[-0.025em]">
            Δωρεάν δοκιμή
          </h1>
          <p className="text-sm leading-[1.5] text-text-2">
            Φτιάξε λογαριασμό σε 30 δευτερόλεπτα · χωρίς κάρτα
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <FloatingInput
            label="ΟΝΟΜΑ"
            type="text"
            value={name}
            onChange={setName}
            autoComplete="given-name"
            required
          />
          <FloatingInput
            label="EMAIL"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <FloatingInput
            label="ΚΩΔΙΚΟΣ (τουλάχιστον 6 χαρακτήρες)"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
          />

          {error && (
            <div className="rounded-[10px] border border-danger/30 bg-danger/[0.08] px-3 py-2.5 text-[13px] text-danger">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-[10px] border border-accent/30 bg-accent/[0.08] px-3 py-2.5 text-[13px] text-accent">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex items-center justify-center gap-2.5 rounded-2xl bg-accent px-4 py-[18px] text-sm font-extrabold uppercase tracking-[0.04em] text-[#0A0A0A] shadow-[0_0_32px_rgba(197,255,0,0.25)] transition-shadow hover:shadow-[0_0_48px_rgba(197,255,0,0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Δημιουργία λογαριασμού..." : "Φτιάξε λογαριασμό"}
            {!loading && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </form>

        <div className="mt-auto pt-7 text-center text-[13px] text-text-3">
          Έχεις ήδη λογαριασμό;{" "}
          <Link href="/login" className="font-bold text-text-1 no-underline">
            Συνδέσου
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}

function translateError(msg: string): string {
  if (msg.includes("already registered") || msg.includes("already exists"))
    return "Υπάρχει ήδη λογαριασμός με αυτό το email. Πήγαινε στο login.";
  if (msg.includes("Password should be at least"))
    return "Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες.";
  if (msg.includes("invalid email") || msg.includes("Unable to validate email"))
    return "Μη έγκυρο email.";
  return msg;
}

type FloatingInputProps = {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
};

function FloatingInput({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: FloatingInputProps) {
  return (
    <div className="relative">
      <label className="pointer-events-none absolute left-[18px] top-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-accent">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-[14px] border border-border bg-surface-1 px-[18px] pb-3 pt-[26px] text-[15px] font-medium text-text-1 transition-colors focus:border-accent focus:bg-surface-2 focus:outline-none"
      />
    </div>
  );
}
