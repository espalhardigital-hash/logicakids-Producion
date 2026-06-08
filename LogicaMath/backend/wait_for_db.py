import sys
import time
import socket
import os
from urllib.parse import urlparse

def wait_for_db():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("⚠️ DATABASE_URL not set in environment, skipping socket connection check.")
        return

    print("=" * 60)
    print("LogicaKids DevOps Tool: Waiting for Database Connection")
    print("=" * 60)

    # Convert asyncpg scheme to standard scheme for urlparse compatibility
    cleaned_url = db_url.replace("postgresql+asyncpg://", "http://").replace("postgresql://", "http://")
    
    try:
        parsed = urlparse(cleaned_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 5432
    except Exception as e:
        print(f"❌ Error parsing DATABASE_URL: {e}. Skipping check.")
        return

    print(f"Checking if database port is open at {host}:{port}...")
    
    start_time = time.time()
    timeout = 60  # Maximum 60 seconds wait time
    
    while True:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(2.0)
                s.connect((host, port))
                print(f"✅ Connection successful! Database port {port} on '{host}' is open and accepting connections.")
                print("=" * 60)
                return
        except (socket.error, socket.timeout):
            elapsed = time.time() - start_time
            if elapsed > timeout:
                print(f"❌ Timeout error: Database at {host}:{port} was not reachable within {timeout} seconds!")
                print("=" * 60)
                sys.exit(1)
            
            print(f"Database port not ready yet (waiting {int(elapsed)}s/{timeout}s)... Retrying in 2 seconds.")
            time.sleep(2)

if __name__ == "__main__":
    wait_for_db()
