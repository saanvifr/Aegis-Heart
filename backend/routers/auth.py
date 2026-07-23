from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
import secrets

from backend.database import get_db
from backend.models.user import User, Profile, RefreshToken
from backend.utils.auth_utils import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, get_current_user, decode_access_token, generate_reset_token
)
from backend.config import get_settings

settings = get_settings()
router = APIRouter(tags=["auth"])


# ── Schemas ─────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""
    role: str = "user"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ── Helpers ──────────────────────────────────────────────────────────────────

def xp_to_level(xp: int) -> str:
    if xp >= 10000: return "Champion"
    if xp >= 5000:  return "Warrior"
    if xp >= 2500:  return "Guardian"
    if xp >= 1000:  return "Explorer"
    return "Beginner"

def build_auth_response(user: User, profile: Profile | None, access_token: str, refresh_token: str) -> dict:
    p = profile
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": p.full_name if p else "",
            "avatar_url": p.avatar_url if p else None,
            "xp": p.xp if p else 0,
            "level": p.level if p else "Beginner",
            "streak_days": p.streak_days if p else 0,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    }


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        role=body.role if body.role in ("user", "doctor", "admin") else "user",
        is_verified=True,  # Demo: auto-verify
        verification_token=secrets.token_urlsafe(32),
    )
    db.add(user)
    await db.flush()  # get user.id

    # Create profile
    profile = Profile(user_id=user.id, full_name=body.full_name, xp=0, level="Beginner", streak_days=0)
    db.add(profile)

    # Create refresh token
    raw_rt, hashed_rt = create_refresh_token()
    rt = RefreshToken(
        user_id=user.id,
        token_hash=hashed_rt,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(rt)
    await db.commit()
    await db.refresh(user)
    await db.refresh(profile)

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return build_auth_response(user, profile, access_token, raw_rt)


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    # Load profile
    pr = await db.execute(select(Profile).where(Profile.user_id == user.id))
    profile = pr.scalar_one_or_none()

    # Rotate refresh token: revoke old ones
    old_tokens = await db.execute(select(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked == False))
    for ot in old_tokens.scalars().all():
        ot.revoked = True

    raw_rt, hashed_rt = create_refresh_token()
    rt = RefreshToken(
        user_id=user.id,
        token_hash=hashed_rt,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(rt)
    await db.commit()

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return build_auth_response(user, profile, access_token, raw_rt)


@router.post("/refresh")
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    # Find a matching non-revoked refresh token
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.revoked == False)
    )
    all_tokens = result.scalars().all()
    
    matched = None
    for rt in all_tokens:
        if verify_password(body.refresh_token, rt.token_hash):
            matched = rt
            break
    
    if not matched or matched.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Revoke used token (rotation)
    matched.revoked = True

    # Issue new tokens
    user_result = await db.execute(select(User).where(User.id == matched.user_id))
    user = user_result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    raw_rt, hashed_rt = create_refresh_token()
    new_rt = RefreshToken(
        user_id=user.id,
        token_hash=hashed_rt,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(new_rt)
    await db.commit()

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "refresh_token": raw_rt, "token_type": "bearer"}


@router.post("/logout")
async def logout(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RefreshToken).where(RefreshToken.revoked == False))
    for rt in result.scalars().all():
        if verify_password(body.refresh_token, rt.token_hash):
            rt.revoked = True
            break
    await db.commit()
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if user:
        raw_token, hashed_token = generate_reset_token()
        user.reset_token = hashed_token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        await db.commit()
        # In production: send email. For demo, return the token directly.
        return {
            "message": "Password reset instructions sent",
            "demo_reset_token": raw_token,  # Remove in production
            "expires_in_minutes": 60
        }
    # Don't reveal whether email exists
    return {"message": "Password reset instructions sent"}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.reset_token != None))
    users = result.scalars().all()
    
    matched_user = None
    for u in users:
        if u.reset_token and verify_password(body.token, u.reset_token):
            matched_user = u
            break
    
    if not matched_user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    if matched_user.reset_token_expires and matched_user.reset_token_expires.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    matched_user.hashed_password = hash_password(body.new_password)
    matched_user.reset_token = None
    matched_user.reset_token_expires = None
    await db.commit()
    return {"message": "Password reset successfully"}


@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.verification_token == token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    user.is_verified = True
    user.verification_token = None
    await db.commit()
    return {"message": "Email verified successfully"}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    pr = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = pr.scalar_one_or_none()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
        "full_name": profile.full_name if profile else "",
        "avatar_url": profile.avatar_url if profile else None,
        "xp": profile.xp if profile else 0,
        "level": profile.level if profile else "Beginner",
        "streak_days": profile.streak_days if profile else 0,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }
