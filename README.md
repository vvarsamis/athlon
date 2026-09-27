# Athlon

Εφαρμογή προπόνησης & διατροφής για αθλητές και προπονητές. Deployed σε **https://athlon-psi.vercel.app**.

## Τι κάνει

Το Athlon είναι SaaS με **2 ρόλους**:

- **Trainer** (desktop-first) — φτιάχνει προγράμματα προπόνησης και διατροφικά πλάνα, τα αναθέτει σε πελάτες, βλέπει την πρόοδό τους.
- **Athlete/Client** (mobile-first) — βλέπει το σημερινό του πρόγραμμα, καταγράφει προπονήσεις και βάρος στο κινητό του.

Οι δύο ρόλοι συνδέονται μέσω **invite code** που δίνει ο trainer στον αθλητή κατά το signup.

## Αρχιτεκτονική

**Stack:**
- **Next.js 16.2.6** (Turbopack, App Router) — προσοχή: υπάρχουν breaking changes σε σχέση με 15 (πχ `proxy.ts` αντί για `middleware.ts`, `cookies()` async)
- **React 19+ / TypeScript strict**
- **Tailwind CSS v4** με `@theme` block
- **Supabase** (Postgres + Auth + Storage) — free tier, region Frankfurt
- **Vercel** (Hobby, region Frankfurt) — auto-deploy on `git push` στο `main`

**Design:** Dark theme (`#050505` background, `#141414` surfaces) με neon accent `#C5FF00`. Fonts Inter + JetBrains Mono.

## Ροές που δουλεύουν

| Ρόλος | Δράση | Σελίδα |
|---|---|---|
| Client | Signup με invite code | `/signup` |
| Client | Δει σημερινή προπόνηση + streak + weekly stats | `/home` |
| Client | Κάνει προπόνηση, ολοκληρώνει, καταγράφεται | `/workout` |
| Client | Δει τα σημερινά γεύματα, τσεκάρει "έφαγα" | `/me/nutrition` |
| Client | Καταγράψει νέο βάρος | `/home` → tap weight card |
| Client | Δει progress: βάρος, streak, sessions, φωτογραφίες προόδου | `/progress` |
| Client | Ανεβάσει νέα φωτογραφία προόδου (μέσω camera στο κινητό) | `/progress` → "Νέα φωτογραφία προόδου" |
| Client | Στείλει/λάβει μηνύματα από τον προπονητή (realtime + notifications) | `/me/messages` ή BottomNav → Μηνύματα |
| Trainer | Δει dashboard με real activity, week chart, invite code | `/trainer` |
| Trainer | Δει λίστα πελατών με assigned program + latest weight + τελευταία φωτο | `/trainer/clients` |
| Trainer | Δει πλήρες προφίλ πελάτη (weight chart, όλες οι φωτο, sessions, chat) | `/trainer/clients/[id]` |
| Trainer | Δει inbox με όλες τις συζητήσεις + unread badges | `/trainer/messages` |
| Trainer | Δει agenda εβδομάδας: πελάτες × ημέρες με ✓ όπου προπονήθηκαν | `/trainer/calendar` |
| Trainer | Δει analytics: KPIs, 8-week trend, activity + weight leaderboards | `/trainer/reports` |
| Trainer | Δει τα προγράμματά του | `/trainer/programs` |
| Trainer | Φτιάξει και αναθέσει πρόγραμμα προπόνησης | `/workout-builder` |
| Trainer | Φτιάξει και αναθέσει διατροφικό πλάνο | `/nutrition` |
| Trainer | Αντιγράψει/μοιραστεί invite code | `/trainer` (top card ή "Νέος πελάτης" button) |

## Data model

8 πίνακες + 1 storage bucket, όλα με RLS enabled:

```
profiles           id ↔ auth.users, user_type (client|trainer), full_name, invite_code
trainer_clients    trainer_id, client_id (UNIQUE), assigned_program_id, assigned_nutrition_plan_id, status
programs           trainer_id, name, title, subtitle, estimated_duration_min, estimated_kcal
program_exercises  program_id, position, name, image_url, tags[], sets, reps, rest_seconds, notes
nutrition_plans    trainer_id, name, target_kcal, target_kcal_min/max
nutrition_meals    plan_id, position, icon, name, time, notes
nutrition_meal_foods meal_id, position, emoji, name, qty, protein_g, carbs_g, fat_g, kcal
workout_sessions   client_id, program_id, program_title/name snapshots, started_at, completed_at
workout_session_sets session_id, position, name, set_number, target/actual reps+weight, done_at
weigh_ins          client_id, weight_kg, notes, recorded_at
progress_photos    client_id, storage_path, weight_kg?, notes, taken_at  (+ storage bucket "progress-photos")
```

Migrations στο `supabase/migrations/` — τρέχονται χειροκίνητα στο Supabase SQL Editor.

## Auth flow

