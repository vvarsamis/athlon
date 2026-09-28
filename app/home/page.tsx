import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PhoneFrame } from "../_components/PhoneFrame";
import { BottomNav } from "../_components/BottomNav";
import { LogoutButton } from "../_components/LogoutButton";
import { WeightCard } from "../_components/WeightCard";
import { createClient } from "../../lib/supabase/server";
import { getProfile } from "../../lib/profile";

function firstName(fullName: string | null | undefined, email: string | undefined) {
  const fn = fullName?.trim();
  if (fn) return fn.split(/\s+/)[0];
  if (email) return email.split("@")[0];
  return "αθλητή";
}

function vocative(name: string) {
  // simple Greek vocative for common male names ending in -ς
  if (/ς$/.test(name)) return name.slice(0, -1);
  return name;
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await getProfile(supabase, user.id);
    if (profile?.user_type === "trainer") {
      redirect("/trainer");
    }
  }

  const name = vocative(firstName(user?.user_metadata?.full_name, user?.email));

  // Ο προπονητής + το ανατεθειμένο πρόγραμμα
  let trainerName: string | null = null;
  let assignedProgram: {
    name: string;
    title: string;
    duration: number | null;
    kcal: number | null;
    exerciseCount: number;
  } | null = null;
  let dbgToday = -1;
  let dbgScheduleRow = "N/A";
  let dbgFallback = "N/A";
  let dbgFinalProgramId = "N/A";
  if (user) {
    const { data: link } = await supabase
      .from("trainer_clients")
      .select(
        "assigned_program_id, trainer:profiles!trainer_clients_trainer_id_fkey(full_name)",
      )
      .eq("client_id", user.id)
      .maybeSingle();
    const linkAny = link as {
      assigned_program_id: string | null;
      trainer: { full_name: string | null } | null;
    } | null;
    trainerName = linkAny?.trainer?.full_name ?? null;

    // Resolve today's program: weekly_schedule πρώτο, μετά fallback στο assigned_program_id
    const today = (new Date().getDay() + 6) % 7; // Δευτέρα = 0
    dbgToday = today;
    const { data: scheduleRow, error: scheduleErr } = await supabase
      .from("client_weekly_schedule")
      .select("program_id")
      .eq("client_id", user.id)
      .eq("day_of_week", today)
      .maybeSingle();
    dbgScheduleRow = scheduleErr
      ? `ERR:${scheduleErr.code}`
      : scheduleRow
      ? `${(scheduleRow as { program_id: string | null }).program_id?.slice(0, 8) ?? "null"}`
      : "empty";
    dbgFallback = linkAny?.assigned_program_id?.slice(0, 8) ?? "null";
    const todayProgramId =
      (scheduleRow as { program_id: string | null } | null)?.program_id ??
      linkAny?.assigned_program_id ??
      null;
    dbgFinalProgramId = todayProgramId?.slice(0, 8) ?? "NULL";

    if (todayProgramId) {
      const { data: prog } = await supabase
        .from("programs")
        .select("name, title, estimated_duration_min, estimated_kcal")
        .eq("id", todayProgramId)
        .single();
      const { count: exCount } = await supabase
        .from("program_exercises")
        .select("id", { count: "exact", head: true })
        .eq("program_id", todayProgramId);
      if (prog) {
        assignedProgram = {
          name: prog.name,
          title: prog.title,
          duration: prog.estimated_duration_min,
          kcal: prog.estimated_kcal,
          exerciseCount: exCount ?? 0,
        };
      }
    }
  }

  // Πραγματικά sessions του πελάτη
  let streakDays = 0;
  let sessionsThisWeek = 0;
  const weekTarget = 4;
  if (user) {
    // Streak: μέτρα διαδοχικές μέρες με τουλάχιστον 1 completed session,
    // ξεκινώντας από σήμερα και πηγαίνοντας πίσω
    const { data: recentSessions } = await supabase
      .from("workout_sessions")
      .select("completed_at")
      .eq("client_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(90);

    const days = new Set<string>();
    for (const s of (recentSessions as { completed_at: string }[] | null) ?? []) {
      const d = new Date(s.completed_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      days.add(key);
    }
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (days.has(key)) {
        streakDays++;
      } else if (i === 0) {
        // σήμερα δεν έχει session, δεν σπάει το streak — check αν χθες έχει
        continue;
      } else {
        break;
      }
    }

    // This week: Δευτέρα-Κυριακή (ISO week)
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    const { count: weekCount } = await supabase
      .from("workout_sessions")
      .select("id", { count: "exact", head: true })
      .eq("client_id", user.id)
      .not("completed_at", "is", null)
      .gte("completed_at", monday.toISOString());
    sessionsThisWeek = weekCount ?? 0;
  }

  // Latest + ~30-day-old βάρος (για delta)
  let latestKg: number | null = null;
  let monthAgoKg: number | null = null;
  if (user) {
    const { data: latest } = await supabase
      .from("weigh_ins")
      .select("weight_kg")
      .eq("client_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    latestKg = latest?.weight_kg != null ? Number(latest.weight_kg) : null;

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const { data: older } = await supabase
      .from("weigh_ins")
      .select("weight_kg")
      .eq("client_id", user.id)
      .lte("recorded_at", monthAgo.toISOString())
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    monthAgoKg = older?.weight_kg != null ? Number(older.weight_kg) : null;
  }

  return (
    <PhoneFrame>
      <div className="relative z-[1] pb-[120px]">
        <StatusBar />
        <Header name={name} />
        <StreakCard days={streakDays} />

        <SectionTitle title="ΣΗΜΕΡΑ" />
        <TodayCard trainerName={trainerName} program={assignedProgram} />
        {/* DEBUG: dev-time only marker */}
        <div className="mx-5 mt-2 rounded-lg border border-warning/30 bg-warning/[0.06] px-3 py-2 font-mono text-[10px] text-warning">
          🐛 DEBUG · today={dbgToday} · schedRow={dbgScheduleRow} · fallback={dbgFallback} · finalId={dbgFinalProgramId}
        </div>

        <StatsGrid
          completedThisWeek={sessionsThisWeek}
          weekTarget={weekTarget}
          latestKg={latestKg}
          monthAgoKg={monthAgoKg}
        />

        <SectionTitle title="ΕΠΟΜΕΝΑ" actionLabel="Ημερολόγιο →" />
        <TomorrowCard />
      </div>
      <BottomNav active="home" userId={user?.id} />
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

function Header({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between px-5 pb-4 pt-2">
      <div className="flex items-center gap-3">
        <div className="relative h-[46px] w-[46px] overflow-hidden rounded-full border-2 border-accent bg-surface-2 shadow-[0_0_16px_rgba(197,255,0,0.35)]">
          <Image
            src="https://randomuser.me/api/portraits/men/45.jpg"
            alt={name}
            width={46}
            height={46}
            className="h-full w-full object-cover"
          />
          <span className="absolute -bottom-px -right-px h-3 w-3 rounded-full border-2 border-bg bg-success" />
        </div>
        <div>
          <div className="text-xs font-medium text-text-3">Καλημέρα,</div>
          <div className="mt-px text-[17px] font-extrabold tracking-[-0.01em]">
            {name}
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
        <LogoutButton />
      </div>
    </div>
  );
}

function StreakCard({ days }: { days: number }) {
  // Δείχνουμε τις τελευταίες 7 μέρες: όσες πρώτες = active βάσει streak
  const dots = Array.from({ length: 7 }).map((_, i) => {
    // Το τελευταίο dot (i === 6) είναι "σήμερα"
    // Streak μετράει διαδοχικές μέρες από σήμερα προς τα πίσω
    const daysBack = 6 - i;
    if (daysBack < days) {
      return daysBack === 0 ? ("today" as const) : ("active" as const);
    }
    return "inactive" as const;
  });
  return (
    <div className="mx-5 mb-4 mt-2 flex items-center justify-between rounded-[18px] border border-border bg-surface-1 px-[18px] py-4">
      <div className="flex items-center gap-3.5">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-[22px] ${
            days > 0
              ? "bg-gradient-to-br from-[#FF6B00] to-[#FFB800] shadow-[0_0_16px_rgba(255,107,0,0.35)]"
              : "bg-surface-3"
          }`}
        >
          {days > 0 ? "🔥" : "💤"}
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
            Σερί προπονήσεων
          </div>
          <div className="mt-[3px] text-lg font-extrabold tracking-[-0.01em]">
            {days > 0 ? (
              <>
                <span className="font-mono text-accent">{days}</span>{" "}
                {days === 1 ? "μέρα" : "μέρες"}
              </>
            ) : (
              <span className="text-text-2">Ξεκίνα σήμερα</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-end gap-1">
        {dots.map((d, i) => (
          <span
            key={i}
            className={
              d === "today"
                ? "h-[26px] w-[6px] rounded-[3px] bg-accent shadow-[0_0_12px_rgba(197,255,0,0.9)]"
                : d === "active"
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

function TodayCard({
  trainerName,
  program,
}: {
  trainerName: string | null;
  program: {
    name: string;
    title: string;
    duration: number | null;
    kcal: number | null;
    exerciseCount: number;
  } | null;
}) {
  const displayName = program?.name ?? "Push · Πρωτόκολλο 2";
  const displayTitle = program?.title ?? "Στήθος, ώμοι & τρικέφαλα";
  const displayDuration = program?.duration ?? 60;
  const displayKcal = program?.kcal ?? 520;
  const displayExercises = program?.exerciseCount ?? 7;
  const byline = trainerName
    ? `από ${trainerName}${program ? "" : " · δείγμα"}`
    : "Δείγμα προγράμματος";
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
        {displayName}
      </div>
      <h3 className="relative mb-1.5 text-[26px] font-extrabold leading-[1.12] tracking-[-0.025em]">
        {displayTitle}
      </h3>
      <div className="relative mb-[18px] text-[13px] text-text-2">{byline}</div>
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
          value={String(displayDuration)}
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
          value={String(displayExercises)}
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
          value={String(displayKcal)}
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

function StatsGrid({
  completedThisWeek,
  weekTarget,
  latestKg,
  monthAgoKg,
}: {
  completedThisWeek: number;
  weekTarget: number;
  latestKg: number | null;
  monthAgoKg: number | null;
}) {
  const pct = Math.min(100, Math.round((completedThisWeek / weekTarget) * 100));
  return (
    <div className="mt-3.5 grid grid-cols-2 gap-2.5 px-5">
      <div className="rounded-2xl border border-border bg-surface-1 p-4">
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
          Αυτή την εβδ.
        </div>
        <div className="flex items-baseline gap-1">
          <div className="font-mono text-[26px] font-extrabold tracking-[-0.03em]">
            {completedThisWeek}
          </div>
          <div className="text-[13px] font-semibold text-text-3">
            /{weekTarget} ολοκλ.
          </div>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-sm bg-surface-3">
          <div
            className="h-full rounded-sm bg-accent shadow-[0_0_6px_var(--accent)] transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <WeightCard latestKg={latestKg} monthAgoKg={monthAgoKg} />
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
