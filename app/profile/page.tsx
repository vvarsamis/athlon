import Image from "next/image";
import Link from "next/link";

export default function ClientProfilePage() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-[1240px] px-4 pb-12 pt-6 md:px-8">
        <ClientHeader />
        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <WeightChartPanel />
          <AiInsightsPanel />
        </div>
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <ProgressPhotosPanel />
          <ActiveProgramsPanel />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <RecentActivityPanel />
          <TrainerNotesPanel />
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-[#080808] px-6">
      <Link
        href="/trainer"
        aria-label="Πίσω"
        className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
          Πελάτες <span className="text-accent">·</span> Προφίλ
        </div>
        <h1 className="text-[17px] font-extrabold tracking-[-0.015em]">
          Ελένη Δημητρίου
        </h1>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Ημερολόγιο"
          className="hidden h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface-1 text-text-1 hover:border-[#303030] md:flex"
        >
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
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-[10px] border border-border bg-surface-1 px-3.5 py-2.5 text-[13px] font-bold text-text-1 hover:border-[#303030] md:flex"
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Επεξεργασία προφίλ
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-[10px] bg-accent px-3.5 py-2.5 text-[13px] font-bold text-[#0A0A0A] shadow-[0_0_20px_rgba(197,255,0,0.3)] hover:shadow-[0_0_32px_rgba(197,255,0,0.5)]"
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Μήνυμα
        </button>
      </div>
    </div>
  );
}

function ClientHeader() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[22px] border border-[#303030] bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] p-7">
      <div
        className="pointer-events-none absolute -right-[60px] -top-[60px] h-[280px] w-[280px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(197,255,0,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex flex-wrap items-center gap-7">
        <div className="relative flex-shrink-0">
          <Image
            src="https://randomuser.me/api/portraits/women/38.jpg"
            alt="Ελένη"
            width={120}
            height={120}
            className="h-[120px] w-[120px] rounded-full border-[3px] border-accent object-cover shadow-[0_0_28px_rgba(197,255,0,0.3)]"
          />
          <span
            title="Online τώρα"
            className="absolute bottom-1.5 right-1.5 h-[22px] w-[22px] rounded-full border-[3px] border-[#0F0F0F] bg-success shadow-[0_0_8px_var(--success)]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-text-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/[0.12] px-2 py-[3px] text-[10px] font-extrabold uppercase tracking-[0.1em] text-success">
              <span className="h-[5px] w-[5px] rounded-full bg-current" />
              Ενεργή · Online
            </span>
            <span>Μέλος για 56 ημέρες</span>
            <span>·</span>
            <span>Τελευταία είσοδος: πριν 12&apos;</span>
          </div>
          <div className="mb-1.5 text-[34px] font-extrabold leading-none tracking-[-0.03em]">
            Ελένη Δημητρίου
          </div>
          <div className="mb-[18px] flex flex-wrap gap-4 text-sm text-text-2">
            <span>👩 32 ετών</span>
            <span>
              <strong className="font-bold text-text-1">Στόχος:</strong> Απώλεια
              λίπους + τόνωση
            </span>
            <span>
              <strong className="font-bold text-text-1">Επίπεδο:</strong>{" "}
              Ενδιάμεσο
            </span>
          </div>
          <div className="flex flex-wrap gap-6">
            <QuickStat
              label="Adherence (30d)"
              val="92"
              unit="%"
              delta="↑ +8% από πρώτο μήνα"
              deltaClass="text-success"
            />
            <QuickStat
              label="Βάρος"
              val="64.2"
              unit="kg"
              delta="↓ −1.8 kg σε 8 εβδ."
              deltaClass="text-success"
            />
            <QuickStat
              label="Streak"
              val="12"
              unit="μέρες"
              delta="🔥 προσωπικό ρεκόρ"
              deltaClass="text-success"
            />
            <QuickStat
              label="Συνδρομή"
              val="38"
              unit="μέρες"
              delta="απομένουν"
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
        <span className="text-xs font-semibold text-text-3">{unit}</span>
      </div>
      <div className={`mt-1 text-[11px] font-bold ${deltaClass}`}>{delta}</div>
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

function WeightChartPanel() {
  return (
    <Panel
      title="Πορεία βάρους"
      subtitle="8 εβδομάδες · στόχος 62 kg"
      action={{ label: "Όλες οι μετρήσεις →", href: "#" }}
    >
      <div className="p-[22px]">
        <div className="mb-[18px] flex flex-wrap items-end gap-6">
          <ChartStat label="Αρχικό" val="66.0" unit="kg" />
          <ChartStat
            label="Τώρα"
            val="64.2"
            unit="kg"
            valClassName="text-accent"
            delta={{ text: "↓ −1.8 kg · −2.7%", className: "text-success" }}
          />
          <ChartStat
            label="Στόχος"
            val="62.0"
            unit="kg"
            delta={{ text: "απομένουν 2.2 kg", className: "text-text-3" }}
          />
          <div className="ml-auto">
            <ChartStat
              label="Ρυθμός"
              val="−0.23"
              unit="kg/εβδ"
              valClassName="text-success"
              delta={{ text: "υγιής ρυθμός", className: "text-success" }}
            />
          </div>
        </div>
        <div className="relative mb-3 h-[200px]">
          <svg
            viewBox="0 0 700 200"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C5FF00" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#C5FF00" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="40" x2="700" y2="40" stroke="#1F1F1F" strokeWidth="1" />
            <line
              x1="0"
              y1="100"
              x2="700"
              y2="100"
              stroke="#1F1F1F"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <line x1="0" y1="160" x2="700" y2="160" stroke="#1F1F1F" strokeWidth="1" />
            <line
              x1="0"
              y1="170"
              x2="700"
              y2="170"
              stroke="#4ADE80"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.5"
            />
            <text
              x="690"
              y="166"
              fill="#4ADE80"
              fontSize="9"
              fontFamily="JetBrains Mono"
              fontWeight="800"
              textAnchor="end"
              opacity="0.7"
            >
              62.0 ΣΤΟΧΟΣ
            </text>
            <path
              d="M 50,50 L 130,55 L 210,62 L 290,70 L 370,82 L 450,90 L 530,100 L 610,115 L 650,135 L 650,200 L 50,200 Z"
              fill="url(#lineGrad)"
            />
            <path
              d="M 50,50 L 130,55 L 210,62 L 290,70 L 370,82 L 450,90 L 530,100 L 610,115 L 650,135"
              fill="none"
              stroke="#C5FF00"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px rgba(197,255,0,0.4))" }}
            />
            {[
              [50, 50],
              [130, 55],
              [210, 62],
              [290, 70],
              [370, 82],
              [450, 90],
              [530, 100],
              [610, 115],
            ].map(([cx, cy]) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="4"
                fill="#0A0A0A"
                stroke="#C5FF00"
                strokeWidth="2"
              />
            ))}
            <circle cx="650" cy="135" r="7" fill="#C5FF00" stroke="#0A0A0A" strokeWidth="2" />
            <circle
              cx="650"
              cy="135"
              r="11"
              fill="none"
              stroke="#C5FF00"
              strokeWidth="1"
              opacity="0.4"
            />
            <text
              x="650"
              y="124"
              fill="#C5FF00"
              fontSize="11"
              fontFamily="JetBrains Mono"
              fontWeight="800"
              textAnchor="middle"
            >
              64.2
            </text>
          </svg>
        </div>
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.08em] text-text-3">
          {["Εβδ 1", "Εβδ 2", "Εβδ 3", "Εβδ 4", "Εβδ 5", "Εβδ 6", "Εβδ 7", "Εβδ 8"].map(
            (l) => (
              <span key={l}>{l}</span>
            ),
          )}
          <span className="text-accent">Τώρα</span>
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
        className={`mt-1 flex items-baseline gap-1.5 font-mono text-[28px] font-extrabold leading-none tracking-[-0.02em] ${
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

function AiInsightsPanel() {
  return (
    <Panel
      title="⚡ AI Insights"
      subtitle="Τι πρέπει να ξέρεις για την Ελένη σήμερα"
    >
      <div className="p-3.5">
        <Insight
          variant="success"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
          title="Στην τροχιά για τον στόχο της"
          body={
            <>
              Με ρυθμό{" "}
              <strong className="font-bold text-text-1">
                −0.23 kg/εβδομάδα
              </strong>
              , η Ελένη θα φτάσει τα 62 kg σε ~10 εβδομάδες. Στείλε ένα
              συγχαρητήριο μήνυμα — αυξάνει την δέσμευση κατά 40%.
            </>
          }
          action="Στείλε προετοιμασμένο μήνυμα →"
        />
        <Insight
          variant="accent"
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
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          }
          title="Streak 12 ημερών — προσωπικό ρεκόρ"
          body={
            <>
              Έσπασε το προηγούμενο ρεκόρ της (10 ημέρες). Ένα{" "}
              <strong className="font-bold text-text-1">
                push notification αναγνώρισης
              </strong>{" "}
              τώρα κρατά momentum για 2-3 εβδομάδες ακόμα.
            </>
          }
        />
        <Insight
          variant="warn"
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
          title="Συνδρομή λήγει σε 38 ημέρες"
          body={
            <>
              Με αυτό το adherence και ορατή πρόοδο, η Ελένη είναι{" "}
              <strong className="font-bold text-text-1">
                87% πιθανότητα ανανέωσης
              </strong>
              . Πρότεινε early-renewal discount τις επόμενες 2 εβδομάδες για να
              κλειδώσει.
            </>
          }
          action="Στείλε προσφορά ανανέωσης →"
        />
      </div>
    </Panel>
  );
}

function Insight({
  variant,
  icon,
  title,
  body,
  action,
}: {
  variant: "success" | "warn" | "accent";
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
  action?: string;
}) {
  const cls =
    variant === "success"
      ? "border-success/20 bg-success/[0.04]"
      : variant === "warn"
      ? "border-warning/20 bg-warning/[0.04]"
      : "border-accent/20 bg-accent/[0.04]";
  const iconCls =
    variant === "success"
      ? "bg-success/15 text-success"
      : variant === "warn"
      ? "bg-warning/15 text-warning"
      : "bg-accent/15 text-accent";
  return (
    <div className={`mb-2.5 flex items-start gap-3 rounded-xl border p-3.5 last:mb-0 ${cls}`}>
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] ${iconCls}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[13px] font-extrabold tracking-[-0.01em]">
          {title}
        </div>
        <div className="text-xs leading-[1.5] text-text-2">{body}</div>
        {action && (
          <button
            type="button"
            className="mt-2 flex items-center gap-1 bg-transparent text-[11px] font-bold text-accent"
          >
            {action}
          </button>
        )}
      </div>
    </div>
  );
}

function ProgressPhotosPanel() {
  const photos = [
    {
      img: "https://randomuser.me/api/portraits/women/38.jpg",
      date: "28 Μαρ · Εβδομάδα 1",
      weight: "66.0 kg",
      delta: null as string | null,
    },
    {
      img: "https://randomuser.me/api/portraits/women/38.jpg",
      date: "25 Απρ · Εβδομάδα 4",
      weight: "65.0 kg",
      delta: "−1.0",
    },
    {
      img: "https://randomuser.me/api/portraits/women/38.jpg",
      date: "23 Μαϊ · Εβδομάδα 8",
      weight: "64.2 kg",
      delta: "−1.8",
      latest: true,
    },
  ];
  return (
    <Panel
      title="Φωτογραφίες προόδου"
      subtitle="3 από 8 — η Ελένη ανέβασε χθες"
      action={{ label: "Όλες οι φωτογραφίες →", href: "#" }}
    >
      <div className="grid grid-cols-3 gap-3 px-[22px] pb-[22px] pt-4">
        {photos.map((p, i) => (
          <div
            key={i}
            className={`relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 hover:border-accent ${
              p.latest
                ? "border-accent shadow-[0_0_0_1px_var(--accent-dim)]"
                : "border-border"
            }`}
            style={{
              background: "linear-gradient(155deg, #1A1A1A 0%, #0A0A0A 100%)",
            }}
          >
            <Image
              src={p.img}
              alt=""
              fill
              sizes="(min-width: 1024px) 150px, 33vw"
              className="object-cover opacity-85"
            />
            {p.latest && (
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
                {p.date}
              </div>
              <div className="mt-0.5 font-mono text-sm font-extrabold text-text-1">
                {p.weight}
                {p.delta && (
                  <span className="ml-1 text-[11px] text-success">{p.delta}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ActiveProgramsPanel() {
  return (
    <Panel
      title="Ενεργά προγράμματα"
      subtitle="Τι κάνει η Ελένη αυτή την εβδομάδα"
    >
      <div className="p-3.5">
        <ProgramCard
          variant="workout"
          icon={
            <svg
              width="20"
              height="20"
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
          name="Full Body — Tone"
          meta="4 ημ/εβδ · 45' · 4η εβδομάδα"
          adherence="94"
          adherenceClass="text-success"
        />
        <ProgramCard
          variant="nutrition"
          icon={
            <svg
              width="20"
              height="20"
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
          name="Cut Πλάνο · 1800 kcal"
          meta="5 γεύματα · 130P / 180C / 60F · 8η εβδ."
          adherence="76"
          adherenceClass="text-warning"
        />
      </div>
    </Panel>
  );
}

function ProgramCard({
  variant,
  icon,
  name,
  meta,
  adherence,
  adherenceClass,
}: {
  variant: "workout" | "nutrition";
  icon: React.ReactNode;
  name: string;
  meta: string;
  adherence: string;
  adherenceClass: string;
}) {
  const iconCls =
    variant === "workout"
      ? "bg-accent/[0.12] text-accent"
      : "bg-[#22D3EE]/[0.12] text-[#22D3EE]";
  return (
    <div className="mb-2.5 flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3.5 last:mb-0">
      <div
        className={`flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px] ${iconCls}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-sm font-extrabold tracking-[-0.01em]">
          {name}
        </div>
        <div className="font-mono text-[11px] font-semibold text-text-2">
          {meta}
        </div>
      </div>
      <div className="text-right">
        <div className={`font-mono text-lg font-extrabold tracking-[-0.02em] ${adherenceClass}`}>
          {adherence}%
        </div>
        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-text-3">
          Adherence
        </div>
      </div>
    </div>
  );
}

