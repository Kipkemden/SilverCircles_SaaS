import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Use the local PostgreSQL database (for development)
// When using with Supabase in production, the code would use the Supabase PostgreSQL connection
if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });
