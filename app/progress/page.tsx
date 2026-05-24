import { PhoneFrame } from "../_components/PhoneFrame";
import { BottomNav } from "../_components/BottomNav";

export default function ProgressPage() {
  return (
    <PhoneFrame>
      <div className="relative z-[1] pb-[120px]">
        <div className="flex h-[50px] items-center justify-between px-8 pt-4 text-[13px] font-bold">
          <span>14:03</span>
          <span className="font-mono text-xs text-accent">● ENERGY 87%</span>
        </div>

        <header className="px-5 pb-4 pt-2">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
            Η πρόοδός σου
          </div>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.025em]">
            Τελευταίες 8 εβδ.
          </h1>
        </header>

        <div className="mx-5 mt-2 grid grid-cols-2 gap-2.5">
          <StatBig label="Σωματικό βάρος" val="82.4" unit="kg" delta="↓ 1.8 kg" deltaClass="text-accent" />
          <StatBig label="Σερί" val="12" unit="μέρες" delta="🔥 ρεκόρ" deltaClass="text-accent" />
          <StatBig label="Προπονήσεις" val="28" unit="/32" delta="87% adherence" deltaClass="text-success" />
          <StatBig label="Όγκος (kg)" val="42.6" unit="t" delta="+18% vs Απρ" deltaClass="text-success" />
        </div>

        <div className="px-5 pt-6 pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
          Προσωπικά ρεκόρ
        </div>

        <div className="mx-5 flex flex-col gap-2">
          {[
            { name: "Squat", val: "62.5", date: "Χθες" },
            { name: "Deadlift", val: "92.5", date: "Πριν 4 μέρες" },
            { name: "Bench press", val: "70.0", date: "Πριν 1 εβδ." },
          ].map((pr) => (
            <div
              key={pr.name}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface-1 px-4 py-3.5"
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-3">
                  {pr.name}
                </div>
                <div className="mt-1 font-mono text-xl font-extrabold text-accent">
                  {pr.val}
                  <span className="ml-1 text-xs font-semibold text-text-3">kg</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-text-3">{pr.date}</span>
            </div>
          ))}
        </div>

        <div className="px-5 pt-6 pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-text-3">
          Από τον προπονητή σου
        </div>

        <div
          className="mx-5 rounded-2xl border border-accent/20 p-4"
          style={{
            background:
              "linear-gradient(155deg, rgba(197,255,0,0.06) 0%, transparent 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FFB800] text-[10px] font-extrabold text-[#0A0A0A]">
              ΘΑ
            </div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">
              Σχόλιο Θάνου
            </div>
          </div>
          <div className="mt-2.5 text-[13px] leading-[1.55] text-text-2">
            «Εξαιρετική πρόοδος. Στις επόμενες 2 εβδ. αυξάνουμε volume στο
            squat. Κράτα την ενυδάτωση σταθερή.»
          </div>
        </div>
      </div>
      <BottomNav active="progress" />
    </PhoneFrame>
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
        <span className="text-[13px] font-semibold text-text-3">{unit}</span>
      </div>
      <div className={`mt-1.5 text-[11px] font-bold ${deltaClass}`}>{delta}</div>
    </div>
  );
}
