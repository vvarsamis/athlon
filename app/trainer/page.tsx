import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "../_components/LogoutButton";
import { createClient } from "../../lib/supabase/server";

function firstName(meta: { full_name?: string } | undefined, email: string | undefined) {
  const fn = meta?.full_name?.trim();
  if (fn) return fn;
  if (email) return email.split("@")[0];
  return "Trainer";
}

function vocative(name: string) {
  if (/ς$/.test(name)) return name.slice(0, -1);
  return name;
}

export default async function TrainerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fullName = firstName(user?.user_metadata, user?.email);
  const firstWord = vocative(fullName.split(/\s+/)[0]);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      <Sidebar fullName={fullName} email={user?.email ?? ""} />
      <main className="min-w-0 px-4 pb-12 pt-6 md:px-8">
        <DemoBanner />
        <TopBar greeting={firstWord} />
        <StatsRow />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
          <ActivityPanel />
          <div className="flex flex-col gap-5">
            <NeedsAttentionPanel />
            <WeekChartPanel />
            <QuickActionsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}

function Sidebar({ fullName, email }: { fullName: string; email: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-[#080808] p-3.5 md:flex">
      <div className="mb-4 border-b border-border px-3 pb-6 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-[#8FB300] text-lg font-black text-[#0A0A0A] shadow-[0_0_16px_rgba(197,255,0,0.35)]">
            A
          </div>
          <div>
            <div className="text-[17px] font-black tracking-[-0.025em]">
              ATHLON<span className="text-accent">.</span>
            </div>
            <div className="mt-px text-[9px] font-bold uppercase tracking-[0.15em] text-text-3">
              Trainer
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-border bg-surface-1 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#303030] bg-black text-[10px] font-black text-[#FFD700]">
            MX
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold tracking-[-0.01em]">
              Maxfitness
            </div>
            <div className="mt-px text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
              ● Pro · 23 clients
            </div>
          </div>
        </div>
      </div>

      <NavSection title="Επισκόπηση">
        <NavItem
          active
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
          }
        >
          Dashboard
        </NavItem>
        <NavItem
          alert
          badge="3"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        >
          Πελάτες
        </NavItem>
        <NavItem
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
        >
          Προγράμματα
        </NavItem>
        <NavItem
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          }
        >
          Διατροφή
        </NavItem>
        <NavItem
          icon={
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
          }
        >
          Ημερολόγιο
        </NavItem>
      </NavSection>

      <NavSection title="Στατιστικά">
        <NavItem
          icon={
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
          }
        >
          Αναφορές
        </NavItem>
        <NavItem
          icon={
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
          }
        >
          Μηνύματα
        </NavItem>
      </NavSection>

      <div className="mt-auto border-t border-border pt-4">
        <div className="flex items-center gap-2.5 rounded-[10px] p-2">
          <Image
            src="https://randomuser.me/api/portraits/men/72.jpg"
            alt={fullName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border-[1.5px] border-accent object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold tracking-[-0.01em]">
              {fullName}
            </div>
            <div className="truncate text-[11px] text-text-3">{email}</div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mb-1.5 mt-4 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-text-3">
        {title}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </>
  );
}

function NavItem({
  icon,
  children,
  active,
  alert,
  badge,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  alert?: boolean;
  badge?: string;
}) {
  const baseClass =
    "flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-semibold transition-colors";
  const stateClass = active
    ? "bg-accent/[0.12] text-accent [&>svg]:drop-shadow-[0_0_6px_rgba(197,255,0,0.5)]"
    : "text-text-2 hover:bg-surface-1 hover:text-text-1";
  return (
    <a className={`${baseClass} ${stateClass}`}>
      <span className="h-[18px] w-[18px] flex-shrink-0">{icon}</span>
      {children}
      {badge && (
        <span
          className={`ml-auto rounded-full px-[7px] py-0.5 font-mono text-[10px] font-extrabold ${
            active
              ? "bg-accent text-[#0A0A0A]"
              : alert
              ? "bg-danger text-white shadow-[0_0_8px_rgba(255,77,77,0.5)]"
              : "bg-surface-3 text-text-2"
          }`}
        >
          {badge}
        </span>
      )}
    </a>
  );
}

