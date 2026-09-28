"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { ClientAssignmentModal } from "../_components/ClientAssignmentModal";

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
  uid: string;
  name: string;
  tags: string[];
  img: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
};

const initialExercises: WorkoutEx[] = [
  {
    uid: "ex-01",
    name: "Πιέσεις με αλτήρες σε επικλινή πάγκο",
    tags: ["Στήθος", "Ώμοι", "Compound"],
    img: `${exDb}/Incline_Dumbbell_Press/0.jpg`,
    sets: "2",
    reps: "10-12",
    rest: "120",
    notes:
      "Αφού κάνεις δυο σετ για ζέσταμα με λίγο φορτίο, στο πρώτο θα ήθελα να εκτελέσεις 10-12 επαναλήψεις. Στο δεύτερο, αφού εκτελέσεις τις επαναλήψεις, να βγάλεις 10 μισές κάτω και 10 μισές πάνω (drop set).",
  },
  {
    uid: "ex-02",
    name: "Πιέσεις πάγκου με μπάρα",
    tags: ["Στήθος", "Τρικ.", "Compound"],
    img: `${exDb}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`,
    sets: "4",
    reps: "8-10",
    rest: "120",
  },
  {
    uid: "ex-03",
    name: "Πτερύγια με αλτήρες σε επικλινή",
    tags: ["Στήθος", "Isolation"],
    img: `${exDb}/Dumbbell_Flyes/0.jpg`,
    sets: "3",
    reps: "12-15",
    rest: "75",
  },
  {
    uid: "ex-04",
    name: "Πιέσεις ώμων με αλτήρες",
    tags: ["Ώμοι", "Τρικ.", "Compound"],
    img: `${exDb}/Dumbbell_Shoulder_Press/0.jpg`,
    sets: "4",
    reps: "10",
    rest: "90",
  },
  {
    uid: "ex-05",
    name: "Πλάγια εκτάσεις αλτήρων",
    tags: ["Ώμοι", "Isolation"],
    img: `${exDb}/Side_Lateral_Raise/0.jpg`,
    sets: "3",
    reps: "15",
    rest: "60",
  },
  {
    uid: "ex-06",
    name: "Τρικέφαλα στο σχοινί",
    tags: ["Τρικ.", "Isolation"],
    img: `${exDb}/Triceps_Pushdown/0.jpg`,
    sets: "3",
    reps: "12",
    rest: "60",
  },
  {
    uid: "ex-07",
    name: "Push-ups (κάμψεις)",
    tags: ["Στήθος", "Σωματικού βάρους", "Finisher"],
    img: `${exDb}/Pushups/0.jpg`,
    sets: "3",
    reps: "AMRAP",
    rest: "45",
  },
];

type LibraryExercise = {
  id: string;
  slug: string | null;
  name: string;
  name_en: string | null;
  primary_muscle: string | null;
  muscle_groups: string[] | null;
  tags: string[];
  image_start_url: string | null;
  image_end_url: string | null;
  owner_id: string | null;
};

