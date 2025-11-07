"""
Server and application configuration management
"""

import os
from typing import List
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings
from pydantic import validator
import json

class Settings(BaseSettings):
    # Server Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_BASE_URL: str = "http://localhost:8000"
    API_WORKERS: int = 4
    
    # OpenAI Settings
    OPENAI_API_KEY: str
    
    # Path Settings
    MODEL_PATH: str = "./models"
    CHROMADB_PATH: str = "./.chroma"
    DATA_PATH: str = "./data"
    DB_PATH: str = "./data/test_results.db"
    
    # Execution Settings
    MAX_PARALLEL_EXECUTIONS: int = 10
    RETRY_ATTEMPTS: int = 3
    TEST_BATCH_SIZE: int = 10
    TEST_TIMEOUT: int = 30
    CONTINUOUS_TESTING_INTERVAL: int = 60
    
    # Model Settings
    USE_DEEP_LEARNING: bool = True
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    USE_OPENAI_EMBEDDINGS: bool = False
    
    # Security Settings
    API_KEY_HEADER: str = "X-API-Key"
    CORS_ORIGINS: List[str] = ["*"]
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 3600
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()