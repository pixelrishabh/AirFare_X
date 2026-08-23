from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    supabase_url: str = "https://xlaizvwpshpsjrgricua.supabase.co"
    supabase_service_role_key: str = "sb_publishable_SWaM76GFKmUFGHBL_MS55A_ZyCDXFiO"
    allowed_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
