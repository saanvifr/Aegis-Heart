from __future__ import annotations
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, ForeignKey, Text, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.database import Base

class DailyHealthLog(Base):
    __tablename__ = "daily_health_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    date: Mapped[date] = mapped_column(index=True)
    weight_kg: Mapped[Optional[float]] = mapped_column(nullable=True)
    heart_rate: Mapped[Optional[int]] = mapped_column(nullable=True)
    systolic_bp: Mapped[Optional[int]] = mapped_column(nullable=True)
    diastolic_bp: Mapped[Optional[int]] = mapped_column(nullable=True)
    blood_sugar: Mapped[Optional[float]] = mapped_column(nullable=True)
    sleep_hours: Mapped[Optional[float]] = mapped_column(nullable=True)
    sleep_quality: Mapped[Optional[int]] = mapped_column(nullable=True)
    mood: Mapped[Optional[int]] = mapped_column(nullable=True)
    stress_level: Mapped[Optional[int]] = mapped_column(nullable=True)
    water_ml: Mapped[Optional[int]] = mapped_column(nullable=True)
    exercise_minutes: Mapped[Optional[int]] = mapped_column(nullable=True)
    calories: Mapped[Optional[int]] = mapped_column(nullable=True)
    steps: Mapped[Optional[int]] = mapped_column(nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_user_date"),)

class Assessment(Base):
    __tablename__ = "assessments"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    input_data: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="completed")
    
    prediction: Mapped[Optional["PredictionHistory"]] = relationship(back_populates="assessment", uselist=False)
