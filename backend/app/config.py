from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # LLM Keys
    ANTHROPIC_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    # Enrichment APIs
    APOLLO_API_KEY: str = ""
    PROXYCURL_API_KEY: str = ""
    EXA_API_KEY: str = ""
    
    # Email
    SMARTLEAD_API_KEY: str = ""
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
