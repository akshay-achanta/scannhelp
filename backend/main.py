from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt

import models, schemas, auth, database
from database import engine, get_db
from google.oauth2 import id_token
from google.auth.transport import requests
import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ScanNHelp API")

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Dependency to get current user
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

# --- Auth Endpoints ---

@app.post("/signup", response_model=schemas.UserRead)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"Signup attempt for: {user.email}")
    print(f"DEBUG: Password received length: {len(user.password)}")
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        print(f"Signup failed: Email {user.email} already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"Signup SUCCESSFUL for: {user.email}")
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"Login attempt for: {form_data.username}")
    print(f"DEBUG: Login password length: {len(form_data.password)}")
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user:
        print(f"Login failed: User {form_data.username} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Try verifying
    is_valid = auth.verify_password(form_data.password, user.hashed_password)
    if not is_valid:
        print(f"Login failed: Incorrect password for {form_data.username}")
        # One last debug check: does it hash to the same thing if we use the same salt?
        # (Passlib handles this internally, but we log the failure)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Login SUCCESSFUL for: {form_data.username}")
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/google")
def google_auth(data: schemas.GoogleLogin, db: Session = Depends(get_db)):
    try:
        # Verify the ID token
        idinfo = id_token.verify_oauth2_token(data.id_token, requests.Request(), GOOGLE_CLIENT_ID)
        
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            # Create a new user if they don't exist
            # We don't have a password for Google users, so we can use a random one or leave it empty
            # Standard practice is to set a random hash or null
            print(f"Creating new Google user: {email}")
            user = models.User(
                email=email,
                full_name=name,
                hashed_password=auth.get_password_hash(os.urandom(24).hex()) # Random password
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        print(f"Google Login SUCCESSFUL for: {email}")
        access_token = auth.create_access_token(data={"sub": email})
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=400, detail="Invalid Google token")

# --- Product Endpoints ---

@app.get("/products", response_model=List[schemas.ProductRead])
def get_products(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Product).filter(models.Product.user_id == current_user.id).all()

@app.get("/products/{id}", response_model=schemas.ProductRead)
def get_product(id: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id, models.Product.user_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=schemas.ProductRead)
def create_product(product: schemas.ProductCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_product = models.Product(**product.dict(), user_id=current_user.id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{id}", response_model=schemas.ProductRead)
def update_product(id: str, product_update: schemas.ProductUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == id, models.Product.user_id == current_user.id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

# --- Health Endpoints ---

@app.get("/health-profiles", response_model=List[schemas.HealthRead])
def get_health_profiles(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.HealthProfile).filter(models.HealthProfile.user_id == current_user.id).all()

@app.get("/health-profiles/{id}", response_model=schemas.HealthRead)
def get_health_profile(id: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.HealthProfile).filter(models.HealthProfile.id == id, models.HealthProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Health profile not found")
    return profile

@app.post("/health-profiles", response_model=schemas.HealthRead)
def create_health_profile(profile: schemas.HealthCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_profile = models.HealthProfile(**profile.dict(), user_id=current_user.id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@app.put("/health-profiles/{id}", response_model=schemas.HealthRead)
def update_health_profile(id: str, profile_update: schemas.HealthUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_profile = db.query(models.HealthProfile).filter(models.HealthProfile.id == id, models.HealthProfile.user_id == current_user.id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Health profile not found")
    
    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

# --- Scan Redirect Endpoint ---

@app.get("/scan/{id}")
def scan_id(id: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if product:
        return {"type": "product", "data": product}
    
    health = db.query(models.HealthProfile).filter(models.HealthProfile.id == id).first()
    if health:
        return {"type": "health", "data": health}
    
    raise HTTPException(status_code=404, detail="Tag ID not found")

@app.get("/")
def read_root():
    return {"message": "ScanNHelp API is running"}
