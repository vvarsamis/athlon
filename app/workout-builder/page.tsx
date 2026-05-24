import Image from "next/image";
import Link from "next/link";

const exDb = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

type LibItem = { id: string; name: string; tags: string[]; img: string };

const frequentItems: LibItem[] = [
  {
    id: "incline-db-press",
    name: "Πιέσεις σε επικλινή πάγκο",
    tags: ["Στήθος", "Ώμοι"],
    img: `${exDb}/Incline_Dumbbell_Press/0.jpg`,
  },
  {
    id: "db-bench-press",
    name: "Πιέσεις πάγκου με αλτήρες",
    tags: ["Στήθος", "Τρικ."],
    img: `${exDb}/Dumbbell_Bench_Press/0.jpg`,
  },
  {
    id: "db-shoulder-press",
    name: "Πιέσεις ώμων με αλτήρες",
    tags: ["Ώμοι", "Τρικ."],
    img: `${exDb}/Dumbbell_Shoulder_Press/0.jpg`,
  },
  {
    id: "side-lateral",
    name: "Πλάγια εκτάσεις αλτήρων",
    tags: ["Ώμοι"],
    img: `${exDb}/Side_Lateral_Raise/0.jpg`,
  },
  {
    id: "triceps-pushdown",
    name: "Τρικέφαλα στο σχοινί",
    tags: ["Τρικ."],
    img: `${exDb}/Triceps_Pushdown/0.jpg`,
  },
];

const chestItems: LibItem[] = [
  {
    id: "bb-bench",
    name: "Πιέσεις πάγκου με μπάρα",
    tags: ["Στήθος", "Τρικ."],
    img: `${exDb}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`,
  },
  {
    id: "cable-crossover",
    name: "Cable Crossover",
    tags: ["Στήθος"],
    img: `${exDb}/Cable_Crossover/0.jpg`,
  },
  {
    id: "db-flyes",
    name: "Πτερύγια με αλτήρες",
    tags: ["Στήθος"],
    img: `${exDb}/Dumbbell_Flyes/0.jpg`,
  },
];

type WorkoutEx = {
  num: string;
  name: string;
  tags: string[];
  img: string;
  sets: string;
  reps: string;
  rest: string;
  expanded?: boolean;
};

const workoutExercises: WorkoutEx[] = [
  {
    num: "01",
    name: "Πιέσεις με αλτήρες σε επικλινή πάγκο",
    tags: ["Στήθος", "Ώμοι", "Compound"],
    img: `${exDb}/Incline_Dumbbell_Press/0.jpg`,
    sets: "2",
    reps: "10-12",
    rest: "120''",
    expanded: true,
  },
  {
    num: "02",
    name: "Πιέσεις πάγκου με μπάρα",
    tags: ["Στήθος", "Τρικ.", "Compound"],
    img: `${exDb}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`,
    sets: "4",
    reps: "8-10",
    rest: "120''",
  },
  {
    num: "03",
    name: "Πτερύγια με αλτήρες σε επικλινή",
    tags: ["Στήθος", "Isolation"],
    img: `${exDb}/Dumbbell_Flyes/0.jpg`,
    sets: "3",
    reps: "12-15",
    rest: "75''",
  },
  {
    num: "04",
    name: "Πιέσεις ώμων με αλτήρες",
    tags: ["Ώμοι", "Τρικ.", "Compound"],
    img: `${exDb}/Dumbbell_Shoulder_Press/0.jpg`,
    sets: "4",
    reps: "10",
    rest: "90''",
  },
  {
    num: "05",
    name: "Πλάγια εκτάσεις αλτήρων",
    tags: ["Ώμοι", "Isolation"],
    img: `${exDb}/Side_Lateral_Raise/0.jpg`,
    sets: "3",
    reps: "15",
    rest: "60''",
  },
  {
    num: "06",
    name: "Τρικέφαλα στο σχοινί",
    tags: ["Τρικ.", "Isolation"],
    img: `${exDb}/Triceps_Pushdown/0.jpg`,
    sets: "3",
    reps: "12",
    rest: "60''",
  },
  {
    num: "07",
    name: "Push-ups (κάμψεις)",
    tags: ["Στήθος", "Σωματικού βάρους", "Finisher"],
    img: `${exDb}/Pushups/0.jpg`,
    sets: "3",
    reps: "AMRAP",
    rest: "45''",
  },
];

