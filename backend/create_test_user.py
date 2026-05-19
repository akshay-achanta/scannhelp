from database import SessionLocal
import models
import auth

def create_test_user():
    db = SessionLocal()
    email = "test@scannhelp.com".lower().strip()
    password = "password123"
    
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        print(f"User {email} already exists. Updating password...")
        existing.hashed_password = auth.get_password_hash(password)
    else:
        new_user = models.User(
            email=email,
            hashed_password=auth.get_password_hash(password),
            full_name="Test User"
        )
        db.add(new_user)
    
    db.commit()
    print(f"User {email} is ready with password: {password}")
    db.close()

if __name__ == "__main__":
    create_test_user()
