-- Add property scraped data columns to user_sites table
-- Run this in Supabase SQL Editor

-- 1. Property Source Info
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_source_url TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_source_type TEXT; -- 'room' or 'host' or 'manual'
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_id_from_airbnb TEXT;

-- 2. Property Details (from scrape or manual)
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_title TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_location TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_price NUMERIC;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_guests INTEGER;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_bedrooms INTEGER;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_beds INTEGER;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_baths INTEGER;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_reviews INTEGER;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_rating DECIMAL(2,1);
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_description TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_amenities TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_host TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_checkin TEXT;

-- 3. Images
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_hero_image TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS property_gallery JSONB; -- Array of image URLs

-- 4. Branding (user customization after scrape)
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS site_brand_name TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS site_brand_color TEXT DEFAULT '#C47756';
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS site_custom_domain TEXT;

-- 5. P9 Onboarding Progress
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS onboarding_design_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS onboarding_banking_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS onboarding_plan_selected TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS onboarding_extras JSONB;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS onboarding_published BOOLEAN DEFAULT FALSE;

-- 6. Stripe Info
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT;
ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS payout_method TEXT; -- 'bank', 'venmo', 'paypal'

-- Update existing columns to include new ones
SELECT 'Columns added successfully' as result;

-- Verify columns were added (run separately)
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'user_sites';