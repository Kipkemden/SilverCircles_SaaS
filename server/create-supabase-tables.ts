// This script creates all the necessary tables in Supabase using the Supabase client
import { supabase } from './supabase';

async function createTables() {
  console.log('Creating Supabase tables...');
  
  try {
    // We'll use Supabase's Data API to create tables
    // Note: In a production environment, this should be done through Supabase's migration tools
    // or directly in the Supabase dashboard
    
    // Create users table if it doesn't exist
    let { error: checkUsersError, count } = await supabase.from('users').select('*', { count: 'exact', head: true });
    
    if (checkUsersError && checkUsersError.code === '42P01') { // relation "users" does not exist
      console.log('Creating users table...');
      
      // We can't create tables through the Data API directly, so we'll need to notify the user
      console.log('Please create the following tables in your Supabase dashboard:');
      console.log(`
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_until TIMESTAMP,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  about_me TEXT,
  profile_image TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT,
  verification_token_expiry TIMESTAMP,
  password_reset_token TEXT,
  password_reset_expiry TIMESTAMP,
  supabase_id TEXT UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE (user_id, group_id)
);

CREATE TABLE IF NOT EXISTS public.forums (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id SERIAL PRIMARY KEY,
  forum_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.forum_replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.zoom_calls (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  zoom_link TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.zoom_call_participants (
  id SERIAL PRIMARY KEY,
  call_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY (call_id) REFERENCES zoom_calls(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (call_id, user_id)
);`);

      console.log('\nYou will need to execute these SQL statements in the Supabase SQL editor.');
      console.log('Go to your Supabase project dashboard > SQL Editor > New query');
      console.log('Paste the SQL above and run it to create all the necessary tables.');
    } else {
      console.log('Tables appear to be set up already. If you encounter issues, create the tables manually in the Supabase dashboard.');
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

// Execute the function if this file is run directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Table creation process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error in table creation process:', error);
      process.exit(1);
    });
}

export { createTables };