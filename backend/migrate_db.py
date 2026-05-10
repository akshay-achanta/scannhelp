import os
from sqlalchemy import text
from database import engine
from dotenv import load_dotenv

load_dotenv()

def migrate():
    print("Starting database migration...")
    
    # Commands to fix column types and constraints
    type_commands = [
        "ALTER TABLE products ALTER COLUMN id TYPE VARCHAR;",
        "ALTER TABLE health_profiles ALTER COLUMN id TYPE VARCHAR;",
        "ALTER TABLE products ALTER COLUMN t_id DROP NOT NULL;",
        "ALTER TABLE products ALTER COLUMN t_t DROP NOT NULL;",
        "ALTER TABLE health_profiles ALTER COLUMN t_id DROP NOT NULL;",
        "ALTER TABLE health_profiles ALTER COLUMN t_t DROP NOT NULL;",
        "UPDATE products SET is_assigned = TRUE WHERE is_assigned IS NULL;",
        "UPDATE health_profiles SET is_assigned = TRUE WHERE is_assigned IS NULL;"
    ]
    
    # List of columns to add for products
    product_commands = [
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS device_name VARCHAR;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS display_information BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_lost BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS description VARCHAR;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS name VARCHAR;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS mobile VARCHAR;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS alt_number VARCHAR;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS address VARCHAR;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS reward_amount VARCHAR;",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS notes VARCHAR;"
    ]
    
    # List of columns to add for health_profiles
    health_commands = [
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS name VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS blood_group VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS allergies VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS medications VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS conditions VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS alt_number VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS address VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS notes VARCHAR;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS physically_disabled BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS display_information BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS primary_doctor_number VARCHAR;"
    ]
    
    all_commands = type_commands + product_commands + health_commands
    
    with engine.connect() as conn:
        for cmd in all_commands:
            try:
                print(f"Executing: {cmd}")
                conn.execute(text(cmd))
                conn.commit()
            except Exception as e:
                print(f"Error executing {cmd}: {e}")
                
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
