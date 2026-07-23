"""
models.py - SQLAlchemy ORM models for Aegis Heart.
All tables are created automatically by main.py on startup via Base.metadata.create_all.
"""

from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, Float, String, Boolean, Date, DateTime,
    Text, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    """Application user — patient, doctor, or admin."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum("user", "doctor", "admin", name="user_role"), default="user", nullable=False)

    # Gamification
    level = Column(String(50), default="Beginner", nullable=False)
    xp = Column(Integer, default=0, nullable=False)
    streak_days = Column(Integer, default=0, nullable=False)
    last_checkin_date = Column(Date, nullable=True)

    # Profile
    avatar_url = Column(String(512), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    health_logs = relationship("HealthLog", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class HealthLog(Base):
    """Daily health check-in log for a user."""
    __tablename__ = "health_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)

    # Vitals & lifestyle
    sleep_hours = Column(Float, nullable=True)
    water_ml = Column(Float, nullable=True)
    mood = Column(Integer, nullable=True)            # 1-10
    stress_level = Column(Integer, nullable=True)   # 1-10
    exercise_minutes = Column(Integer, nullable=True)
    systolic_bp = Column(Integer, nullable=True)
    diastolic_bp = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    blood_sugar = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="health_logs")


class Prediction(Base):
    """Stored cardiovascular risk prediction result."""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    risk_percentage = Column(Float, nullable=False)
    risk_category = Column(String(50), nullable=False)
    confidence_score = Column(Float, nullable=True)
    digital_twin_state = Column(String(50), nullable=True)
    recommendation = Column(Text, nullable=True)

    # Stored as JSON strings
    input_data = Column(Text, nullable=True)    # JSON of AssessmentInput
    shap_factors = Column(Text, nullable=True)  # JSON list

    user = relationship("User", back_populates="predictions")


class Goal(Base):
    """User-defined health goal with progress tracking."""
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_value = Column(Float, nullable=True)
    current_value = Column(Float, default=0.0, nullable=False)
    unit = Column(String(50), nullable=True)
    category = Column(String(100), nullable=True)   # e.g. "fitness", "nutrition"
    is_completed = Column(Boolean, default=False, nullable=False)
    xp_reward = Column(Integer, default=200, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="goals")


class Achievement(Base):
    """Badge / achievement earned by a user."""
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    badge_id = Column(String(100), nullable=False)
    badge_name = Column(String(255), nullable=False)
    badge_description = Column(Text, nullable=True)
    badge_icon = Column(String(512), nullable=True)
    earned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    xp_awarded = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="achievements")


class JournalEntry(Base):
    """Personal wellness journal entry."""
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)

    content = Column(Text, nullable=False)
    mood_score = Column(Integer, nullable=True)  # 1-10
    tags = Column(String(512), nullable=True)    # comma-separated

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="journal_entries")


class Notification(Base):
    """In-app notification for a user."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(
        SAEnum("info", "success", "warning", "alert", name="notification_type"),
        default="info",
        nullable=False,
    )
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")
