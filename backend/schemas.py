"""
schemas.py - Pydantic v2 schemas for all Aegis Heart models.
Includes separate request (Create/Update) and response schemas.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

class OrmBase(BaseModel):
    """Base schema that enables ORM mode for all response models."""
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# User schemas
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1, max_length=255)
    role: str = Field(default="user", pattern="^(user|doctor|admin)$")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    avatar_url: Optional[str] = Field(default=None, max_length=512)


class UserResponse(OrmBase):
    id: int
    email: str
    full_name: str
    role: str
    level: str
    xp: int
    streak_days: int
    last_checkin_date: Optional[date]
    avatar_url: Optional[str]
    is_verified: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# ---------------------------------------------------------------------------
# HealthLog schemas
# ---------------------------------------------------------------------------

class HealthLogCreate(BaseModel):
    date: Optional[date] = None                     # defaults to today in router
    sleep_hours: Optional[float] = Field(default=None, ge=0, le=24)
    water_ml: Optional[float] = Field(default=None, ge=0)
    mood: Optional[int] = Field(default=None, ge=1, le=10)
    stress_level: Optional[int] = Field(default=None, ge=1, le=10)
    exercise_minutes: Optional[int] = Field(default=None, ge=0)
    systolic_bp: Optional[int] = Field(default=None, ge=60, le=300)
    diastolic_bp: Optional[int] = Field(default=None, ge=40, le=200)
    weight_kg: Optional[float] = Field(default=None, ge=1)
    blood_sugar: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = None


class HealthLogResponse(OrmBase):
    id: int
    user_id: int
    date: date
    sleep_hours: Optional[float]
    water_ml: Optional[float]
    mood: Optional[int]
    stress_level: Optional[int]
    exercise_minutes: Optional[int]
    systolic_bp: Optional[int]
    diastolic_bp: Optional[int]
    weight_kg: Optional[float]
    blood_sugar: Optional[float]
    notes: Optional[str]
    created_at: datetime


class WeeklySummary(BaseModel):
    avg_sleep_hours: Optional[float]
    avg_water_ml: Optional[float]
    avg_mood: Optional[float]
    avg_stress_level: Optional[float]
    avg_exercise_minutes: Optional[float]
    avg_systolic_bp: Optional[float]
    avg_diastolic_bp: Optional[float]
    avg_weight_kg: Optional[float]
    days_logged: int


# ---------------------------------------------------------------------------
# Prediction schemas
# ---------------------------------------------------------------------------

class PredictionCreate(BaseModel):
    risk_percentage: float = Field(ge=0, le=100)
    risk_category: str
    confidence_score: Optional[float] = None
    digital_twin_state: Optional[str] = None
    recommendation: Optional[str] = None
    input_data: Optional[Dict[str, Any]] = None
    shap_factors: Optional[List[Dict[str, Any]]] = None


class PredictionResponse(OrmBase):
    id: int
    user_id: int
    created_at: datetime
    risk_percentage: float
    risk_category: str
    confidence_score: Optional[float]
    digital_twin_state: Optional[str]
    recommendation: Optional[str]
    input_data: Optional[str]   # raw JSON string as stored
    shap_factors: Optional[str] # raw JSON string as stored


# ---------------------------------------------------------------------------
# Goal schemas
# ---------------------------------------------------------------------------

class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    target_value: Optional[float] = None
    current_value: float = 0.0
    unit: Optional[str] = Field(default=None, max_length=50)
    category: Optional[str] = Field(default=None, max_length=100)
    xp_reward: int = Field(default=200, ge=0)


class GoalProgressUpdate(BaseModel):
    current_value: float = Field(ge=0)


class GoalResponse(OrmBase):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    target_value: Optional[float]
    current_value: float
    unit: Optional[str]
    category: Optional[str]
    is_completed: bool
    xp_reward: int
    created_at: datetime
    completed_at: Optional[datetime]


# ---------------------------------------------------------------------------
# Achievement schemas
# ---------------------------------------------------------------------------

class AchievementCreate(BaseModel):
    badge_id: str
    badge_name: str
    badge_description: Optional[str] = None
    badge_icon: Optional[str] = None
    xp_awarded: int = 0


class AchievementResponse(OrmBase):
    id: int
    user_id: int
    badge_id: str
    badge_name: str
    badge_description: Optional[str]
    badge_icon: Optional[str]
    earned_at: datetime
    xp_awarded: int


# ---------------------------------------------------------------------------
# JournalEntry schemas
# ---------------------------------------------------------------------------

class JournalEntryCreate(BaseModel):
    date: Optional[date] = None
    content: str = Field(min_length=1)
    mood_score: Optional[int] = Field(default=None, ge=1, le=10)
    tags: Optional[str] = None   # comma-separated


class JournalEntryResponse(OrmBase):
    id: int
    user_id: int
    date: date
    content: str
    mood_score: Optional[int]
    tags: Optional[str]
    created_at: datetime


# ---------------------------------------------------------------------------
# Notification schemas
# ---------------------------------------------------------------------------

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = Field(default="info", pattern="^(info|success|warning|alert)$")


class NotificationResponse(OrmBase):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime


# ---------------------------------------------------------------------------
# XP / level schemas
# ---------------------------------------------------------------------------

class AddXPRequest(BaseModel):
    amount: int = Field(gt=0, description="XP points to add")


class AddXPResponse(BaseModel):
    new_xp: int
    new_level: str
    leveled_up: bool


# ---------------------------------------------------------------------------
# Dashboard schema
# ---------------------------------------------------------------------------

class DashboardOverview(BaseModel):
    streak: int
    xp: int
    level: str
    latest_prediction: Optional[PredictionResponse]
    today_checkin_done: bool
    health_score: Optional[float]
    recent_logs: List[HealthLogResponse]
    achievements_count: int


# ---------------------------------------------------------------------------
# User stats schema
# ---------------------------------------------------------------------------

class UserStats(BaseModel):
    xp: int
    level: str
    streak_days: int
    total_predictions: int
    total_logs: int
