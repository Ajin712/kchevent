create table if not exists quiz_entries (
  id uuid primary key default gen_random_uuid(),
  chosen_number text not null unique,
  score int not null check (score between 0 and 5),
  created_at timestamptz not null default now()
);

alter table quiz_entries enable row level security;

create policy "No public reads"
on quiz_entries
for select
using (false);

create policy "No public inserts"
on quiz_entries
for insert
with check (false);
