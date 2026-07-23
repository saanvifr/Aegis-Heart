from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.utils.auth_utils import get_current_user
from backend.models.user import User

router = APIRouter()

@router.get("/data")
async def passport_data(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {
        "profile": {},
        "health_profile": {},
        "latest_prediction": None,
        "achievements_earned": {"count": 0, "top": []},
        "digital_heart": None,
        "total_assessments": 0,
        "member_since": None
    }

@router.post("/pdf")
async def passport_pdf(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"message": "file download not implemented"}
