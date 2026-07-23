from __future__ import annotations
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="user")
    is_verified: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    verification_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reset_token_expires: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())
    
    profile: Mapped[Optional["Profile"]] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    health_profile: Mapped[Optional["HealthProfile"]] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    settings: Mapped[Optional["UserSettings"]] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    full_name: Mapped[str] = mapped_column(String(255), default="")
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    date_of_birth: Mapped[Optional[date]] = mapped_column(nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    xp: Mapped[int] = mapped_column(default=0)
    streak_days: Mapped[int] = mapped_column(default=0)
    last_checkin_date: Mapped[Optional[date]] = mapped_column(nullable=True)
    level: Mapped[str] = mapped_column(String(50), default="Beginner")
    
    user: Mapped["User"] = relationship(back_populates="profile")

class HealthProfile(Base):
    __tablename__ = "health_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    height_cm: Mapped[Optional[float]] = mapped_column(nullable=True)
    weight_kg: Mapped[Optional[float]] = mapped_column(nullable=True)
    allergies: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    current_medications: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    medical_conditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    user: Mapped["User"] = relationship(back_populates="health_profile")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    token_hash: Mapped[str] = mapped_column(String(255))
    expires_at: Mapped[datetime]
    revoked: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    
    user: Mapped["User"] = relationship(back_populates="refresh_tokens")

class UserSettings(Base):
    __tablename__ = "settings"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    theme: Mapped[str] = mapped_column(String(20), default="dark")
    notifications_enabled: Mapped[bool] = mapped_column(default=True)
    reminder_time: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    units: Mapped[str] = mapped_column(String(10), default="metric")
    privacy_mode: Mapped[bool] = mapped_column(default=False)
    dashboard_layout: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    user: Mapped["User"] = relationship(back_populates="settings")
