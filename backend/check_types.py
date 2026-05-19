from sqlalchemy import inspect
from database import engine

def check_types():
    inspector = inspect(engine)
    columns = inspector.get_columns('products')
    for col in columns:
        print(f"Column: {col['name']}, Type: {col['type']}")

if __name__ == "__main__":
    check_types()
