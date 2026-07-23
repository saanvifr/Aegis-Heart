from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.utils.auth_utils import get_current_user, require_role
from backend.models.user import User

router = APIRouter()

@router.get("/patients")
async def get_patients(user: User = Depends(require_role("doctor")), db: AsyncSession = Depends(get_db)):
    return []

@router.get("/patients/search")
async def search_patients(q: str, user: User = Depends(require_role("doctor")), db: AsyncSession = Depends(get_db)):
    return []

@router.get("/patient/{id}/history")
async def patient_history(id: int, user: User = Depends(require_role("doctor")), db: AsyncSession = Depends(get_db)):
    return {"items": [], "total": 0, "page": 1, "limit": 10}

@router.get("/patient/{id}/profile")
async def patient_profile(id: int, user: User = Depends(require_role("doctor")), db: AsyncSession = Depends(get_db)):
    return {}

@router.get("/patient/{id}/logs")
async def patient_logs(id: int, user: User = Depends(require_role("doctor")), db: AsyncSession = Depends(get_db)):
    return []

@router.post("/patient/{id}/note")
async def add_note(id: int, user: User = Depends(require_role("doctor")), db: AsyncSession = Depends(get_db)):
    return {"message": "note added"}

@router.get("/patient/{id}/notes")
async def get_notes(id: int, user: User = Depends(require_role("doctor")), db: AsyncSession = Depends(get_db)):
    return []
