-- 009_exercises.sql
-- Πίνακας ασκήσεων: public (owner_id null) + custom per trainer.
-- Seed με ~80 δημοφιλείς ασκήσεις, ελληνικά ονόματα, εικόνες από free-exercise-db.

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,                        -- Ελληνικό όνομα (ή αγγλικό αν δεν μεταφράστηκε)
  name_en text,                              -- Original English (για fallback search)
  primary_muscle text,                       -- chest, back, shoulders, biceps, triceps, legs, core, cardio
  muscle_groups text[] not null default '{}',
  equipment text,                            -- barbell, dumbbell, bodyweight, machine, cable, kettlebell
  level text,                                -- beginner, intermediate, advanced
  category text,                             -- strength, cardio, plyometrics, stretching
  tags text[] not null default '{}',         -- Ελληνικά chips: Στήθος, Compound, Isolation, κλπ.
  instructions text[],
  image_start_url text,                      -- 0.jpg
  image_end_url text,                        -- 1.jpg
  owner_id uuid references public.profiles(id) on delete cascade,  -- null = public library
  created_at timestamptz not null default now()
);

create index exercises_owner_idx on public.exercises (owner_id);
create index exercises_primary_muscle_idx on public.exercises (primary_muscle);
create index exercises_tags_gin on public.exercises using gin (tags);
create index exercises_muscle_groups_gin on public.exercises using gin (muscle_groups);

alter table public.exercises enable row level security;

create policy "Anyone reads public exercises"
  on public.exercises for select
  using (owner_id is null);

create policy "Owner reads their custom"
  on public.exercises for select
  using (auth.uid() = owner_id);

create policy "Owner creates their custom"
  on public.exercises for insert
  with check (auth.uid() = owner_id);

create policy "Owner updates their custom"
  on public.exercises for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owner deletes their custom"
  on public.exercises for delete
  using (auth.uid() = owner_id);

-- ============================================================
-- SEED: 80 δημοφιλείς ασκήσεις
-- Οι εικόνες προέρχονται από:
-- https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{FOLDER}/{0|1}.jpg
-- ============================================================

do $$
declare
  ex_db text := 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
begin

-- ΣΤΗΘΟΣ (10)
insert into public.exercises (slug, name, name_en, primary_muscle, muscle_groups, equipment, level, category, tags, image_start_url, image_end_url) values
  ('bench-press-barbell', 'Πιέσεις πάγκου με μπάρα', 'Barbell Bench Press', 'chest', ARRAY['Στήθος','Τρικέφαλα'], 'barbell', 'intermediate', 'strength', ARRAY['Στήθος','Τρικ.','Compound'], ex_db||'Barbell_Bench_Press_-_Medium_Grip/0.jpg', ex_db||'Barbell_Bench_Press_-_Medium_Grip/1.jpg'),
  ('bench-press-dumbbell', 'Πιέσεις πάγκου με αλτήρες', 'Dumbbell Bench Press', 'chest', ARRAY['Στήθος','Τρικέφαλα'], 'dumbbell', 'beginner', 'strength', ARRAY['Στήθος','Τρικ.'], ex_db||'Dumbbell_Bench_Press/0.jpg', ex_db||'Dumbbell_Bench_Press/1.jpg'),
  ('incline-bench-barbell', 'Πιέσεις σε επικλινή πάγκο με μπάρα', 'Barbell Incline Bench Press', 'chest', ARRAY['Στήθος','Ώμοι'], 'barbell', 'intermediate', 'strength', ARRAY['Στήθος','Ώμοι','Compound'], ex_db||'Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg', ex_db||'Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg'),
  ('incline-bench-dumbbell', 'Πιέσεις σε επικλινή με αλτήρες', 'Incline Dumbbell Press', 'chest', ARRAY['Στήθος','Ώμοι'], 'dumbbell', 'beginner', 'strength', ARRAY['Στήθος','Ώμοι','Compound'], ex_db||'Incline_Dumbbell_Press/0.jpg', ex_db||'Incline_Dumbbell_Press/1.jpg'),
  ('decline-bench-dumbbell', 'Πιέσεις σε καθοδικό με αλτήρες', 'Decline Dumbbell Press', 'chest', ARRAY['Στήθος'], 'dumbbell', 'intermediate', 'strength', ARRAY['Στήθος','Compound'], ex_db||'Decline_Dumbbell_Bench_Press/0.jpg', ex_db||'Decline_Dumbbell_Bench_Press/1.jpg'),
  ('dumbbell-flyes', 'Πτερύγια με αλτήρες', 'Dumbbell Flyes', 'chest', ARRAY['Στήθος'], 'dumbbell', 'beginner', 'strength', ARRAY['Στήθος','Isolation'], ex_db||'Dumbbell_Flyes/0.jpg', ex_db||'Dumbbell_Flyes/1.jpg'),
  ('incline-flyes', 'Πτερύγια σε επικλινή πάγκο', 'Incline Dumbbell Flyes', 'chest', ARRAY['Στήθος','Ώμοι'], 'dumbbell', 'beginner', 'strength', ARRAY['Στήθος','Isolation'], ex_db||'Incline_Dumbbell_Flyes/0.jpg', ex_db||'Incline_Dumbbell_Flyes/1.jpg'),
  ('cable-crossover', 'Cable Crossover', 'Cable Crossover', 'chest', ARRAY['Στήθος'], 'cable', 'intermediate', 'strength', ARRAY['Στήθος','Isolation'], ex_db||'Cable_Crossover/0.jpg', ex_db||'Cable_Crossover/1.jpg'),
  ('pushup', 'Push-ups (κάμψεις)', 'Push-ups', 'chest', ARRAY['Στήθος','Τρικέφαλα'], 'bodyweight', 'beginner', 'strength', ARRAY['Στήθος','Τρικ.','Σωματικού βάρους'], ex_db||'Pushups/0.jpg', ex_db||'Pushups/1.jpg'),
  ('chest-dip', 'Dips στήθους', 'Chest Dips', 'chest', ARRAY['Στήθος','Τρικέφαλα'], 'bodyweight', 'intermediate', 'strength', ARRAY['Στήθος','Τρικ.','Σωματικού βάρους'], ex_db||'Dips_-_Chest_Version/0.jpg', ex_db||'Dips_-_Chest_Version/1.jpg');

