import Image from "next/image";
import Link from "next/link";
import { PhoneFrame } from "../_components/PhoneFrame";
import { BottomNav } from "../_components/BottomNav";

export default function HomePage() {
  return (
    <PhoneFrame>
      <div className="relative z-[1] pb-[120px]">
        <StatusBar />
        <Header />
        <StreakCard />

        <SectionTitle title="ΣΗΜΕΡΑ · ΔΕΥΤΕΡΑ 25 ΜΑΪ" />
        <TodayCard />

        <StatsGrid />

        <SectionTitle title="ΕΠΟΜΕΝΑ" actionLabel="Ημερολόγιο →" />
        <TomorrowCard />
      </div>
      <BottomNav active="home" />
    </PhoneFrame>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[50px] items-center justify-between px-8 pt-4 text-[13px] font-bold">
      <span>14:03</span>
      <span className="flex items-center gap-1.5">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <path d="M1.5 1.5h13M1.5 5.5h13M1.5 9.5h13" />
        </svg>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="1" y="3" width="14" height="6" rx="1.5" />
          <rect x="16" y="5" width="1.5" height="2" rx="0.5" />
        </svg>
      </span>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between px-5 pb-4 pt-2">
      <div className="flex items-center gap-3">
        <div className="relative h-[46px] w-[46px] overflow-hidden rounded-full border-2 border-accent bg-surface-2 shadow-[0_0_16px_rgba(197,255,0,0.35)]">
          <Image
            src="https://randomuser.me/api/portraits/men/45.jpg"
            alt="Βασίλης"
            width={46}
            height={46}
            className="h-full w-full object-cover"
          />
          <span className="absolute -bottom-px -right-px h-3 w-3 rounded-full border-2 border-bg bg-success" />
        </div>
        <div>
          <div className="text-xs font-medium text-text-3">Καλημέρα,</div>
          <div className="mt-px text-[17px] font-extrabold tracking-[-0.01em]">
            Βασίλη
          </div>
        </div>
      </div>
      <div className="flex gap-2.5">
        <button
          type="button"
          aria-label="Ειδοποιήσεις"
          className="relative flex h-[42px] w-[42px] items-center justify-center rounded-2xl border border-border bg-surface-1 text-text-1"
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
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full border-2 border-surface-1 bg-accent shadow-[0_0_8px_var(--accent)]" />
        </button>
      </div>
    </div>
  );
}

