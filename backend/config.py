from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./aegis_heart.db"
    JWT_SECRET_KEY: str = "aegis_heart_ultra_secure_2045_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BCRYPT_ROUNDS: int = 12
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = "noreply@aegisheart.app"
    FRONTEND_URL: str = "http://localhost:5173"
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_GENERAL: str = "60/minute"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache
def get_settings():
    return Settings()
