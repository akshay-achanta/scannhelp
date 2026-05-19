from sqlalchemy import text, inspect
from database import engine

def check_and_migrate():
    print("Checking current columns in 'products' table...")
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('products')]
    print(f"Current columns: {columns}")
    
    if 'device_name' not in columns:
        print("MISSING device_name! Attempting to add...")
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE products ADD COLUMN device_name VARCHAR;"))
            conn.commit()
            print("Successfully added device_name.")
    else:
        print("device_name already exists.")
        
    # Check again
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('products')]
    print(f"Columns after migration attempt: {columns}")

if __name__ == "__main__":
    check_and_migrate()
