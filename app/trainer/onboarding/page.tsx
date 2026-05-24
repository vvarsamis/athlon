"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Color = { id: string; from: string; to: string };

const colors: Color[] = [
  { id: "lime", from: "#C5FF00", to: "#8FB300" },
  { id: "orange", from: "#FF6B00", to: "#FFB800" },
  { id: "pink", from: "#FF4D6D", to: "#C9184A" },
  { id: "blue", from: "#60A5FA", to: "#2563EB" },
  { id: "purple", from: "#A78BFA", to: "#7C3AED" },
  { id: "green", from: "#4ADE80", to: "#16A34A" },
  { id: "amber", from: "#FBBF24", to: "#D97706" },
];

const specialties = [
  "Bodybuilding",
  "Απώλεια λίπους",
  "Powerlifting",
  "CrossFit",
  "Γυναικείο fitness",
  "Αποκατάσταση",
  "Διατροφή",
  "Online coaching",
];

const languages = [
  { id: "gr", name: "Ελληνικά", sub: "Κύρια γλώσσα" },
  { id: "es", name: "Español", sub: "Διαθέσιμη" },
  { id: "en", name: "English", sub: "Διαθέσιμη" },
];

const LOGO_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23000'/><text x='50' y='42' text-anchor='middle' fill='%23FFD700' font-family='Arial' font-weight='900' font-size='18'>MAX</text><text x='50' y='62' text-anchor='middle' fill='%23FFD700' font-family='Arial' font-weight='900' font-size='10'>FITNESS</text></svg>";

