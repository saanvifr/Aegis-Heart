from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.utils.auth_utils import get_current_user
from backend.models.user import User

router = APIRouter()

@router.post("/run")
async def run_simulator(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "simulator run"}

@router.post("/compare")
async def compare_profiles(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "comparison completed"}
