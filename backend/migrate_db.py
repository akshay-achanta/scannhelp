import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL).execution_options(isolation_level="AUTOCOMMIT")
with engine.connect() as conn:
    queries = [
        "ALTER TABLE users ADD COLUMN reset_code VARCHAR",
        "ALTER TABLE users ADD COLUMN reset_code_expires TIMESTAMP",
        "ALTER TABLE users ADD COLUMN reset_attempts INTEGER DEFAULT 0",
        "ALTER TABLE users ADD COLUMN reset_rate_limit_until TIMESTAMP",
        "ALTER TABLE users ADD COLUMN mobile VARCHAR",
    ]
    for q in queries:
        try:
            conn.execute(text(q))
            print(f"Success: {q}")
        except Exception as e:
            print(f"Failed: {q} - {e}")
