-- Create RSVPs table
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  attendee_name text not null,
  attendee_email text not null,
  created_at timestamptz default now(),
  unique(event_id, attendee_email)
);

-- Enable RLS
alter table public.rsvps enable row level security;

-- Allow anyone to view RSVPs
create policy "rsvps_select_all"
  on public.rsvps for select
  using (true);

-- Allow anyone to create RSVPs
create policy "rsvps_insert_all"
  on public.rsvps for insert
  with check (true);

-- Allow anyone to delete their own RSVPs
create policy "rsvps_delete_all"
  on public.rsvps for delete
  using (true);

-- Create index for faster queries
create index if not exists rsvps_event_id_idx on public.rsvps(event_id);