-- ΠΛΑΤΗ (10)
insert into public.exercises (slug, name, name_en, primary_muscle, muscle_groups, equipment, level, category, tags, image_start_url, image_end_url) values
  ('deadlift', 'Άρσεις θανάτου', 'Deadlift', 'back', ARRAY['Πλάτη','Πόδια','Κορμός'], 'barbell', 'advanced', 'strength', ARRAY['Πλάτη','Πόδια','Compound'], ex_db||'Barbell_Deadlift/0.jpg', ex_db||'Barbell_Deadlift/1.jpg'),
  ('barbell-row', 'Κωπηλατική με μπάρα', 'Bent Over Barbell Row', 'back', ARRAY['Πλάτη','Δικέφαλα'], 'barbell', 'intermediate', 'strength', ARRAY['Πλάτη','Δικ.','Compound'], ex_db||'Bent_Over_Barbell_Row/0.jpg', ex_db||'Bent_Over_Barbell_Row/1.jpg'),
  ('dumbbell-row', 'Κωπηλατική με αλτήρα', 'One Arm Dumbbell Row', 'back', ARRAY['Πλάτη','Δικέφαλα'], 'dumbbell', 'beginner', 'strength', ARRAY['Πλάτη','Δικ.'], ex_db||'One-Arm_Dumbbell_Row/0.jpg', ex_db||'One-Arm_Dumbbell_Row/1.jpg'),
  ('t-bar-row', 'T-Bar Row', 'T-Bar Row', 'back', ARRAY['Πλάτη','Δικέφαλα'], 'barbell', 'intermediate', 'strength', ARRAY['Πλάτη','Compound'], ex_db||'T-Bar_Row_with_Handle/0.jpg', ex_db||'T-Bar_Row_with_Handle/1.jpg'),
  ('pullup', 'Έλξεις (Pull-ups)', 'Pull-ups', 'back', ARRAY['Πλάτη','Δικέφαλα'], 'bodyweight', 'advanced', 'strength', ARRAY['Πλάτη','Δικ.','Σωματικού βάρους'], ex_db||'Pullups/0.jpg', ex_db||'Pullups/1.jpg'),
  ('chinup', 'Έλξεις υπτίες (Chin-ups)', 'Chin-ups', 'back', ARRAY['Πλάτη','Δικέφαλα'], 'bodyweight', 'intermediate', 'strength', ARRAY['Πλάτη','Δικ.','Σωματικού βάρους'], ex_db||'Chin-Up/0.jpg', ex_db||'Chin-Up/1.jpg'),
  ('lat-pulldown', 'Έλξεις τροχαλίας πλάτης', 'Wide-Grip Lat Pulldown', 'back', ARRAY['Πλάτη','Δικέφαλα'], 'cable', 'beginner', 'strength', ARRAY['Πλάτη','Δικ.'], ex_db||'Wide-Grip_Lat_Pulldown/0.jpg', ex_db||'Wide-Grip_Lat_Pulldown/1.jpg'),
  ('seated-cable-row', 'Κωπηλατική τροχαλίας καθιστός', 'Seated Cable Row', 'back', ARRAY['Πλάτη','Δικέφαλα'], 'cable', 'beginner', 'strength', ARRAY['Πλάτη'], ex_db||'Seated_Cable_Rows/0.jpg', ex_db||'Seated_Cable_Rows/1.jpg'),
  ('face-pull', 'Face Pull', 'Face Pull', 'back', ARRAY['Ώμοι','Πλάτη'], 'cable', 'beginner', 'strength', ARRAY['Ώμοι','Πλάτη','Isolation'], ex_db||'Face_Pull/0.jpg', ex_db||'Face_Pull/1.jpg'),
  ('romanian-deadlift', 'Ρουμάνικες άρσεις', 'Romanian Deadlift', 'back', ARRAY['Πλάτη','Πόδια'], 'barbell', 'intermediate', 'strength', ARRAY['Πλάτη','Πόδια','Compound'], ex_db||'Romanian_Deadlift/0.jpg', ex_db||'Romanian_Deadlift/1.jpg');

