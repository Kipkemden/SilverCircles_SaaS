-- Add supabase_id column to users table
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS supabase_id TEXT UNIQUE;