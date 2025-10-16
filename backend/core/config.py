from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Admin Dashboard API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database - Use environment variable or default SQLite
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./admin_dashboard.db")

    # CORS - Allow all origins in Replit environment
    ALLOWED_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()