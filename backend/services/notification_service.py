import json
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.social import Notification

async def create_notification(user_id: int, title: str, message: str, type: str, metadata: dict, db: AsyncSession):
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        metadata=json.dumps(metadata) if metadata else None
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif

async def trigger_checkin_reminder(user_id: int, db: AsyncSession):
    await create_notification(user_id, "Check-in Reminder", "Don't forget to log your health today!", "info", None, db)

async def trigger_goal_achieved(user_id: int, goal, db: AsyncSession):
    await create_notification(user_id, "Goal Achieved!", f"You completed: {goal.title}", "success", {"goal_id": goal.id}, db)

async def trigger_risk_changed(user_id: int, old_risk: float, new_risk: float, db: AsyncSession):
    if new_risk - old_risk > 10:
        await create_notification(user_id, "Risk Alert", "Your risk score increased significantly.", "warning", None, db)

async def trigger_achievement_earned(user_id: int, achievement, db: AsyncSession):
    await create_notification(user_id, "Achievement Unlocked!", f"You earned the {achievement.badge_name} badge!", "success", {"badge_id": achievement.badge_id}, db)
