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

# ✅ CORS MUST be added before any routes
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://accurate-vision-production-48a0.up.railway.app",
    "https://scannhelp-production.up.railway.app",
    "https://scannhelp.vercel.app",
    "https://scannhelp.com",
    "https://www.scannhelp.com",
    "http://10.189.80.42:5173",
    "http://10.189.80.42.nip.io:5173",
    "http://172.20.113.185:5173",
    "http://172.20.113.185.nip.io:5173"
]

env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    extra_origins = [o.strip(' "\'') for o in env_origins.split(",") if o.strip()]
    allowed_origins.extend(extra_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Health check route
@app.get("/")
def read_root():
    return {"status": "online", "message": "ScanNHelp API is running"}

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
    user = db.query(models.User).filter(models.User.email == token_data.email.lower().strip()).first()
    if user is None:
        raise credentials_exception
    return user

# --- Auth Endpoints ---

@app.post("/signup", response_model=schemas.UserRead)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    email_lower = user.email.lower().strip()
    db_user = db.query(models.User).filter(models.User.email == email_lower).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=email_lower,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email_lower = form_data.username.lower().strip()
    print(f"DEBUG: Login attempt for email: '{email_lower}' (original: '{form_data.username}')")
    
    user = db.query(models.User).filter(models.User.email == email_lower).first()
    if not user:
        print(f"DEBUG: User not found in DB: '{email_lower}'")
        # Log all emails in DB for debugging
        all_users = db.query(models.User.email).all()
        print(f"DEBUG: All emails in DB: {[u[0] for u in all_users]}")
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    is_valid = auth.verify_password(form_data.password, user.hashed_password)
    print(f"DEBUG: Password verification for {email_lower}: {is_valid}")
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/google")
def google_auth(data: schemas.GoogleLogin, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(data.id_token, requests.Request(), GOOGLE_CLIENT_ID)
        
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            user = models.User(
                email=email,
                full_name=name,
                hashed_password=auth.get_password_hash(os.urandom(24).hex())
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        access_token = auth.create_access_token(data={"sub": email})
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")

# --- Product Endpoints ---

@app.get("/products", response_model=List[schemas.ProductRead])
def get_products(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Product).filter(models.Product.user_id == current_user.id).all()

@app.get("/products/{id}", response_model=schemas.ProductRead)
def get_product(id: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(
        ((models.Product.id == id) | (models.Product.t_id == id)),
        models.Product.user_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=schemas.ProductRead)
def create_product(product: schemas.ProductCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if a record with this ID already exists (check both id and t_id)
    existing = db.query(models.Product).filter(
        (models.Product.id == product.id) | (models.Product.t_id == product.id)
    ).first()
    
    if existing:
        for key, value in product.dict().items():
            setattr(existing, key, value)
        existing.user_id = current_user.id
        existing.is_assigned = True
        existing.t_id = product.id
        db.commit()
        db.refresh(existing)
        return existing

    db_product = models.Product(
        **product.dict(), 
        user_id=current_user.id,
        t_id=product.id,
        is_assigned=True
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{id}", response_model=schemas.ProductRead)
def update_product(id: str, product_update: schemas.ProductUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(
        ((models.Product.id == id) | (models.Product.t_id == id)),
        models.Product.user_id == current_user.id
    ).first()
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
    profile = db.query(models.HealthProfile).filter(
        ((models.HealthProfile.id == id) | (models.HealthProfile.t_id == id)),
        models.HealthProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Health profile not found")
    return profile

@app.post("/health-profiles", response_model=schemas.HealthRead)
def create_health_profile(profile: schemas.HealthCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if a record with this ID already exists (check both id and t_id)
    existing = db.query(models.HealthProfile).filter(
        (models.HealthProfile.id == profile.id) | (models.HealthProfile.t_id == profile.id)
    ).first()
    if existing:
        for key, value in profile.dict().items():
            setattr(existing, key, value)
        existing.user_id = current_user.id
        existing.is_assigned = True
        existing.t_id = profile.id
        db.commit()
        db.refresh(existing)
        return existing

    db_profile = models.HealthProfile(
        **profile.dict(), 
        user_id=current_user.id,
        t_id=profile.id,
        is_assigned=True
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@app.put("/health-profiles/{id}", response_model=schemas.HealthRead)
def update_health_profile(id: str, profile_update: schemas.HealthUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_profile = db.query(models.HealthProfile).filter(
        ((models.HealthProfile.id == id) | (models.HealthProfile.t_id == id)),
        models.HealthProfile.user_id == current_user.id
    ).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Health profile not found")
    
    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

# --- Scan Verification & Public Details ---

@app.get("/scan/verify")
def verify_scan(t_t: int, t_id: str, db: Session = Depends(get_db)):
    # t_t: 1 for Product, 2 for Health
    if t_t == 1:
        # Check both id and legacy t_id just in case
        item = db.query(models.Product).filter(
            (models.Product.id == t_id) | (models.Product.t_id == t_id)
        ).first()
    else:
        item = db.query(models.HealthProfile).filter(
            (models.HealthProfile.id == t_id) | (models.HealthProfile.t_id == t_id)
        ).first()
        
    if not item or not getattr(item, 'is_assigned', False):
        return {"t_id": t_id, "t_t": t_t, "status": "unassigned"}
        
    # For products: check is_lost. For health: check display_information (visible to public)
    if t_t == 1:
        if getattr(item, 'is_lost', False):
            return {"t_id": t_id, "t_t": t_t, "status": "lost"}
    else:
        if getattr(item, 'display_information', False):
            return {"t_id": t_id, "t_t": t_t, "status": "lost"}
        
    return {"t_id": t_id, "t_t": t_t, "status": "assigned"}

@app.post("/activate")
def activate_tag(req: schemas.TagActivateRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # req.details contains the product/health info
    if req.t_t == 1:
        # Check if already exists
        existing = db.query(models.Product).filter(models.Product.id == req.t_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Tag already assigned")
        
        new_item = models.Product(**req.details, id=req.t_id, t_id=req.t_id, t_t=1, is_assigned=True, user_id=current_user.id)
        db.add(new_item)
    else:
        existing = db.query(models.HealthProfile).filter(models.HealthProfile.id == req.t_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Tag already assigned")
            
        new_item = models.HealthProfile(**req.details, id=req.t_id, t_id=req.t_id, t_t=2, is_assigned=True, user_id=current_user.id)
        db.add(new_item)
        
    db.commit()
    return {"message": "Tag activated successfully"}

@app.get("/public-details/{t_id}")
def get_public_details(t_id: str, t_t: int, db: Session = Depends(get_db)):
    if t_t == 1:
        item = db.query(models.Product).filter(
            (models.Product.id == t_id) | (models.Product.t_id == t_id)
        ).first()
    else:
        item = db.query(models.HealthProfile).filter(
            (models.HealthProfile.id == t_id) | (models.HealthProfile.t_id == t_id)
        ).first()
        
    if not item:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # For products: check is_lost. For health: check display_information
    if t_t == 1:
        if not getattr(item, 'is_lost', False):
            raise HTTPException(status_code=404, detail="Active tag not found")
    else:
        if not getattr(item, 'display_information', False):
            raise HTTPException(status_code=404, detail="Active tag not found")
    
    # Build a safe serializable dict from the model
    if t_t == 1:
        data = {
            "device_name": item.device_name,
            "description": item.description,
            "name": item.name,
            "mobile": item.mobile,
            "alt_number": item.alt_number,
            "address": item.address,
            "reward_amount": item.reward_amount,
            "notes": item.notes,
        }
    else:
        data = {
            "name": item.name,
            "blood_group": item.blood_group,
            "allergies": item.allergies,
            "medications": item.medications,
            "conditions": item.conditions,
            "emergency_contact": item.emergency_contact,
            "emergency_phone": item.emergency_phone,
            "alt_number": item.alt_number,
            "address": item.address,
            "notes": item.notes,
            "physically_disabled": item.physically_disabled,
        }
    
    return {"data": data, "t_t": t_t}
