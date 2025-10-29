-- Remove email requirement and unique constraint
alter table public.rsvps drop constraint if exists rsvps_event_id_attendee_email_key;
alter table public.rsvps alter column attendee_email drop not null;

-- Add new unique constraint on event_id and attendee_name
alter table public.rsvps add constraint rsvps_event_id_name_unique unique(event_id, attendee_name);