export default function WorkoutBuilderPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<WorkoutEx[]>(initialExercises);
  const [expandedUid, setExpandedUid] = useState<string | null>("ex-01");
  const [name, setName] = useState("Push · Πρωτόκολλο 2");
  const [title, setTitle] = useState("Στήθος, ώμοι & τρικέφαλα");
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<
    | { kind: "idle" }
    | { kind: "success"; assignedTo: number }
    | { kind: "error"; msg: string }
  >({ kind: "idle" });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savedProgramId, setSavedProgramId] = useState<string | null>(null);

  // Fetch από τη βάση όλες τις ασκήσεις (public + custom του user)
  const [libraryExercises, setLibraryExercises] = useState<LibraryExercise[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("exercises")
      .select(
        "id, slug, name, name_en, primary_muscle, muscle_groups, tags, image_start_url, image_end_url, owner_id",
      )
      .order("primary_muscle", { ascending: true })
      .order("name", { ascending: true })
      .then(({ data }) => {
        setLibraryExercises((data as LibraryExercise[] | null) ?? []);
        setLibraryLoading(false);
      });
  }, []);

  function reloadLibrary() {
    const supabase = createClient();
    supabase
      .from("exercises")
      .select(
        "id, slug, name, name_en, primary_muscle, muscle_groups, tags, image_start_url, image_end_url, owner_id",
      )
      .order("primary_muscle", { ascending: true })
      .order("name", { ascending: true })
      .then(({ data }) => {
        setLibraryExercises((data as LibraryExercise[] | null) ?? []);
      });
  }

  // Στάδιο 1: αποθήκευση προγράμματος + ασκήσεων, χωρίς ανάθεση.
  // Επιστρέφει το programId αν πέτυχε.
  async function saveProgramOnly(): Promise<string | null> {
    setSaveState({ kind: "idle" });
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSaveState({ kind: "error", msg: "Δεν είσαι συνδεδεμένος." });
      return null;
    }

    const programId = crypto.randomUUID();
    const { error: progErr } = await supabase.from("programs").insert({
      id: programId,
      trainer_id: userId,
      name: name.trim() || "Πρόγραμμα χωρίς όνομα",
      title: title.trim() || "Χωρίς τίτλο",
      subtitle: "Δευτέρα + Πέμπτη · ενδιάμεσο επίπεδο · 60' στόχος",
      estimated_duration_min: Math.max(20, exercises.length * 8),
      estimated_kcal: exercises.length * 75,
    });
    if (progErr) {
      setSaveState({ kind: "error", msg: progErr.message });
      return null;
    }

    const exerciseRows = exercises.map((ex, i) => ({
      program_id: programId,
      position: i,
      name: ex.name,
      image_url: ex.img,
      tags: ex.tags,
      sets: ex.sets,
      reps: ex.reps,
      rest_seconds: parseInt(ex.rest, 10) || null,
      notes: ex.notes ?? null,
    }));
    const { error: exErr } = await supabase
      .from("program_exercises")
      .insert(exerciseRows);
    if (exErr) {
      setSaveState({ kind: "error", msg: exErr.message });
      return null;
    }
    return programId;
  }

  // Ενέργεια κουμπιού "Ανάθεση σε πελάτες..."
  async function openPickerAfterSave() {
    setSaving(true);
    const programId = await saveProgramOnly();
    setSaving(false);
    if (!programId) return;
    setSavedProgramId(programId);
    setPickerOpen(true);
  }

  // Ενέργεια κουμπιού "Μόνο αποθήκευση"
  async function saveOnly() {
    setSaving(true);
    const programId = await saveProgramOnly();
    setSaving(false);
    if (!programId) return;
    setSaveState({ kind: "success", assignedTo: 0 });
    router.refresh();
  }

  // Callback από το modal — assign σε επιλεγμένους
  async function assignToSelected(clientIds: string[]) {
    if (!savedProgramId) return;
    const supabase = createClient();
    if (clientIds.length === 0) {
      // Χωρίς επιλογή: πρόγραμμα σώθηκε αλλά χωρίς ανάθεση
      setSaveState({ kind: "success", assignedTo: 0 });
      router.refresh();
      return;
    }
    const { error, data } = await supabase
      .from("trainer_clients")
      .update({ assigned_program_id: savedProgramId })
      .in("client_id", clientIds)
      .select("client_id");
    if (error) {
      throw new Error(error.message);
    }
    setSaveState({ kind: "success", assignedTo: data?.length ?? 0 });
    router.refresh();
  }

  function addExerciseFromLib(item: LibItem) {
    setExercises((prev) => [
      ...prev,
      {
        uid: `ex-${Date.now()}`,
        name: item.name,
        tags: item.tags,
        img: item.img,
        sets: "3",
        reps: "10",
        rest: "90",
      },
    ]);
  }

  function deleteExercise(uid: string) {
    setExercises((prev) => prev.filter((e) => e.uid !== uid));
    if (expandedUid === uid) setExpandedUid(null);
  }

  function toggleExpand(uid: string) {
    setExpandedUid((cur) => (cur === uid ? null : uid));
  }

  function updateExercise(uid: string, patch: Partial<WorkoutEx>) {
    setExercises((prev) => prev.map((e) => (e.uid === uid ? { ...e, ...patch } : e)));
  }

  return (
    <div className="min-h-screen">
      <TopBar
        name={name}
        saving={saving}
        saveState={saveState}
        onSaveOnly={saveOnly}
        onSaveAndAssign={openPickerAfterSave}
      />
      <ClientAssignmentModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        assignmentType="program"
        newItemLabel={title.trim() || "Νέο πρόγραμμα"}
        onConfirm={assignToSelected}
      />
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
        <Library
          onAdd={addExerciseFromLib}
          items={libraryExercises}
          loading={libraryLoading}
          onCustomCreated={reloadLibrary}
        />
        <main className="mx-auto w-full max-w-[920px] px-6 pb-12 pt-8 md:px-10">
          <WorkoutHeader
            count={exercises.length}
            name={name}
            onNameChange={setName}
            title={title}
            onTitleChange={setTitle}
          />
          <div className="mt-6 flex flex-col gap-2.5">
            {exercises.map((ex, i) => (
              <ExerciseCard
                key={ex.uid}
                ex={ex}
                num={String(i + 1).padStart(2, "0")}
                expanded={expandedUid === ex.uid}
                onToggle={() => toggleExpand(ex.uid)}
                onDelete={() => deleteExercise(ex.uid)}
                onUpdate={(patch) => updateExercise(ex.uid, patch)}
              />
            ))}
          </div>
          <AddExerciseButton onClick={() => addExerciseFromLib(frequentItems[0])} />
          <AiTip />
          <BottomBar />
        </main>
      </div>
    </div>
  );
}

