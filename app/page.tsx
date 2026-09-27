import Link from "next/link";

const screens = [
  { href: "/login", label: "Είσοδος", desc: "Login οθόνη" },
  { href: "/signup", label: "Εγγραφή", desc: "Signup (client/trainer + invite code)" },
  { href: "/home", label: "Αρχική (client)", desc: "Home feed με streak, βάρος, πρόγραμμα" },
  { href: "/schedule", label: "Ημερολόγιο (client)", desc: "Month grid με προπονήσεις" },
  { href: "/me/nutrition", label: "Διατροφή (client)", desc: "Γεύματα ημέρας" },
  { href: "/progress", label: "Πρόοδος (client)", desc: "Stats + progress photos" },
  { href: "/me/messages", label: "Μηνύματα (client)", desc: "Chat με τον προπονητή" },
  { href: "/workout", label: "Προπόνηση (client)", desc: "Assigned workout runner" },
  { href: "/trainer", label: "Trainer Dashboard", desc: "Πίνακας προπονητή" },
  { href: "/trainer/clients", label: "Πελάτες (trainer)", desc: "Λίστα με weight + photo" },
  { href: "/trainer/programs", label: "Προγράμματα (trainer)", desc: "Programs list" },
  { href: "/trainer/messages", label: "Μηνύματα (trainer)", desc: "Inbox με unread" },
  { href: "/trainer/calendar", label: "Ημερολόγιο (trainer)", desc: "Week grid πελατών" },
  { href: "/trainer/reports", label: "Αναφορές (trainer)", desc: "KPIs + leaderboards" },
  { href: "/trainer/onboarding", label: "Trainer Onboarding", desc: "Studio setup preview" },
  { href: "/workout-builder", label: "Workout Builder", desc: "Δημιουργία προγράμματος" },
  { href: "/nutrition", label: "Nutrition Planner", desc: "Διατροφικό πλάνο editor" },
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