-- ΩΜΟΙ (8)
insert into public.exercises (slug, name, name_en, primary_muscle, muscle_groups, equipment, level, category, tags, image_start_url, image_end_url) values
  ('overhead-press-barbell', 'Πιέσεις ώμων με μπάρα', 'Standing Military Press', 'shoulders', ARRAY['Ώμοι','Τρικέφαλα'], 'barbell', 'intermediate', 'strength', ARRAY['Ώμοι','Τρικ.','Compound'], ex_db||'Standing_Military_Press/0.jpg', ex_db||'Standing_Military_Press/1.jpg'),
  ('shoulder-press-dumbbell', 'Πιέσεις ώμων με αλτήρες', 'Seated Dumbbell Press', 'shoulders', ARRAY['Ώμοι','Τρικέφαλα'], 'dumbbell', 'beginner', 'strength', ARRAY['Ώμοι','Τρικ.','Compound'], ex_db||'Dumbbell_Shoulder_Press/0.jpg', ex_db||'Dumbbell_Shoulder_Press/1.jpg'),
  ('arnold-press', 'Arnold Press', 'Arnold Dumbbell Press', 'shoulders', ARRAY['Ώμοι','Τρικέφαλα'], 'dumbbell', 'intermediate', 'strength', ARRAY['Ώμοι','Compound'], ex_db||'Arnold_Dumbbell_Press/0.jpg', ex_db||'Arnold_Dumbbell_Press/1.jpg'),
  ('side-lateral-raise', 'Πλάγιες εκτάσεις με αλτήρες', 'Side Lateral Raise', 'shoulders', ARRAY['Ώμοι'], 'dumbbell', 'beginner', 'strength', ARRAY['Ώμοι','Isolation'], ex_db||'Side_Lateral_Raise/0.jpg', ex_db||'Side_Lateral_Raise/1.jpg'),
  ('front-raise', 'Μπροστινές εκτάσεις με αλτήρες', 'Front Dumbbell Raise', 'shoulders', ARRAY['Ώμοι'], 'dumbbell', 'beginner', 'strength', ARRAY['Ώμοι','Isolation'], ex_db||'Front_Dumbbell_Raise/0.jpg', ex_db||'Front_Dumbbell_Raise/1.jpg'),
  ('rear-delt-fly', 'Οπίσθια δελτοειδή με αλτήρες', 'Reverse Flyes', 'shoulders', ARRAY['Ώμοι','Πλάτη'], 'dumbbell', 'beginner', 'strength', ARRAY['Ώμοι','Isolation'], ex_db||'Reverse_Flyes/0.jpg', ex_db||'Reverse_Flyes/1.jpg'),
  ('upright-row', 'Ρωμαϊκή έλξη με μπάρα', 'Upright Barbell Row', 'shoulders', ARRAY['Ώμοι','Τραπεζοειδείς'], 'barbell', 'intermediate', 'strength', ARRAY['Ώμοι','Compound'], ex_db||'Upright_Barbell_Row/0.jpg', ex_db||'Upright_Barbell_Row/1.jpg'),
  ('shrug-barbell', 'Shrugs τραπεζοειδών', 'Barbell Shrug', 'shoulders', ARRAY['Τραπεζοειδείς'], 'barbell', 'beginner', 'strength', ARRAY['Τραπεζοειδείς','Isolation'], ex_db||'Barbell_Shrug/0.jpg', ex_db||'Barbell_Shrug/1.jpg');

