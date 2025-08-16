#!/bin/sh

set -e
set -o pipefail

# Wait for database to be ready
export PGPASSWORD="${POSTGRES_PASSWORD:-motorq123}"
echo "Waiting for database..."

# Wait longer for database to be fully ready
for i in 1 2 3 4 5 6 7 8 9 10; do
  if pg_isready -h db -U postgres; then
    echo "Database ready!"
    break
  fi
  echo "Attempt $i/10: Database not ready, waiting 5 seconds..."
  sleep 5
done

echo "Database ready, running migrations..."
npm run migrate

echo "Migrations completed, starting server..."
npm run start