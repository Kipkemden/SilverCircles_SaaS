import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
import { supabase } from './supabase';

// For server-side we'll use pooled connections to improve performance
// We'll use the connection provided by the environment variable DATABASE_URL which is set by Replit
if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });
