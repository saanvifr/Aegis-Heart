from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.future import select
import os

from backend.database import init_db, AsyncSessionLocal
from backend.config import get_settings
from backend.models.gamification import Achievement
from backend.routers import (
    auth, user, health_logs, predictions, simulator, goals, achievements, 
    notifications, reports, journal, dashboard, doctor, admin, passport
)

settings = get_settings()

ACHIEVEMENT_CATALOG = [
    {"badge_id": "first_login", "badge_name": "First Step", "description": "Logged into Aegis Heart", "icon": "⭐", "rarity": "common", "xp_reward": 50, "requirement_type": "login", "requirement_value": 1},
    {"badge_id": "first_prediction", "badge_name": "Risk Scout", "description": "Completed first risk assessment", "icon": "🔬", "rarity": "common", "xp_reward": 100, "requirement_type": "predictions", "requirement_value": 1},
    {"badge_id": "streak_7", "badge_name": "7-Day Warrior", "description": "7-day health streak", "icon": "🔥", "rarity": "rare", "xp_reward": 200, "requirement_type": "streak", "requirement_value": 7},
    {"badge_id": "streak_30", "badge_name": "30-Day Champion", "description": "30-day health streak", "icon": "⚡", "rarity": "epic", "xp_reward": 500, "requirement_type": "streak", "requirement_value": 30},
    {"badge_id": "hydration_hero", "badge_name": "Hydration Hero", "description": "Hit water goal 5 days", "icon": "💧", "rarity": "rare", "xp_reward": 150, "requirement_type": "water_goal", "requirement_value": 5},
    {"badge_id": "sleep_master", "badge_name": "Sleep Master", "description": "Logged 8h sleep for a week", "icon": "🌙", "rarity": "rare", "xp_reward": 200, "requirement_type": "sleep_goal", "requirement_value": 7},
    {"badge_id": "goal_crusher", "badge_name": "Goal Crusher", "description": "Completed first health goal", "icon": "🎯", "rarity": "rare", "xp_reward": 200, "requirement_type": "goals_completed", "requirement_value": 1},
    {"badge_id": "heart_warrior", "badge_name": "Heart Warrior", "description": "30 consecutive days on platform", "icon": "❤️", "rarity": "epic", "xp_reward": 500, "requirement_type": "days_active", "requirement_value": 30},
    {"badge_id": "stress_buster", "badge_name": "Stress Buster", "description": "14 consecutive mood logs", "icon": "🧠", "rarity": "rare", "xp_reward": 300, "requirement_type": "mood_logs", "requirement_value": 14},
    {"badge_id": "predict_10", "badge_name": "Risk Analyst", "description": "10 risk assessments", "icon": "🛡️", "rarity": "rare", "xp_reward": 300, "requirement_type": "predictions", "requirement_value": 10},
    {"badge_id": "predict_50", "badge_name": "ML Master", "description": "50 risk assessments", "icon": "🤖", "rarity": "legendary", "xp_reward": 1000, "requirement_type": "predictions", "requirement_value": 50},
    {"badge_id": "legend", "badge_name": "Cardiovascular Legend", "description": "Perfect heart health 90 days", "icon": "👑", "rarity": "legendary", "xp_reward": 2000, "requirement_type": "low_risk_streak", "requirement_value": 90},
]

async def seed_achievements():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Achievement).limit(1))
        existing = result.scalar_one_or_none()
        if not existing:
            for item in ACHIEVEMENT_CATALOG:
                a = Achievement(**item)
                db.add(a)
            await db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_achievements()
    os.makedirs("backend/reports", exist_ok=True)
    yield

app = FastAPI(
    title="Aegis Heart API v2",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(health_logs.router, prefix="/api/health-logs", tags=["Health Logs"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(simulator.router, prefix="/api/simulator", tags=["Simulator"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(achievements.router, prefix="/api/achievements", tags=["Achievements"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(journal.router, prefix="/api/journal", tags=["Journal"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(doctor.router, prefix="/api/doctor", tags=["Doctor"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(passport.router, prefix="/api/passport", tags=["Passport"])

@app.post("/api/predict")
async def predict_compat(data: dict):
    return {"message": "compat route ok"}

if os.path.exists("backend/reports"):
    app.mount("/reports", StaticFiles(directory="backend/reports"), name="reports")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "2.0.0"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})
