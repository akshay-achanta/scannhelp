from sqlalchemy import text
from database import engine

def raw_check():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM products LIMIT 0"))
        print(f"Raw columns from SELECT: {result.keys()}")

if __name__ == "__main__":
    raw_check()
