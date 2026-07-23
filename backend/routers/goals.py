from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.utils.auth_utils import get_current_user
from backend.models.user import User

router = APIRouter()

@router.get("/")
async def get_goals(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return []

@router.post("/")
async def create_goal(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "goal created"}

@router.get("/{id}")
async def get_goal(id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return None

@router.put("/{id}")
async def update_goal(id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "goal updated"}

@router.patch("/{id}/progress")
async def update_progress(id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "progress updated"}

@router.patch("/{id}/complete")
async def complete_goal(id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "goal completed"}

@router.delete("/{id}")
async def delete_goal(id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "deleted"}