function DemoBanner() {
  return (
    <div className="mb-5 rounded-lg border-l-[3px] border-accent bg-gradient-to-r from-accent/[0.12] to-transparent px-4 py-2.5 text-xs text-text-2">
      <strong className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-accent">
        Demo
      </strong>{" "}
      · Αυτό βλέπει ο Θάνος (trainer) όταν μπαίνει το πρωί στο laptop του
    </div>
  );
}

function TopBar({ greeting }: { greeting: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-[-0.025em]">
          Καλημέρα, {greeting} <span className="text-accent">·</span>
        </h1>
        <p className="mt-1 text-sm text-text-2">
          23 ενεργοί πελάτες · 12 προπονήσεις σήμερα · 3 χρειάζονται προσοχή
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Αναζήτηση πελάτη, άσκησης..."
            className="w-60 rounded-xl border border-border bg-surface-1 py-2.5 pl-9 pr-3.5 text-[13px] text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-[7px] rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-[13px] font-bold text-text-1 hover:border-[#303030]"
        >
          <PlusIcon />
          Νέος πελάτης
        </button>
        <Link
          href="/workout-builder"
          className="flex items-center gap-[7px] rounded-xl bg-accent px-4 py-2.5 text-[13px] font-bold text-[#0A0A0A] shadow-[0_0_24px_rgba(197,255,0,0.3)] hover:shadow-[0_0_32px_rgba(197,255,0,0.5)]"
        >
          <PlusIcon />
          Νέο πρόγραμμα
        </Link>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function StatsRow() {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        featured
        label="Ενεργοί πελάτες"
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
        value="23"
        delta="+3 αυτό το μήνα"
        deltaTrend="up"
      />
      <StatCard
        label="Σήμερα ολοκληρώθηκαν"
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        }
        value="8"
        unit="/12"
        delta="67% completion rate"
        deltaTrend="neutral"
      />
      <StatCard
        label="Adherence (30d)"
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        }
        value="84"
        unit="%"
        delta="+6% από προηγ. μήνα"
        deltaTrend="up"
      />
      <StatCard
        label="Έσοδα μήνα"
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
        value="2.840"
        unit="€"
        delta="+320€ vs Απρ"
        deltaTrend="up"
      />
    </div>
  );
}

