from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI TestGen"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: Optional[str] = None # Needed for local JWT verification if not using Supabase SDK

    # Database Configuration
    DATABASE_URL: str

    # OpenRouter Configuration
    OPENROUTER_API_KEY: str

    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # App Configuration
    DEBUG: bool = True

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"), 
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
