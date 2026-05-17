#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo "Starting LogicaKids Backend Startup Flow..."
echo "============================================="

# 1. Run database migrations using Alembic
echo "Step 1/3: Running database migrations with Alembic..."
alembic upgrade head

# 2. Populate the database with default configurations and phase/discipline seeds
echo "Step 2/3: Seeding database with initial assets..."
python -m app.seed

# 2.5. Create admin and test users (Amilcar & Prueba)
echo "Step 2.5/3: Creating admin and test users..."
python create_users.py

# 3. Start the FastAPI backend application
echo "Step 3/3: Starting FastAPI application with Uvicorn..."
echo "============================================="
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
