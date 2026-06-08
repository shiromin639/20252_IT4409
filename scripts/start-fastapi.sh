#!/bin/bash
set -e

# Wait for postgres to be ready
echo "Waiting for postgres..."
while ! pg_isready -h "$POSTGRES_SERVER" -p "$POSTGRES_PORT" -U "$POSTGRES_USER"; do
  sleep 1
done
echo "PostgreSQL started"

# Run migrations
if [ -d "alembic" ] || [ -f "alembic.ini" ]; then
    echo "Running Alembic migrations..."
    export PYTHONPATH=/app
    uv run alembic upgrade head
else
    echo "No alembic setup found, skipping migrations."
fi

# Run seed script if exists
if [ -f "seed.py" ]; then
    echo "Running seed script..."
    uv run python seed.py
elif [ -f "app/seed.py" ]; then
    echo "Running seed script..."
    uv run python app/seed.py
fi

# Start uvicorn
if [ -f "main.py" ]; then
    echo "Starting Uvicorn with main:app..."
    exec uv run uvicorn main:app --host 0.0.0.0 --port 8000
elif [ -f "app/main.py" ]; then
    echo "Starting Uvicorn with app.main:app..."
    exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
else
    echo "Error: Cannot find main.py or app/main.py"
    exit 1
fi
