from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional

from backend.database import get_db
from backend.models.user import User, Profile, HealthProfile, UserSettings
from backend.utils.auth_utils import get_current_user

router = APIRouter(tags=["user"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None

class HealthProfileUpdate(BaseModel):
    blood_group: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    medical_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None

class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    reminder_time: Optional[str] = None
    units: Optional[str] = None
    privacy_mode: Optional[bool] = None
    dashboard_layout: Optional[str] = None

class AddXPRequest(BaseModel):
    amount: int
    reason: str = ""


def xp_to_level(xp: int) -> str:
    if xp >= 10000: return "Champion"
    if xp >= 5000:  return "Warrior"
    if xp >= 2500:  return "Guardian"
    if xp >= 1000:  return "Explorer"
    return "Beginner"


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pr = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = pr.scalar_one_or_none()
    hp = await db.execute(select(HealthProfile).where(HealthProfile.user_id == current_user.id))
    health = hp.scalar_one_or_none()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
        "profile": {
            "full_name": profile.full_name if profile else "",
            "avatar_url": profile.avatar_url if profile else None,
            "phone": profile.phone if profile else None,
            "date_of_birth": profile.date_of_birth.isoformat() if profile and profile.date_of_birth else None,
            "gender": profile.gender if profile else None,
            "xp": profile.xp if profile else 0,
            "level": profile.level if profile else "Beginner",
            "streak_days": profile.streak_days if profile else 0,
        },
        "health_profile": {
            "blood_group": health.blood_group if health else None,
            "height_cm": health.height_cm if health else None,
            "weight_kg": health.weight_kg if health else None,
            "allergies": health.allergies if health else None,
            "current_medications": health.current_medications if health else None,
            "medical_conditions": health.medical_conditions if health else None,
            "emergency_contact": health.emergency_contact if health else None,
        } if health else None
    }


@router.put("/profile")
async def update_profile(body: ProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pr = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = pr.scalar_one_or_none()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    await db.commit()
    return {"message": "Profile updated"}


@router.put("/health-profile")
async def update_health_profile(body: HealthProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    hp = await db.execute(select(HealthProfile).where(HealthProfile.user_id == current_user.id))
    health = hp.scalar_one_or_none()
    if not health:
        health = HealthProfile(user_id=current_user.id)
        db.add(health)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(health, field, value)
    await db.commit()
    return {"message": "Health profile updated"}


@router.get("/stats")
async def get_stats(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from backend.models.health import DailyHealthLog
    from backend.models.predictions import PredictionHistory
    from sqlalchemy import func as sqlfunc

    pr = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = pr.scalar_one_or_none()

    logs_count_r = await db.execute(select(sqlfunc.count()).where(DailyHealthLog.user_id == current_user.id))
    preds_count_r = await db.execute(select(sqlfunc.count()).where(PredictionHistory.user_id == current_user.id))

    return {
        "xp": profile.xp if profile else 0,
        "level": profile.level if profile else "Beginner",
        "streak_days": profile.streak_days if profile else 0,
        "total_logs": logs_count_r.scalar() or 0,
        "total_predictions": preds_count_r.scalar() or 0,
    }


@router.post("/add-xp")
async def add_xp(body: AddXPRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pr = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = pr.scalar_one_or_none()
    if not profile:
        profile = Profile(user_id=current_user.id, xp=0, level="Beginner")
        db.add(profile)
    profile.xp = (profile.xp or 0) + body.amount
    profile.level = xp_to_level(profile.xp)
    await db.commit()
    return {"xp": profile.xp, "level": profile.level}


@router.get("/settings")
async def get_settings_route(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    s = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    settings = s.scalar_one_or_none()
    if not settings:
        return {"theme": "dark", "notifications_enabled": True, "reminder_time": None, "units": "metric", "privacy_mode": False}
    return {
        "theme": settings.theme,
        "notifications_enabled": settings.notifications_enabled,
        "reminder_time": settings.reminder_time,
        "units": settings.units,
        "privacy_mode": settings.privacy_mode,
        "dashboard_layout": settings.dashboard_layout,
    }


@router.put("/settings")
async def update_settings(body: SettingsUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    s = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    settings = s.scalar_one_or_none()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(settings, field, value)
    await db.commit()
    return {"message": "Settings updated"}
