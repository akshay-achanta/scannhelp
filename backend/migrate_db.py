import os
from sqlalchemy import text
from database import engine
from dotenv import load_dotenv

load_dotenv()

def migrate():
    print("Starting database migration...")
    
    # List of columns to add
    commands = [
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS alt_number VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS address VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS notes VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS physically_disabled BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS display_information BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS primary_doctor_number VARCHAR;"
    ]
    
    with engine.connect() as conn:
        for cmd in commands:
            try:
                print(f"Executing: {cmd}")
                conn.execute(text(cmd))
                conn.commit()
            except Exception as e:
                print(f"Error or already exists: {e}")
                
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