function StatCard({
  label,
  icon,
  value,
  unit,
  delta,
  deltaTrend,
  featured,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  unit?: string;
  delta: string;
  deltaTrend: "up" | "down" | "neutral";
  featured?: boolean;
}) {
  const trendClass =
    deltaTrend === "up"
      ? "text-success"
      : deltaTrend === "down"
      ? "text-danger"
      : "text-text-3";
  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border p-5 ${
        featured
          ? "border-[#303030] bg-gradient-to-br from-[#1F1F1F] to-[#111]"
          : "border-border bg-surface-1"
      }`}
    >
      {featured && (
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-[140px] w-[140px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(197,255,0,0.15) 0%, transparent 65%)",
          }}
        />
      )}
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-3">
          {label}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${
            featured
              ? "bg-accent/[0.12] text-accent"
              : "bg-surface-3 text-text-2"
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="relative font-mono text-[32px] font-extrabold leading-none tracking-[-0.03em]">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-semibold text-text-3">{unit}</span>
        )}
      </div>
      <div
        className={`relative mt-2 flex items-center gap-1.5 text-xs font-bold ${trendClass}`}
      >
        {deltaTrend === "up" && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        )}
        {delta}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-surface-1">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <div>
          <h2 className="text-sm font-extrabold tracking-[-0.01em]">{title}</h2>
          {subtitle && (
            <div className="mt-0.5 text-[11px] font-medium text-text-3">
              {subtitle}
            </div>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="text-xs font-semibold text-text-2"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

type StatusType = "in-progress" | "completed" | "missed" | "neutral";

function ActivityPanel() {
  const items: {
    avatar: string;
    name: string;
    time: string;
    desc: React.ReactNode;
    status: { label: string; type: StatusType };
  }[] = [
    {
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      name: "Βασίλης Β.",
      time: "14:08",
      status: { label: "Προπονείται τώρα", type: "in-progress" },
      desc: (
        <>
          Στην <strong className="font-bold text-text-1">Άσκηση 3/7</strong> ·
          Push Πρωτόκολλο 2 · 18 λεπτά μέσα
        </>
      ),
    },
    {
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
      name: "Μαρία Κ.",
      time: "13:42",
      status: { label: "Ολοκληρώθηκε", type: "completed" },
      desc: (
        <>
          <strong className="font-bold text-text-1">Leg Day</strong> · 52' ·
          Κατέγραψε προσωπικό ρεκόρ στο squat (62.5 kg)
        </>
      ),
    },
    {
      avatar: "https://randomuser.me/api/portraits/men/55.jpg",
      name: "Νίκος Π.",
      time: "12:15",
      status: { label: "Ολοκληρώθηκε", type: "completed" },
      desc: (
        <>
          <strong className="font-bold text-text-1">Pull Πρωτόκολλο 1</strong> ·
          48' · Άφησε σχόλιο: «Σκληρό σήμερα»
        </>
      ),
    },
    {
      avatar: "https://randomuser.me/api/portraits/women/38.jpg",
      name: "Ελένη Δ.",
      time: "11:30",
      status: { label: "Ανέβασε φωτό", type: "neutral" },
      desc: (
        <>
          <strong className="font-bold text-text-1">
            Πρόοδος εβδομάδας 8
          </strong>{" "}
          · Βάρος: 64.2 kg (−1.8 kg σε 8 εβδ.)
        </>
      ),
    },
    {
      avatar: "https://randomuser.me/api/portraits/men/29.jpg",
      name: "Γιάννης Σ.",
      time: "Χθες",
      status: { label: "Παραλείφθηκε", type: "missed" },
      desc: (
        <>
          <strong className="font-bold text-text-1">Upper Body</strong> · Δεν
          την έκανε χθες · 3η παράλειψη σε 2 εβδ.
        </>
      ),
    },
  ];
  return (
    <Panel
      title="Ζωντανή δραστηριότητα"
      subtitle="Τι κάνουν τώρα οι πελάτες σου"
      action={{ label: "Όλη η ροή →", href: "#" }}
    >
      <div className="py-2">
        {items.map((it) => (
          <div
            key={it.name + it.time}
            className="flex cursor-pointer items-center gap-3.5 px-[22px] py-3.5 transition-colors hover:bg-surface-2"
          >
            <Image
              src={it.avatar}
              alt=""
              width={38}
              height={38}
              className="h-[38px] w-[38px] flex-shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-baseline gap-2">
                <span className="text-sm font-bold tracking-[-0.01em]">
                  {it.name}
                </span>
                <StatusPill type={it.status.type}>{it.status.label}</StatusPill>
              </div>
              <div className="text-xs leading-[1.4] text-text-2">{it.desc}</div>
            </div>
            <span className="font-mono text-[11px] font-semibold text-text-3">
              {it.time}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function StatusPill({
  type,
  children,
}: {
  type: StatusType;
  children: React.ReactNode;
}) {
  const cls =
    type === "completed"
      ? "bg-success/[0.12] text-success"
      : type === "in-progress"
      ? "bg-accent/[0.12] text-accent"
      : type === "missed"
      ? "bg-danger/[0.12] text-danger"
      : "bg-surface-3 text-text-2";
  return (
    <span
      className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.06em] ${cls}`}
    >
      <span
        className="h-[5px] w-[5px] rounded-full bg-current"
        style={
          type === "in-progress"
            ? { animation: "accent-pulse 1.5s ease-in-out infinite" }
            : undefined
        }
      />
      {children}
    </span>
  );
}

