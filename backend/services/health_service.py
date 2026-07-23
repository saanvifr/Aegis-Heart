import logging
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.health import DailyHealthLog
from datetime import date, timedelta
from sqlalchemy.future import select
from backend.models.user import Profile

logger = logging.getLogger(__name__)

async def calculate_health_score(log: DailyHealthLog, risk_pct: float) -> float:
    score = 100.0 - risk_pct
    return max(0.0, min(100.0, score))

async def update_streak(user_id: int, db: AsyncSession):
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if profile:
        today = date.today()
        if profile.last_checkin_date == today - timedelta(days=1):
            profile.streak_days += 1
        elif profile.last_checkin_date != today:
            profile.streak_days = 1
        profile.last_checkin_date = today
        await db.commit()

async def award_xp(user_id: int, amount: int, db: AsyncSession):
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if profile:
        profile.xp += amount
        if profile.xp > 1000:
            profile.level = "Advanced"
        elif profile.xp > 500:
            profile.level = "Intermediate"
        await db.commit()

async def check_achievements(user_id: int, db: AsyncSession):
    return []

async def get_weekly_trend(user_id: int, field: str, db: AsyncSession):
    return {}

async def get_monthly_trend(user_id: int, field: str, db: AsyncSession):
    return {}
