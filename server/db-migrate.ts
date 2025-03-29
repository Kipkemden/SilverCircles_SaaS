import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema';

const { Pool } = pg;

// Function to run migrations
async function runMigrations() {
  // Connect to the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  // Create drizzle instance
  const db = drizzle(pool, { schema });
  
  console.log('Running database migrations...');
  
  try {
    // This will create all tables defined in shared/schema.ts
    await pool.query(`
      -- Users
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(100),
        about_me TEXT,
        profile_image VARCHAR(255),
        is_premium BOOLEAN DEFAULT FALSE,
        is_admin BOOLEAN DEFAULT FALSE,
        premium_until TIMESTAMP WITH TIME ZONE,
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Groups
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_premium BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Group Members
      CREATE TABLE IF NOT EXISTS group_members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, group_id)
      );
      
      -- Forums
      CREATE TABLE IF NOT EXISTS forums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        is_premium BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Forum Posts
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Forum Replies
      CREATE TABLE IF NOT EXISTS forum_replies (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Zoom Calls
      CREATE TABLE IF NOT EXISTS zoom_calls (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        zoom_link VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Zoom Call Participants
      CREATE TABLE IF NOT EXISTS zoom_call_participants (
        id SERIAL PRIMARY KEY,
        call_id INTEGER NOT NULL REFERENCES zoom_calls(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(call_id, user_id)
      );
    `);

    console.log('Database migrations completed successfully');

    // Seed some initial data if the database is empty
    const forums = await db.select().from(schema.forums);
    
    if (forums.length === 0) {
      console.log('Seeding initial data...');
      
      // Seed some forums
      await db.insert(schema.forums).values([
        {
          title: 'Retirement Planning',
          description: 'Discuss strategies and tips for planning your retirement.',
          isPremium: false,
          createdAt: new Date()
        },
        {
          title: 'Dating After 50',
          description: 'Share experiences and advice for dating in the later stages of life.',
          isPremium: false,
          createdAt: new Date()
        },
        {
          title: 'Health & Wellness',
          description: 'Tips for staying healthy and active as you age.',
          isPremium: false,
          createdAt: new Date()
        },
        {
          title: 'Investment Strategies',
          description: 'Advanced discussion on investment approaches for retirement.',
          isPremium: true,
          createdAt: new Date()
        },
        {
          title: 'Travel & Adventures',
          description: 'Planning trips and adventures in retirement.',
          isPremium: true,
          createdAt: new Date()
        }
      ]);
      
      console.log('Initial data seeded successfully');
    }
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migrations
runMigrations().catch(console.error);