1. Signup: user επιλέγει role, βάζει στοιχεία, προαιρετικά invite code (αν client)
2. Trigger `handle_new_user` δημιουργεί το `profiles` row αυτόματα με το `user_type` από `raw_user_meta_data`
3. Trainers παίρνουν αυτόματα unique 8-char `invite_code`
4. Ο client που έδωσε invite code συνδέεται μέσω insert στο `trainer_clients`
5. Login → RPC lookup profile → redirect based on role (`/home` για client, `/trainer` για trainer)
6. Middleware (`proxy.ts` — Next 16 convention) ανανεώνει session σε κάθε request και redirect-άρει non-public paths στο `/login`
7. Trainer-only pages (`/nutrition`, `/workout-builder`, `/profile`) έχουν επιπλέον `layout.tsx` με `requireRole("trainer")`

Public paths: `/`, `/login`, `/signup`, `/trainer/onboarding`, `/auth/*`

## Πώς το τρέχεις τοπικά

**Προϋποθέσεις:** Node.js 22+, git, Supabase project με env vars.

```powershell
cd C:\athlon
npm install
# Δημιούργησε .env.local με NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Άνοιξε http://localhost:3000

## Πώς κάνεις deploy

Απλά:
```bash
git push
```

Το Vercel παίρνει το `main` branch και deploy-άρει αυτόματα σε ~90 δευτερόλεπτα.

## File map

```
app/
├── _components/     — reusable client components (AthlonLogo, BottomNav, PhoneFrame, LogoutButton, InviteClientButton, InviteCodeCard, WeightCard, PhotoUploader)
├── layout.tsx       — root layout
├── globals.css      — Tailwind v4 + design tokens
├── page.tsx         — dev index με links σε όλα τα routes
├── login/, signup/  — auth pages
├── home/            — client home (mobile-first)
├── workout/         — client workout page (server + WorkoutView client component)
├── me/nutrition/    — client meal view (server + NutritionView client component)
├── progress/        — client progress: stats + photo uploader + photo grid (signed URLs)
├── schedule/        — client placeholder page
├── trainer/
│   ├── page.tsx         — dashboard
│   ├── onboarding/      — studio setup (public)
│   ├── clients/         — client list
│   └── programs/        — programs list
├── nutrition/       — trainer meal editor (με layout guard)
├── workout-builder/ — trainer program editor (με layout guard)
└── profile/         — trainer viewing client (με layout guard)

lib/
├── profile.ts       — types + getProfile + homePathFor (client-safe)
├── require-role.ts  — server-only role gate
└── supabase/        — client.ts, server.ts, middleware.ts

supabase/migrations/  — 7 SQL migrations, όλα με RLS
proxy.ts             — Next 16 middleware convention
next.config.ts       — remotePatterns για external images
mockups/             — τα αρχικά 8 HTML mockups (reference μόνο)
```

## Design patterns

**Server + client split**: για σελίδες που χρειάζονται server fetch + client interactivity, split σε `page.tsx` (server) + `ViewName.tsx` (client). Παραδείγματα: `/me/nutrition`, `/workout`.

**Batched inserts**: για save flows με πολλά rows, pre-generate UUIDs client-side, insert parent (await), μετά parallel Promise.all για children + side-effects. Πέρασε το save time από ~2-3s σε ~0.5-1s.

**Controlled inputs**: ΠΑΝΤΑ `value` + `onChange`, ποτέ `defaultValue` σε editable forms. Έχουμε πληρώσει bug 2 φορές όπου το πεδίο άλλαζε οπτικά αλλά δεν σωζόταν.

**Role-based routing**: `homePathFor(role)` για post-auth redirect, `requireRole(role)` για page guards, inline check στα server components για cross-role redirect.

## Roadmap

- ✅ Phase 1: UI για όλα τα mockups
- ✅ Phase 2: Supabase auth
- ✅ Phase 3: Full data model (profiles, trainer_clients, programs, nutrition)
- ✅ Phase A: Workout sessions με real stats (streak, week count, activity feed)
- ✅ Phase B: Weight tracking + progress photos (client uploads, trainer sees latest per πελάτη)
- ✅ Phase Γ: 1-on-1 μηνύματα trainer↔client (realtime + polling backup + browser notifications + unread badges)
- ✅ Phase Δ: Ημερολόγιο — client month grid στο /schedule, trainer week view στο /trainer/calendar
- ✅ Phase Ε: Αναφορές /trainer/reports — 4 KPI, 8-week trend, adherence + weight change leaderboards

**Όλες οι φάσεις του initial roadmap ολοκληρώθηκαν.** Το app έχει full-cycle: signup → training → tracking → βάρος/φωτο → μηνύματα → ημερολόγιο → analytics.

## Χρήσιμα links

- **App:** https://athlon-psi.vercel.app
- **GitHub:** https://github.com/vvarsamis/athlon
- **Vercel dashboard:** https://vercel.com/dashboard
- **Supabase dashboard:** https://supabase.com/dashboard (project id: qorjuoadoykztomahkqm)
