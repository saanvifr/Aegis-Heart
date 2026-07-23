from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlalchemy import String, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.database import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    assessment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("assessments.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    risk_percentage: Mapped[float]
    risk_category: Mapped[str] = mapped_column(String(50))
    confidence_score: Mapped[float]
    health_score: Mapped[float]
    model_used: Mapped[str] = mapped_column(String(50))
    shap_values: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    recommendation: Mapped[str] = mapped_column(Text)
    digital_heart_state: Mapped[str] = mapped_column(String(20), default="healthy")
    
    assessment: Mapped[Optional["Assessment"]] = relationship(back_populates="prediction")

class DigitalHeartHistory(Base):
    __tablename__ = "digital_heart_history"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    prediction_id: Mapped[Optional[int]] = mapped_column(ForeignKey("prediction_history.id"), nullable=True)
    state: Mapped[str] = mapped_column(String(20))
    pulse_rate: Mapped[int]
    artery_health: Mapped[float]
    color_hex: Mapped[str] = mapped_column(String(10))
    recorded_at: Mapped[datetime] = mapped_column(default=func.now())
