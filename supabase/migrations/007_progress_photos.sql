-- Athlon: Phase B step 2
-- progress_photos + Supabase Storage bucket + storage RLS

-- 1. Πίνακας μεταδεδομένων φωτογραφιών
create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,          -- πχ "user-id/photo-uuid.jpg"
  weight_kg numeric(5,2),               -- προαιρετικό snapshot βάρους την ώρα της φωτο
  notes text,
  taken_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index progress_photos_client_idx
  on public.progress_photos (client_id, taken_at desc);

alter table public.progress_photos enable row level security;

create policy "Clients manage their progress photos"
  on public.progress_photos for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create policy "Trainers see their clients' progress photos"
  on public.progress_photos for select
  using (
    exists (
      select 1 from public.trainer_clients tc
      where tc.client_id = public.progress_photos.client_id
        and tc.trainer_id = auth.uid()
    )
  );

-- 2. Storage bucket (private — αρχεία προσβάσιμα μόνο με signed URLs)
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- 3. Storage policies — path convention: {client_id}/{filename}
create policy "Clients upload their own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Clients read their own photos"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Clients delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Trainers read their clients' photos"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and exists (
      select 1 from public.trainer_clients tc
      where tc.client_id::text = (storage.foldername(name))[1]
        and tc.trainer_id = auth.uid()
    )
  );
