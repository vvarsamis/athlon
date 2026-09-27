"use client";

import { useEffect, useState } from "react";

export function NotificationPermissionButton() {
  const [permission, setPermission] = useState<
    "default" | "granted" | "denied" | "unsupported"
  >("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as typeof permission);
  }, []);

  if (permission === "unsupported" || permission === "granted") return null;

  async function ask() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as typeof permission);
  }

  if (permission === "denied") {
    return (
      <div className="mx-4 mt-3 rounded-xl border border-warning/20 bg-warning/[0.06] px-3 py-2 text-[11px] text-warning">
        Οι ειδοποιήσεις είναι μπλοκαρισμένες από τον browser. Ενεργοποίησέ τες
        από τις ρυθμίσεις του browser για αυτό το site.
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/[0.06] px-3 py-2">
      <div className="text-[11px] leading-[1.3] text-text-1">
        <strong className="font-bold">Ενεργοποίησε ειδοποιήσεις</strong> για να
        μαθαίνεις άμεσα νέα μηνύματα.
      </div>
      <button
        type="button"
        onClick={ask}
        className="flex-shrink-0 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-extrabold text-[#0A0A0A]"
      >
        Ενεργοποίηση
      </button>
    </div>
  );
}