type ActivityStatus = "completed" | "partial" | "missed";

function RecentActivityPanel() {
  const items: {
    status: ActivityStatus;
    title: string;
    desc: React.ReactNode;
    time: string;
  }[] = [
    {
      status: "completed",
      title: "Full Body — Day 3",
      desc: (
        <>
          42&apos; · 7/7 ασκήσεις ·{" "}
          <strong className="font-bold text-text-2">RPE 7</strong> · σχόλιο
          «Νιώθω δυνατή σήμερα»
        </>
      ),
      time: "Σήμερα 11:30",
    },
    {
      status: "completed",
      title: "Full Body — Day 2",
      desc: (
        <>
          48&apos; · 7/7 ασκήσεις ·{" "}
          <strong className="font-bold text-text-2">+2.5 kg στο squat</strong> 🔥
        </>
      ),
      time: "Χθες",
    },
    {
      status: "partial",
      title: "Full Body — Day 1",
      desc: (
        <>38&apos; · 5/7 ασκήσεις · σταμάτησε νωρίς · σχόλιο «πόνος στο γόνατο»</>
      ),
      time: "21 Μαϊ",
    },
    {
      status: "completed",
      title: "Full Body — Day 3",
      desc: (
        <>
          45&apos; · 7/7 ασκήσεις ·{" "}
          <strong className="font-bold text-text-2">
            PR στο deadlift
          </strong>{" "}
          (52.5 kg)
        </>
      ),
      time: "19 Μαϊ",
    },
    {
      status: "missed",
      title: "Full Body — Day 2",
      desc: "Παραλείφθηκε · χωρίς αιτιολογία",
      time: "17 Μαϊ",
    },
  ];
  return (
    <Panel
      title="Πρόσφατη δραστηριότητα"
      subtitle="Τελευταίες 5 προπονήσεις"
      action={{ label: "Όλο το ιστορικό →", href: "#" }}
    >
      <div className="py-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex cursor-pointer items-center gap-3 px-[22px] py-3 transition-colors hover:bg-surface-2"
          >
            <ActivityIcon status={it.status} />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold tracking-[-0.01em]">
                {it.title}
              </div>
              <div className="mt-0.5 text-[11px] text-text-3">{it.desc}</div>
            </div>
            <span className="flex-shrink-0 font-mono text-[11px] font-semibold text-text-3">
              {it.time}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ActivityIcon({ status }: { status: ActivityStatus }) {
  const cls =
    status === "completed"
      ? "bg-success/[0.12] text-success"
      : status === "missed"
      ? "bg-danger/[0.12] text-danger"
      : "bg-warning/[0.12] text-warning";
  return (
    <div
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] ${cls}`}
    >
      {status === "completed" ? (
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
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : status === "missed" ? (
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
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
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
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )}
    </div>
  );
}

function TrainerNotesPanel() {
  return (
    <Panel
      title="Σημειώσεις προπονητή"
      subtitle="Ιδιωτικές — δεν τις βλέπει η πελάτης"
    >
      <div className="p-[22px]">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-[3px] text-[10px] font-extrabold uppercase tracking-[0.12em] text-warning">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Ιδιωτικές σημειώσεις
        </div>
        <textarea
          defaultValue={`Πάει εξαιρετικά. Έχει βελτιωθεί πολύ στο squat — από 30 kg έφτασε 42 kg σε 8 εβδ. Πολύ συνεπής με adherence 92%.

Στο γόνατο (δεξί) έχει παλιό τραυματισμό από running. Απέφυγε high-impact ασκήσεις (jumps, plyometrics). Πάντα ελέγχει αν πονάει πριν αυξήσει βάρος.

Διατροφικά λίγο χαλαρή τα ΣΚ — να μιλήσω για flexible eating ώστε να μη νιώθει στέρηση.

Στόχοι: 62 kg μέχρι Ιούλιο + bridal photoshoot τέλος Αυγούστου. Να επιταχύνουμε λίγο μετά τα μέσα Ιουλίου.`}
          className="min-h-[140px] w-full resize-y rounded-xl border border-border bg-surface-2 p-3.5 text-[13px] leading-[1.6] text-text-1 outline-none focus:border-accent"
        />
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-[10px] font-bold text-danger">
            ⚠ Τραυματισμός: δεξί γόνατο
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#60A5FA]/10 px-2.5 py-1 text-[10px] font-bold text-[#60A5FA]">
            ℹ Δεν τρώει γαλακτοκομικά
          </span>
          <span className="flex items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-[10px] font-bold text-text-2">
            📌 Στόχος: Αύγουστος
          </span>
        </div>
      </div>
    </Panel>
  );
}
