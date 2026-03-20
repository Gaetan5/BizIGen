"""
BizGen AI - FastAPI Configuration
"""
from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache
from pathlib import Path
import os


# Get the project root directory (3 levels up from this file)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
DB_PATH = PROJECT_ROOT / "db" / "custom.db"


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App
    APP_NAME: str = "BizGen AI API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PORT: int = 3001
    
    # Database - Use same DB as Prisma
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DB_PATH}"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # AI Services
    OPENAI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gpt-4o-mini"
    
    # Next.js Frontend
    NEXTAUTH_URL: str = "http://localhost:3000"
    NEXTAUTH_SECRET: Optional[str] = None
    
    # Payment - Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_BASIC_PRICE_ID: Optional[str] = None
    STRIPE_PRO_PRICE_ID: Optional[str] = None
    
    # Payment - Flutterwave (Africa)
    FLUTTERWAVE_SECRET_KEY: Optional[str] = None
    FLUTTERWAVE_PUBLIC_KEY: Optional[str] = None
    FLUTTERWAVE_WEBHOOK_HASH: Optional[str] = None
    
    # CORS
    CORS_ORIGINS: str = "*"
    
    # Redis (optional for caching)
    REDIS_URL: Optional[str] = None
    
    # Sentry (Error Tracking)
    SENTRY_DSN: Optional[str] = None
    
    # Email (Password Reset)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: Optional[str] = None
    
    # Features
    ENABLE_WEBHOOKS: bool = True
    ENABLE_SUBSCRIPTIONS: bool = True
    ENABLE_CHAT: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"
    
    def validate_production(self) -> list[str]:
        """Validate settings for production environment"""
        warnings = []
        
        if not self.SECRET_KEY or self.SECRET_KEY.startswith("dev-"):
            warnings.append("SECRET_KEY must be set to a secure value in production")
        
        if self.CORS_ORIGINS == "*":
            warnings.append("CORS_ORIGINS should be restricted in production")
        
        if self.DEBUG:
            warnings.append("DEBUG should be False in production")
        
        if not self.SENTRY_DSN:
            warnings.append("SENTRY_DSN should be configured for error tracking")
        
        return warnings


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Create global settings instance
settings = get_settings()
