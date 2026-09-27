import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getProfile } from "../../../lib/profile";

type ClientRow = {
  client_id: string;
  status: string;
  profile: { full_name: string | null } | null;
};

type SessionRow = {
  id: string;
  client_id: string;
  completed_at: string;
  duration_sec: number | null;
};

type WeighInRow = {
  client_id: string;
  weight_kg: number;
  recorded_at: string;
};

const EXPECTED_SESSIONS_PER_WEEK = 3;

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type !== "trainer") {
    redirect("/home");
  }

  // Πελάτες
  const { data: clientsData } = await supabase
    .from("trainer_clients")
    .select(
      "client_id, status, profile:profiles!trainer_clients_client_id_fkey(full_name)",
    )
    .eq("trainer_id", user.id);
  const allClients = (clientsData as ClientRow[] | null) ?? [];
  const activeClients = allClients.filter((c) => c.status === "active");
  const clientIds = activeClients.map((c) => c.client_id);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const eightWeeksAgo = new Date(now);
  eightWeeksAgo.setDate(now.getDate() - 8 * 7);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(now.getDate() - 90);

  let sessionsThisMonth: SessionRow[] = [];
  let sessions8Weeks: SessionRow[] = [];
  let weighIns90d: WeighInRow[] = [];

  if (clientIds.length > 0) {
    const [{ data: m }, { data: w }, { data: wi }] = await Promise.all([
      supabase
        .from("workout_sessions")
        .select("id, client_id, completed_at, duration_sec")
        .in("client_id", clientIds)
        .not("completed_at", "is", null)
        .gte("completed_at", monthStart.toISOString()),
      supabase
        .from("workout_sessions")
        .select("id, client_id, completed_at, duration_sec")
        .in("client_id", clientIds)
        .not("completed_at", "is", null)
        .gte("completed_at", eightWeeksAgo.toISOString()),
      supabase
        .from("weigh_ins")
        .select("client_id, weight_kg, recorded_at")
        .in("client_id", clientIds)
        .gte("recorded_at", ninetyDaysAgo.toISOString())
        .order("recorded_at", { ascending: true }),
    ]);
    sessionsThisMonth = (m as SessionRow[] | null) ?? [];
    sessions8Weeks = (w as SessionRow[] | null) ?? [];
    weighIns90d = (wi as WeighInRow[] | null) ?? [];
  }

  // KPIs
  const totalSessionsMonth = sessionsThisMonth.length;
  const activeClientsThisMonth = new Set(
    sessionsThisMonth.map((s) => s.client_id),
  ).size;
  const avgSessionsPerClient =
    activeClients.length > 0
      ? totalSessionsMonth / activeClients.length
      : 0;
  const totalWeighIns = weighIns90d.length;

  // 8-week bar chart
  const weekBars = build8WeekBars(sessions8Weeks, now);

  // Client leaderboard (activity this month)
  const sessionsByClient = new Map<string, number>();
  for (const s of sessionsThisMonth) {
    sessionsByClient.set(s.client_id, (sessionsByClient.get(s.client_id) ?? 0) + 1);
  }
  const activityLeaderboard = [...activeClients]
    .map((c) => {
      const count = sessionsByClient.get(c.client_id) ?? 0;
      // Adherence = count / (weeks_so_far * EXPECTED)
      const weeksSoFar = Math.max(
        1,
        Math.ceil((now.getTime() - monthStart.getTime()) / (7 * 86400 * 1000)),
      );
      const expected = weeksSoFar * EXPECTED_SESSIONS_PER_WEEK;
      const adherence = Math.round((count / expected) * 100);
      return {
        id: c.client_id,
        name: c.profile?.full_name ?? "Χωρίς όνομα",
        sessions: count,
        adherence,
      };
    })
    .sort((a, b) => b.sessions - a.sessions);

  // Weight change leaderboard (πρώτο vs τελευταίο weigh-in κάθε πελάτη)
  const weighInsByClient = new Map<string, WeighInRow[]>();
  for (const wi of weighIns90d) {
    const arr = weighInsByClient.get(wi.client_id) ?? [];
    arr.push(wi);
    weighInsByClient.set(wi.client_id, arr);
  }
  const weightLeaderboard = [...activeClients]
    .map((c) => {
      const list = weighInsByClient.get(c.client_id) ?? [];
      if (list.length < 2) {
        return {
          id: c.client_id,
          name: c.profile?.full_name ?? "Χωρίς όνομα",
          from: list[0] ? Number(list[0].weight_kg) : null,
          to: list[0] ? Number(list[0].weight_kg) : null,
          delta: 0,
          measurements: list.length,
        };
      }
      const first = Number(list[0].weight_kg);
      const last = Number(list[list.length - 1].weight_kg);
      return {
        id: c.client_id,
        name: c.profile?.full_name ?? "Χωρίς όνομα",
        from: first,
        to: last,
        delta: Math.round((last - first) * 10) / 10,
        measurements: list.length,
      };
    })
    .filter((r) => r.measurements >= 2)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const monthLabel = now.toLocaleDateString("el-GR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border bg-[#080808]">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-6 py-4">
          <Link
            href="/trainer"
            aria-label="Πίσω"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
              Trainer <span className="text-accent">·</span> Αναφορές
            </div>
            <h1 className="text-[17px] font-extrabold tracking-[-0.015em]">
              Στατιστικά studio
            </h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-6 py-8">
        {/* KPI cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard
            label={`Προπονήσεις ${monthLabel}`}
            value={String(totalSessionsMonth)}
            sub={`${activeClientsThisMonth}/${activeClients.length} πελάτες ενεργοί`}
            trend={totalSessionsMonth > 0 ? "up" : "neutral"}
            featured
          />
          <KPICard
            label="Ενεργοί πελάτες"
            value={String(activeClients.length)}
            sub={
              allClients.length !== activeClients.length
                ? `+${allClients.length - activeClients.length} paused`
                : "όλοι active"
            }
            trend="neutral"
          />
          <KPICard
            label="Μέσος όρος / πελάτη"
            value={avgSessionsPerClient.toFixed(1)}
            sub="προπονήσεις τον μήνα"
            trend="neutral"
          />
          <KPICard
            label="Καταγραφές βάρους"
            value={String(totalWeighIns)}
            sub="τελευταίες 90 μέρες"
            trend={totalWeighIns > 0 ? "up" : "neutral"}
          />
        </div>

        {/* Weekly trend chart */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface-1">
          <div className="border-b border-border px-[22px] py-[18px]">
            <h2 className="text-sm font-extrabold tracking-[-0.01em]">
              Τάση 8 εβδομάδων
            </h2>
            <div className="mt-0.5 text-[11px] font-medium text-text-3">
              Συνολικές ολοκληρωμένες προπονήσεις πελατών ανά εβδομάδα
            </div>
          </div>
          <div className="p-[22px]">
            <WeeklyBarChart bars={weekBars} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Activity leaderboard */}
          <LeaderboardPanel
            title="Πιο ενεργοί πελάτες"
            subtitle={`Προπονήσεις ${monthLabel}`}
            rows={activityLeaderboard.slice(0, 8)}
            emptyText="Καμία προπόνηση αυτόν τον μήνα ακόμα."
            renderRow={(r) => (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-extrabold tracking-[-0.01em]">
                    {r.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-3">
                    {r.sessions} {r.sessions === 1 ? "προπόνηση" : "προπονήσεις"} · adherence{" "}
                    <span
                      className={
                        r.adherence >= 80
                          ? "font-bold text-success"
                          : r.adherence >= 50
                          ? "font-bold text-warning"
                          : "font-bold text-danger"
                      }
                    >
                      {r.adherence}%
                    </span>
                  </div>
                </div>
                <div className="font-mono text-[18px] font-extrabold text-accent">
                  {r.sessions}
                </div>
              </>
            )}
            hrefFor={(r) => `/trainer/clients/${r.id}`}
          />

          {/* Weight change leaderboard */}
          <LeaderboardPanel
            title="Μεγαλύτερες αλλαγές βάρους"
            subtitle="Πρώτο vs τελευταίο (τελευταίες 90 μέρες)"
            rows={weightLeaderboard.slice(0, 8)}
            emptyText="Δεν υπάρχουν αρκετές μετρήσεις."
            renderRow={(r) => (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-extrabold tracking-[-0.01em]">
                    {r.name}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-text-3">
                    {r.from} → {r.to} kg · {r.measurements} μετρήσεις
                  </div>
                </div>
                <div
                  className={`font-mono text-[16px] font-extrabold ${
                    r.delta < 0
                      ? "text-success"
                      : r.delta > 0
                      ? "text-warning"
                      : "text-text-3"
                  }`}
                >
                  {r.delta === 0
                    ? "±0"
                    : r.delta < 0
                    ? `↓ ${Math.abs(r.delta)}`
                    : `↑ ${r.delta}`}{" "}
                  <span className="text-[11px] font-semibold text-text-3">kg</span>
                </div>
              </>
            )}
            hrefFor={(r) => `/trainer/clients/${r.id}`}
          />
        </div>

        {/* Adherence hint */}
        <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4 text-[11px] text-text-3">
          <strong className="font-bold text-text-2">Adherence:</strong>{" "}
          υπολογίζεται ως προπονήσεις μήνα / (εβδομάδες που πέρασαν × {EXPECTED_SESSIONS_PER_WEEK}).
          Στο μέλλον θα ορίζεται custom per πελάτη.
        </div>
      </main>
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
  trend,
  featured,
}: {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "neutral";
  featured?: boolean;
}) {
  const trendCls =
    trend === "up"
      ? "text-success"
      : trend === "down"
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
      <div className="relative">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-3">
          {label}
        </div>
        <div className="mt-3 font-mono text-[30px] font-extrabold leading-none tracking-[-0.03em]">
          {value}
        </div>
        <div className={`mt-2 text-[11px] font-bold ${trendCls}`}>{sub}</div>
      </div>
    </div>
  );
}

