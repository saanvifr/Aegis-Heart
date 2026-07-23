import json
from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from pydantic import BaseModel

from backend.database import get_db
from backend.models.user import User, Profile
from backend.models.health import Assessment, DailyHealthLog
from backend.models.predictions import PredictionHistory, DigitalHeartHistory
from backend.models.gamification import Achievement, UserAchievement
from backend.utils.auth_utils import get_current_user

router = APIRouter(tags=["predictions"])

try:
    from backend.ml.predict import predict_risk, is_model_ready
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

# ── Helpers ──────────────────────────────────────────────────────────────────

def xp_to_level(xp: int) -> str:
    if xp >= 10000: return "Champion"
    if xp >= 5000:  return "Warrior"
    if xp >= 2500:  return "Guardian"
    if xp >= 1000:  return "Explorer"
    return "Beginner"


def risk_fallback(data: dict) -> dict:
    """Clinical formula fallback when ML model is unavailable."""
    age = data.get("age", 50)
    chol = data.get("cholesterol", 200)
    sbp = data.get("systolic_bp", 120)
    smoke = data.get("smoking", 0)
    
    risk = (age * 0.4) + (chol * 0.05) + (sbp * 0.1) + (smoke * 15) - 30
    risk = max(5, min(95, risk))
    health_score = round(100 - risk * 0.9, 1)
    
    if risk < 20:   cat = "Low Risk"
    elif risk < 40: cat = "Moderate Risk"
    elif risk < 60: cat = "High Risk"
    else:           cat = "Critical Risk"

    if risk < 20:   state = "healthy"
    elif risk < 40: state = "warning"
    elif risk < 60: state = "danger"
    else:           state = "critical"

    return {
        "risk_percentage": round(risk, 1),
        "risk_category": cat,
        "confidence_score": 72.0,
        "health_score": health_score,
        "digital_heart_state": state,
        "model_used": "clinical_formula",
        "explanation": "Estimated using clinical risk formula. Train the ML model for AI-powered predictions.",
        "recommendation": "Schedule a cardiology screening. Maintain healthy lifestyle habits.",
        "shap_factors": [
            {"feature": "Age", "impact_percentage": round(age * 0.4, 1), "direction": "increase" if age > 45 else "decrease", "title": "Age", "description": "Primary cardiovascular risk factor."},
            {"feature": "Systolic_BP", "impact_percentage": round(sbp * 0.1, 1), "direction": "increase" if sbp > 130 else "neutral", "title": "Systolic Blood Pressure", "description": "Elevated BP strains arteries."},
        ]
    }


async def award_xp_and_check_achievements(user_id: int, profile: Profile, xp_amount: int,
                                           pred_count: int, db: AsyncSession):
    """Award XP and unlock achievements based on prediction count."""
    profile.xp = (profile.xp or 0) + xp_amount
    profile.level = xp_to_level(profile.xp)

    # Check prediction-based achievements
    achievements_to_check = []
    if pred_count == 1:
        achievements_to_check.append("first_prediction")
    if pred_count >= 10:
        achievements_to_check.append("predict_10")
    if pred_count >= 50:
        achievements_to_check.append("predict_50")

    for badge_id in achievements_to_check:
        ach_r = await db.execute(select(Achievement).where(Achievement.badge_id == badge_id))
        ach = ach_r.scalar_one_or_none()
        if ach:
            existing = await db.execute(
                select(UserAchievement).where(
                    UserAchievement.user_id == user_id,
                    UserAchievement.achievement_id == ach.id
                )
            )
            if not existing.scalar_one_or_none():
                ua = UserAchievement(user_id=user_id, achievement_id=ach.id)
                db.add(ua)
                profile.xp += ach.xp_reward
                profile.level = xp_to_level(profile.xp)