export default function WorkoutBuilderPage() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
        <Library />
        <main className="mx-auto w-full max-w-[920px] px-6 pb-12 pt-8 md:px-10">
          <WorkoutHeader />
          <div className="mt-6 flex flex-col gap-2.5">
            {workoutExercises.map((ex) => (
              <ExerciseCard key={ex.num} ex={ex} />
            ))}
          </div>
          <AddExerciseButton />
          <AiTip />
          <BottomBar />
        </main>
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
          Πρόγραμμα <span className="text-accent">·</span> Επεξεργασία
        </div>
        <h1 className="flex items-center gap-2 text-[17px] font-extrabold tracking-[-0.015em]">
          Push · Πρωτόκολλο 2
          <button type="button" aria-label="Μετονομασία" className="text-text-3 hover:text-accent">
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </h1>
      </div>
      <div className="hidden items-center gap-1.5 text-[11px] font-semibold text-text-3 lg:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_var(--success)]" />
        Αποθηκεύτηκε <strong className="text-text-2">πριν 12 δευτ.</strong>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-[10px] bg-transparent px-3.5 py-2.5 text-[13px] font-bold text-text-2 hover:bg-surface-1 hover:text-text-1 md:flex"
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
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-[10px] border border-border bg-surface-1 px-3.5 py-2.5 text-[13px] font-bold text-text-1 hover:border-[#303030] lg:flex"
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="15" y2="13" />
          </svg>
          Αποθήκευση ως template
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
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Ανάθεση
        </button>
      </div>
    </div>
  );
}

function Library() {
  const filters = ["Όλα", "Στήθος", "Πλάτη", "Ώμοι", "Πόδια", "Χέρια", "Κορμός"];
  return (
    <aside className="sticky top-16 hidden max-h-[calc(100vh-64px)] overflow-y-auto border-r border-border bg-[#0C0C0C] p-5 md:block">
      <div className="mb-4">
        <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.12em] text-text-3">
          Βιβλιοθήκη ασκήσεων
        </h2>
        <div className="relative mb-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-3"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Αναζήτηση άσκησης..."
            className="w-full rounded-[10px] border border-border bg-surface-1 py-2.5 pl-9 pr-3 text-[13px] text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f, i) => (
            <span
              key={f}
              className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                i === 0
                  ? "border-accent bg-accent/[0.12] text-accent"
                  : "border-border bg-surface-1 text-text-2 hover:border-[#303030]"
              }`}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <LibrarySection title="Συχνά Χρησιμοποιούμενα" count="12" items={frequentItems} />
      <LibrarySection title="Στήθος (Όλα)" count="38" items={chestItems} />
    </aside>
  );
}

function LibrarySection({
  title,
  count,
  items,
}: {
  title: string;
  count: string;
  items: LibItem[];
}) {
  return (
    <>
      <div className="mb-2 mt-3.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-text-3">
        <span>{title}</span>
        <span className="font-mono font-extrabold">{count}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((it) => (
          <div
            key={it.id}
            className="group flex cursor-grab items-center gap-2.5 rounded-xl border border-border bg-surface-1 p-2 transition-all hover:translate-x-0.5 hover:border-accent"
          >
            <Image
              src={it.img}
              alt=""
              width={44}
              height={44}
              unoptimized
              className="h-11 w-11 flex-shrink-0 rounded-lg bg-white object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 truncate text-[13px] font-bold leading-tight tracking-[-0.01em]">
                {it.name}
              </div>
              <div className="flex gap-1">
                {it.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-text-2"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              aria-label="Πρόσθεσε"
              className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-lg border border-[#303030] bg-transparent text-text-2 group-hover:border-accent group-hover:bg-accent group-hover:text-[#0A0A0A]"
            >
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function WorkoutHeader() {
  return (
    <div className="mb-7">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/[0.12] px-2.5 py-[5px] text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />
        Push · Πρωτόκολλο 2
      </div>
      <input
        defaultValue="Στήθος, ώμοι & τρικέφαλα"
        className="mb-2 w-full border-0 bg-transparent text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] text-text-1 outline-none"
      />
      <div className="text-sm leading-[1.5] text-text-2">
        Δευτέρα + Πέμπτη · ενδιάμεσο επίπεδο · 60' στόχος
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-surface-1 px-[18px] py-3.5">
        <Stat
          icon={
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
              <line x1="6" y1="4" x2="6" y2="20" />
              <line x1="18" y1="4" x2="18" y2="20" />
              <line x1="4" y1="9" x2="20" y2="9" />
              <line x1="4" y1="15" x2="20" y2="15" />
            </svg>
          }
          val="7"
          unit="ασκήσεις"
          label="Σύνολο"
        />
        <Stat
          icon={
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
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          val="~60"
          unit="'"
          label="Διάρκεια"
        />
        <Stat
          icon={
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
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          }
          val="~520"
          unit="kcal"
          label="Καύση"
          last
        />
        <AssignedBadge />
      </div>
    </div>
  );
}

function Stat({
  icon,
  val,
  unit,
  label,
  last,
}: {
  icon: React.ReactNode;
  val: string;
  unit: string;
  label: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 pr-5 ${
        last ? "" : "border-r border-border"
      }`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-surface-3 text-text-2">
        {icon}
      </div>
      <div>
        <div className="font-mono text-base font-extrabold tracking-[-0.02em]">
          {val}
          <span className="ml-0.5 text-[11px] font-semibold text-text-3">
            {unit}
          </span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
          {label}
        </div>
      </div>
    </div>
  );
}

