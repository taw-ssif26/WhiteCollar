from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080

    # Supabase Storage (replaces Cloudflare R2 — no card required)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_BUCKET: str = "photos"

    # Green API (WhatsApp)
    GREEN_API_INSTANCE_ID: str = ""
    GREEN_API_TOKEN: str = ""

    FRONTEND_URL: str = "http://localhost:3000"
    ADMIN_DEFAULT_PASSWORD: str = "Admin@WhiteCollar2025"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
