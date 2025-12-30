from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Settings class to handle environment variables.
    
    Why this? 
    It allows us to centralize all our configuration (DB URL, API Keys) 
    in one place and ensures they are of the correct type.
    """
    # API Settings
    APP_NAME: str = "AI TestGen Backend"
    ENV: str = "development"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security Settings
    JWT_SECRET_KEY: str = "supersecretkey_change_me_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_testgen"
    
    # Redis Settings (for Celery)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # AI Settings (OpenRouter)
    OPENROUTER_API_KEY: str = "sk-or-v1-..." # User should set this in .env
    OPENROUTER_MODEL: str = "deepseek/deepseek-chat"
    
    # Load from .env file if it exists
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

# Initialize the settings object
settings = Settings()
