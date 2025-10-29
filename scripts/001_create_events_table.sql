-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  location text not null,
  event_date timestamptz not null,
  capacity integer not null check (capacity > 0),
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.events enable row level security;

-- Allow anyone to view events
create policy "events_select_all"
  on public.events for select
  using (true);

-- Allow anyone to create events (no auth required for this simple app)
create policy "events_insert_all"
  on public.events for insert
  with check (true);

-- Allow anyone to update events
create policy "events_update_all"
  on public.events for update
  using (true);

-- Allow anyone to delete events
create policy "events_delete_all"
  on public.events for delete
  using (true);