function WeeklyBarChart({
  bars,
}: {
  bars: { label: string; val: number }[];
}) {
  const max = Math.max(1, ...bars.map((b) => b.val));
  return (
    <div>
      <div className="mb-2 flex h-[140px] items-end gap-2">
        {bars.map((b, i) => {
          const h = Math.max(6, Math.round((b.val / max) * 100));
          return (
            <div key={i} className="relative flex-1">
              {b.val > 0 && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[10px] font-extrabold text-text-2">
                  {b.val}
                </span>
              )}
              <div
                className={`w-full rounded-t-md ${
                  b.val > 0 ? "bg-accent" : "bg-surface-3 opacity-40"
                }`}
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-2">
        {bars.map((b, i) => (
          <span
            key={i}
            className="flex-1 text-center text-[9px] font-bold uppercase tracking-[0.05em] text-text-3"
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function LeaderboardPanel<T extends { id: string }>({
  title,
  subtitle,
  rows,
  emptyText,
  renderRow,
  hrefFor,
}: {
  title: string;
  subtitle: string;
  rows: T[];
  emptyText: string;
  renderRow: (r: T) => React.ReactNode;
  hrefFor: (r: T) => string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-1">
      <div className="border-b border-border px-[22px] py-[18px]">
        <h2 className="text-sm font-extrabold tracking-[-0.01em]">{title}</h2>
        <div className="mt-0.5 text-[11px] font-medium text-text-3">
          {subtitle}
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="px-[22px] py-8 text-center text-[12px] text-text-3">
          {emptyText}
        </div>
      ) : (
        <div>
          {rows.map((r, i) => (
            <Link
              key={r.id}
              href={hrefFor(r)}
              className="flex items-center gap-3 border-b border-border px-[22px] py-3 transition-colors last:border-b-0 hover:bg-surface-2"
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-extrabold ${
                  i === 0
                    ? "bg-accent/[0.15] text-accent"
                    : i === 1
                    ? "bg-text-2/10 text-text-1"
                    : i === 2
                    ? "bg-warning/[0.12] text-warning"
                    : "bg-surface-3 text-text-3"
                }`}
              >
                {i + 1}
              </div>
              {renderRow(r)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function build8WeekBars(
  sessions: SessionRow[],
  now: Date,
): { label: string; val: number }[] {
  // Δευτέρα τρέχουσας εβδομάδας
  const thisMonday = new Date(now);
  thisMonday.setHours(0, 0, 0, 0);
  thisMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const weeks: { start: Date; end: Date; val: number; label: string }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    weeks.push({
      start,
      end,
      val: 0,
      label:
        i === 0
          ? "τώρα"
          : `${start.toLocaleDateString("el-GR", { day: "numeric", month: "short" })}`,
    });
  }

  for (const s of sessions) {
    const t = new Date(s.completed_at).getTime();
    for (const w of weeks) {
      if (t >= w.start.getTime() && t < w.end.getTime()) {
        w.val++;
        break;
      }
    }
  }
  return weeks.map((w) => ({ label: w.label, val: w.val }));
}
