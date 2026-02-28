import os
from sqlalchemy import create_engine
from sqlalchemy.sql import text

# Handle Railway/Heroku/Neon style postgresql:// vs postgres://
DB_URL = os.getenv("DATABASE_URL", "sqlite:///./api_platform.db")
if DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        print(f"Connected to database at {DB_URL.split('@')[-1] if '@' in DB_URL else DB_URL}")
        
        # Check dialect
        dialect = engine.dialect.name
        
        if dialect == "sqlite":
            print("Applying SQLite migration for is_multifile and file_map...")
            try:
                conn.execute(text("ALTER TABLE swarm_missions ADD COLUMN parent_id VARCHAR;"))
                conn.execute(text("ALTER TABLE swarm_missions ADD COLUMN experiment_id VARCHAR;"))
                print("Added lineage columns!")
            except Exception as e:
                print("Lineage columns might already exist:", str(e))
                
            try:
                conn.execute(text("ALTER TABLE swarm_missions ADD COLUMN is_multifile BOOLEAN DEFAULT 0;"))
                print("Added is_multifile!")
            except Exception as e:
                print("is_multifile might already exist:", str(e))
                
            try:
                conn.execute(text("ALTER TABLE swarm_missions ADD COLUMN file_map VARCHAR;"))
                print("Added file_map!")
            except Exception as e:
                print("file_map might already exist:", str(e))
                
        elif dialect == "postgresql":
            print("Applying PostgreSQL migration for is_multifile and file_map...")
            try:
                conn.execute(text("ALTER TABLE swarm_missions ADD COLUMN is_multifile BOOLEAN DEFAULT FALSE;"))
                print("Added is_multifile!")
            except Exception as e:
                print("is_multifile might already exist:", str(e))
                
            try:
                conn.execute(text("ALTER TABLE swarm_missions ADD COLUMN file_map TEXT;"))
                print("Added file_map!")
            except Exception as e:
                print("file_map might already exist:", str(e))
                
            conn.commit()
            
        else:
            print(f"Unsupported database dialect for automatic migration: {dialect}")
            print("Please manually add columns: is_multifile (Boolean), file_map (String/Text)")
            
    print("Migration complete!")
except Exception as e:
    print(f"Migration script failed: {e}")
