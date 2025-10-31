-- Add created_by column to events table
ALTER TABLE events ADD COLUMN created_by UUID REFERENCES auth.users(id);