-- ΔΙΚΕΦΑΛΑ (6)
insert into public.exercises (slug, name, name_en, primary_muscle, muscle_groups, equipment, level, category, tags, image_start_url, image_end_url) values
  ('barbell-curl', 'Δικέφαλα με μπάρα', 'Barbell Curl', 'biceps', ARRAY['Δικέφαλα'], 'barbell', 'beginner', 'strength', ARRAY['Δικ.','Isolation'], ex_db||'Barbell_Curl/0.jpg', ex_db||'Barbell_Curl/1.jpg'),
  ('dumbbell-curl', 'Δικέφαλα με αλτήρες εναλλάξ', 'Dumbbell Alternate Bicep Curl', 'biceps', ARRAY['Δικέφαλα'], 'dumbbell', 'beginner', 'strength', ARRAY['Δικ.','Isolation'], ex_db||'Dumbbell_Alternate_Bicep_Curl/0.jpg', ex_db||'Dumbbell_Alternate_Bicep_Curl/1.jpg'),
  ('hammer-curl', 'Hammer Curls', 'Hammer Curls', 'biceps', ARRAY['Δικέφαλα','Βραχιόνιοι'], 'dumbbell', 'beginner', 'strength', ARRAY['Δικ.','Isolation'], ex_db||'Hammer_Curls/0.jpg', ex_db||'Hammer_Curls/1.jpg'),
  ('preacher-curl', 'Preacher Curl', 'Preacher Curl', 'biceps', ARRAY['Δικέφαλα'], 'barbell', 'intermediate', 'strength', ARRAY['Δικ.','Isolation'], ex_db||'Preacher_Curl/0.jpg', ex_db||'Preacher_Curl/1.jpg'),
  ('concentration-curl', 'Concentration Curl', 'Concentration Curls', 'biceps', ARRAY['Δικέφαλα'], 'dumbbell', 'beginner', 'strength', ARRAY['Δικ.','Isolation'], ex_db||'Concentration_Curls/0.jpg', ex_db||'Concentration_Curls/1.jpg'),
  ('cable-curl', 'Δικέφαλα τροχαλίας', 'Cable Curl', 'biceps', ARRAY['Δικέφαλα'], 'cable', 'beginner', 'strength', ARRAY['Δικ.','Isolation'], ex_db||'Standing_Biceps_Cable_Curl/0.jpg', ex_db||'Standing_Biceps_Cable_Curl/1.jpg');

-- ΤΡΙΚΕΦΑΛΑ (6)
insert into public.exercises (slug, name, name_en, primary_muscle, muscle_groups, equipment, level, category, tags, image_start_url, image_end_url) values
  ('triceps-pushdown', 'Τρικέφαλα στο σχοινί', 'Triceps Pushdown', 'triceps', ARRAY['Τρικέφαλα'], 'cable', 'beginner', 'strength', ARRAY['Τρικ.','Isolation'], ex_db||'Triceps_Pushdown/0.jpg', ex_db||'Triceps_Pushdown/1.jpg'),
  ('skull-crusher', 'Skull Crushers', 'Lying Triceps Press', 'triceps', ARRAY['Τρικέφαλα'], 'barbell', 'intermediate', 'strength', ARRAY['Τρικ.','Isolation'], ex_db||'Lying_Triceps_Press/0.jpg', ex_db||'Lying_Triceps_Press/1.jpg'),
  ('close-grip-bench', 'Πιέσεις με στενή λαβή', 'Close-Grip Barbell Bench Press', 'triceps', ARRAY['Τρικέφαλα','Στήθος'], 'barbell', 'intermediate', 'strength', ARRAY['Τρικ.','Στήθος','Compound'], ex_db||'Close-Grip_Barbell_Bench_Press/0.jpg', ex_db||'Close-Grip_Barbell_Bench_Press/1.jpg'),
  ('triceps-dip', 'Dips τρικεφάλων', 'Triceps Dip', 'triceps', ARRAY['Τρικέφαλα','Στήθος'], 'bodyweight', 'intermediate', 'strength', ARRAY['Τρικ.','Σωματικού βάρους'], ex_db||'Dips_-_Triceps_Version/0.jpg', ex_db||'Dips_-_Triceps_Version/1.jpg'),
  ('overhead-triceps', 'Τρικέφαλα υπερώα με αλτήρα', 'Standing Dumbbell Triceps Extension', 'triceps', ARRAY['Τρικέφαλα'], 'dumbbell', 'beginner', 'strength', ARRAY['Τρικ.','Isolation'], ex_db||'Standing_Dumbbell_Triceps_Extension/0.jpg', ex_db||'Standing_Dumbbell_Triceps_Extension/1.jpg'),
  ('rope-pushdown', 'Τρικέφαλα σχοινί υπερώα', 'Cable Rope Overhead Triceps Extension', 'triceps', ARRAY['Τρικέφαλα'], 'cable', 'beginner', 'strength', ARRAY['Τρικ.','Isolation'], ex_db||'Cable_Rope_Overhead_Triceps_Extension/0.jpg', ex_db||'Cable_Rope_Overhead_Triceps_Extension/1.jpg');

