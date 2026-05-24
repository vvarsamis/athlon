# Athlon

Εφαρμογή προπόνησης & διατροφής για αθλητές και προπονητές.

## Τι έχει μέσα

- `mockups/` — τα αρχικά HTML mockups (αναφορά)
- `app/` — οι σελίδες της εφαρμογής (Next.js App Router)
- `app/_components/` — επαναχρησιμοποιήσιμα κομμάτια UI

## Πώς το τρέχεις

Άνοιξε PowerShell μέσα στον φάκελο `C:\athlon` και τρέξε:

```powershell
npm run dev
```

Μετά πήγαινε στο http://localhost:3000 — θα δεις τον index με όλες τις οθόνες.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Fonts: Inter + JetBrains Mono
- Θέμα: σκούρο φόντο + neon πράσινο (`#C5FF00`)

## Επόμενα βήματα

1. Μεταφορά κάθε mockup σε πραγματική σελίδα μία-μία
2. Επιλογή backend (πιθανόν Supabase) για login & αποθήκευση δεδομένων
3. PWA setup για εγκατάσταση στο κινητό
