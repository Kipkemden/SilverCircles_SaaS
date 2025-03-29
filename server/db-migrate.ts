import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

async function runMigrations() {
  console.log("Running database migrations...");
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase credentials');
  }

  // Extract the connection string from the Supabase URL
  const projectRef = process.env.SUPABASE_URL.match(/https:\/\/(.*?)\.supabase\.co/)?.[1];
  const dbUrl = `postgresql://postgres:${process.env.SUPABASE_SERVICE_KEY}@db.${projectRef}.supabase.co:5432/postgres`;
  
  const client = postgres(dbUrl);
  const db = drizzle(client, { schema });

  try {
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS verification_token TEXT,
      ADD COLUMN IF NOT EXISTS verification_token_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
      ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE
    `);
    
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await client.end();
  }
}

runMigrations().catch(console.error);