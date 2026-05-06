from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    products = relationship("Product", back_populates="owner")
    health_profiles = relationship("HealthProfile", back_populates="owner")

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True) # QR ID
    user_id = Column(Integer, ForeignKey("users.id"))
    device_name = Column(String, nullable=False)
    display_information = Column(Boolean, default=False)
    is_lost = Column(Boolean, default=False)
    description = Column(String)
    name = Column(String)
    mobile = Column(String)
    alt_number = Column(String)
    address = Column(String)
    reward_amount = Column(String)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="products")

class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(String, primary_key=True, index=True) # QR ID
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    blood_group = Column(String)
    allergies = Column(String)
    medications = Column(String)
    conditions = Column(String)
    emergency_contact = Column(String)
    emergency_phone = Column(String)
    alt_number = Column(String)
    address = Column(String)
    notes = Column(String)
    physically_disabled = Column(Boolean, default=False)
    display_information = Column(Boolean, default=False)
    primary_doctor_number = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="health_profiles")
