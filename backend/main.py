from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import JWTError, jwt

import models, schemas, auth, database
from database import engine, get_db
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY", "")

# ── Login attempt tracker for smart CAPTCHA (in-memory) ──────────────────────
# Structure: { email_lower: {"count": int, "first_at": datetime} }
login_attempt_tracker: dict = {}
LOGIN_MAX_ATTEMPTS_BEFORE_CAPTCHA = 3
LOGIN_ATTEMPT_WINDOW_SECONDS = 600  # 10 minutes

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

# ── Turnstile verification helper ────────────────────────────────────────────
async def verify_turnstile(token: Optional[str], remote_ip: Optional[str] = None) -> bool:
    """Verify a Cloudflare Turnstile token. Returns True on success."""
    if not TURNSTILE_SECRET_KEY:
        # No secret key configured — skip verification in dev
        return True
    if not token:
        return False
    payload = {"secret": TURNSTILE_SECRET_KEY, "response": token}
    if remote_ip:
        payload["remoteip"] = remote_ip
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data=payload,
                timeout=10,
            )
        data = resp.json()
        return bool(data.get("success"))
    except Exception as e:
        print(f"ERROR: Turnstile verification failed: {e}")
        return False

# ── Signup: Send verification code ───────────────────────────────────────────
@app.post("/signup/send-code")
async def signup_send_code(req: schemas.SignupCodeRequest, db: Session = Depends(get_db)):
    email_lower = req.email.lower().strip()

    # Reject if email already registered
    existing_user = db.query(models.User).filter(models.User.email == email_lower).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="This email is already registered. Please log in instead.")

    now = datetime.utcnow()
    otp_record = db.query(models.SignupOTP).filter(models.SignupOTP.email == email_lower).first()

    # Rate limit check
    if otp_record and otp_record.rate_limit_until and otp_record.rate_limit_until > now:
        wait_secs = int((otp_record.rate_limit_until - now).total_seconds())
        wait_mins = max(1, (wait_secs + 59) // 60)
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Please wait {wait_mins} minute(s) before requesting a new code."
        )

    current_attempts = ((otp_record.attempts or 0) if otp_record else 0) + 1
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = now + timedelta(minutes=5)

    if otp_record:
        otp_record.code = code
        otp_record.expires_at = expires_at
        otp_record.attempts = current_attempts
        if current_attempts >= OTP_MAX_ATTEMPTS:
            otp_record.rate_limit_until = now + timedelta(minutes=OTP_LOCKOUT_MINUTES)
            otp_record.attempts = 0
    else:
        otp_record = models.SignupOTP(
            email=email_lower,
            code=code,
            expires_at=expires_at,
            attempts=current_attempts,
            rate_limit_until=None
        )
        db.add(otp_record)

    db.commit()
    send_verification_email(email_lower, code)

    if current_attempts >= OTP_MAX_ATTEMPTS:
        return {
            "message": "Verification code sent to your email.",
            "attempts_remaining": 0,
            "warning": f"This was your last attempt. Wait {OTP_LOCKOUT_MINUTES} minutes to request again."
        }

    remaining = OTP_MAX_ATTEMPTS - current_attempts
    return {"message": "Verification code sent to your email.", "attempts_remaining": remaining}

