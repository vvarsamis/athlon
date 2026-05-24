import Link from "next/link";

const screens = [
  { href: "/login", label: "Είσοδος", desc: "Login οθόνη" },
  { href: "/home", label: "Αρχική", desc: "Home feed για αθλητή" },
  { href: "/profile", label: "Προφίλ Αθλητή", desc: "Στοιχεία, μετρήσεις, ιστορικό" },
  { href: "/trainer", label: "Trainer Dashboard", desc: "Πίνακας προπονητή" },
  { href: "/trainer/onboarding", label: "Trainer Onboarding", desc: "Εγγραφή προπονητή" },
  { href: "/workout", label: "Προπόνηση", desc: "Single workout view" },
  { href: "/workout-builder", label: "Workout Builder", desc: "Δημιουργία προπόνησης" },
  { href: "/nutrition", label: "Nutrition Planner", desc: "Διατροφικό πλάνο" },
];

export default function Index() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Athlon <span className="text-accent">·</span>{" "}
          <span className="text-text-2 font-medium">σκελετός εφαρμογής</span>
        </h1>
        <p className="mt-3 text-text-2">
          Πρώτη έκδοση: όλα τα mockups γίνονται σταδιακά πραγματικές σελίδες.
          Παρακάτω είναι ο index των οθονών.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {screens.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block rounded-2xl border border-border bg-surface-1 p-4 transition hover:border-accent hover:bg-surface-2"
            >
              <div className="text-text-1 font-semibold">{s.label}</div>
              <div className="mt-1 text-sm text-text-3">{s.desc}</div>
              <div className="mt-3 font-mono text-xs text-accent">{s.href}</div>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="mt-12 text-xs text-text-3">
        Mockups: <span className="font-mono">mockups/*.html</span>
      </footer>
    </main>
  );
}
