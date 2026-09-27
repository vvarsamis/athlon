import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getProfile } from "../../../../lib/profile";

type ClientAssignment = {
  status: string;
  joined_at: string;
  assigned_program_id: string | null;
  assigned_nutrition_plan_id: string | null;
  profile: { full_name: string | null; avatar_url: string | null } | null;
  program: { name: string; title: string; estimated_duration_min: number | null; estimated_kcal: number | null } | null;
  nutrition_plan: { name: string; target_kcal: number | null } | null;
};

type WeighIn = { weight_kg: number; recorded_at: string; notes: string | null };
type PhotoRow = { id: string; storage_path: string; weight_kg: number | null; taken_at: string };
type SessionRow = { id: string; program_title: string | null; program_name: string | null; started_at: string; completed_at: string | null; duration_sec: number | null };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trainerProfile = await getProfile(supabase, user.id);
  if (trainerProfile?.user_type !== "trainer") {
    redirect("/home");
  }

  // Verify: αυτός ο πελάτης ΕΙΝΑΙ δικός του
  const { data: rel } = await supabase
    .from("trainer_clients")
    .select(
      "status, joined_at, assigned_program_id, assigned_nutrition_plan_id, profile:profiles!trainer_clients_client_id_fkey(full_name, avatar_url), program:programs(name, title, estimated_duration_min, estimated_kcal), nutrition_plan:nutrition_plans(name, target_kcal)",
    )
    .eq("trainer_id", user.id)
    .eq("client_id", clientId)
    .maybeSingle();

  if (!rel) {
    redirect("/trainer/clients");
  }

  const assignment = rel as unknown as ClientAssignment;
  const clientName = assignment.profile?.full_name ?? "Πελάτης";

  // Weight history
  const { data: weighInsData } = await supabase
    .from("weigh_ins")
    .select("weight_kg, recorded_at, notes")
    .eq("client_id", clientId)
    .order("recorded_at", { ascending: true });
  const weighIns = (weighInsData as WeighIn[] | null) ?? [];

  // Progress photos + signed URLs
  const { data: photosData } = await supabase
    .from("progress_photos")
    .select("id, storage_path, weight_kg, taken_at")
    .eq("client_id", clientId)
    .order("taken_at", { ascending: false });
  const photos = (photosData as PhotoRow[] | null) ?? [];
  const photoUrls = new Map<string, string>();
  if (photos.length > 0) {
    const { data: signed } = await supabase.storage
      .from("progress-photos")
      .createSignedUrls(
        photos.map((p) => p.storage_path),
        60 * 60,
      );
    for (const s of signed ?? []) {
      if (s.signedUrl && s.path) {
        photoUrls.set(s.path, s.signedUrl);
      }
    }
  }

  // Workout sessions
  const { data: sessionsData } = await supabase
    .from("workout_sessions")
    .select("id, program_title, program_name, started_at, completed_at, duration_sec")
    .eq("client_id", clientId)
    .order("started_at", { ascending: false })
    .limit(10);
  const sessions = (sessionsData as SessionRow[] | null) ?? [];

  // Computed stats
  const latestWeight = weighIns.length > 0 ? weighIns[weighIns.length - 1] : null;
  const firstWeight = weighIns.length > 0 ? weighIns[0] : null;
  const totalDelta =
    latestWeight && firstWeight && latestWeight !== firstWeight
      ? Math.round((Number(latestWeight.weight_kg) - Number(firstWeight.weight_kg)) * 10) / 10
      : null;

  const completedSessions = sessions.filter((s) => s.completed_at != null);

  // Streak calc
  const daySet = new Set<string>();
  for (const s of completedSessions) {
    if (!s.completed_at) continue;
    const d = new Date(s.completed_at);
    daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (daySet.has(key)) streak++;
    else if (i === 0) continue;
    else break;
  }

  const joined = new Date(assignment.joined_at).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const memberDays = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(assignment.joined_at).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <div className="min-h-screen bg-bg">
      <TopBar clientName={clientName} />
      <div className="mx-auto max-w-[1240px] px-4 pb-12 pt-6 md:px-8">
        <ClientHeader
          name={clientName}
          avatarUrl={assignment.profile?.avatar_url}
          status={assignment.status}
          joined={joined}
          memberDays={memberDays}
          latestWeightKg={latestWeight ? Number(latestWeight.weight_kg) : null}
          totalDelta={totalDelta}
          streak={streak}
          totalSessions={completedSessions.length}
        />

        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <WeightChartPanel weighIns={weighIns} />
          <ActiveProgramsPanel
            program={assignment.program}
            nutritionPlan={assignment.nutrition_plan}
          />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-5">
          <ProgressPhotosPanel photos={photos} photoUrls={photoUrls} />
        </div>

        <div className="grid grid-cols-1 gap-5">
          <RecentActivityPanel sessions={sessions} />
        </div>
      </div>
    </div>
  );
}

