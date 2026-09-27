import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getProfile } from "../../../lib/profile";

type ClientRow = {
  client_id: string;
  status: string;
  joined_at: string;
  assigned_program_id: string | null;
  profile: { full_name: string | null } | null;
  program: { name: string; title: string } | null;
};

export default async function TrainerClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (profile?.user_type !== "trainer") {
    redirect("/home");
  }

  const { data } = await supabase
    .from("trainer_clients")
    .select(
      "client_id, status, joined_at, assigned_program_id, profile:profiles!trainer_clients_client_id_fkey(full_name), program:programs(name, title)",
    )
    .eq("trainer_id", user.id)
    .order("joined_at", { ascending: false });

  const clients = (data as ClientRow[] | null) ?? [];

  // Πάρε το τελευταίο βάρος για κάθε πελάτη (batch query)
  const clientIds = clients.map((c) => c.client_id);
  const latestWeights = new Map<string, { kg: number; at: string }>();
  const photoCounts = new Map<string, number>();
  const latestPhotoPaths = new Map<string, { path: string; at: string }>();
  if (clientIds.length > 0) {
    const { data: allWeighIns } = await supabase
      .from("weigh_ins")
      .select("client_id, weight_kg, recorded_at")
      .in("client_id", clientIds)
      .order("recorded_at", { ascending: false });
    for (const w of (allWeighIns as
      | { client_id: string; weight_kg: number; recorded_at: string }[]
      | null) ?? []) {
      if (!latestWeights.has(w.client_id)) {
        latestWeights.set(w.client_id, {
          kg: Number(w.weight_kg),
          at: w.recorded_at,
        });
      }
    }

    // Photos: count per client + latest per client
    const { data: allPhotos } = await supabase
      .from("progress_photos")
      .select("client_id, storage_path, taken_at")
      .in("client_id", clientIds)
      .order("taken_at", { ascending: false });
    for (const p of (allPhotos as
      | { client_id: string; storage_path: string; taken_at: string }[]
      | null) ?? []) {
      photoCounts.set(p.client_id, (photoCounts.get(p.client_id) ?? 0) + 1);
      if (!latestPhotoPaths.has(p.client_id)) {
        latestPhotoPaths.set(p.client_id, {
          path: p.storage_path,
          at: p.taken_at,
        });
      }
    }
  }

  // Signed URLs για latest photo per client (batch)
  const latestPhotoUrls = new Map<string, string>();
  const paths = Array.from(latestPhotoPaths.values()).map((v) => v.path);
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("progress-photos")
      .createSignedUrls(paths, 60 * 60);
    for (const s of signed ?? []) {
      if (s.signedUrl && s.path) {
        latestPhotoUrls.set(s.path, s.signedUrl);
      }
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border bg-[#080808]">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-6 py-4">
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
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-3">
              Trainer <span className="text-accent">·</span> Πελάτες
            </div>
            <h1 className="text-[17px] font-extrabold tracking-[-0.015em]">
              Οι πελάτες σου ({clients.length})
            </h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-6 py-8">
        {clients.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => {
              const latestPhoto = latestPhotoPaths.get(c.client_id);
              const latestPhotoUrl = latestPhoto
                ? latestPhotoUrls.get(latestPhoto.path) ?? null
                : null;
              return (
                <ClientCard
                  key={c.client_id}
                  client={c}
                  latestWeight={latestWeights.get(c.client_id) ?? null}
                  photoCount={photoCounts.get(c.client_id) ?? 0}
                  latestPhotoUrl={latestPhotoUrl}
                  latestPhotoAt={latestPhoto?.at ?? null}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-1 p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/[0.12] text-accent">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-extrabold tracking-[-0.02em]">
        Καμία σύνδεση ακόμα
      </h2>
      <p className="mx-auto max-w-md text-sm text-text-2">
        Μοιράσου τον κωδικό σου από το Dashboard σε αθλητές — θα εμφανιστούν εδώ
        μόλις γραφτούν με τον κωδικό.
      </p>
      <Link
        href="/trainer"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-[#0A0A0A]"
      >
        ← Επιστροφή στο Dashboard
      </Link>
    </div>
  );
}

function ClientCard({
  client,
  latestWeight,
  photoCount,
  latestPhotoUrl,
  latestPhotoAt,
}: {
  client: ClientRow;
  latestWeight: { kg: number; at: string } | null;
  photoCount: number;
  latestPhotoUrl: string | null;
  latestPhotoAt: string | null;
}) {
  const name = client.profile?.full_name ?? "Χωρίς όνομα";
  const joined = new Date(client.joined_at).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const statusColor =
    client.status === "active"
      ? "bg-success/[0.12] text-success"
      : client.status === "paused"
      ? "bg-warning/[0.12] text-warning"
      : "bg-surface-3 text-text-3";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-1 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-accent bg-surface-3 text-lg font-extrabold text-text-1">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-extrabold tracking-[-0.01em]">
            {name}
          </div>
          <div className="mt-0.5 text-[11px] text-text-3">
            Μέλος από {joined}
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${statusColor}`}
        >
          {client.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
            Πρόγραμμα
          </div>
          {client.program ? (
            <div className="mt-1 text-[12px] font-bold">
              {client.program.title.slice(0, 24)}
              {client.program.title.length > 24 ? "…" : ""}
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-text-3">Δεν έχει</div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
            Βάρος
          </div>
          {latestWeight ? (
            <div className="mt-1">
              <div className="font-mono text-[13px] font-extrabold">
                {latestWeight.kg} kg
              </div>
              <div className="mt-0.5 text-[10px] text-text-3">
                {new Date(latestWeight.at).toLocaleDateString("el-GR", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-text-3">—</div>
          )}
        </div>
      </div>

      {/* Latest progress photo */}
      <div className="rounded-xl border border-border bg-surface-2 p-3">
        <div className="mb-2 flex items-baseline justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-3">
            Φωτογραφίες προόδου
          </div>
          <div className="font-mono text-[10px] font-semibold text-text-3">
            {photoCount}
          </div>
        </div>
        {latestPhotoUrl && latestPhotoAt ? (
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-black">
              <Image
                src={latestPhotoUrl}
                alt="Τελευταία φωτο"
                fill
                unoptimized
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-text-1">
                Τελευταία
              </div>
              <div className="mt-0.5 text-[10px] text-text-3">
                {new Date(latestPhotoAt).toLocaleDateString("el-GR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-text-3">Δεν έχει ανεβάσει ακόμα</div>
        )}
      </div>
    </div>
  );
}
