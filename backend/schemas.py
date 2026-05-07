from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
import datetime

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

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

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
    mobile: Optional[str] = Field(None, max_length=20, pattern=r'^\d*$')
    alt_number: Optional[str] = Field(None, max_length=20, pattern=r'^\d*$')

class ProductUpdate(BaseModel):
    device_name: Optional[str] = Field(None, min_length=1, max_length=100)
    display_information: Optional[bool] = None
    is_lost: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=500)
    name: Optional[str] = Field(None, max_length=100)
    mobile: Optional[str] = Field(None, max_length=20, pattern=r'^\d*$')
    alt_number: Optional[str] = Field(None, max_length=20, pattern=r'^\d*$')
    address: Optional[str] = Field(None, max_length=255)
    reward_amount: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=1000)

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
    emergency_phone: Optional[str] = Field(None, max_length=20, pattern=r'^\d*$')
    alt_number: Optional[str] = Field(None, max_length=20, pattern=r'^\d*$')
    primary_doctor_number: Optional[str] = Field(None, max_length=20, pattern=r'^\d*$')

class HealthUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    blood_group: Optional[Literal['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', '']] = None
    allergies: Optional[str] = Field(None, max_length=500)
    medications: Optional[str] = Field(None, max_length=500)
    conditions: Optional[str] = Field(None, max_length=500)
    emergency_contact: Optional[str] = Field(None, max_length=100)
    emergency_phone: Optional[str] = Field(None, max_length=20, pattern=r'^\d*$')
    alt_number: Optional[str] = Field(None, max_length=20, pattern=r'^\d*$')
    address: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None, max_length=1000)
    physically_disabled: Optional[bool] = None
    display_information: Optional[bool] = None
    primary_doctor_number: Optional[str] = Field(None, max_length=20, pattern=r'^\d*$')

class HealthRead(HealthBase):
    user_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
