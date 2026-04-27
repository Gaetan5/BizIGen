"""
BizGen AI - FastAPI Configuration
Supports both Docker (PostgreSQL) and local (SQLite) environments
"""
from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache
from pathlib import Path
import os
import logging

logger = logging.getLogger(__name__)

# Get the project root directory (3 levels up from this file)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
DB_PATH = PROJECT_ROOT / "db" / "custom.db"


def get_database_url() -> str:
    """
    Get database URL based on environment.
    - Docker/Production: Use DATABASE_URL env var (PostgreSQL)
    - Local/Development: Use SQLite
    """
    # Check if running in Docker (DATABASE_URL will be set)
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        # Convert postgres:// to postgresql+asyncpg:// for SQLAlchemy
        if database_url.startswith("postgresql://"):
            database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
        elif database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql+asyncpg://")
        logger.info(f"Using PostgreSQL database: {database_url.split('@')[1] if '@' in database_url else 'configured'}")
        return database_url
    
    # Fallback to SQLite for local development
    sqlite_url = f"sqlite+aiosqlite:///{DB_PATH}"
    logger.info(f"Using SQLite database: {DB_PATH}")
    return sqlite_url


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App
    APP_NAME: str = "BizGen AI API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PORT: int = 3001
    
    # Database - Auto-detect from environment
    DATABASE_URL: str = ""  # Will be set dynamically
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars"
    INTERNAL_API_KEY: str = "bizgen-internal-api-key-safe-for-dev"
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
    
    def model_post_init(self, __context):
        """Set DATABASE_URL dynamically after initialization"""
        if not self.DATABASE_URL:
            object.__setattr__(self, 'DATABASE_URL', get_database_url())
    
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
