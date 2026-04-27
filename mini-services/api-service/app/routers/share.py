"""
BizGen AI - Share Router
Handles secure document sharing and collaboration
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import secrets

from app.database import get_db
from app.models.models import User, Project, GeneratedDocument, SharedDocument, CanvasData
from app.routers.auth import get_current_user
from app.services.notification_service import notification_service

router = APIRouter(prefix="/share", tags=["Collaboration"])

class ShareRequest(BaseModel):
    docId: str
    expiresInDays: Optional[int] = 30
    allowDownload: bool = True
    sendEmailTo: Optional[str] = None

class ShareResponse(BaseModel):
    shareId: str
    shareUrl: str
    expiresAt: Optional[datetime]

@router.post("", response_model=ShareResponse)
async def create_share_link(
    request: ShareRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate a secure share link for a document"""
    
    # 1. Verify document belongs to user
    result = await db.execute(
        select(GeneratedDocument)
        .join(Project)
        .where(
            GeneratedDocument.id == request.docId,
            Project.userId == current_user.id
        )
    )
    doc = result.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    # 2. Create share record
    share_id = secrets.token_urlsafe(16)
    expires_at = datetime.utcnow() + timedelta(days=request.expiresInDays) if request.expiresInDays else None
    
    new_share = SharedDocument(
        shareId=share_id,
        docId=doc.id,
        expiresAt=expires_at,
        allowDownload=request.allowDownload
    )
    
    # 3. Send email if requested
    if request.sendEmailTo:
        await notification_service.send_business_plan_email(
            to_email=request.sendEmailTo,
            project_name=doc.project.name,
            share_url=f"http://localhost:3000/shared/{share_id}"
        )
    
    # In production, use your actual domain
    base_url = "http://localhost:3000/shared"
    
    return ShareResponse(
        shareId=share_id,
        shareUrl=f"{base_url}/{share_id}",
        expiresAt=expires_at
    )

@router.get("/{share_id}")
async def get_shared_document(
    share_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve document content via public share link"""
    
    # 1. Find share record
    result = await db.execute(
        select(SharedDocument).where(SharedDocument.shareId == share_id)
    )
    share = result.scalar_one_or_none()
    
    if not share:
        raise HTTPException(status_code=404, detail="Share link not found")
        
    if share.expiresAt and share.expiresAt < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Share link has expired")
    
    # 2. Get document and project info
    result = await db.execute(
        select(GeneratedDocument, Project.name, Project.sector)
        .join(Project)
        .where(GeneratedDocument.id == share.docId)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Document data not found")
        
    doc, project_name, sector = row
    
    # 3. Get associated canvases
    result = await db.execute(
        select(CanvasData).where(CanvasData.docId == doc.id)
    )
    canvases = result.scalars().all()
    
    # Increment view count
    share.views += 1
    await db.flush()
    
    import json
    return {
        "projectName": project_name,
        "sector": sector,
        "type": doc.type,
        "content": json.loads(doc.rawContent) if doc.rawContent else {},
        "canvases": {c.canvasType: json.loads(c.blocks) for c in canvases if c.blocks},
        "createdAt": doc.createdAt,
        "allowDownload": share.allowDownload
    }
