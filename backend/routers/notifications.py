from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.utils.auth_utils import get_current_user
from backend.models.user import User

router = APIRouter()

@router.get("/")
async def get_notifications(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"items": [], "unread_count": 0, "total": 0}

@router.get("/unread-count")
async def unread_count(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"count": 0}

@router.patch("/{id}/read")
async def mark_read(id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "marked read"}

@router.patch("/read-all")
async def mark_all_read(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "all marked read"}

@router.delete("/{id}")
async def delete_notification(id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "deleted"}
