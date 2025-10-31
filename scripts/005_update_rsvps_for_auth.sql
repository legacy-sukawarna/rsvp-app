-- Update RSVPs table to support authenticated users (backward compatible)
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add partial unique constraint (only for authenticated users)
-- This allows existing anonymous RSVPs to remain
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_event_rsvp 
ON rsvps (user_id, event_id) 
WHERE user_id IS NOT NULL;

-- Ensure events table has created_by column
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);