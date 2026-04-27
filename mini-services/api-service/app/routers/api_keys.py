"""
BizGen AI - API Keys Router
Management of Personal API Keys for external integrations.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from typing import List, Optional
import secrets
import hashlib
from datetime import datetime

from app.database import get_db
from app.models.models import User
from app.routers.auth import get_current_user

# Note: In a real architecture, we would create a new table 'ApiKey'. 
# For this implementation, I will define the logic and use a mock structure 
# until the next DB migration.

router = APIRouter(prefix="/settings/api-keys", tags=["Integrations"])

class ApiKeyCreate(BaseModel):
    name: str

class ApiKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    createdAt: datetime
    lastUsedAt: Optional[datetime]

@router.post("", response_model=Dict[str, str])
async def create_api_key(
    request: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate a new personal API key"""
    # 1. Generate secure random key
    raw_key = f"bg_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    # 2. Store hash in DB (logic placeholder)
    # new_key = ApiKey(userId=current_user.id, name=request.name, keyHash=key_hash)
    # db.add(new_key)
    
    return {
        "name": request.name,
        "api_key": raw_key,
        "warning": "Conservez cette clé précieusement, elle ne sera plus affichée."
    }

@router.get("", response_model=List[ApiKeyResponse])
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all active API keys for the user"""
    # result = await db.execute(select(ApiKey).where(ApiKey.userId == current_user.id))
    # keys = result.scalars().all()
    return [] # Placeholder

@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke and delete an API key"""
    # await db.execute(delete(ApiKey).where(ApiKey.id == key_id, ApiKey.userId == current_user.id))
    return {"success": True}