export default function TrainerOnboardingPage() {
  const [studio, setStudio] = useState("Maxfitness");
  const [colorId, setColorId] = useState("lime");
  const [activeSpecs, setActiveSpecs] = useState<string[]>([
    "Bodybuilding",
    "Απώλεια λίπους",
  ]);
  const [activeLangs, setActiveLangs] = useState<string[]>(["gr"]);

  const color = useMemo(
    () => colors.find((c) => c.id === colorId) ?? colors[0],
    [colorId],
  );

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 10%, rgba(197,255,0,0.06) 0%, transparent 50%), radial-gradient(circle at 85% 70%, rgba(96,165,250,0.04) 0%, transparent 50%)",
      }}
    >
      <Header />
      <Steps />

      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-start gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-8">
            <h1 className="mb-3 text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em]">
              Φτιάξε το <span className="text-accent">δικό σου</span> studio.
            </h1>
            <p className="text-base leading-[1.6] text-text-2">
              Οι πελάτες σου δεν θα βλέπουν «Athlon» — θα βλέπουν{" "}
              <strong className="font-bold text-text-1">
                το δικό σου brand
              </strong>
              . Λογότυπο, όνομα, χρώματα: ό,τι αναγνωρίζουν ήδη από εσένα. Όλα
              προσαρμοσμένα σε 30 δευτερόλεπτα.
            </p>
          </div>

          <div className="rounded-[18px] border border-border bg-surface-1 p-[26px]">
            <h2 className="text-base font-extrabold tracking-[-0.01em]">
              Στοιχεία studio
            </h2>
            <div className="mb-[22px] mt-1 text-xs text-text-3">
              Όλα μπορούν να αλλάξουν αργότερα από τις ρυθμίσεις
            </div>

            <Field label="Όνομα studio" required>
              <input
                value={studio}
                onChange={(e) => setStudio(e.target.value)}
                className="w-full rounded-[11px] border border-border bg-surface-2 px-3.5 py-3 text-sm text-text-1 outline-none transition-[border-color,box-shadow] focus:border-accent focus:shadow-[0_0_0_3px_rgba(197,255,0,0.1)]"
              />
            </Field>

            <Field label="Λογότυπο" required>
              <LogoUpload />
            </Field>

            <Field label="Κύριο χρώμα brand">
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setColorId(c.id)}
                    aria-label={c.id}
                    className={`relative h-9 w-9 rounded-[10px] transition-transform hover:scale-110 ${
                      colorId === c.id
                        ? "border-2 border-text-1 shadow-[0_0_0_2px_var(--bg),0_0_0_4px_currentColor]"
                        : "border-2 border-transparent"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                      color: c.from,
                    }}
                  >
                    {colorId === c.id && (
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  title="Προσαρμοσμένο"
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-[#303030] bg-surface-2 text-text-3"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </button>
              </div>
            </Field>

            <Field label="Ειδικότητα (επίλεξε όσα ταιριάζουν)">
              <div className="flex flex-wrap gap-1.5">
                {specialties.map((s) => {
                  const active = activeSpecs.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() =>
                        setActiveSpecs((prev) =>
                          active
                            ? prev.filter((x) => x !== s)
                            : [...prev, s],
                        )
                      }
                      className={`rounded-full border px-[13px] py-2 text-xs font-bold transition-colors ${
                        active
                          ? "border-accent bg-accent/[0.12] text-accent"
                          : "border-border bg-surface-2 text-text-2 hover:border-[#303030]"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Γλώσσες που μιλάς με τους πελάτες σου">
              <div className="flex gap-2">
                {languages.map((l) => {
                  const active = activeLangs.includes(l.id);
                  return (
                    <button
                      type="button"
                      key={l.id}
                      onClick={() =>
                        setActiveLangs((prev) =>
                          active
                            ? prev.filter((x) => x !== l.id)
                            : [...prev, l.id],
                        )
                      }
                      className={`flex flex-1 items-center gap-2.5 rounded-xl border-[1.5px] p-3.5 transition-colors ${
                        active
                          ? "border-accent bg-accent/[0.12]"
                          : "border-border bg-surface-2 hover:border-[#303030]"
                      }`}
                    >
                      <LangFlag id={l.id} />
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-[13px] font-extrabold">
                          {l.name}
                        </div>
                        <div
                          className={`mt-px text-[10px] ${
                            active ? "text-accent" : "text-text-3"
                          }`}
                        >
                          {l.sub}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="mt-[30px] flex items-center justify-between border-t border-border pt-[22px]">
              <Link
                href="/login"
                className="rounded-[11px] bg-transparent px-4 py-2.5 text-[13px] font-extrabold text-text-2 hover:text-text-1"
              >
                ← Πίσω
              </Link>
              <div className="flex items-center gap-3.5">
                <p className="flex items-center gap-2 text-[11px] text-text-3">
                  <span className="font-extrabold text-success">●</span>{" "}
                  Auto-saved
                </p>
                <Link
                  href="/trainer"
                  className="flex items-center gap-2 rounded-[11px] bg-accent px-[18px] py-2.5 text-[13px] font-extrabold text-[#0A0A0A] shadow-[0_0_24px_rgba(197,255,0,0.3)] hover:shadow-[0_0_36px_rgba(197,255,0,0.5)]"
                >
                  Συνέχεια
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <TrustRow />
        </div>

        <LivePreview studio={studio} color={color} />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border px-8">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-[#8FB300] text-base font-black text-[#0A0A0A] shadow-[0_0_14px_rgba(197,255,0,0.35)]">
          A
        </div>
        <span className="text-base font-black tracking-[-0.025em]">
          ATHLON<span className="text-accent">.</span>
        </span>
      </Link>
      <div className="flex items-center gap-4 text-[13px] text-text-2">
        <span>
          Έχεις ήδη λογαριασμό;{" "}
          <Link href="/login" className="font-bold text-accent">
            Συνδέσου
          </Link>
        </span>
      </div>
    </div>
  );
}

function Steps() {
  const steps = [
    { label: "Λογαριασμός", state: "done" as const },
    { label: "Studio", state: "active" as const },
    { label: "Πρώτος πελάτης", state: "pending" as const },
    { label: "Συνδρομή", state: "pending" as const },
    { label: "Έτοιμος!", state: "pending" as const },
  ];
  return (
    <div className="mx-auto flex max-w-[720px] items-center gap-3 px-6 pt-8">
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] font-mono text-[11px] font-extrabold ${
                s.state === "done"
                  ? "border-accent bg-accent text-[#0A0A0A]"
                  : s.state === "active"
                  ? "border-accent bg-surface-1 text-accent shadow-[0_0_0_4px_rgba(197,255,0,0.12)]"
                  : "border-[#303030] bg-surface-1 text-text-3"
              }`}
            >
              {s.state === "done" ? "✓" : i + 1}
            </div>
            <span
              className={`whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.1em] ${
                s.state === "done"
                  ? "text-text-2"
                  : s.state === "active"
                  ? "text-accent"
                  : "text-text-3"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-[1.5px] flex-1 ${
                s.state === "done" ? "bg-accent" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[18px]">
      <div className="mb-[7px] flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-2">
        {label}
        {required && <span className="text-accent">·</span>}
      </div>
      {children}
    </div>
  );
}

function LogoUpload() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative flex h-[70px] w-[70px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[14px] border-[1.5px] border-dashed border-[#303030] bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_SVG}
          alt="Studio logo"
          className="h-full w-full bg-black object-contain"
        />
      </div>
      <div className="flex-1">
        <div className="mb-1.5 flex gap-1.5">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-[9px] border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-text-1 hover:border-[#303030]"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Αλλαγή
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-[9px] border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-text-2 hover:border-danger/30 hover:text-danger"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
            Αφαίρεση
          </button>
        </div>
        <div className="text-[11px] text-text-3">
          PNG, JPG ή SVG · μέγιστο 2MB · συστήνεται 512×512px
        </div>
      </div>
    </div>
  );
}

function LangFlag({ id }: { id: string }) {
  if (id === "gr") {
    return (
      <div className="relative h-5 w-7 flex-shrink-0 overflow-hidden rounded-[4px]">
        <div className="absolute inset-0 bg-[#0d5eaf]" />
        <div className="absolute top-[11%] left-0 right-0 h-[11%] bg-white" />
        <div className="absolute top-[33%] left-0 right-0 h-[11%] bg-white" />
        <div className="absolute top-[55%] left-0 right-0 h-[11%] bg-white" />
        <div className="absolute top-[77%] left-0 right-0 h-[11%] bg-white" />
        <div className="absolute left-0 top-0 h-[56%] w-[44%] bg-[#0d5eaf]" />
        <div className="absolute left-[18%] top-[11%] h-[34%] w-[8%] bg-white" />
        <div className="absolute left-0 top-[22%] h-[12%] w-[44%] bg-white" />
      </div>
    );
  }
  if (id === "es") {
    return (
      <div
        className="h-5 w-7 flex-shrink-0 rounded-[4px]"
        style={{
          background:
            "linear-gradient(180deg, #aa151b 0%, #aa151b 25%, #f1bf00 25%, #f1bf00 75%, #aa151b 75%, #aa151b 100%)",
        }}
      />
    );
  }
  return (
    <div className="flex h-5 w-7 flex-shrink-0 items-center justify-center rounded-[4px] bg-[#012169] text-[14px]">
      🇬🇧
    </div>
  );
}

function TrustRow() {
  const items = [
    "30 ημέρες δωρεάν",
    "Χωρίς πιστωτική κάρτα",
    "Ακύρωση οποτεδήποτε",
    "GDPR / EU servers",
  ];
  return (
    <div className="mt-[18px] flex flex-wrap justify-center gap-3">
      {items.map((it) => (
        <div
          key={it}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-text-3"
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
            className="text-success"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {it}
        </div>
      ))}
    </div>
  );
}

function LivePreview({ studio, color }: { studio: string; color: Color }) {
  const gradient = `linear-gradient(155deg, ${color.from} 0%, ${color.to} 100%)`;
  const fadeText = color.id === "lime" ? "rgba(10,10,10,0.7)" : "rgba(255,255,255,0.7)";
  const titleText = color.id === "lime" ? "#0A0A0A" : "#FFFFFF";
  const watermarkText = color.id === "lime" ? "rgba(10,10,10,0.5)" : "rgba(255,255,255,0.6)";

  return (
    <div className="sticky top-8">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-3">
        <span>Πώς το βλέπει ο πελάτης σου</span>
        <span className="inline-flex items-center gap-1.5 text-accent">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]"
            style={{ animation: "accent-pulse 1.4s ease-in-out infinite" }}
          />
          LIVE
        </span>
      </div>
      <div className="flex justify-center gap-3.5">
        {/* Phone 1: Login */}
        <div className="relative h-[460px] w-[220px] overflow-hidden rounded-[36px] border-[8px] border-[#1A1A1A] bg-black shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <div className="absolute left-1/2 top-1.5 z-10 h-1.5 w-[60px] -translate-x-1/2 rounded bg-black" />
          <div
            className="relative h-full overflow-hidden rounded-3xl px-4 pb-4 pt-6 transition-[background]"
            style={{ background: gradient }}
          >
            <div className="px-1 pt-4 text-center">
              <div className="mx-auto flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_SVG}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div
                className="mt-2.5 text-lg font-black tracking-[-0.02em]"
                style={{ color: titleText }}
              >
                Θάνος Αλιμπάκης
              </div>
              <div
                className="mt-px text-[11px] font-semibold"
                style={{ color: fadeText }}
              >
                {studio}
              </div>
            </div>
            <div className="mt-6 rounded-[18px] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
              <div className="mb-3 text-center text-[13px] font-extrabold text-[#0A0A0A]">
                Καλώς ήρθες πίσω!
              </div>
              <div className="mb-2 rounded-[10px] bg-[#F5F5F5] p-2.5 text-[11px] text-[#888]">
                Username
              </div>
              <div className="mb-2 rounded-[10px] bg-[#F5F5F5] p-2.5 text-[11px] text-[#888]">
                Password
              </div>
              <div
                className="mt-1 rounded-[10px] p-2.5 text-center text-xs font-extrabold transition-[background]"
                style={{
                  background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`,
                  color: titleText,
                }}
              >
                Είσοδος
              </div>
            </div>
            <div
              className="absolute inset-x-0 bottom-3 text-center text-[8px] font-bold uppercase tracking-[0.1em]"
              style={{ color: watermarkText }}
            >
              Powered by Athlon
            </div>
          </div>
        </div>

        {/* Phone 2: Home */}
        <div className="relative h-[460px] w-[220px] overflow-hidden rounded-[36px] border-[8px] border-[#1A1A1A] bg-black shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <div className="absolute left-1/2 top-1.5 z-10 h-1.5 w-[60px] -translate-x-1/2 rounded bg-black" />
          <div className="relative h-full overflow-hidden rounded-3xl bg-[#0A0A0A] px-3 py-4">
            <div
              className="flex items-center gap-2 rounded-[14px] p-3 transition-[background]"
              style={{
                background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`,
              }}
            >
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_SVG}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-[9px] font-bold"
                  style={{ color: titleText }}
                >
                  Θάνος Αλιμπάκης
                </div>
                <div
                  className="text-xs font-black tracking-[-0.02em]"
                  style={{ color: titleText }}
                >
                  {studio}
                </div>
              </div>
            </div>
            <div className="mt-4 px-1 text-sm font-extrabold text-white">
              Hey Βασίλη! 👋
            </div>
            <FakeCard ttl="Σήμερα" val="Push Πρωτόκολλο 2" />
            <FakeCard ttl="Past week" val="3/4 ολοκληρώθηκαν" />
            <FakeCard ttl="Streak" val="🔥 12 ημέρες" />
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-[11px] leading-[1.5] text-text-3">
        Άλλαξε χρώμα / λογότυπο και θα δεις τη διαφορά
        <br />
        <strong className="font-semibold text-text-2">αυτόματα</strong> στο
        preview.
      </div>
    </div>
  );
}

function FakeCard({ ttl, val }: { ttl: string; val: string }) {
  return (
    <div className="mt-2.5 rounded-xl border border-[#232323] bg-[#131313] p-2.5">
      <div className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#6B6B6B]">
        {ttl}
      </div>
      <div className="mt-1 text-[13px] font-extrabold text-white">{val}</div>
    </div>
  );
}