function AssignedBadge() {
  const avatars = [
    "https://randomuser.me/api/portraits/men/45.jpg",
    "https://randomuser.me/api/portraits/men/55.jpg",
    "https://randomuser.me/api/portraits/men/29.jpg",
  ];
  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
        Ανατεθειμένο σε
      </span>
      {avatars.map((a, i) => (
        <Image
          key={a}
          src={a}
          alt=""
          width={28}
          height={28}
          className={`h-7 w-7 rounded-full border-[1.5px] border-accent object-cover ${
            i > 0 ? "-ml-2" : ""
          }`}
        />
      ))}
      <div className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-[#303030] bg-surface-3 font-mono text-[10px] font-extrabold text-text-2">
        +5
      </div>
    </div>
  );
}

function ExerciseCard({ ex }: { ex: WorkoutEx }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all ${
        ex.expanded
          ? "border-accent shadow-[0_0_0_1px_var(--accent-dim)]"
          : "border-border hover:border-[#303030]"
      } bg-surface-1`}
    >
      <div className="flex items-center gap-3.5 p-3">
        <div className="cursor-grab p-1 text-text-3 hover:text-accent">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="8" cy="6" r="1.5" />
            <circle cx="16" cy="6" r="1.5" />
            <circle cx="8" cy="12" r="1.5" />
            <circle cx="16" cy="12" r="1.5" />
            <circle cx="8" cy="18" r="1.5" />
            <circle cx="16" cy="18" r="1.5" />
          </svg>
        </div>
        <div
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-extrabold ${
            ex.expanded
              ? "bg-accent text-[#0A0A0A]"
              : "bg-surface-3 text-text-2"
          }`}
        >
          {ex.num}
        </div>
        <Image
          src={ex.img}
          alt=""
          width={56}
          height={56}
          unoptimized
          className="h-14 w-14 flex-shrink-0 rounded-[10px] bg-white object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-[15px] font-bold tracking-[-0.01em]">
            {ex.name}
          </div>
          <div className="flex gap-1.5">
            {ex.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-text-2"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden gap-4 lg:flex">
          <ConfigCell label="ΣΕΤ" val={ex.sets} />
          <ConfigCell label="ΕΠΑΝ." val={ex.reps} />
          <ConfigCell label="REST" val={ex.rest} />
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={ex.expanded ? "Σύμπτυξη" : "Επέκταση"}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border text-text-3 hover:border-[#303030] hover:text-text-1"
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
              {ex.expanded ? (
                <polyline points="18 15 12 9 6 15" />
              ) : (
                <polyline points="6 9 12 15 18 9" />
              )}
            </svg>
          </button>
          <button
            type="button"
            aria-label="Διαγραφή"
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border text-text-3 hover:border-danger hover:text-danger"
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
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {ex.expanded && (
        <div className="px-3.5 pb-4 pl-[70px]">
          <div className="mb-3.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <ConfigInput label="Σετ" defaultValue={ex.sets} />
            <ConfigInput label="Επαναλήψεις" defaultValue={ex.reps} />
            <ConfigInput
              label="Ξεκούραση (sec)"
              defaultValue={ex.rest.replace(/'/g, "")}
            />
            <ConfigInput label="Tempo" defaultValue="2-0-2-0" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
              Σημείωση προς αθλούμενο
              <span className="text-[10px] normal-case tracking-normal text-accent">
                · εμφανίζεται μέσα στο app του πελάτη
              </span>
            </div>
            <textarea
              defaultValue="Αφού κάνεις δυο σετ για ζέσταμα με λίγο φορτίο, στο πρώτο θα ήθελα να εκτελέσεις 10-12 επαναλήψεις. Στο δεύτερο, αφού εκτελέσεις τις επαναλήψεις, να βγάλεις 10 μισές κάτω και 10 μισές πάνω (drop set)."
              className="min-h-[70px] w-full resize-y rounded-[10px] border border-border bg-surface-2 p-3 text-[13px] leading-[1.5] text-text-1 outline-none focus:border-accent"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigCell({ label, val }: { label: string; val: string }) {
  return (
    <div className="min-w-[50px] text-center">
      <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.1em] text-text-3">
        {label}
      </div>
      <div className="font-mono text-[15px] font-extrabold text-text-1">
        {val}
      </div>
    </div>
  );
}

function ConfigInput({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-surface-2 px-3 py-2.5">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
        {label}
      </div>
      <input
        defaultValue={defaultValue}
        className="w-full border-0 bg-transparent p-0 font-mono text-base font-extrabold text-text-1 outline-none"
      />
    </div>
  );
}

function AddExerciseButton() {
  return (
    <button
      type="button"
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#303030] bg-transparent p-[18px] text-[13px] font-bold text-text-2 transition-all hover:border-accent hover:bg-accent/[0.03] hover:text-accent"
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
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Πρόσθεσε άσκηση · σύρε από τη βιβλιοθήκη ή κλικ εδώ
    </button>
  );
}

function AiTip() {
  return (
    <div
      className="mt-[18px] flex items-start gap-3 rounded-2xl border border-accent/20 p-4"
      style={{
        background:
          "linear-gradient(155deg, rgba(197,255,0,0.06) 0%, transparent 100%)",
      }}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-accent/[0.12] text-accent">
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
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
        </svg>
      </div>
      <div>
        <div className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">
          ⚡ AI Coach
        </div>
        <div className="text-[13px] leading-[1.5] text-text-2">
          Το πρόγραμμα έχει{" "}
          <strong className="font-bold text-text-1">3 ασκήσεις στήθους</strong>{" "}
          και <strong className="font-bold text-text-1">2 ώμων</strong>. Σου
          προτείνω να προσθέσεις{" "}
          <strong className="font-bold text-text-1">
            1 άσκηση για posterior delts
          </strong>{" "}
          (face pulls) για ισορροπία και προστασία ώμων.
        </div>
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-accent bg-accent px-2.5 py-1.5 text-[11px] font-bold text-[#0A0A0A]"
          >
            + Πρόσθεσε Face Pulls
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] font-bold text-text-1"
          >
            Άγνοια
          </button>
        </div>
      </div>
    </div>
  );
}

function BottomBar() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-1 px-[22px] py-[18px]">
      <div className="flex items-center gap-2.5 text-[13px] text-text-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-3"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Οι αλλαγές αποθηκεύονται αυτόματα και εμφανίζονται αμέσως στους
        ανατεθειμένους πελάτες
      </div>
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
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        Ανάθεση σε 5 ακόμα πελάτες
      </button>
    </div>
  );
}
