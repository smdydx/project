from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Admin Dashboard API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database - PostgreSQL (from .env file) or fallback to SQLite
    DATABASE_URL: str = "sqlite:///./lcrpay.db"
    
    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Admin Credentials - MUST be set in .env file
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str
    
    # Upload/Static file settings
    UPLOAD_FOLDER: str = os.getenv("UPLOAD_FOLDER", "./uploads")
    STATIC_URL_PATH: str = os.getenv("STATIC_URL_PATH", "/uploads")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Override DATABASE_URL from environment if provided
if os.getenv("DATABASE_URL"):
    settings.DATABASE_URL = os.getenv("DATABASE_URL")
    print(f"✅ Using PostgreSQL from .env: {settings.DATABASE_URL.split('@')[0]}@****")
else:
    print(f"⚠️  Using SQLite fallback: {settings.DATABASE_URL}")