function TopBar({
  name,
  saving,
  saveState,
  onSaveOnly,
  onSaveAndAssign,
}: {
  name: string;
  saving: boolean;
  saveState:
    | { kind: "idle" }
    | { kind: "success"; assignedTo: number }
    | { kind: "error"; msg: string };
  onSaveOnly: () => void;
  onSaveAndAssign: () => void;
}) {
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
          {name}
        </h1>
      </div>
      {saveState.kind === "success" && (
        <div className="hidden items-center gap-1.5 rounded-lg border border-success/30 bg-success/[0.08] px-3 py-1.5 text-[11px] font-semibold text-success lg:flex">
          ✓ Αποθηκεύτηκε
          {saveState.assignedTo > 0
            ? ` — ανατέθηκε σε ${saveState.assignedTo} ${saveState.assignedTo === 1 ? "πελάτη" : "πελάτες"}`
            : " (χωρίς ανάθεση)"}
        </div>
      )}
      {saveState.kind === "error" && (
        <div className="hidden items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-1.5 text-[11px] font-semibold text-danger lg:flex max-w-[280px] truncate">
          {saveState.msg}
        </div>
      )}
      <button
        type="button"
        onClick={onSaveOnly}
        disabled={saving}
        className="rounded-[10px] border border-border bg-surface-1 px-3.5 py-2.5 text-[13px] font-bold text-text-1 hover:border-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "..." : "Μόνο αποθήκευση"}
      </button>
      <button
        type="button"
        onClick={onSaveAndAssign}
        disabled={saving}
        className="flex items-center gap-2 rounded-[10px] bg-accent px-3.5 py-2.5 text-[13px] font-bold text-[#0A0A0A] shadow-[0_0_20px_rgba(197,255,0,0.3)] hover:shadow-[0_0_32px_rgba(197,255,0,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
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
        {saving ? "Αποθήκευση..." : "Ανάθεση σε πελάτες..."}
      </button>
    </div>
  );
}