-- ΠΟΔΙΑ (12)
insert into public.exercises (slug, name, name_en, primary_muscle, muscle_groups, equipment, level, category, tags, image_start_url, image_end_url) values
  ('squat-barbell', 'Κάθισμα με μπάρα (Squat)', 'Barbell Squat', 'legs', ARRAY['Τετρακέφαλα','Γλουτοί','Κορμός'], 'barbell', 'intermediate', 'strength', ARRAY['Πόδια','Γλουτοί','Compound'], ex_db||'Barbell_Squat/0.jpg', ex_db||'Barbell_Squat/1.jpg'),
  ('front-squat', 'Front Squat', 'Front Squat (Clean Grip)', 'legs', ARRAY['Τετρακέφαλα','Κορμός'], 'barbell', 'advanced', 'strength', ARRAY['Πόδια','Compound'], ex_db||'Front_Squat_Clean_Grip/0.jpg', ex_db||'Front_Squat_Clean_Grip/1.jpg'),
  ('goblet-squat', 'Goblet Squat', 'Goblet Squat', 'legs', ARRAY['Τετρακέφαλα','Γλουτοί'], 'dumbbell', 'beginner', 'strength', ARRAY['Πόδια','Compound'], ex_db||'Goblet_Squat/0.jpg', ex_db||'Goblet_Squat/1.jpg'),
  ('leg-press', 'Leg Press', 'Leg Press', 'legs', ARRAY['Τετρακέφαλα','Γλουτοί'], 'machine', 'beginner', 'strength', ARRAY['Πόδια','Compound'], ex_db||'Leg_Press/0.jpg', ex_db||'Leg_Press/1.jpg'),
  ('bulgarian-split-squat', 'Bulgarian Split Squat', 'Split Squat with Dumbbells', 'legs', ARRAY['Τετρακέφαλα','Γλουτοί'], 'dumbbell', 'intermediate', 'strength', ARRAY['Πόδια','Γλουτοί'], ex_db||'Split_Squat_with_Dumbbells/0.jpg', ex_db||'Split_Squat_with_Dumbbells/1.jpg'),
  ('lunge-dumbbell', 'Lunges με αλτήρες', 'Dumbbell Lunges', 'legs', ARRAY['Τετρακέφαλα','Γλουτοί'], 'dumbbell', 'beginner', 'strength', ARRAY['Πόδια','Γλουτοί'], ex_db||'Dumbbell_Lunges/0.jpg', ex_db||'Dumbbell_Lunges/1.jpg'),
  ('walking-lunge', 'Walking Lunges', 'Walking Lunges', 'legs', ARRAY['Τετρακέφαλα','Γλουτοί'], 'bodyweight', 'beginner', 'strength', ARRAY['Πόδια','Γλουτοί'], ex_db||'Bodyweight_Walking_Lunge/0.jpg', ex_db||'Bodyweight_Walking_Lunge/1.jpg'),
  ('leg-curl', 'Leg Curl (δικέφαλα μηρών)', 'Lying Leg Curls', 'legs', ARRAY['Δικέφαλα μηρού'], 'machine', 'beginner', 'strength', ARRAY['Πόδια','Isolation'], ex_db||'Lying_Leg_Curls/0.jpg', ex_db||'Lying_Leg_Curls/1.jpg'),
  ('leg-extension', 'Leg Extension (τετρακέφαλα)', 'Leg Extensions', 'legs', ARRAY['Τετρακέφαλα'], 'machine', 'beginner', 'strength', ARRAY['Πόδια','Isolation'], ex_db||'Leg_Extensions/0.jpg', ex_db||'Leg_Extensions/1.jpg'),
  ('calf-raise-standing', 'Standing Calf Raise', 'Standing Calf Raise', 'legs', ARRAY['Γάμπες'], 'barbell', 'beginner', 'strength', ARRAY['Γάμπες','Isolation'], ex_db||'Standing_Barbell_Calf_Raise/0.jpg', ex_db||'Standing_Barbell_Calf_Raise/1.jpg'),
  ('calf-raise-seated', 'Seated Calf Raise', 'Seated Calf Raise', 'legs', ARRAY['Γάμπες'], 'machine', 'beginner', 'strength', ARRAY['Γάμπες','Isolation'], ex_db||'Seated_Calf_Raise/0.jpg', ex_db||'Seated_Calf_Raise/1.jpg'),
  ('hip-thrust', 'Hip Thrust', 'Barbell Hip Thrust', 'legs', ARRAY['Γλουτοί','Δικέφαλα μηρού'], 'barbell', 'intermediate', 'strength', ARRAY['Γλουτοί','Compound'], ex_db||'Barbell_Hip_Thrust/0.jpg', ex_db||'Barbell_Hip_Thrust/1.jpg');