def serialize_prediction(p: PredictionHistory) -> dict:
    shap = []
    try:
        shap = json.loads(p.shap_values) if p.shap_values else []
    except Exception:
        pass
    return {
        "id": p.id,
        "user_id": p.user_id,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "risk_percentage": p.risk_percentage,
        "risk_category": p.risk_category,
        "confidence_score": p.confidence_score,
        "health_score": p.health_score,
        "model_used": p.model_used,
        "digital_heart_state": p.digital_heart_state,
        "explanation": p.explanation,
        "recommendation": p.recommendation,
        "shap_factors": shap,
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/assess")
async def assess(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Run ML or fallback
    if ML_AVAILABLE:
        try:
            result = predict_risk(data)
        except Exception:
            result = risk_fallback(data)
    else:
        result = risk_fallback(data)

    # Save Assessment record
    assessment = Assessment(
        user_id=current_user.id,
        input_data=json.dumps(data),
    )
    db.add(assessment)
    await db.flush()

    # Save PredictionHistory
    pred = PredictionHistory(
        user_id=current_user.id,
        assessment_id=assessment.id,
        risk_percentage=result.get("risk_percentage", 0),
        risk_category=result.get("risk_category", "Unknown"),
        confidence_score=result.get("confidence_score", 0),
        health_score=result.get("health_score", 0),
        model_used=result.get("model_used", "unknown"),
        shap_values=json.dumps(result.get("shap_factors", [])),
        explanation=result.get("explanation", ""),
        recommendation=result.get("recommendation", ""),
        digital_heart_state=result.get("digital_heart_state", "healthy"),
    )
    db.add(pred)
    await db.flush()

    # Save DigitalHeartHistory
    risk = result.get("risk_percentage", 20)
    state = result.get("digital_heart_state", "healthy")
    pulse = max(55, min(120, int(70 + risk * 0.5)))
    artery = max(10, min(100, 100 - risk))
    color_map = {"healthy": "#00ff88", "warning": "#fbbf24", "danger": "#f97316", "critical": "#ef4444"}
    dh = DigitalHeartHistory(
        user_id=current_user.id,
        prediction_id=pred.id,
        state=state,
        pulse_rate=pulse,
        artery_health=artery,
        color_hex=color_map.get(state, "#00ff88"),
    )
    db.add(dh)

    # Count total predictions for achievements
    count_r = await db.execute(
        select(PredictionHistory).where(PredictionHistory.user_id == current_user.id)
    )
    pred_count = len(count_r.scalars().all()) + 1  # +1 for current

    # Load profile & award XP
    pr = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = pr.scalar_one_or_none()
    if not profile:
        profile = Profile(user_id=current_user.id, xp=0, level="Beginner")
        db.add(profile)

    await award_xp_and_check_achievements(current_user.id, profile, 100, pred_count, db)
    await db.commit()

    return {**result, "prediction_id": pred.id, "xp_awarded": 100}


@router.get("/history")
async def history(
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    result = await db.execute(
        select(PredictionHistory)
        .where(PredictionHistory.user_id == current_user.id)
        .order_by(desc(PredictionHistory.created_at))
        .offset(offset).limit(limit)
    )
    preds = result.scalars().all()
    
    count_r = await db.execute(
        select(PredictionHistory).where(PredictionHistory.user_id == current_user.id)
    )
    total = len(count_r.scalars().all())
    
    return {"items": [serialize_prediction(p) for p in preds], "total": total, "page": page, "limit": limit}


@router.get("/latest")
async def latest(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PredictionHistory)
        .where(PredictionHistory.user_id == current_user.id)
        .order_by(desc(PredictionHistory.created_at))
        .limit(1)
    )
    pred = result.scalar_one_or_none()
    if not pred:
        raise HTTPException(status_code=404, detail="No predictions yet")
    return serialize_prediction(pred)


@router.get("/{pred_id}")
async def get_prediction(pred_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PredictionHistory).where(
            PredictionHistory.id == pred_id,
            PredictionHistory.user_id == current_user.id
        )
    )
    pred = result.scalar_one_or_none()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return serialize_prediction(pred)


@router.delete("/{pred_id}")
async def delete_prediction(pred_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PredictionHistory).where(
            PredictionHistory.id == pred_id,
            PredictionHistory.user_id == current_user.id
        )
    )
    pred = result.scalar_one_or_none()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    await db.delete(pred)
    await db.commit()
    return {"message": "Prediction deleted"}