function StreakCard() {
  const dots = [
    { state: "active" as const },
    { state: "active" as const },
    { state: "active" as const },
    { state: "active" as const },
    { state: "active" as const },
    { state: "active" as const },
    { state: "today" as const },
  ];
  return (
    <div className="mx-5 mb-4 mt-2 flex items-center justify-between rounded-[18px] border border-border bg-surface-1 px-[18px] py-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl text-[22px] shadow-[0_0_16px_rgba(255,107,0,0.35)] bg-gradient-to-br from-[#FF6B00] to-[#FFB800]">
          🔥
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
            Σερί προπονήσεων
          </div>
          <div className="mt-[3px] text-lg font-extrabold tracking-[-0.01em]">
            <span className="font-mono text-accent">12</span> μέρες
          </div>
        </div>
      </div>
      <div className="flex items-end gap-1">
        {dots.map((d, i) => (
          <span
            key={i}
            className={
              d.state === "today"
                ? "h-[26px] w-[6px] rounded-[3px] bg-accent shadow-[0_0_12px_rgba(197,255,0,0.9)]"
                : d.state === "active"
                ? "h-[22px] w-[6px] rounded-[3px] bg-accent shadow-[0_0_8px_rgba(197,255,0,0.6)]"
                : "h-[22px] w-[6px] rounded-[3px] bg-surface-3"
            }
          />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  actionLabel,
  actionHref = "#",
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-baseline justify-between px-5 pb-3 pt-5">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
        {title}
      </h2>
      {actionLabel && (
        <Link
          href={actionHref}
          className="text-xs font-semibold text-text-2 no-underline"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

function TodayCard() {
  return (
    <div className="relative mx-5 overflow-hidden rounded-3xl border border-[#2E2E2E] bg-gradient-to-br from-[#1F1F1F] to-[#111] p-[22px]">
      <div
        className="pointer-events-none absolute -right-[60px] -top-[60px] h-[220px] w-[220px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(197,255,0,0.18) 0%, transparent 65%)",
        }}
      />
      <div className="relative mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/[0.12] px-[11px] py-[5px] text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
        Push · Πρωτόκολλο 2
      </div>
      <h3 className="relative mb-1.5 text-[26px] font-extrabold leading-[1.12] tracking-[-0.025em]">
        Στήθος, ώμοι
        <br />& τρικέφαλα
      </h3>
      <div className="relative mb-[18px] text-[13px] text-text-2">
        από Θάνο Αλιμπάκη
      </div>
      <div className="relative mb-5 flex gap-[18px]">
        <MetaItem
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          value="60"
          label="λεπτά"
        />
        <MetaItem
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="6" y1="4" x2="6" y2="20" />
              <line x1="18" y1="4" x2="18" y2="20" />
              <line x1="4" y1="9" x2="20" y2="9" />
              <line x1="4" y1="15" x2="20" y2="15" />
            </svg>
          }
          value="7"
          label="ασκήσεις"
        />
        <MetaItem
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          }
          value="520"
          label="kcal"
        />
      </div>
      <Link
        href="/workout"
        className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-accent p-4 text-[13px] font-extrabold uppercase tracking-[0.06em] text-[#0A0A0A] shadow-[0_0_36px_rgba(197,255,0,0.35)] transition-shadow hover:shadow-[0_0_50px_rgba(197,255,0,0.55)]"
      >
        Ξεκίνα προπόνηση
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
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </div>
  );
}

function MetaItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-[7px]">
      <span className="h-[15px] w-[15px] text-text-3">{icon}</span>
      <span className="text-[13px] font-medium text-text-2">
        <strong className="font-mono font-extrabold text-text-1">
          {value}
        </strong>{" "}
        {label}
      </span>
    </div>
  );
}

function StatsGrid() {
  return (
    <div className="mt-3.5 grid grid-cols-2 gap-2.5 px-5">
      <div className="rounded-2xl border border-border bg-surface-1 p-4">
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
          Αυτή την εβδ.
        </div>
        <div className="flex items-baseline gap-1">
          <div className="font-mono text-[26px] font-extrabold tracking-[-0.03em]">
            3
          </div>
          <div className="text-[13px] font-semibold text-text-3">
            /4 ολοκλ.
          </div>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-sm bg-surface-3">
          <div
            className="h-full rounded-sm bg-accent shadow-[0_0_6px_var(--accent)]"
            style={{ width: "75%" }}
          />
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-surface-1 p-4">
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
          Σωματικό βάρος
        </div>
        <div className="flex items-baseline gap-1">
          <div className="font-mono text-[26px] font-extrabold tracking-[-0.03em]">
            82.4
          </div>
          <div className="text-[13px] font-semibold text-text-3">kg</div>
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-accent">
          ↓ 0.6 kg αυτό το μήνα
        </div>
      </div>
    </div>
  );
}

function TomorrowCard() {
  return (
    <Link
      href="/workout"
      className="mx-5 my-3 flex items-center justify-between rounded-2xl border border-dashed border-surface-3 bg-surface-1 px-[18px] py-4 transition-colors hover:border-accent"
    >
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
          Αύριο · Τρίτη 26 Μαϊ
        </div>
        <div className="mt-1 text-[15px] font-bold tracking-[-0.01em]">
          Pull · Πρωτόκολλο 2
        </div>
      </div>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-text-3"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
