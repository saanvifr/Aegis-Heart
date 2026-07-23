import json
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from backend.database import get_db
from backend.models.user import User, Profile
from backend.models.health import DailyHealthLog
from backend.models.predictions import PredictionHistory
from backend.models.gamification import Achievement, UserAchievement, Goal
from backend.utils.auth_utils import get_current_user

router = APIRouter(tags=["dashboard"])


@router.get("/overview")
async def overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()

    # ── User + Profile ───────────────────────────────────────────────────────
    pr = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = pr.scalar_one_or_none()

    user_data = {
        "name": profile.full_name if profile else current_user.email.split("@")[0],
        "xp": profile.xp if profile else 0,
        "level": profile.level if profile else "Beginner",
        "streak": profile.streak_days if profile else 0,
        "avatar_url": profile.avatar_url if profile else None,
    }

    # ── Latest Prediction ────────────────────────────────────────────────────
    pred_r = await db.execute(
        select(PredictionHistory)
        .where(PredictionHistory.user_id == current_user.id)
        .order_by(desc(PredictionHistory.created_at))
        .limit(1)
    )
    latest_pred = pred_r.scalar_one_or_none()
    latest_prediction = None
    if latest_pred:
        try:
            shap = json.loads(latest_pred.shap_values) if latest_pred.shap_values else []
        except Exception:
            shap = []
        latest_prediction = {
            "id": latest_pred.id,
            "risk_percentage": latest_pred.risk_percentage,
            "risk_category": latest_pred.risk_category,
            "health_score": latest_pred.health_score,
            "digital_heart_state": latest_pred.digital_heart_state,
            "confidence_score": latest_pred.confidence_score,
            "recommendation": latest_pred.recommendation,
            "shap_factors": shap,
            "created_at": latest_pred.created_at.isoformat() if latest_pred.created_at else None,
        }

    # ── Today Check-in ───────────────────────────────────────────────────────
    log_r = await db.execute(
        select(DailyHealthLog).where(
            DailyHealthLog.user_id == current_user.id,
            DailyHealthLog.date == today
        )
    )
    today_log = log_r.scalar_one_or_none()

    # ── Weekly Trends ────────────────────────────────────────────────────────
    week_ago = today - timedelta(days=6)
    logs_r = await db.execute(
        select(DailyHealthLog)
        .where(DailyHealthLog.user_id == current_user.id, DailyHealthLog.date >= week_ago)
        .order_by(DailyHealthLog.date)
    )
    week_logs = logs_r.scalars().all()
    log_map = {l.date: l for l in week_logs}

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

    # ── Recent Predictions (5) ───────────────────────────────────────────────
    preds_r = await db.execute(
        select(PredictionHistory)
        .where(PredictionHistory.user_id == current_user.id)
        .order_by(desc(PredictionHistory.created_at))
        .limit(5)
    )
    recent_preds = [
        {"id": p.id, "risk_percentage": p.risk_percentage, "risk_category": p.risk_category,
         "health_score": p.health_score, "created_at": p.created_at.isoformat() if p.created_at else None}
        for p in preds_r.scalars().all()
    ]

    # ── Goals ────────────────────────────────────────────────────────────────
    goals_r = await db.execute(select(Goal).where(Goal.user_id == current_user.id))
    all_goals = goals_r.scalars().all()
    active_goals = [g for g in all_goals if not g.is_completed]
    completed_goals = [g for g in all_goals if g.is_completed]
    goals_pct = round(len(completed_goals) / max(len(all_goals), 1) * 100, 0) if all_goals else 0

    # ── Recent Achievements ──────────────────────────────────────────────────
    ua_r = await db.execute(
        select(UserAchievement, Achievement)
        .join(Achievement, UserAchievement.achievement_id == Achievement.id)
        .where(UserAchievement.user_id == current_user.id)
        .order_by(desc(UserAchievement.earned_at))
        .limit(3)
    )
    recent_achievements = [
        {"name": a.badge_name, "icon": a.icon, "earned_at": ua.earned_at.isoformat() if ua.earned_at else None}
        for ua, a in ua_r.all()
    ]

    # ── Health Score Trend (last 7 predictions) ──────────────────────────────
    hs_r = await db.execute(
        select(PredictionHistory)
        .where(PredictionHistory.user_id == current_user.id)
        .order_by(desc(PredictionHistory.created_at))
        .limit(7)
    )
    hs_trend = [
        {"date": p.created_at.date().isoformat() if p.created_at else None, "health_score": p.health_score}
        for p in hs_r.scalars().all()
    ]

    return {
        "user": user_data,
        "latest_prediction": latest_prediction,
        "today_checkin": today_log is not None,
        "checkin_data": {
            "sleep_hours": today_log.sleep_hours if today_log else None,
            "water_ml": today_log.water_ml if today_log else None,
            "mood": today_log.mood if today_log else None,
        } if today_log else None,
        "weekly_trends": {"dates": dates, "sleep": sleep, "water": water, "mood": mood, "stress": stress, "exercise": exercise},
        "recent_predictions": recent_preds,
        "notifications_unread": 0,
        "achievements_recent": recent_achievements,
        "goals_active": len(active_goals),
        "goals_completed_pct": goals_pct,
        "health_score_trend": hs_trend,
    }


@router.get("/health-score-history")
async def health_score_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PredictionHistory)
        .where(PredictionHistory.user_id == current_user.id)
        .order_by(desc(PredictionHistory.created_at))
        .limit(30)
    )
    return [
        {
            "date": p.created_at.date().isoformat() if p.created_at else None,
            "health_score": p.health_score,
            "risk_percentage": p.risk_percentage,
        }
        for p in result.scalars().all()
    ]
