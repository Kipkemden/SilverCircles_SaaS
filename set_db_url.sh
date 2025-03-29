export DATABASE_URL="postgresql://postgres:${SUPABASE_SERVICE_KEY}@db.$(echo $SUPABASE_URL | sed -n "s|https://\(.*\)\.supabase\.co|\1|p").supabase.co:5432/postgres"
