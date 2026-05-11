-- Add property_id to user_sites table
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id);