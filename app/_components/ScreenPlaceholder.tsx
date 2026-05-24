import Link from "next/link";

type Props = {
  title: string;
  mockup: string;
};

export function ScreenPlaceholder({ title, mockup }: Props) {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link
        href="/"
        className="font-mono text-xs text-text-3 hover:text-accent"
      >
        ← index
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-3 text-text-2">
        Σκελετός σελίδας. Θα μεταφερθεί από το mockup:
      </p>
      <p className="mt-2 font-mono text-sm text-accent">{mockup}</p>
    </main>
  );
}