function NeedsAttentionPanel() {
  const items: { avatar: string; name: string; reason: string; warn?: boolean; cta: string }[] = [
    {
      avatar: "https://randomuser.me/api/portraits/men/29.jpg",
      name: "Γιάννης Σ.",
      reason: "3 παραλείψεις σε 2 εβδ.",
      cta: "Μήνυμα",
    },
    {
      avatar: "https://randomuser.me/api/portraits/women/51.jpg",
      name: "Σοφία Λ.",
      reason: "Συνδρομή λήγει σε 5 μέρες",
      warn: true,
      cta: "Ανανέωση",
    },
    {
      avatar: "https://randomuser.me/api/portraits/men/64.jpg",
      name: "Κώστας Μ.",
      reason: "Δεν συνδέθηκε 8 μέρες",
      cta: "Μήνυμα",
    },
  ];
  return (
    <Panel title="Χρειάζονται προσοχή" subtitle="3 πελάτες με ζητήματα">
      <div className="py-2">
        {items.map((it) => (
          <div
            key={it.name}
            className="flex cursor-pointer items-center gap-3 px-[22px] py-3.5 transition-colors hover:bg-surface-2"
          >
            <Image
              src={it.avatar}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold tracking-[-0.01em]">
                {it.name}
              </div>
              <div
                className={`mt-0.5 text-[11px] font-semibold ${
                  it.warn ? "text-warning" : "text-danger"
                }`}
              >
                {it.reason}
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg border border-[#303030] bg-surface-2 px-2.5 py-1.5 text-[11px] font-bold text-text-1 hover:border-accent hover:text-accent"
            >
              {it.cta}
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function WeekChartPanel() {
  const bars = [
    { day: "Δ", val: 5, h: 35 },
    { day: "Τ", val: 9, h: 60 },
    { day: "Τ", val: 12, h: 80 },
    { day: "Π", val: 7, h: 50 },
    { day: "Π", val: 10, h: 70 },
    { day: "Σ", val: 8, h: 55, today: true },
    { day: "Κ", val: null as number | null, h: 15, future: true },
  ];
  return (
    <Panel title="Αυτή την εβδομάδα" subtitle="Ολοκληρωμένες προπονήσεις">
      <div className="px-[22px] py-[18px]">
        <div className="mb-2 flex h-[100px] items-end gap-2">
          {bars.map((b, i) => (
            <div
              key={i}
              className={`relative flex-1 rounded-t-md ${
                b.today
                  ? "bg-text-1"
                  : b.future
                  ? "bg-surface-3 opacity-40"
                  : "bg-surface-3"
              }`}
              style={{ height: `${b.h}%` }}
            >
              {b.val !== null && (
                <span className="absolute -top-[18px] left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-text-2">
                  {b.val}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2">
          {bars.map((b, i) => (
            <span
              key={i}
              className={`flex-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] ${
                b.today ? "text-text-1" : "text-text-3"
              }`}
            >
              {b.day}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function QuickActionsPanel() {
  const actions = [
    {
      title: "Νέος πελάτης",
      desc: "Προσθήκη + αυτόματο email πρόσκλησης",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
    },
    {
      title: "Νέο πρόγραμμα",
      desc: "Φτιάξε από μηδέν ή από template",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      ),
    },
    {
      title: "Πλάνο διατροφής",
      desc: "Δομημένο πλάνο με γεύματα & μακρο",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        </svg>
      ),
    },
    {
      title: "Ομαδικό μήνυμα",
      desc: "Push notification σε όλους τους πελάτες",
      icon: (
        <svg
          width="16"
          height="16"
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
  return (
    <Panel title="Γρήγορες ενέργειες">
      <div className="grid grid-cols-2 gap-2.5 px-[22px] py-[18px]">
        {actions.map((a) => (
          <button
            key={a.title}
            type="button"
            className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-surface-2 p-4 text-left text-text-1 transition-all hover:border-accent hover:bg-surface-1"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent/[0.12] text-accent">
              {a.icon}
            </div>
            <div className="text-[13px] font-bold tracking-[-0.01em]">
              {a.title}
            </div>
            <div className="text-[11px] leading-[1.4] text-text-3">
              {a.desc}
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}
