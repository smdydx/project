from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Admin Dashboard API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database - PostgreSQL only (from environment variable)
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # Upload/Static file settings
    UPLOAD_FOLDER: str = os.getenv("UPLOAD_FOLDER", "./uploads")
    STATIC_URL_PATH: str = os.getenv("STATIC_URL_PATH", "/uploads")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Database configured via environment variable