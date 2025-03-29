// Load environment variables
import { execSync } from 'child_process';

try {
  console.log('Setting up Supabase database tables...');
  execSync('npx tsx server/create-supabase-tables.ts', { stdio: 'inherit' });
  console.log('Supabase database setup completed successfully!');
} catch (error) {
  console.error('Error setting up Supabase database:', error);
  process.exit(1);
}