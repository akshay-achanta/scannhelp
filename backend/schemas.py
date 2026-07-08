from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional, List, Literal
import datetime
import re

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class GoogleLogin(BaseModel):
    id_token: str

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    mobile: Optional[str] = Field(None, max_length=15, pattern=r'^\d*$')

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    mobile: Optional[str] = Field(None, max_length=15, pattern=r'^\d*$')

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=20)
    confirm_password: str = Field(..., min_length=8, max_length=20)
    verification_code: str = Field(..., min_length=6, max_length=6)

    @model_validator(mode='after')
    def validate_passwords(self) -> 'UserCreate':
        pw = self.password
        cpw = self.confirm_password

        if pw != cpw:
            raise ValueError("Passwords do not match")

        import string
        if not all(c in string.ascii_letters + string.digits + string.punctuation for c in pw):
            raise ValueError("Password can only contain letters, numbers, and special characters")

        has_letter = any(c.isalpha() for c in pw)
        has_digit = any(c.isdigit() for c in pw)

        if not has_digit:
            raise ValueError("Password is not strong — it cannot be only letters, please add some numbers")
        if not has_letter:
            raise ValueError("Password is not strong — it cannot be only numbers, please add some letters")

        return self

class SignupCodeRequest(BaseModel):
    email: EmailStr

class LoginJsonRequest(BaseModel):
    email: EmailStr
    password: str

class UserRead(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    id: str = Field(..., min_length=1, max_length=50)
    device_name: str = Field(..., min_length=1, max_length=100)
    display_information: bool = False
    is_lost: bool = False
    description: Optional[str] = Field(None, max_length=500)
    name: Optional[str] = Field(None, max_length=100)
    mobile: Optional[str] = Field(None, max_length=20)
    alt_number: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=255)
    reward_amount: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=1000)

class ProductCreate(ProductBase):
    mobile: Optional[str] = Field(None, min_length=10, max_length=10, pattern=r'^\d{10}$')
    alt_number: Optional[str] = Field(None, max_length=10, pattern=r'^\d*$')

    @field_validator('device_name')
    @classmethod
    def device_name_no_digits(cls, v):
        if v and not re.search(r'[a-zA-Z]', v):
            raise ValueError('Device name must contain at least one letter')
        return v

    @field_validator('name')
    @classmethod
    def name_no_digits(cls, v):
        if v and not re.search(r'[a-zA-Z]', v):
            raise ValueError('Name must contain at least one letter')
        return v

    @field_validator('address')
    @classmethod
    def address_must_have_letters(cls, v):
        if v and not re.search(r'[a-zA-Z]', v):
            raise ValueError('Address must contain letters')
        return v

class ProductUpdate(BaseModel):
    device_name: Optional[str] = Field(None, min_length=1, max_length=100)
    display_information: Optional[bool] = None
    is_lost: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=500)
    name: Optional[str] = Field(None, max_length=100)
    mobile: Optional[str] = Field(None, min_length=10, max_length=10, pattern=r'^\d{10}$')
    alt_number: Optional[str] = Field(None, max_length=10, pattern=r'^\d*$')
    address: Optional[str] = Field(None, max_length=255)
    reward_amount: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=1000)

    @field_validator('device_name')
    @classmethod
    def device_name_no_digits(cls, v):
        if v and not re.search(r'[a-zA-Z]', v):
            raise ValueError('Device name must contain at least one letter')
        return v

    @field_validator('name')
    @classmethod
    def name_no_digits(cls, v):
        if v and not re.search(r'[a-zA-Z]', v):
            raise ValueError('Name must contain at least one letter')
        return v

    @field_validator('address')
    @classmethod
    def address_must_have_letters(cls, v):
        if v and not re.search(r'[a-zA-Z]', v):
            raise ValueError('Address must contain letters')
        return v

class ProductRead(ProductBase):
    user_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class HealthBase(BaseModel):
    id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    blood_group: Optional[Literal['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', '']] = None
    allergies: Optional[str] = Field(None, max_length=500)
    medications: Optional[str] = Field(None, max_length=500)
    conditions: Optional[str] = Field(None, max_length=500)
    emergency_contact: Optional[str] = Field(None, max_length=100)
    emergency_phone: Optional[str] = Field(None, max_length=20)
    alt_number: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None, max_length=1000)
    physically_disabled: bool = False
    display_information: bool = False
    primary_doctor_number: Optional[str] = Field(None, max_length=20)

class HealthCreate(HealthBase):
    emergency_phone: Optional[str] = Field(None, min_length=10, max_length=10, pattern=r'^\d{10}$')
    alt_number: Optional[str] = Field(None, max_length=10, pattern=r'^\d*$')
    primary_doctor_number: Optional[str] = Field(None, max_length=10, pattern=r'^\d*$')

    @field_validator('name')
    @classmethod
    def name_no_digits(cls, v):
        if v and not re.search(r'[a-zA-Z]', v):
            raise ValueError('Name must contain at least one letter')
        return v

    @field_validator('address')
    @classmethod
    def address_must_have_letters(cls, v):
        if v and not re.search(r'[a-zA-Z]', v):
            raise ValueError('Address must contain letters')
        return v

class HealthUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    blood_group: Optional[Literal['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', '']] = None
    allergies: Optional[str] = Field(None, max_length=500)
    medications: Optional[str] = Field(None, max_length=500)
    conditions: Optional[str] = Field(None, max_length=500)
    emergency_contact: Optional[str] = Field(None, max_length=100)
    emergency_phone: Optional[str] = Field(None, min_length=10, max_length=10, pattern=r'^\d{10}$')
    alt_number: Optional[str] = Field(None, max_length=10, pattern=r'^\d*$')
    address: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None, max_length=1000)
    physically_disabled: Optional[bool] = None
    display_information: Optional[bool] = None
    primary_doctor_number: Optional[str] = Field(None, max_length=10, pattern=r'^\d*$')

    @field_validator('name')
    @classmethod
    def name_no_digits(cls, v):
        if v and not re.search(r'[a-zA-Z]', v):
            raise ValueError('Name must contain at least one letter')
        return v

    @field_validator('address')
    @classmethod
    def address_must_have_letters(cls, v):
        if v and not re.search(r'[a-zA-Z]', v):
            raise ValueError('Address must contain letters')
        return v

class HealthRead(HealthBase):
    user_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Verification & Activation ---

class TagVerifyResponse(BaseModel):
    t_id: str
    t_t: int
    status: Literal['unassigned', 'assigned', 'lost']
    data: Optional[dict] = None

class TagActivateRequest(BaseModel):
    t_id: str
    t_t: int
    details: dict

# --- Password Reset ---

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyResetCodeRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=20)
    confirm_password: str = Field(..., min_length=8, max_length=20)

    @model_validator(mode='after')
    def validate_passwords(self) -> 'ResetPasswordRequest':
        pw = self.new_password
        cpw = self.confirm_password
        
        if pw != cpw:
            raise ValueError("Passwords do not match")
        
        # Check for allowed characters
        import string
        if not all(c in string.ascii_letters + string.digits + string.punctuation for c in pw):
            raise ValueError("Password can only contain letters, numbers, and special characters")
        
        has_letter = any(c.isalpha() for c in pw)
        has_digit = any(c.isdigit() for c in pw)
        
        if not has_digit:
            raise ValueError("Password is not strong — it cannot be only letters, please add some numbers")
        if not has_letter:
            raise ValueError("Password is not strong — it cannot be only numbers, please add some letters")
            
        return self
