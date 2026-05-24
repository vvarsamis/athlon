"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AthlonLogo } from "../_components/AthlonLogo";
import { PhoneFrame } from "../_components/PhoneFrame";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("vasilis@athlon.app");
  const [password, setPassword] = useState("password123");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/home");
  }

  return (
    <PhoneFrame>
      <div className="relative z-[1] flex min-h-screen sm:min-h-[880px] flex-col px-7 pb-10 pt-20">
        <div className="mb-16 mt-6">
          <AthlonLogo />
        </div>

        <div className="mb-8">
          <h1 className="mb-1.5 text-[26px] font-extrabold tracking-[-0.025em]">
            Καλώς ήρθες πίσω
          </h1>
          <p className="text-sm leading-[1.5] text-text-2">
            Συνέχισε την προπόνησή σου από εκεί που έμεινες
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <FloatingInput
            label="EMAIL"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <FloatingInput
            label="ΚΩΔΙΚΟΣ"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="mt-4 flex items-center justify-center gap-2.5 rounded-2xl bg-accent px-4 py-[18px] text-sm font-extrabold uppercase tracking-[0.04em] text-[#0A0A0A] shadow-[0_0_32px_rgba(197,255,0,0.25)] transition-shadow hover:shadow-[0_0_48px_rgba(197,255,0,0.5)] active:scale-[0.98]"
          >
            Είσοδος
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
          </button>
        </form>

        <a
          href="#"
          className="mt-5 text-center text-[13px] font-medium text-text-2"
        >
          Ξέχασες τον κωδικό σου;
        </a>

        <div className="my-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-3 before:h-px before:flex-1 before:bg-border before:content-[''] after:h-px after:flex-1 after:bg-border after:content-['']">
          ή
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-surface-1 px-4 py-3.5 text-sm font-semibold text-text-1"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Συνέχεια με Apple
        </button>

        <div className="mt-auto pt-7 text-center text-[13px] text-text-3">
          Νέος εδώ;{" "}
          <Link
            href="/trainer/onboarding"
            className="font-bold text-text-1 no-underline"
          >
            Ξεκίνα δωρεάν δοκιμή
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}

type FloatingInputProps = {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
};

function FloatingInput({
  label,
  type,
  value,
  onChange,
  autoComplete,
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
        className="w-full rounded-[14px] border border-border bg-surface-1 px-[18px] pb-3 pt-[26px] text-[15px] font-medium text-text-1 transition-colors focus:border-accent focus:bg-surface-2 focus:outline-none"
      />
    </div>
  );
}
