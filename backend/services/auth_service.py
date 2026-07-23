from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from backend.models.user import User, Profile, HealthProfile, UserSettings, RefreshToken
from backend.models.gamification import Achievement, UserAchievement
from backend.utils.auth_utils import hash_password, verify_password, create_access_token, create_refresh_token, generate_reset_token
from backend.utils.email_utils import send_verification_email, send_reset_email
from backend.config import get_settings

settings = get_settings()

async def register_user(email: str, password: str, full_name: str, role: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed = hash_password(password)
    verification_token, _ = generate_reset_token()
    
    new_user = User(
        email=email,
        hashed_password=hashed,
        role=role,
        verification_token=verification_token
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    profile = Profile(user_id=new_user.id, full_name=full_name)
    health_profile = HealthProfile(user_id=new_user.id)
    user_settings = UserSettings(user_id=new_user.id)
    
    db.add_all([profile, health_profile, user_settings])
    await db.commit()
    
    await send_verification_email(email, verification_token)
    return new_user

async def login_user(email: str, password: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    raw_refresh, hashed_refresh = create_refresh_token()
    
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_record = RefreshToken(
        user_id=user.id,
        token_hash=hashed_refresh,
        expires_at=expires_at.replace(tzinfo=None)
    )
    db.add(refresh_record)
    await db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": raw_refresh,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified
        }
    }

async def refresh_tokens(refresh_token_raw: str, db: AsyncSession):
    # For a real implementation, you would need to look up the unhashed token or 
    # look up the user and verify the token. This is simplified.
    # In production, pass a user identifier with the refresh token or parse it out
    raise HTTPException(status_code=501, detail="Not fully implemented in this demo")

async def logout_user(refresh_token_raw: str, db: AsyncSession):
    pass # simplified

async def forgot_password(email: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user:
        raw_token, hashed_token = generate_reset_token()
        user.reset_token = hashed_token
        user.reset_token_expires = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=1)
        await db.commit()
        await send_reset_email(email, raw_token)
    return {"message": "If that email is in our database, we will send a password reset link."}

async def reset_password(token: str, new_password: str, db: AsyncSession):
    # simplified validation
    raise HTTPException(status_code=501, detail="Not fully implemented")

async def verify_email(token: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.verification_token == token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
    user.is_verified = True
    user.verification_token = None
    await db.commit()
    return {"message": "Email verified"}