function TopBar({ clientName }: { clientName: string }) {
  return (
    <div className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-[#080808] px-6">
      <Link
        href="/trainer/clients"
        aria-label="Πίσω"
        className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
          Πελάτες <span className="text-accent">·</span> Προφίλ
        </div>
        <h1 className="truncate text-[17px] font-extrabold tracking-[-0.015em]">
          {clientName}
        </h1>
      </div>
      <button
        type="button"
        disabled
        title="Σύντομα — Φάση Γ"
        className="hidden items-center gap-2 rounded-[10px] border border-border bg-surface-1 px-3.5 py-2.5 text-[13px] font-bold text-text-3 opacity-60 md:flex"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Μήνυμα · σύντομα
      </button>
    </div>
  );
}

function ClientHeader({
  name,
  avatarUrl,
  status,
  joined,
  memberDays,
  latestWeightKg,
  totalDelta,
  streak,
  totalSessions,
}: {
  name: string;
  avatarUrl: string | null | undefined;
  status: string;
  joined: string;
  memberDays: number;
  latestWeightKg: number | null;
  totalDelta: number | null;
  streak: number;
  totalSessions: number;
}) {
  const statusLabel = status === "active" ? "Ενεργός" : status === "paused" ? "Σε παύση" : status;
  const statusColor =
    status === "active"
      ? "bg-success/[0.12] text-success"
      : status === "paused"
      ? "bg-warning/[0.12] text-warning"
      : "bg-surface-3 text-text-3";

  return (
    <div className="relative mb-6 overflow-hidden rounded-[22px] border border-[#303030] bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-7">
      <div
        className="pointer-events-none absolute -right-[60px] -top-[60px] h-[280px] w-[280px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(197,255,0,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex flex-wrap items-center gap-7">
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={120}
              height={120}
              unoptimized
              className="h-[120px] w-[120px] rounded-full border-[3px] border-accent object-cover shadow-[0_0_28px_rgba(197,255,0,0.3)]"
            />
          ) : (
            <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-[3px] border-accent bg-surface-3 text-5xl font-extrabold text-text-1 shadow-[0_0_28px_rgba(197,255,0,0.3)]">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-text-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[10px] font-extrabold uppercase tracking-[0.1em] ${statusColor}`}>
              <span className="h-[5px] w-[5px] rounded-full bg-current" />
              {statusLabel}
            </span>
            <span>Μέλος για {memberDays} {memberDays === 1 ? "ημέρα" : "ημέρες"}</span>
            <span>·</span>
            <span>από {joined}</span>
          </div>
          <div className="mb-4 text-[34px] font-extrabold leading-none tracking-[-0.03em]">
            {name}
          </div>
          <div className="flex flex-wrap gap-6">
            <QuickStat
              label="Βάρος"
              val={latestWeightKg != null ? String(latestWeightKg) : "—"}
              unit={latestWeightKg != null ? "kg" : ""}
              delta={
                totalDelta == null
                  ? latestWeightKg == null
                    ? "Καμία μέτρηση"
                    : "1η μέτρηση"
                  : totalDelta === 0
                  ? "= από την αρχή"
                  : totalDelta < 0
                  ? `↓ ${Math.abs(totalDelta)} kg συνολικά`
                  : `↑ ${totalDelta} kg συνολικά`
              }
              deltaClass={
                totalDelta == null
                  ? "text-text-3"
                  : totalDelta < 0
                  ? "text-success"
                  : totalDelta > 0
                  ? "text-warning"
                  : "text-text-3"
              }
            />
            <QuickStat
              label="Streak"
              val={streak > 0 ? String(streak) : "0"}
              unit={streak === 1 ? "μέρα" : "μέρες"}
              delta={streak > 0 ? "🔥 σε εξέλιξη" : "Καμία ενεργή σειρά"}
              deltaClass={streak > 0 ? "text-success" : "text-text-3"}
            />
            <QuickStat
              label="Προπονήσεις"
              val={String(totalSessions)}
              unit="συνολικά"
              delta={totalSessions > 0 ? "Καταγεγραμμένες" : "Καμία ακόμα"}
              deltaClass={totalSessions > 0 ? "text-success" : "text-text-3"}
            />
            <QuickStat
              label="Adherence"
              val="—"
              unit=""
              delta="Σύντομα"
              deltaClass="text-text-3"
              last
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  label,
  val,
  unit,
  delta,
  deltaClass,
  last,
}: {
  label: string;
  val: string;
  unit: string;
  delta: string;
  deltaClass: string;
  last?: boolean;
}) {
  return (
    <div className={`pr-6 ${last ? "" : "border-r border-border"}`}>
      <div className="mb-[5px] text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5 font-mono text-[22px] font-extrabold leading-none tracking-[-0.02em]">
        {val}
        {unit && <span className="text-xs font-semibold text-text-3">{unit}</span>}
      </div>
      <div className={`mt-1 text-[11px] font-bold ${deltaClass}`}>{delta}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
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
      </div>
      {children}
    </div>
  );
}

function WeightChartPanel({ weighIns }: { weighIns: WeighIn[] }) {
  if (weighIns.length === 0) {
    return (
      <Panel title="Πορεία βάρους" subtitle="Καμία μέτρηση ακόμα">
        <div className="flex h-[200px] items-center justify-center px-[22px] text-center text-sm text-text-3">
          Ο πελάτης δεν έχει καταγράψει βάρος ακόμα.
        </div>
      </Panel>
    );
  }

  const values = weighIns.map((w) => Number(w.weight_kg));
  const first = values[0];
  const last = values[values.length - 1];
  const delta = Math.round((last - first) * 10) / 10;

  // Chart geometry
  const width = 700;
  const height = 200;
  const padTop = 30;
  const padBottom = 30;
  const padLeft = 20;
  const padRight = 40;

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = Math.max(0.5, maxVal - minVal);
  const yPad = range * 0.2;
  const yMin = minVal - yPad;
  const yMax = maxVal + yPad;

  const times = weighIns.map((w) => new Date(w.recorded_at).getTime());
  const tMin = times[0];
  const tMax = times[times.length - 1];
  const tRange = Math.max(1, tMax - tMin);

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const points = weighIns.map((w, i) => {
    const x =
      weighIns.length === 1
        ? padLeft + chartW / 2
        : padLeft + ((times[i] - tMin) / tRange) * chartW;
    const y = padTop + ((yMax - Number(w.weight_kg)) / (yMax - yMin)) * chartH;
    return { x, y };
  });

  const linePath = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M ${p.x},${p.y}` : ` L ${p.x},${p.y}`),
    "",
  );
  const areaPath =
    weighIns.length > 1
      ? `${linePath} L ${points[points.length - 1].x},${height - padBottom} L ${points[0].x},${height - padBottom} Z`
      : "";

  const firstDate = new Date(weighIns[0].recorded_at).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
  });
  const lastDate = new Date(weighIns[weighIns.length - 1].recorded_at).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
  });

  return (
    <Panel
      title="Πορεία βάρους"
      subtitle={`${weighIns.length} ${weighIns.length === 1 ? "μέτρηση" : "μετρήσεις"} · ${firstDate} → ${lastDate}`}
    >
      <div className="p-[22px]">
        <div className="mb-[18px] flex flex-wrap items-end gap-6">
          <ChartStat label="Αρχικό" val={String(first)} unit="kg" />
          <ChartStat
            label="Τώρα"
            val={String(last)}
            unit="kg"
            valClassName="text-accent"
            delta={
              weighIns.length > 1
                ? {
                    text:
                      delta === 0
                        ? "= από την αρχή"
                        : delta < 0
                        ? `↓ ${Math.abs(delta)} kg`
                        : `↑ ${delta} kg`,
                    className:
                      delta < 0
                        ? "text-success"
                        : delta > 0
                        ? "text-warning"
                        : "text-text-3",
                  }
                : { text: "1η μέτρηση", className: "text-text-3" }
            }
          />
          <ChartStat
            label="Ελάχιστο"
            val={String(Math.round(minVal * 10) / 10)}
            unit="kg"
          />
          <ChartStat
            label="Μέγιστο"
            val={String(Math.round(maxVal * 10) / 10)}
            unit="kg"
          />
        </div>
        <div className="relative h-[200px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C5FF00" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#C5FF00" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1={padLeft} y1={padTop} x2={width - padRight} y2={padTop} stroke="#1F1F1F" strokeWidth="1" />
            <line x1={padLeft} y1={padTop + chartH / 2} x2={width - padRight} y2={padTop + chartH / 2} stroke="#1F1F1F" strokeWidth="1" strokeDasharray="3 5" />
            <line x1={padLeft} y1={height - padBottom} x2={width - padRight} y2={height - padBottom} stroke="#1F1F1F" strokeWidth="1" />
            {areaPath && <path d={areaPath} fill="url(#weightGrad)" />}
            <path
              d={linePath}
              fill="none"
              stroke="#C5FF00"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px rgba(197,255,0,0.4))" }}
            />
            {points.slice(0, -1).map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill="#0A0A0A" stroke="#C5FF00" strokeWidth="2" />
            ))}
            {points.length > 0 && (
              <>
                <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="7" fill="#C5FF00" stroke="#0A0A0A" strokeWidth="2" />
                <text
                  x={points[points.length - 1].x}
                  y={Math.max(15, points[points.length - 1].y - 12)}
                  fill="#C5FF00"
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {last}
                </text>
              </>
            )}
          </svg>
        </div>
      </div>
    </Panel>
  );
}

function ChartStat({
  label,
  val,
  unit,
  valClassName,
  delta,
}: {
  label: string;
  val: string;
  unit: string;
  valClassName?: string;
  delta?: { text: string; className: string };
}) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
        {label}
      </div>
      <div
        className={`mt-1 flex items-baseline gap-1.5 font-mono text-[24px] font-extrabold leading-none tracking-[-0.02em] ${
          valClassName ?? ""
        }`}
      >
        {val}
        <span className="text-sm font-semibold text-text-3">{unit}</span>
      </div>
      {delta && (
        <div className={`mt-1.5 text-[11px] font-extrabold ${delta.className}`}>
          {delta.text}
        </div>
      )}
    </div>
  );
}

function ActiveProgramsPanel({
  program,
  nutritionPlan,
}: {
  program: ClientAssignment["program"];
  nutritionPlan: ClientAssignment["nutrition_plan"];
}) {
  return (
    <Panel
      title="Ενεργά προγράμματα"
      subtitle="Τι έχει ανατεθεί στον πελάτη"
    >
      <div className="p-3.5">
        {program ? (
          <ProgramRow
            variant="workout"
            name={program.title}
            meta={
              [
                program.name,
                program.estimated_duration_min ? `${program.estimated_duration_min}'` : null,
                program.estimated_kcal ? `${program.estimated_kcal} kcal` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Χωρίς extra στοιχεία"
            }
          />
        ) : (
          <EmptyRow text="Δεν έχει ανατεθεί πρόγραμμα προπόνησης." />
        )}
        {nutritionPlan ? (
          <ProgramRow
            variant="nutrition"
            name={nutritionPlan.name}
            meta={
              nutritionPlan.target_kcal
                ? `Στόχος ${nutritionPlan.target_kcal} kcal / ημέρα`
                : "Διατροφικό πλάνο"
            }
          />
        ) : (
          <EmptyRow text="Δεν έχει ανατεθεί διατροφικό πλάνο." />
        )}
      </div>
    </Panel>
  );
}