# ── Signup: Create account ────────────────────────────────────────────────────
@app.post("/signup", response_model=schemas.UserRead)
async def signup(user: schemas.UserCreate, request: Request, db: Session = Depends(get_db)):
    email_lower = user.email.lower().strip()

    # Verify Turnstile token if provided
    if user.turnstile_token:
        remote_ip = request.client.host if request.client else None
        if not await verify_turnstile(user.turnstile_token, remote_ip):
            raise HTTPException(status_code=400, detail="CAPTCHA verification failed. Please try again.")

    db_user = db.query(models.User).filter(models.User.email == email_lower).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Verify OTP
    otp_record = db.query(models.SignupOTP).filter(models.SignupOTP.email == email_lower).first()
    if not otp_record:
        raise HTTPException(status_code=400, detail="No verification code was sent to this email. Please request one first.")
    if otp_record.code != user.verification_code:
        raise HTTPException(status_code=400, detail="Incorrect verification code.")
    if otp_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new one.")

    # Create user
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=email_lower,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_active=True,
    )
    db.add(new_user)
    db.delete(otp_record)  # Clean up OTP
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Standard OAuth2 form-data login (no CAPTCHA — used by token flows)."""
    email_lower = form_data.username.lower().strip()
    user = db.query(models.User).filter(models.User.email == email_lower).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/login/json", response_model=schemas.Token)
async def login_json(req: schemas.LoginJsonRequest, request: Request, db: Session = Depends(get_db)):
    """JSON login endpoint with smart Turnstile CAPTCHA support."""
    email_lower = req.email.lower().strip()
    now = datetime.utcnow()

    # ── Track login attempts for smart CAPTCHA ────────────────────────────
    tracker = login_attempt_tracker.get(email_lower)
    if tracker:
        age_seconds = (now - tracker["first_at"]).total_seconds()
        if age_seconds > LOGIN_ATTEMPT_WINDOW_SECONDS:
            # Window expired — reset
            login_attempt_tracker.pop(email_lower, None)
            tracker = None

    attempt_count = (tracker["count"] if tracker else 0) + 1
    captcha_required = attempt_count > LOGIN_MAX_ATTEMPTS_BEFORE_CAPTCHA

    # ── Verify Turnstile when required ────────────────────────────────────
    if captcha_required:
        if not req.turnstile_token:
            raise HTTPException(
                status_code=428,
                detail="CAPTCHA required. Please complete the security check."
            )
        remote_ip = request.client.host if request.client else None
        if not await verify_turnstile(req.turnstile_token, remote_ip):
            raise HTTPException(status_code=400, detail="CAPTCHA verification failed. Please try again.")

    # ── Authenticate ──────────────────────────────────────────────────────
    user = db.query(models.User).filter(models.User.email == email_lower).first()
    if not user or not auth.verify_password(req.password, user.hashed_password):
        # Record failed attempt
        if tracker and (now - tracker["first_at"]).total_seconds() <= LOGIN_ATTEMPT_WINDOW_SECONDS:
            login_attempt_tracker[email_lower] = {"count": attempt_count, "first_at": tracker["first_at"]}
        else:
            login_attempt_tracker[email_lower] = {"count": 1, "first_at": now}

        remaining_before_captcha = max(0, LOGIN_MAX_ATTEMPTS_BEFORE_CAPTCHA - attempt_count)
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"X-Captcha-Required": "true" if captcha_required else "false",
                     "X-Attempts-Remaining": str(remaining_before_captcha)}
        )

    # Success — clear tracker
    login_attempt_tracker.pop(email_lower, None)
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/google")
def google_auth(data: schemas.GoogleLogin, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(data.id_token, google_requests.Request(), GOOGLE_CLIENT_ID)

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
    
    # For products: check is_lost. For health: return partial data even if display_information is false
    if t_t == 1:
        if not getattr(item, 'is_lost', False):
            raise HTTPException(status_code=404, detail="Active tag not found")
    else:
        # No 404 check needed here; the frontend will restrict view based on display_information
        pass
    
    # Build a safe serializable dict from the model
    if t_t == 1:
        is_displayed = getattr(item, 'display_information', False)
        data = {
            "device_name": item.device_name,
            "description": item.description,
            "name": item.name if is_displayed else None,
            "mobile": item.mobile if is_displayed else None,
            "alt_number": item.alt_number if is_displayed else None,
            "address": item.address if is_displayed else None,
            "reward_amount": item.reward_amount,
            "notes": item.notes,
            "display_information": is_displayed,
        }
    else:
        is_displayed = getattr(item, 'display_information', False)
        data = {
            "name": item.name,
            "blood_group": item.blood_group,
            "allergies": item.allergies,
            "conditions": item.conditions,
            "medications": item.medications if is_displayed else None,
            "emergency_contact": item.emergency_contact if is_displayed else None,
            "emergency_phone": item.emergency_phone if is_displayed else None,
            "alt_number": item.alt_number if is_displayed else None,
            "address": item.address if is_displayed else None,
            "notes": item.notes if is_displayed else None,
            "physically_disabled": item.physically_disabled if is_displayed else False,
            "display_information": is_displayed,
        }
    
    return {"data": data, "t_t": t_t}

# --- Password Reset Endpoints ---

import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

def _send_email(to_email: str, subject: str, html: str):
    """Generic email send helper via Gmail SMTP."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"ScanNHelp <{SMTP_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        print(f"INFO: Email sent to {to_email} | Subject: {subject}")
    except Exception as e:
        print(f"ERROR: Failed to send email to {to_email}: {e}")

def send_verification_email(to_email: str, code: str):
    """Send signup verification code via Gmail SMTP."""
    html = f"""\
    <html>
    <body style="margin:0;padding:0;background:#f7f7f7;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr><td align="center">
          <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#ff7f00,#ff9f40);padding:32px 32px 24px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">ScanNHelp</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Email Verification</p>
            </td></tr>
            <tr><td style="padding:32px;">
              <p style="margin:0 0 16px;color:#333;font-size:15px;">Welcome!</p>
              <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
                Use the code below to verify your email and complete your ScanNHelp registration. This code expires in <strong>5 minutes</strong>.
              </p>
              <div style="background:#fff7ed;border:2px dashed #ff7f00;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
                <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#ff7f00;">{code}</span>
              </div>
              <p style="margin:0;color:#999;font-size:12px;line-height:1.5;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td></tr>
            <tr><td style="background:#fafafa;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;color:#bbb;font-size:11px;">&copy; 2026 ScanNHelp. All rights reserved.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    _send_email(to_email, "ScanNHelp — Email Verification Code", html)

def send_reset_email(to_email: str, code: str):
    """Send password reset code via Gmail SMTP."""
    html = f"""\
    <html>
    <body style="margin:0;padding:0;background:#f7f7f7;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr><td align="center">
          <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#ff7f00,#ff9f40);padding:32px 32px 24px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">ScanNHelp</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Password Reset Request</p>
            </td></tr>
            <tr><td style="padding:32px;">
              <p style="margin:0 0 16px;color:#333;font-size:15px;">Hi there,</p>
              <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
                We received a request to reset your password. Use the code below to proceed. This code expires in <strong>5 minutes</strong>.
              </p>
              <div style="background:#fff7ed;border:2px dashed #ff7f00;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
                <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#ff7f00;">{code}</span>
              </div>
              <p style="margin:0;color:#999;font-size:12px;line-height:1.5;">
                If you didn't request this, you can safely ignore this email. Your password will not be changed.
              </p>
            </td></tr>
            <tr><td style="background:#fafafa;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;color:#bbb;font-size:11px;">&copy; 2026 ScanNHelp. All rights reserved.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    _send_email(to_email, "ScanNHelp — Password Reset Code", html)

OTP_MAX_ATTEMPTS = 3
OTP_LOCKOUT_MINUTES = 15

@app.post("/forgot-password")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_lower = req.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email_lower).first()

    if not user:
        raise HTTPException(status_code=404, detail="Email address not found in our records.")

    now = datetime.utcnow()

    # --- Rate limit check: block if lockout is still active ---
    if user.reset_rate_limit_until and user.reset_rate_limit_until > now:
        wait_seconds = int((user.reset_rate_limit_until - now).total_seconds())
        wait_minutes = max(1, (wait_seconds + 59) // 60)
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Please wait {wait_minutes} minute(s) before requesting a new code."
        )

    # --- Increment attempt counter (1-indexed: 1st, 2nd, 3rd send are all allowed) ---
    current_attempts = (user.reset_attempts or 0) + 1
    user.reset_attempts = current_attempts

    # --- Generate & store OTP (send on all allowed attempts) ---
    code = ''.join(random.choices(string.digits, k=6))
    user.reset_code = code
    user.reset_code_expires = now + timedelta(minutes=5)

    if current_attempts >= OTP_MAX_ATTEMPTS:
        # This is the last allowed attempt — lock after this send
        user.reset_rate_limit_until = now + timedelta(minutes=OTP_LOCKOUT_MINUTES)
        user.reset_attempts = 0  # Reset counter for after the lockout expires
        db.commit()
        # Still send the OTP on the 3rd attempt, but inform user it's the last one
        send_reset_email(email_lower, code)
        return {
            "message": "A reset code has been sent to your email.",
            "attempts_remaining": 0,
            "warning": f"This was your last OTP request. You must wait {OTP_LOCKOUT_MINUTES} minutes before requesting again."
        }

    db.commit()

    # --- Send OTP via email ---
    send_reset_email(email_lower, code)

    remaining = OTP_MAX_ATTEMPTS - current_attempts
    return {
        "message": "A reset code has been sent to your email.",
        "attempts_remaining": remaining
    }

@app.post("/verify-reset-code")
def verify_reset_code(req: schemas.VerifyResetCodeRequest, db: Session = Depends(get_db)):
    email_lower = req.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email_lower).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")
        
    if not user.reset_code or user.reset_code != req.code:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
        
    if not user.reset_code_expires or user.reset_code_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Code has expired")
        
    return {"message": "Code verified successfully"}

@app.post("/reset-password")
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    email_lower = req.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email_lower).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")
        
    if not user.reset_code or user.reset_code != req.code:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
        
    if not user.reset_code_expires or user.reset_code_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Code has expired")
        
    # Update password and clear all reset-related fields
    user.hashed_password = auth.get_password_hash(req.new_password)
    user.reset_code = None
    user.reset_code_expires = None
    user.reset_attempts = 0
    user.reset_rate_limit_until = None
    db.commit()
    
    return {"message": "Password reset successfully"}
