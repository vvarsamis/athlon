import Image from "next/image";
import { redirect } from "next/navigation";
import { PhoneFrame } from "../_components/PhoneFrame";
import { BottomNav } from "../_components/BottomNav";
import { PhotoUploader } from "../_components/PhotoUploader";
import { createClient } from "../../lib/supabase/server";
import { getProfile } from "../../lib/profile";

type PhotoRow = {
  id: string;
  storage_path: string;
  weight_kg: number | null;
  taken_at: string;
};

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type === "trainer") {
    redirect("/trainer");
  }

  // 1. Weight: latest + delta
  const { data: latestW } = await supabase
    .from("weigh_ins")
    .select("weight_kg, recorded_at")
    .eq("client_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const latestKg =
    latestW?.weight_kg != null ? Number(latestW.weight_kg) : null;

  // Earliest ever για total delta
  const { data: firstW } = await supabase
    .from("weigh_ins")
    .select("weight_kg, recorded_at")
    .eq("client_id", user.id)
    .order("recorded_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const firstKg = firstW?.weight_kg != null ? Number(firstW.weight_kg) : null;

  // 2. Session stats
  const { count: sessionsCount } = await supabase
    .from("workout_sessions")
    .select("id", { count: "exact", head: true })
    .eq("client_id", user.id)
    .not("completed_at", "is", null);

  // Streak
  const { data: sessionDays } = await supabase
    .from("workout_sessions")
    .select("completed_at")
    .eq("client_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(90);
  const daySet = new Set<string>();
  for (const s of (sessionDays as { completed_at: string }[] | null) ?? []) {
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

  // 3. Photos + signed URLs
  const { data: photoRows } = await supabase
    .from("progress_photos")
    .select("id, storage_path, weight_kg, taken_at")
    .eq("client_id", user.id)
    .order("taken_at", { ascending: false })
    .limit(12);
  const photos = (photoRows as PhotoRow[] | null) ?? [];

  const photoUrls = new Map<string, string>();
  if (photos.length > 0) {
    const { data: signed } = await supabase.storage
      .from("progress-photos")
      .createSignedUrls(
        photos.map((p) => p.storage_path),
        60 * 60, // 1 ώρα
      );
    for (const s of signed ?? []) {
      if (s.signedUrl && s.path) {
        photoUrls.set(s.path, s.signedUrl);
      }
    }
  }

  const totalDelta =
    latestKg != null && firstKg != null
      ? Math.round((latestKg - firstKg) * 10) / 10
      : null;

  return (
    <PhoneFrame>
      <div className="relative z-[1] pb-[120px]">
        <StatusBar />

        <header className="px-5 pb-4 pt-2">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
            Η πρόοδός σου
          </div>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.025em]">
            Όλα σε ένα μέρος
          </h1>
        </header>

        {/* Stats grid */}
        <div className="mx-5 mt-2 grid grid-cols-2 gap-2.5">
          <StatBig
            label="Σωματικό βάρος"
            val={latestKg != null ? String(latestKg) : "—"}
            unit={latestKg != null ? "kg" : ""}
            delta={
              totalDelta == null
                ? "Καμία μέτρηση"
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
                ? "text-accent"
                : totalDelta > 0
                ? "text-warning"
                : "text-text-3"
            }
          />
          <StatBig
            label="Σερί"
            val={streak > 0 ? String(streak) : "0"}
            unit={streak === 1 ? "μέρα" : "μέρες"}
            delta={streak > 0 ? "🔥 σε εξέλιξη" : "Ξεκίνα σήμερα"}
            deltaClass={streak > 0 ? "text-accent" : "text-text-3"}
          />
          <StatBig
            label="Προπονήσεις"
            val={String(sessionsCount ?? 0)}
            unit="συνολικά"
            delta={
              (sessionsCount ?? 0) > 0 ? "Καταγεγραμμένες" : "Καμία ακόμα"
            }
            deltaClass={
              (sessionsCount ?? 0) > 0 ? "text-success" : "text-text-3"
            }
          />
          <StatBig
            label="Όγκος (kg)"
            val="—"
            unit=""
            delta="Σύντομα"
            deltaClass="text-text-3"
          />
        </div>

        {/* Progress photos */}
        <div className="px-5 pt-6 pb-3 flex items-baseline justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
            Φωτογραφίες προόδου
          </h2>
          <span className="text-[11px] font-semibold text-text-3">
            {photos.length}/12 πρόσφατες
          </span>
        </div>

        <div className="mx-5">
          <PhotoUploader userId={user.id} />
        </div>

        {photos.length > 0 && (
          <div className="mx-5 mt-3 grid grid-cols-3 gap-2">
            {photos.map((p) => {
              const url = photoUrls.get(p.storage_path);
              const date = new Date(p.taken_at).toLocaleDateString("el-GR", {
                day: "numeric",
                month: "short",
              });
              return (
                <div
                  key={p.id}
                  className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-surface-2"
                >
                  {url ? (
                    <Image
                      src={url}
                      alt={`Φωτο ${date}`}
                      fill
                      unoptimized
                      sizes="120px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-text-3">
                      —
                    </div>
                  )}
                  <div
                    className="absolute inset-x-0 bottom-0 p-1.5"
                    style={{
                      background:
                        "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
                    }}
                  >
                    <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-1">
                      {date}
                    </div>
                    {p.weight_kg != null && (
                      <div className="mt-0.5 font-mono text-[10px] font-extrabold text-accent">
                        {p.weight_kg} kg
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav active="progress" />
    </PhoneFrame>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[50px] items-center justify-between px-8 pt-4 text-[13px] font-bold">
      <span>14:03</span>
      <span className="font-mono text-xs text-accent">● ENERGY 87%</span>
    </div>
  );
}

function StatBig({
  label,
  val,
  unit,
  delta,
  deltaClass,
}: {
  label: string;
  val: string;
  unit: string;
  delta: string;
  deltaClass: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1 font-mono text-[26px] font-extrabold tracking-[-0.03em]">
        {val}
        {unit && (
          <span className="text-[13px] font-semibold text-text-3">{unit}</span>
        )}
      </div>
      <div className={`mt-1.5 text-[11px] font-bold ${deltaClass}`}>{delta}</div>
    </div>
  );
}
