#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo "Starting LogicaKids Backend Startup Flow..."
echo "============================================="

# Execute the unified migration, seeding, and user creation script
python run_migrations.py

# 3. Start the FastAPI backend application
echo "Step 3/3: Starting FastAPI application with Uvicorn..."
echo "============================================="
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
