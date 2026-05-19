from database import SessionLocal
import models

def check_users():
    db = SessionLocal()
    users = db.query(models.User).all()
    print(f"Total users: {len(users)}")
    for user in users:
        print(f"User: {user.email}")
    db.close()

if __name__ == "__main__":
    check_users()