-- ΚΟΡΜΟΣ (10)
insert into public.exercises (slug, name, name_en, primary_muscle, muscle_groups, equipment, level, category, tags, image_start_url, image_end_url) values
  ('plank', 'Plank (σανίδα)', 'Plank', 'core', ARRAY['Κοιλιακοί','Κορμός'], 'bodyweight', 'beginner', 'strength', ARRAY['Κορμός','Isolation','Σωματικού βάρους'], ex_db||'Plank/0.jpg', ex_db||'Plank/1.jpg'),
  ('side-plank', 'Πλάγια σανίδα (Side Plank)', 'Side Bridge', 'core', ARRAY['Κοιλιακοί','Κορμός'], 'bodyweight', 'beginner', 'strength', ARRAY['Κορμός','Isolation','Σωματικού βάρους'], ex_db||'Side_Bridge/0.jpg', ex_db||'Side_Bridge/1.jpg'),
  ('crunches', 'Crunches', 'Crunches', 'core', ARRAY['Κοιλιακοί'], 'bodyweight', 'beginner', 'strength', ARRAY['Κορμός','Isolation','Σωματικού βάρους'], ex_db||'Crunches/0.jpg', ex_db||'Crunches/1.jpg'),
  ('bicycle-crunch', 'Bicycle Crunch', 'Air Bike', 'core', ARRAY['Κοιλιακοί','Πλάγιοι'], 'bodyweight', 'beginner', 'strength', ARRAY['Κορμός','Σωματικού βάρους'], ex_db||'Air_Bike/0.jpg', ex_db||'Air_Bike/1.jpg'),
  ('hanging-leg-raise', 'Hanging Leg Raise', 'Hanging Leg Raise', 'core', ARRAY['Κοιλιακοί','Ισχυοκάμπτες'], 'bodyweight', 'intermediate', 'strength', ARRAY['Κορμός','Isolation'], ex_db||'Hanging_Leg_Raise/0.jpg', ex_db||'Hanging_Leg_Raise/1.jpg'),
  ('russian-twist', 'Russian Twist', 'Russian Twist', 'core', ARRAY['Κοιλιακοί','Πλάγιοι'], 'bodyweight', 'beginner', 'strength', ARRAY['Κορμός','Πλάγιοι'], ex_db||'Russian_Twist/0.jpg', ex_db||'Russian_Twist/1.jpg'),
  ('ab-wheel', 'Ab Wheel Rollout', 'Ab Roller', 'core', ARRAY['Κοιλιακοί','Κορμός'], 'other', 'advanced', 'strength', ARRAY['Κορμός','Isolation'], ex_db||'Ab_Roller/0.jpg', ex_db||'Ab_Roller/1.jpg'),
  ('cable-crunch', 'Cable Crunch', 'Cable Crunch', 'core', ARRAY['Κοιλιακοί'], 'cable', 'intermediate', 'strength', ARRAY['Κορμός','Isolation'], ex_db||'Cable_Crunch/0.jpg', ex_db||'Cable_Crunch/1.jpg'),
  ('flutter-kicks', 'Flutter Kicks', 'Flutter Kicks', 'core', ARRAY['Κοιλιακοί','Ισχυοκάμπτες'], 'bodyweight', 'beginner', 'strength', ARRAY['Κορμός','Σωματικού βάρους'], ex_db||'Flutter_Kicks/0.jpg', ex_db||'Flutter_Kicks/1.jpg'),
  ('mountain-climbers', 'Mountain Climbers', 'Mountain Climbers', 'core', ARRAY['Κοιλιακοί','Κορμός'], 'bodyweight', 'beginner', 'plyometrics', ARRAY['Κορμός','Cardio','Σωματικού βάρους'], ex_db||'Mountain_Climbers/0.jpg', ex_db||'Mountain_Climbers/1.jpg');

