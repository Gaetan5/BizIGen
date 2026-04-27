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
from app.models.models import User, ApiKey
from app.routers.auth import get_current_user
from typing import Dict

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
    prefix = raw_key[:7] + "..." # bg_abcd...
    
    # 2. Store hash in DB
    new_key = ApiKey(
        userId=current_user.id, 
        name=request.name, 
        keyHash=key_hash,
        keyPrefix=prefix
    )
    db.add(new_key)
    await db.flush()
    
    return {
        "id": new_key.id,
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
    result = await db.execute(
        select(ApiKey).where(ApiKey.userId == current_user.id).order_by(ApiKey.createdAt.desc())
    )
    keys = result.scalars().all()
    
    return [
        ApiKeyResponse(
            id=k.id,
            name=k.name,
            key_prefix=k.keyPrefix,
            createdAt=k.createdAt,
            lastUsedAt=k.lastUsedAt
        )
        for k in keys
    ]

@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke and delete an API key"""
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.userId == current_user.id)
    )
    key = result.scalar_one_or_none()
    
    if not key:
        raise HTTPException(status_code=404, detail="API Key not found")
        
    await db.delete(key)
    await db.flush()
    
    return {"success": True, "message": "Clé API révoquée avec succès"}
