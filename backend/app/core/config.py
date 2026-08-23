from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    allowed_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
