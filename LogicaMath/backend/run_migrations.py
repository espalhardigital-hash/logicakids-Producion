import asyncio
import os
import sys
from alembic.config import Config
from alembic import command

# Add current directory to path so imports work correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def run_alembic_upgrade():
    print("=============================================")
    print("Running Database Migrations with Alembic...")
    print("=============================================")
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("✅ Alembic migrations completed successfully.")
    except Exception as e:
        print(f"❌ Error running Alembic migrations: {e}")
        sys.exit(1)

async def main():
    # 1. Wait for database
    from wait_for_db import wait_for_db
    wait_for_db()

    # 2. Run migrations
    run_alembic_upgrade()

    # 3. Seed database
    if os.environ.get("SEED_DB", "false").lower() == "true":
        print("=============================================")
        print("Seeding Database...")
        print("=============================================")
        from app.seed import run_seed
        try:
            await run_seed()
            print("✅ Database seeding completed successfully.")
        except Exception as e:
            import traceback
            print(f"❌ Error seeding database: {e}")
            traceback.print_exc()
            sys.exit(1)
    else:
        print("=============================================")
        print("Skipping Database Seeding (SEED_DB != true)")
        print("=============================================")

    # 4. Create users
    print("=============================================")
    print("Creating Admin and Test Users...")
    print("=============================================")
    from manual_scripts.create_users import create_users
    try:
        await create_users()
        print("✅ User creation completed successfully.")
    except Exception as e:
        import traceback
        print(f"❌ Error creating users: {e}")
        traceback.print_exc()
        sys.exit(1)

    print("=============================================")
    print("Database Startup Flow Finished Successfully!")
    print("=============================================")

if __name__ == "__main__":
    asyncio.run(main())