-- CARDIO / FUNCTIONAL (5)
insert into public.exercises (slug, name, name_en, primary_muscle, muscle_groups, equipment, level, category, tags, image_start_url, image_end_url) values
  ('burpee', 'Burpees', 'Burpee', 'cardio', ARRAY['Ολόσωμο'], 'bodyweight', 'intermediate', 'plyometrics', ARRAY['Cardio','Ολόσωμο','Finisher'], null, null),
  ('kettlebell-swing', 'Kettlebell Swing', 'One-Arm Kettlebell Swings', 'cardio', ARRAY['Γλουτοί','Πλάτη','Κορμός'], 'kettlebell', 'intermediate', 'strength', ARRAY['Cardio','Compound','Γλουτοί'], ex_db||'One-Arm_Kettlebell_Swings/0.jpg', ex_db||'One-Arm_Kettlebell_Swings/1.jpg'),
  ('box-jump', 'Box Jump', 'Box Jump', 'cardio', ARRAY['Τετρακέφαλα','Γλουτοί'], 'other', 'intermediate', 'plyometrics', ARRAY['Cardio','Πόδια','Plyometric'], ex_db||'Box_Jump_Multiple_Response/0.jpg', ex_db||'Box_Jump_Multiple_Response/1.jpg'),
  ('jumping-jack', 'Jumping Jacks', 'Star Jump', 'cardio', ARRAY['Ολόσωμο'], 'bodyweight', 'beginner', 'plyometrics', ARRAY['Cardio','Warmup'], ex_db||'Star_Jump/0.jpg', ex_db||'Star_Jump/1.jpg'),
  ('battle-rope', 'Battle Ropes', 'Battle Ropes', 'cardio', ARRAY['Ώμοι','Κορμός'], 'other', 'intermediate', 'plyometrics', ARRAY['Cardio','Ώμοι','Finisher'], ex_db||'Battling_Ropes/0.jpg', ex_db||'Battling_Ropes/1.jpg');

-- ΕΠΙΠΛΕΟΝ / STRETCHING (3)
insert into public.exercises (slug, name, name_en, primary_muscle, muscle_groups, equipment, level, category, tags, image_start_url, image_end_url) values
  ('good-morning', 'Good Morning', 'Good Morning', 'back', ARRAY['Πλάτη','Δικέφαλα μηρού'], 'barbell', 'intermediate', 'strength', ARRAY['Πλάτη','Πόδια'], ex_db||'Good_Morning/0.jpg', ex_db||'Good_Morning/1.jpg'),
  ('glute-bridge', 'Glute Bridge', 'Butt Lift (Bridge)', 'legs', ARRAY['Γλουτοί'], 'bodyweight', 'beginner', 'strength', ARRAY['Γλουτοί','Σωματικού βάρους'], ex_db||'Butt_Lift_Bridge/0.jpg', ex_db||'Butt_Lift_Bridge/1.jpg'),
  ('sumo-deadlift', 'Sumo Deadlift', 'Sumo Deadlift', 'back', ARRAY['Πλάτη','Πόδια','Γλουτοί'], 'barbell', 'advanced', 'strength', ARRAY['Πλάτη','Γλουτοί','Compound'], ex_db||'Sumo_Deadlift/0.jpg', ex_db||'Sumo_Deadlift/1.jpg');

end $$;
