"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type ScannedFood = {
  code: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

type Props = {
  userId: string;
  trainerId: string | null;
};

// Ελάχιστη type declaration για BarcodeDetector (browser API, όχι σε TypeScript stdlib)
type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement | ImageBitmap | HTMLCanvasElement) => Promise<Array<{ rawValue: string }>>;
};
type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;
declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorCtor;
  }
}

export function BarcodeScannerButton({ userId, trainerId }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[100px] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-[#0A0A0A] shadow-[0_0_28px_rgba(197,255,0,0.45)]"
        aria-label="Scan barcode"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7V5a2 2 0 0 1 2-2h2M4 17v2a2 2 0 0 0 2 2h2M20 7V5a2 2 0 0 0-2-2h-2M20 17v2a2 2 0 0 1-2 2h-2M7 7v10M11 7v10M15 7v10" />
        </svg>
      </button>
      {open && <BarcodeScannerModal onClose={() => setOpen(false)} userId={userId} trainerId={trainerId} />}
    </>
  );
}

function BarcodeScannerModal({
  onClose,
  userId,
  trainerId,
}: {
  onClose: () => void;
  userId: string;
  trainerId: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "found" | "manual" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [scanned, setScanned] = useState<ScannedFood | null>(null);
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [supportsBarcode, setSupportsBarcode] = useState<boolean | null>(null);

  useEffect(() => {
    const supported = typeof window !== "undefined" && !!window.BarcodeDetector;
    setSupportsBarcode(supported);
    if (supported) {
      startCamera();
    } else {
      setStatus("manual");
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setStatus("scanning");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        detectLoop();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Αποτυχία πρόσβασης στην κάμερα.");
      setStatus("manual");
    }
  }

  async function detectLoop() {
    if (!window.BarcodeDetector || !videoRef.current) return;
    const detector = new window.BarcodeDetector({
      formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
    });
    const check = async () => {
      if (!videoRef.current || status === "found") return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          await lookupBarcode(code);
          return;
        }
      } catch {
        // silent
      }
      if (streamRef.current?.active) {
        requestAnimationFrame(check);
      }
    };
    check();
  }

  async function lookupBarcode(code: string) {
    setStatus("found");
    setError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    try {
      // Τοπική βάση πρώτα (αν έχει ήδη ψαχτεί)
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("foods")
        .select("name, brand, image_url, kcal, protein_g, carbs_g, fat_g")
        .eq("barcode", code)
        .limit(1)
        .maybeSingle();
      if (existing) {
        setScanned({ code, ...(existing as Omit<ScannedFood, "code">) });
        return;
      }
      // Αλλιώς OpenFoodFacts
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const j = (await res.json()) as {
        status?: number;
        product?: {
          product_name?: string;
          product_name_el?: string;
          brands?: string;
          image_small_url?: string;
          nutriments?: {
            "energy-kcal_100g"?: number;
            proteins_100g?: number;
            carbohydrates_100g?: number;
            fat_100g?: number;
          };
        };
      };
      if (j.status !== 1 || !j.product) {
        setError("Το barcode δεν βρέθηκε στο OpenFoodFacts.");
        return;
      }
      const p = j.product;
      const food: ScannedFood = {
        code,
        name: p.product_name_el || p.product_name || "Άγνωστο προϊόν",
        brand: p.brands ?? null,
        image_url: p.image_small_url ?? null,
        kcal: p.nutriments?.["energy-kcal_100g"] ?? 0,
        protein_g: p.nutriments?.proteins_100g ?? 0,
        carbs_g: p.nutriments?.carbohydrates_100g ?? 0,
        fat_g: p.nutriments?.fat_100g ?? 0,
      };
      setScanned(food);
      // Cache στη βάση
      await supabase.from("foods").upsert(
        {
          name: food.name,
          brand: food.brand,
          barcode: code,
          category: "other",
          emoji: "📦",
          image_url: food.image_url,
          portion_size: 100,
          portion_unit: "g",
          protein_g: food.protein_g,
          carbs_g: food.carbs_g,
          fat_g: food.fat_g,
          kcal: food.kcal,
          origin: "off",
          owner_id: userId,
        },
        { onConflict: "barcode" },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Αποτυχία σύνδεσης.");
    }
  }

  async function sendToTrainer() {
    if (!scanned || !trainerId) return;
    setSending(true);
    const supabase = createClient();
    const body = `📦 Σκανάρισα αυτό:\n${scanned.name}${scanned.brand ? ` (${scanned.brand})` : ""}\n${Math.round(scanned.kcal)} kcal · P ${Math.round(scanned.protein_g)}g · C ${Math.round(scanned.carbs_g)}g · F ${Math.round(scanned.fat_g)}g / 100g\nBarcode: ${scanned.code}`;
    const { error } = await supabase.from("messages").insert({
      sender_id: userId,
      recipient_id: trainerId,
      body,
    });
    setSending(false);
    if (!error) {
      setSentOk(true);
      setTimeout(() => onClose(), 1200);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-[#0F0F0F] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-[13px] font-extrabold">Barcode Scanner</div>
          <button type="button" onClick={onClose} className="text-text-3 hover:text-text-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {scanned ? (
          <div className="p-5">
            <div className="mb-3 flex items-center gap-3">
              {scanned.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={scanned.image_url} alt={scanned.name} className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-surface-2 text-2xl">📦</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-extrabold">{scanned.name}</div>
                {scanned.brand && <div className="mt-0.5 truncate text-[11px] text-text-3">{scanned.brand}</div>}
              </div>
            </div>
            <div className="mb-4 grid grid-cols-4 gap-2 rounded-xl border border-border bg-surface-2 p-3 text-center text-[11px]">
              <Macro label="kcal" val={Math.round(scanned.kcal)} className="text-accent" />
              <Macro label="P" val={Math.round(scanned.protein_g)} unit="g" />
              <Macro label="C" val={Math.round(scanned.carbs_g)} unit="g" />
              <Macro label="F" val={Math.round(scanned.fat_g)} unit="g" />
            </div>
            <div className="text-center text-[9px] text-text-3">ανά 100g / 100ml</div>
            {sentOk ? (
              <div className="mt-4 rounded-lg border border-success/30 bg-success/[0.08] px-3 py-2 text-center text-[12px] font-bold text-success">
                ✓ Στάλθηκε στον προπονητή
              </div>
            ) : trainerId ? (
              <button
                type="button"
                onClick={sendToTrainer}
                disabled={sending}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-[13px] font-extrabold text-[#0A0A0A] disabled:opacity-50"
              >
                {sending ? "Αποστολή..." : "📩 Στείλε στον προπονητή"}
              </button>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-1 px-3 py-2 text-center text-[11px] text-text-3">
                Χρειάζεσαι προπονητή για να στείλεις.
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setScanned(null);
                setStatus("scanning");
                startCamera();
              }}
              className="mt-2 w-full rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-[12px] font-bold text-text-2"
            >
              Σκανάρισε άλλο
            </button>
          </div>
        ) : status === "manual" ? (
          <div className="space-y-3 p-5">
            {supportsBarcode === false ? (
              <div className="rounded-lg border border-warning/30 bg-warning/[0.08] px-3 py-2 text-[11px] text-warning">
                Ο browser σου δεν υποστηρίζει scanner. Πληκτρολόγησε τον barcode:
              </div>
            ) : (
              <div className="text-[11px] text-text-3">Πληκτρολόγησε τον barcode:</div>
            )}
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="π.χ. 5201234567890"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-center font-mono text-[15px] focus:border-accent focus:outline-none"
            />
            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-[11px] text-danger">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={() => manualCode.trim() && lookupBarcode(manualCode.trim())}
              disabled={!manualCode.trim()}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-[13px] font-extrabold text-[#0A0A0A] disabled:opacity-50"
            >
              Ψάξε
            </button>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              className="aspect-square w-full bg-black object-cover"
              playsInline
              muted
            />
            <div className="absolute inset-x-8 top-1/2 h-16 -translate-y-1/2 rounded-lg border-2 border-accent" />
            <div className="absolute inset-x-0 bottom-3 text-center text-[11px] font-bold text-white/80">
              Στόχευσε το barcode
            </div>
            {error && (
              <div className="absolute inset-x-3 bottom-14 rounded-lg border border-danger/40 bg-danger/[0.15] px-3 py-2 text-[11px] text-danger">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Macro({
  label,
  val,
  unit,
  className,
}: {
  label: string;
  val: number;
  unit?: string;
  className?: string;
}) {
  return (
    <div>
      <div className={`font-mono text-[15px] font-extrabold ${className ?? "text-text-1"}`}>
        {val}
        {unit && <span className="ml-0.5 text-[9px] text-text-3">{unit}</span>}
      </div>
      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-text-3">
        {label}
      </div>
    </div>
  );
}
