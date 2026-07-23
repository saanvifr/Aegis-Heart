from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.utils.auth_utils import get_current_user
from backend.models.user import User

router = APIRouter()

@router.get("/")
async def get_achievements(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return []

@router.get("/earned")
async def get_earned(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return []

@router.get("/stats")
async def get_stats(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"total_earned": 0, "total_available": 12, "total_xp_earned": 0, "rarest_badge": None}
