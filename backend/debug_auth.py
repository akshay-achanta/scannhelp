from database import SessionLocal
import models
import auth

def debug_auth():
    db = SessionLocal()
    email = "test@scannhelp.com"
    password = "password123"
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        print(f"User {email} not found in database!")
        return
    
    print(f"User found: {user.email}")
    print(f"Hashed password in DB: {user.hashed_password}")
    
    is_valid = auth.verify_password(password, user.hashed_password)
    print(f"Manual verification of 'password123': {is_valid}")
    
    db.close()

if __name__ == "__main__":
    debug_auth()
