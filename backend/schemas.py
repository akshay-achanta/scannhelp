from pydantic import BaseModel, EmailStr
from typing import Optional, List
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
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    id: str
    device_name: str
    display_information: bool = False
    is_lost: bool = False
    description: Optional[str] = None
    name: Optional[str] = None
    mobile: Optional[str] = None
    alt_number: Optional[str] = None
    address: Optional[str] = None
    reward_amount: Optional[str] = None
    notes: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    device_name: Optional[str] = None
    display_information: Optional[bool] = None
    is_lost: Optional[bool] = None
    description: Optional[str] = None
    name: Optional[str] = None
    mobile: Optional[str] = None
    alt_number: Optional[str] = None
    address: Optional[str] = None
    reward_amount: Optional[str] = None
    notes: Optional[str] = None

class ProductRead(ProductBase):
    user_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class HealthBase(BaseModel):
    id: str
    name: str
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    conditions: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    alt_number: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    physically_disabled: bool = False
    display_information: bool = False
    primary_doctor_number: Optional[str] = None

class HealthCreate(HealthBase):
    pass

class HealthUpdate(BaseModel):
    name: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    conditions: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    alt_number: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    physically_disabled: Optional[bool] = None
    display_information: Optional[bool] = None
    primary_doctor_number: Optional[str] = None

class HealthRead(HealthBase):
    user_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
