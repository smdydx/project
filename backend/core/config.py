from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Admin Dashboard API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database - Use PostgreSQL from environment or fallback to SQLite
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lcrpay.db")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()