"""
BizGen AI - Database Configuration (SQLAlchemy Async)
Uses the same SQLite database as Prisma/Next.js
"""
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from pathlib import Path

# Get database URL from environment or use default
# Prisma uses 'file:' prefix for SQLite, SQLAlchemy needs 'sqlite+aiosqlite://'
env_db_url = os.getenv("DATABASE_URL", "")

if env_db_url.startswith("file:"):
    # Convert Prisma format to SQLAlchemy async format
    db_path = env_db_url.replace("file:", "")
    DATABASE_URL = f"sqlite+aiosqlite:///{db_path}"
elif env_db_url.startswith("sqlite:"):
    # Already SQLite format, make it async
    if "+aiosqlite" not in env_db_url:
        DATABASE_URL = env_db_url.replace("sqlite:", "sqlite+aiosqlite:")
    else:
        DATABASE_URL = env_db_url
elif not env_db_url:
    # Default to project's db
    PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
    DB_PATH = PROJECT_ROOT / "db" / "custom.db"
    DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"
else:
    # Use as-is for other databases (PostgreSQL, MySQL, etc.)
    DATABASE_URL = env_db_url

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL debugging
    future=True,
)

# Async session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models"""
    pass


async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database - tables are created by Prisma, so this is just a placeholder"""
    # Tables are managed by Prisma migrations
    # This function exists for compatibility
    pass
