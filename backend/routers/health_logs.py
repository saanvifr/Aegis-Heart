from datetime import date, datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from pydantic import BaseModel

from backend.database import get_db
from backend.models.user import User, Profile
from backend.models.health import DailyHealthLog
from backend.models.gamification import Achievement, UserAchievement
from backend.utils.auth_utils import get_current_user

router = APIRouter(tags=["health_logs"])


class CheckInRequest(BaseModel):
    sleep_hours: Optional[float] = None
    water_ml: Optional[int] = None
    mood: Optional[int] = None
    stress_level: Optional[int] = None
    exercise_minutes: Optional[int] = None
    weight_kg: Optional[float] = None
    heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    blood_sugar: Optional[float] = None
    calories: Optional[int] = None
    steps: Optional[int] = None
    notes: Optional[str] = None


def xp_to_level(xp: int) -> str:
    if xp >= 10000: return "Champion"
    if xp >= 5000:  return "Warrior"
    if xp >= 2500:  return "Guardian"
    if xp >= 1000:  return "Explorer"
    return "Beginner"


def log_to_dict(log: DailyHealthLog) -> dict:
    return {
        "id": log.id,
        "date": log.date.isoformat() if log.date else None,
        "sleep_hours": log.sleep_hours,
        "water_ml": log.water_ml,
        "mood": log.mood,
        "stress_level": log.stress_level,
        "exercise_minutes": log.exercise_minutes,
        "weight_kg": log.weight_kg,
        "heart_rate": log.heart_rate,
        "systolic_bp": log.systolic_bp,
        "diastolic_bp": log.diastolic_bp,
        "blood_sugar": log.blood_sugar,
        "calories": log.calories,
        "steps": log.steps,
        "notes": log.notes,
        "created_at": log.created_at.isoformat() if log.created_at else None,
    }


async def update_streak(user_id: int, profile: Profile, today: date, db: AsyncSession):
    """Update streak based on consecutive daily logs."""
    yesterday = today - timedelta(days=1)
    
    if profile.last_checkin_date == yesterday:
        profile.streak_days = (profile.streak_days or 0) + 1
    elif profile.last_checkin_date != today:
        profile.streak_days = 1
    # If last_checkin_date == today, already checked in, no update needed
    
    profile.last_checkin_date = today

    # Check streak achievements
    streak = profile.streak_days or 0
    badge_map = {7: "streak_7", 30: "streak_30"}
    for threshold, badge_id in badge_map.items():
        if streak >= threshold:
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
                    profile.xp = (profile.xp or 0) + ach.xp_reward
                    profile.level = xp_to_level(profile.xp)


@router.post("/checkin")
async def checkin(
    body: CheckInRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()

    # Upsert today's log
    result = await db.execute(
        select(DailyHealthLog).where(
            DailyHealthLog.user_id == current_user.id,
            DailyHealthLog.date == today
        )
    )
    log = result.scalar_one_or_none()
    xp_awarded = 0

    if not log:
        log = DailyHealthLog(user_id=current_user.id, date=today)
        db.add(log)
        xp_awarded = 50  # Only award XP for first check-in of the day

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(log, field, value)

    # Update profile XP and streak
    pr = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = pr.scalar_one_or_none()
    if not profile:
        profile = Profile(user_id=current_user.id, xp=0, level="Beginner", streak_days=0)
        db.add(profile)

    if xp_awarded > 0:
        profile.xp = (profile.xp or 0) + xp_awarded
        profile.level = xp_to_level(profile.xp)
        await update_streak(current_user.id, profile, today, db)

    await db.commit()
    await db.refresh(log)

    return {**log_to_dict(log), "xp_awarded": xp_awarded, "streak": profile.streak_days}


@router.get("/today")
async def get_today(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    today = date.today()
    result = await db.execute(
        select(DailyHealthLog).where(
            DailyHealthLog.user_id == current_user.id,
            DailyHealthLog.date == today
        )
    )
    log = result.scalar_one_or_none()
    return log_to_dict(log) if log else None


@router.get("/history")
async def get_history(
    page: int = 1,
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    result = await db.execute(
        select(DailyHealthLog)
        .where(DailyHealthLog.user_id == current_user.id)
        .order_by(desc(DailyHealthLog.date))
        .offset(offset).limit(limit)
    )
    logs = result.scalars().all()
    return {"items": [log_to_dict(l) for l in logs], "total": len(logs), "page": page, "limit": limit}


@router.get("/trends/weekly")
async def weekly_trends(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    today = date.today()
    week_ago = today - timedelta(days=6)
    result = await db.execute(
        select(DailyHealthLog)
        .where(
            DailyHealthLog.user_id == current_user.id,
            DailyHealthLog.date >= week_ago
        )
        .order_by(DailyHealthLog.date)
    )
    logs = result.scalars().all()
    log_map = {l.date: l for l in logs}

    dates, sleep, water, mood, stress, exercise = [], [], [], [], [], []
    for i in range(7):
        d = week_ago + timedelta(days=i)
        dates.append(d.isoformat())
        l = log_map.get(d)
        sleep.append(l.sleep_hours if l else None)
        water.append(l.water_ml if l else None)
        mood.append(l.mood if l else None)
        stress.append(l.stress_level if l else None)
        exercise.append(l.exercise_minutes if l else None)

    return {"dates": dates, "sleep": sleep, "water": water, "mood": mood, "stress": stress, "exercise": exercise}


@router.get("/trends/monthly")
async def monthly_trends(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    today = date.today()
    month_ago = today - timedelta(days=29)
    result = await db.execute(
        select(DailyHealthLog)
        .where(
            DailyHealthLog.user_id == current_user.id,
            DailyHealthLog.date >= month_ago
        )
        .order_by(DailyHealthLog.date)
    )
    logs = result.scalars().all()
    return {"items": [log_to_dict(l) for l in logs], "total": len(logs)}


@router.get("/summary")
async def summary(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    today = date.today()
    month_ago = today - timedelta(days=29)
    result = await db.execute(
        select(DailyHealthLog)
        .where(
            DailyHealthLog.user_id == current_user.id,
            DailyHealthLog.date >= month_ago
        )
    )
    logs = result.scalars().all()
    if not logs:
        return {"avg_sleep": None, "avg_water": None, "avg_mood": None, "avg_stress": None, "avg_exercise": None, "total_logs": 0}

    def avg(vals): return round(sum(v for v in vals if v is not None) / max(len([v for v in vals if v is not None]), 1), 1)

    return {
        "avg_sleep": avg([l.sleep_hours for l in logs]),
        "avg_water": avg([l.water_ml for l in logs]),
        "avg_mood": avg([l.mood for l in logs]),
        "avg_stress": avg([l.stress_level for l in logs]),
        "avg_exercise": avg([l.exercise_minutes for l in logs]),
        "total_logs": len(logs),
    }
