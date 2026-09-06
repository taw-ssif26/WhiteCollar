from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days

    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "white-collar-photos"
    R2_PUBLIC_URL: str = ""

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