function Library({
  onAdd,
  items,
  loading,
  onCustomCreated,
}: {
  onAdd: (item: LibItem) => void;
  items: LibraryExercise[];
  loading: boolean;
  onCustomCreated: () => void;
}) {
  // Filters που ταιριάζουν με primary_muscle στη βάση
  const filters: { label: string; muscle: string | null }[] = [
    { label: "Όλα", muscle: null },
    { label: "Στήθος", muscle: "chest" },
    { label: "Πλάτη", muscle: "back" },
    { label: "Ώμοι", muscle: "shoulders" },
    { label: "Πόδια", muscle: "legs" },
    { label: "Χέρια", muscle: "arms" }, // ειδικός χειρισμός για biceps+triceps
    { label: "Κορμός", muscle: "core" },
    { label: "Cardio", muscle: "cardio" },
  ];
  const [activeFilter, setActiveFilter] = useState(0);
  const [query, setQuery] = useState("");
  const [customOpen, setCustomOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const activeMuscle = filters[activeFilter].muscle;
  function matches(it: LibraryExercise) {
    if (activeMuscle) {
      const pm = it.primary_muscle;
      if (activeMuscle === "arms") {
        if (pm !== "biceps" && pm !== "triceps") return false;
      } else if (pm !== activeMuscle) {
        return false;
      }
    }
    if (q) {
      const hay = `${it.name} ${it.name_en ?? ""} ${(it.tags ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  const customs = items.filter((it) => it.owner_id != null).filter(matches);
  const publics = items.filter((it) => it.owner_id == null).filter(matches);
  const totalMatches = customs.length + publics.length;

  function toLibItem(ex: LibraryExercise): LibItem {
    return {
      id: ex.slug ?? ex.id,
      name: ex.name,
      tags: ex.tags ?? [],
      img: ex.image_start_url ?? "",
    };
  }

  return (
    <aside className="sticky top-16 hidden max-h-[calc(100vh-64px)] overflow-y-auto border-r border-border bg-[#0C0C0C] p-5 md:block">
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-text-3">
            Βιβλιοθήκη ασκήσεων
          </h2>
          <button
            type="button"
            onClick={() => setCustomOpen(true)}
            className="rounded-lg border border-accent/30 bg-accent/[0.08] px-2 py-1 text-[10px] font-extrabold text-accent"
          >
            + Νέα
          </button>
        </div>
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Αναζήτηση άσκησης..."
            className="w-full rounded-[10px] border border-border bg-surface-1 py-2.5 pl-9 pr-3 text-[13px] text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f, i) => (
            <button
              type="button"
              key={f.label}
              onClick={() => setActiveFilter(i)}
              className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                i === activeFilter
                  ? "border-accent bg-accent/[0.12] text-accent"
                  : "border-border bg-surface-1 text-text-2 hover:border-[#303030]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-1 px-3 py-6 text-center text-[11px] text-text-3">
          Φόρτωση ασκήσεων...
        </div>
      ) : totalMatches === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-1 px-3 py-6 text-center text-[11px] text-text-3">
          Δεν βρέθηκαν ασκήσεις με αυτό το φίλτρο.
        </div>
      ) : (
        <>
          {customs.length > 0 && (
            <LibrarySection
              title="Οι δικές σου"
              count={String(customs.length)}
              items={customs.map(toLibItem)}
              onAdd={onAdd}
            />
          )}
          {publics.length > 0 && (
            <LibrarySection
              title="Βιβλιοθήκη"
              count={String(publics.length)}
              items={publics.map(toLibItem)}
              onAdd={onAdd}
            />
          )}
        </>
      )}
      <CustomExerciseModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onCreated={() => {
          setCustomOpen(false);
          onCustomCreated();
        }}
      />
    </aside>
  );
}

function CustomExerciseModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [primaryMuscle, setPrimaryMuscle] = useState("chest");
  const [tagsRaw, setTagsRaw] = useState("");
  const [imgStart, setImgStart] = useState("");
  const [imgEnd, setImgEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setPrimaryMuscle("chest");
      setTagsRaw("");
      setImgStart("");
      setImgEnd("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  async function submit() {
    if (!name.trim()) {
      setError("Δώσε όνομα άσκησης.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSaving(false);
      setError("Δεν είσαι συνδεδεμένος.");
      return;
    }
    const tags = tagsRaw
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const { error: insErr } = await supabase.from("exercises").insert({
      name: name.trim(),
      primary_muscle: primaryMuscle,
      muscle_groups: tags,
      tags,
      image_start_url: imgStart.trim() || null,
      image_end_url: imgEnd.trim() || null,
      owner_id: userId,
    });
    setSaving(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    onCreated();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-[#0F0F0F] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
            Νέα άσκηση
          </div>
          <h2 className="mt-1 text-[16px] font-extrabold tracking-[-0.02em]">
            Πρόσθεσε δική σου στη βιβλιοθήκη
          </h2>
        </div>
        <div className="space-y-3 p-5">
          <Field label="Όνομα άσκησης">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="π.χ. Πιέσεις σε μηχανή Hammer"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-1 focus:border-accent focus:outline-none"
            />
          </Field>
          <Field label="Κύριος μυικός group">
            <select
              value={primaryMuscle}
              onChange={(e) => setPrimaryMuscle(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-1 focus:border-accent focus:outline-none"
            >
              <option value="chest">Στήθος</option>
              <option value="back">Πλάτη</option>
              <option value="shoulders">Ώμοι</option>
              <option value="biceps">Δικέφαλα</option>
              <option value="triceps">Τρικέφαλα</option>
              <option value="legs">Πόδια</option>
              <option value="core">Κορμός</option>
              <option value="cardio">Cardio</option>
            </select>
          </Field>
          <Field label="Tags (χωρισμένα με κόμμα)">
            <input
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="Στήθος, Compound, Ώμοι"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-1 focus:border-accent focus:outline-none"
            />
          </Field>
          <Field label="Εικόνα εκκίνησης (URL) — προαιρετικά">
            <input
              value={imgStart}
              onChange={(e) => setImgStart(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-1 focus:border-accent focus:outline-none"
            />
          </Field>
          <Field label="Εικόνα τέλους (URL) — για animation">
            <input
              value={imgEnd}
              onChange={(e) => setImgEnd(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-1 focus:border-accent focus:outline-none"
            />
          </Field>
        </div>
        {error && (
          <div className="mx-5 mb-3 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
            {error}
          </div>
        )}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-[10px] border border-border bg-surface-1 px-3.5 py-2 text-[13px] font-bold text-text-1"
          >
            Άκυρο
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="rounded-[10px] bg-accent px-4 py-2 text-[13px] font-extrabold text-[#0A0A0A] shadow-[0_0_16px_rgba(197,255,0,0.35)] disabled:opacity-50"
          >
            {saving ? "Αποθήκευση..." : "Αποθήκευση"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
        {label}
      </label>
      {children}
    </div>
  );
}

function LibrarySection({
  title,
  count,
  items,
  onAdd,
}: {
  title: string;
  count: string;
  items: LibItem[];
  onAdd: (item: LibItem) => void;
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
            className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface-1 p-2 transition-all hover:translate-x-0.5 hover:border-accent"
            onClick={() => onAdd(it)}
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
              onClick={(e) => {
                e.stopPropagation();
                onAdd(it);
              }}
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

function WorkoutHeader({
  count,
  name,
  onNameChange,
  title,
  onTitleChange,
}: {
  count: number;
  name: string;
  onNameChange: (v: string) => void;
  title: string;
  onTitleChange: (v: string) => void;
}) {
  return (
    <div className="mb-7">
      <input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="mb-3 inline-flex w-auto items-center gap-1.5 rounded-full border border-accent/20 bg-accent/[0.12] px-2.5 py-[5px] text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent outline-none focus:border-accent"
      />
      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
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
          val={String(count)}
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
          val={`~${Math.max(20, count * 8)}`}
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
          val={`~${count * 75}`}
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

function ExerciseCard({
  ex,
  num,
  expanded,
  onToggle,
  onDelete,
  onUpdate,
}: {
  ex: WorkoutEx;
  num: string;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<WorkoutEx>) => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all ${
        expanded
          ? "border-accent shadow-[0_0_0_1px_var(--accent-dim)]"
          : "border-border hover:border-[#303030]"
      } bg-surface-1`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3.5 p-3 text-left"
      >
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
            expanded
              ? "bg-accent text-[#0A0A0A]"
              : "bg-surface-3 text-text-2"
          }`}
        >
          {num}
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
          <ConfigCell label="REST" val={`${ex.rest}''`} />
        </div>
        <div className="flex gap-1">
          <span
            aria-hidden
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border text-text-3"
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
              {expanded ? (
                <polyline points="18 15 12 9 6 15" />
              ) : (
                <polyline points="6 9 12 15 18 9" />
              )}
            </svg>
          </span>
          <span
            role="button"
            aria-label="Διαγραφή"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-lg border border-border text-text-3 hover:border-danger hover:text-danger"
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
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-3.5 pb-4 pl-[70px]">
          <div className="mb-3.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <ConfigInput
              label="Σετ"
              value={ex.sets}
              onChange={(v) => onUpdate({ sets: v })}
            />
            <ConfigInput
              label="Επαναλήψεις"
              value={ex.reps}
              onChange={(v) => onUpdate({ reps: v })}
            />
            <ConfigInput
              label="Ξεκούραση (sec)"
              value={ex.rest}
              onChange={(v) => onUpdate({ rest: v })}
            />
            <ConfigInput label="Tempo" value="2-0-2-0" onChange={() => {}} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
              Σημείωση προς αθλούμενο
              <span className="text-[10px] normal-case tracking-normal text-accent">
                · εμφανίζεται μέσα στο app του πελάτη
              </span>
            </div>
            <textarea
              value={ex.notes ?? ""}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Π.χ. Στο τελευταίο σετ βγάλε drop set..."
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
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-surface-2 px-3 py-2.5">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 bg-transparent p-0 font-mono text-base font-extrabold text-text-1 outline-none"
      />
    </div>
  );
}

function AddExerciseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
      Πρόσθεσε άσκηση · κλικ στη βιβλιοθήκη ή εδώ
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
          (face pulls) για ισορροπία.
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
        Οι αλλαγές αποθηκεύονται τοπικά μέχρι να βάλουμε database
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
        Ανάθεση σε πελάτες
      </button>
    </div>
  );
}