function ProgramRow({
  variant,
  name,
  meta,
}: {
  variant: "workout" | "nutrition";
  name: string;
  meta: string;
}) {
  const iconCls =
    variant === "workout"
      ? "bg-accent/[0.12] text-accent"
      : "bg-[#22D3EE]/[0.12] text-[#22D3EE]";
  const icon =
    variant === "workout" ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="4" x2="6" y2="20" />
        <line x1="18" y1="4" x2="18" y2="20" />
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
      </svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    );
  return (
    <div className="mb-2.5 flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3.5 last:mb-0">
      <div className={`flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px] ${iconCls}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 truncate text-sm font-extrabold tracking-[-0.01em]">
          {name}
        </div>
        <div className="font-mono text-[11px] font-semibold text-text-2">
          {meta}
        </div>
      </div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="mb-2.5 rounded-xl border border-dashed border-border bg-surface-2 p-3.5 text-center text-[12px] text-text-3 last:mb-0">
      {text}
    </div>
  );
}

function ProgressPhotosPanel({
  photos,
  photoUrls,
}: {
  photos: PhotoRow[];
  photoUrls: Map<string, string>;
}) {
  if (photos.length === 0) {
    return (
      <Panel title="Φωτογραφίες προόδου" subtitle="Καμία φωτογραφία ακόμα">
        <div className="flex h-[140px] items-center justify-center text-center text-sm text-text-3">
          Ο πελάτης δεν έχει ανεβάσει φωτογραφίες.
        </div>
      </Panel>
    );
  }
  return (
    <Panel
      title="Φωτογραφίες προόδου"
      subtitle={`${photos.length} συνολικά · κλικ σε φωτογραφία για full size`}
    >
      <div className="grid grid-cols-2 gap-3 px-[22px] pb-[22px] pt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.map((p, i) => {
          const url = photoUrls.get(p.storage_path);
          const date = new Date(p.taken_at).toLocaleDateString("el-GR", {
            day: "numeric",
            month: "short",
          });
          const isLatest = i === 0;
          return url ? (
            <a
              key={p.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative block aspect-[3/4] overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 hover:border-accent ${
                isLatest
                  ? "border-accent shadow-[0_0_0_1px_var(--accent-dim)]"
                  : "border-border"
              }`}
              style={{ background: "linear-gradient(155deg, #1A1A1A 0%, #0A0A0A 100%)" }}
            >
              <Image
                src={url}
                alt={`Φωτο ${date}`}
                fill
                unoptimized
                sizes="(min-width:1024px) 200px, (min-width:768px) 240px, 45vw"
                className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
              {isLatest && (
                <span className="absolute right-2 top-2 rounded-full bg-accent px-2 py-[3px] text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#0A0A0A]">
                  Νέα
                </span>
              )}
              <div
                className="absolute inset-x-0 bottom-0 p-2.5"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
                }}
              >
                <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-text-3">
                  {date}
                </div>
                {p.weight_kg != null && (
                  <div className="mt-0.5 font-mono text-sm font-extrabold text-text-1">
                    {p.weight_kg} kg
                  </div>
                )}
              </div>
            </a>
          ) : (
            <div
              key={p.id}
              className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-border bg-surface-2 text-[10px] text-text-3"
            >
              —
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function RecentActivityPanel({ sessions }: { sessions: SessionRow[] }) {
  if (sessions.length === 0) {
    return (
      <Panel title="Πρόσφατη δραστηριότητα" subtitle="Καμία προπόνηση ακόμα">
        <div className="flex h-[120px] items-center justify-center text-center text-sm text-text-3">
          Ο πελάτης δεν έχει καταγράψει προπόνηση.
        </div>
      </Panel>
    );
  }
  return (
    <Panel
      title="Πρόσφατη δραστηριότητα"
      subtitle={`Τελευταίες ${sessions.length} ${sessions.length === 1 ? "προπόνηση" : "προπονήσεις"}`}
    >
      <div className="py-2">
        {sessions.map((s) => {
          const isCompleted = s.completed_at != null;
          const when = isCompleted && s.completed_at
            ? new Date(s.completed_at).toLocaleDateString("el-GR", {
                day: "numeric",
                month: "short",
              })
            : "σε εξέλιξη";
          const durationMin =
            s.duration_sec != null ? Math.round(s.duration_sec / 60) : null;
          return (
            <div
              key={s.id}
              className="flex items-center gap-3 px-[22px] py-3"
            >
              <ActivityIcon status={isCompleted ? "completed" : "partial"} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold tracking-[-0.01em]">
                  {s.program_title ?? s.program_name ?? "Προπόνηση"}
                </div>
                <div className="mt-0.5 text-[11px] text-text-3">
                  {isCompleted
                    ? durationMin != null
                      ? `${durationMin}' · ολοκληρώθηκε`
                      : "Ολοκληρώθηκε"
                    : "Δεν ολοκληρώθηκε"}
                </div>
              </div>
              <span className="flex-shrink-0 font-mono text-[11px] font-semibold text-text-3">
                {when}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function ActivityIcon({ status }: { status: "completed" | "partial" }) {
  const cls =
    status === "completed"
      ? "bg-success/[0.12] text-success"
      : "bg-warning/[0.12] text-warning";
  return (
    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] ${cls}`}>
      {status === "completed" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )}
    </div>
  );
}
