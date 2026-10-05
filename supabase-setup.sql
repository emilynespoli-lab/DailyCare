-- Rode este script uma vez no Supabase (SQL Editor).
create table if not exists care_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table care_data enable row level security;

create policy "ler o proprio registro" on care_data
  for select using (auth.uid() = user_id);

create policy "criar o proprio registro" on care_data
  for insert with check (auth.uid() = user_id);

create policy "atualizar o proprio registro" on care_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
