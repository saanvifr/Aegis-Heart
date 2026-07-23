from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.utils.auth_utils import get_current_user
from backend.models.user import User

router = APIRouter()

@router.get("/")
async def get_journal(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"items": [], "total": 0, "page": 1, "limit": 10}

@router.post("/")
async def create_entry(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "entry created"}

@router.put("/{id}")
async def update_entry(id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "entry updated"}

@router.delete("/{id}")
async def delete_entry(id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "deleted"}
