-- 008_messages.sql
-- 1-on-1 μηνύματα μεταξύ trainer και πελάτη.
-- Ο καθένας βλέπει μόνο τα δικά του (sender ή recipient).
-- Insert επιτρέπεται μόνο αν υπάρχει trainer_clients σχέση.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) > 0 and length(body) <= 4000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint messages_sender_recipient_different check (sender_id <> recipient_id)
);

create index messages_thread_idx
  on public.messages (least(sender_id, recipient_id), greatest(sender_id, recipient_id), created_at desc);

create index messages_recipient_unread_idx
  on public.messages (recipient_id, read_at)
  where read_at is null;

alter table public.messages enable row level security;

-- SELECT: βλέπεις όσα έχεις στείλει ή σου έχουν σταλεί
create policy "Users see their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- INSERT: sender είναι ο ίδιος ο user, και υπάρχει σχέση trainer↔client
create policy "Users send to their paired counterparty"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.trainer_clients tc
      where (tc.trainer_id = auth.uid() and tc.client_id = messages.recipient_id)
         or (tc.client_id = auth.uid() and tc.trainer_id = messages.recipient_id)
    )
  );

-- UPDATE: μόνο ο recipient μπορεί να σημειώσει read_at (δεν επιτρέπουμε edit του body)
create policy "Recipients mark messages as read"
  on public.messages for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Enable realtime για push updates
alter publication supabase_realtime add table public.messages;
