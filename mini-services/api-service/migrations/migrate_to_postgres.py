"""
BizGen AI - Database Migration Script
Migrate from SQLite to PostgreSQL
"""
import asyncio
import json
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker


async def migrate_to_postgres(
    sqlite_path: str,
    postgres_url: str,
    batch_size: int = 100
):
    """
    Migrate data from SQLite to PostgreSQL
    
    Args:
        sqlite_path: Path to SQLite database file
        postgres_url: PostgreSQL connection URL (asyncpg format)
        batch_size: Number of records to process per batch
    """
    
    # Create engines
    sqlite_engine = create_async_engine(f"sqlite+aiosqlite:///{sqlite_path}")
    postgres_engine = create_async_engine(postgres_url)
    
    # Create session makers
    sqlite_session = sessionmaker(sqlite_engine, class_=AsyncSession, expire_on_commit=False)
    postgres_session = sessionmaker(postgres_engine, class_=AsyncSession, expire_on_commit=False)
    
    print(f"Starting migration from {sqlite_path} to PostgreSQL...")
    
    async with sqlite_session() as source, postgres_session() as target:
        # ============================================
        # Migrate Users
        # ============================================
        print("Migrating users...")
        result = await source.execute(text("SELECT * FROM users"))
        users = result.fetchall()
        
        for user in users:
            user_dict = dict(user._mapping)
            await target.execute(
                text("""
                    INSERT INTO users (id, email, name, password_hash, role, subscription_plan, 
                                       subscription_id, stripe_customer_id, email_verified, 
                                       created_at, updated_at, last_login)
                    VALUES (:id, :email, :name, :password_hash, :role, :subscription_plan,
                            :subscription_id, :stripe_customer_id, :email_verified,
                            :created_at, :updated_at, :last_login)
                    ON CONFLICT (id) DO UPDATE SET
                        email = EXCLUDED.email,
                        name = EXCLUDED.name,
                        role = EXCLUDED.role,
                        subscription_plan = EXCLUDED.subscription_plan
                """),
                user_dict
            )
        
        await target.commit()
        print(f"  ✓ Migrated {len(users)} users")
        
        # ============================================
        # Migrate Projects
        # ============================================
        print("Migrating projects...")
        result = await source.execute(text("SELECT * FROM projects"))
        projects = result.fetchall()
        
        for project in projects:
            project_dict = dict(project._mapping)
            await target.execute(
                text("""
                    INSERT INTO projects (id, user_id, name, sector, country, status,
                                         created_at, updated_at, completed_at)
                    VALUES (:id, :user_id, :name, :sector, :country, :status,
                            :created_at, :updated_at, :completed_at)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        status = EXCLUDED.status
                """),
                project_dict
            )
        
        await target.commit()
        print(f"  ✓ Migrated {len(projects)} projects")
        
        # ============================================
        # Migrate Form Inputs
        # ============================================
        print("Migrating form inputs...")
        result = await source.execute(text("SELECT * FROM form_inputs"))
        inputs = result.fetchall()
        
        for inp in inputs:
            input_dict = dict(inp._mapping)
            await target.execute(
                text("""
                    INSERT INTO form_inputs (id, project_id, question_key, answer_value, 
                                            step, created_at, updated_at)
                    VALUES (:id, :project_id, :question_key, :answer_value,
                            :step, :created_at, :updated_at)
                    ON CONFLICT (id) DO UPDATE SET
                        answer_value = EXCLUDED.answer_value
                """),
                input_dict
            )
        
        await target.commit()
        print(f"  ✓ Migrated {len(inputs)} form inputs")
        
        # ============================================
        # Migrate Generated Documents
        # ============================================
        print("Migrating generated documents...")
        result = await source.execute(text("SELECT * FROM generated_documents"))
        docs = result.fetchall()
        
        for doc in docs:
            doc_dict = dict(doc._mapping)
            # Convert raw_content to JSON if it's a string
            if doc_dict.get('raw_content') and isinstance(doc_dict['raw_content'], str):
                doc_dict['raw_content'] = json.loads(doc_dict['raw_content'])
            
            await target.execute(
                text("""
                    INSERT INTO generated_documents (id, project_id, type, status, 
                                                    version, raw_content, created_at, updated_at)
                    VALUES (:id, :project_id, :type, :status,
                            :version, :raw_content::jsonb, :created_at, :updated_at)
                    ON CONFLICT (id) DO UPDATE SET
                        status = EXCLUDED.status,
                        version = EXCLUDED.version
                """),
                doc_dict
            )
        
        await target.commit()
        print(f"  ✓ Migrated {len(docs)} generated documents")
        
        # ============================================
        # Migrate Canvas Data
        # ============================================
        print("Migrating canvas data...")
        result = await source.execute(text("SELECT * FROM canvas_data"))
        canvases = result.fetchall()
        
        for canvas in canvases:
            canvas_dict = dict(canvas._mapping)
            # Convert blocks to JSON if it's a string
            if canvas_dict.get('blocks') and isinstance(canvas_dict['blocks'], str):
                canvas_dict['blocks'] = json.loads(canvas_dict['blocks'])
            
            await target.execute(
                text("""
                    INSERT INTO canvas_data (id, doc_id, canvas_type, blocks, created_at, updated_at)
                    VALUES (:id, :doc_id, :canvas_type, :blocks::jsonb, :created_at, :updated_at)
                    ON CONFLICT (id) DO UPDATE SET
                        blocks = EXCLUDED.blocks
                """),
                canvas_dict
            )
        
        await target.commit()
        print(f"  ✓ Migrated {len(canvases)} canvas data records")
    
    print("\n✅ Migration completed successfully!")
    print("Please verify the data and update your DATABASE_URL environment variable.")


if __name__ == "__main__":
    # Default paths
    SQLITE_PATH = Path(__file__).parent.parent.parent.parent / "db" / "custom.db"
    POSTGRES_URL = os.environ.get("DATABASE_URL_POSTGRES", "")
    
    if not POSTGRES_URL:
        print("Error: DATABASE_URL_POSTGRES environment variable not set")
        print("Example: postgresql+asyncpg://user:password@localhost:5432/bizgen")
        sys.exit(1)
    
    if not SQLITE_PATH.exists():
        print(f"Error: SQLite database not found at {SQLITE_PATH}")
        sys.exit(1)
    
    asyncio.run(migrate_to_postgres(str(SQLITE_PATH), POSTGRES_URL))
