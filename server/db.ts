import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
import { supabase } from './supabase';

// Connect directly to the Supabase PostgreSQL database
if (!process.env.SUPABASE_URL) {
  throw new Error('Missing Supabase URL');
}

// Extract the connection string from the Supabase URL
// Format: https://[project].supabase.co -> postgres://postgres:[service_key]@db.[project].supabase.co:5432/postgres
const projectRef = process.env.SUPABASE_URL.match(/https:\/\/(.*?)\.supabase\.co/)?.[1];
if (!projectRef) {
  throw new Error('Invalid Supabase URL format');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase service key');
}

const dbUrl = `postgresql://postgres:${process.env.SUPABASE_SERVICE_KEY}@db.${projectRef}.supabase.co:5432/postgres`;

const client = postgres(dbUrl);
export const db = drizzle(client, { schema });
