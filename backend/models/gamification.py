from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlalchemy import String, ForeignKey, Text, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from backend.database import Base

class Achievement(Base):
    __tablename__ = "achievements"
    id: Mapped[int] = mapped_column(primary_key=True)
    badge_id: Mapped[str] = mapped_column(String(50), unique=True)
    badge_name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(String(10))
    rarity: Mapped[str] = mapped_column(String(20))
    xp_reward: Mapped[int] = mapped_column(default=100)
    requirement_type: Mapped[str] = mapped_column(String(50))
    requirement_value: Mapped[int] = mapped_column(default=1)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id"))
    earned_at: Mapped[datetime] = mapped_column(default=func.now())
    
    __table_args__ = (UniqueConstraint("user_id", "achievement_id"),)

class Goal(Base):
    __tablename__ = "goals"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50))
    target_value: Mapped[float]
    current_value: Mapped[float] = mapped_column(default=0)
    unit: Mapped[str] = mapped_column(String(30))
    xp_reward: Mapped[int] = mapped_column(default=100)
    is_completed: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
