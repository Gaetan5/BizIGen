"""
BizGen AI - Export Router
Handles document exports (PDF, DOCX, PNG)
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any
from datetime import datetime
from pydantic import BaseModel
import json
import io

from app.database import get_db
from app.models.models import User, Project, GeneratedDocument, CanvasData, Export, Subscription
from app.routers.auth import get_current_user
from app.services.export_service import export_service
from app.services.payment_service import payment_service

router = APIRouter(prefix="/export", tags=["Exports"])


# ============================================
# SCHEMAS
# ============================================

class ExportRequest(BaseModel):
    projectId: str
    docType: str  # bmc, lean, bp
    format: str  # pdf, png, docx


class ExportResponse(BaseModel):
    success: bool
    exportId: str
    fileName: str
    format: str
    fileUrl: str
    fileSize: int
    message: str


# ============================================
# ENDPOINTS
# ============================================

@router.post("", response_model=ExportResponse)
async def export_document(
    request: ExportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Export a document in the specified format"""
    
    # Get project with generated document
    result = await db.execute(
        select(Project)
        .where(
            Project.id == request.projectId,
            Project.userId == current_user.id
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project not yet completed. Please generate documents first."
        )
    
    # Get generated document
    result = await db.execute(
        select(GeneratedDocument)
        .where(GeneratedDocument.projectId == project.id)
    )
    gen_doc = result.scalar_one_or_none()
    
    if not gen_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No generated documents found"
        )
    
    # Check export limits
    result = await db.execute(
        select(Export).where(Export.userId == current_user.id)
    )
    exports = result.scalars().all()
    
    # Get user subscription
    result = await db.execute(
        select(Subscription).where(Subscription.userId == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    user_plan = subscription.plan if subscription else "FREE"
    
    if not payment_service.can_export(user_plan, len(exports)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Export limit reached. Please upgrade your plan."
        )
    
    # Get canvas data
    result = await db.execute(
        select(CanvasData).where(CanvasData.docId == gen_doc.id)
    )
    canvases = result.scalars().all()
    
    # Get data based on doc type
    export_data: Dict[str, Any] = {}
    
    if request.docType == "bmc":
        bmc_canvas = next(
            (c for c in canvases if c.canvasType == "BUSINESS_MODEL_CANVAS"), None
        )
        if bmc_canvas:
            export_data = json.loads(bmc_canvas.blocks)
    
    elif request.docType == "lean":
        lean_canvas = next(
            (c for c in canvases if c.canvasType == "LEAN_CANVAS"), None
        )
        if lean_canvas:
            export_data = json.loads(lean_canvas.blocks)
    
    elif request.docType == "bp":
        if gen_doc.rawContent:
            export_data = json.loads(gen_doc.rawContent)
    
    # Generate export
    try:
        file_bytes = export_service.export_document(
            doc_type=request.docType,
            format_type=request.format,
            data=export_data,
            project_name=project.name
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Create export record
    export_record = Export(
        docId=gen_doc.id,
        userId=current_user.id,
        format=request.format.upper(),
        fileUrl="",  # Would be set to actual storage URL
        fileSize=len(file_bytes)
    )
    db.add(export_record)
    
    # Update subscription usage
    if subscription:
        subscription.exportsUsed += 1
    
    await db.flush()
    
    # Generate filename
    filename = f"{project.name}_{request.docType}.{request.format}"
    
    return ExportResponse(
        success=True,
        exportId=export_record.id,
        fileName=filename,
        format=request.format,
        fileUrl=f"/export/download/{export_record.id}",
        fileSize=len(file_bytes),
        message="Export ready. Use the download endpoint to get the file."
    )


@router.get("/download/{export_id}")
async def download_export(
    export_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Download an exported file"""
    
    # Get export record
    result = await db.execute(
        select(Export)
        .where(
            Export.id == export_id,
            Export.userId == current_user.id
        )
    )
    export_record = result.scalar_one_or_none()
    
    if not export_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Export not found"
        )
    
    # Get project and data
    result = await db.execute(
        select(GeneratedDocument)
        .where(GeneratedDocument.id == export_record.docId)
    )
    gen_doc = result.scalar_one_or_none()
    
    if not gen_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    result = await db.execute(
        select(Project).where(Project.id == gen_doc.projectId)
    )
    project = result.scalar_one_or_none()
    
    result = await db.execute(
        select(CanvasData).where(CanvasData.docId == gen_doc.id)
    )
    canvases = result.scalars().all()
    
    # Re-generate file
    export_data = {}
    doc_type = "bmc"
    
    if gen_doc.rawContent:
        export_data = json.loads(gen_doc.rawContent)
        doc_type = "bp"
    elif canvases:
        c = canvases[0]
        export_data = json.loads(c.blocks) if c.blocks else {}
        doc_type = "bmc" if c.canvasType == "BUSINESS_MODEL_CANVAS" else "lean"
    
    file_bytes = export_service.export_document(
        doc_type=doc_type,
        format_type=export_record.format.lower(),
        data=export_data,
        project_name=project.name if project else "export"
    )
    
    # Update download time
    export_record.downloadedAt = datetime.utcnow()
    await db.flush()
    
    # Return file
    filename = f"{project.name if project else 'export'}_{doc_type}.{export_record.format.lower()}"
    
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/history")
async def get_export_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's export history"""
    
    result = await db.execute(
        select(Export)
        .where(Export.userId == current_user.id)
        .order_by(Export.createdAt.desc())
        .limit(20)
    )
    exports = result.scalars().all()
    
    return [
        {
            "id": e.id,
            "format": e.format,
            "fileSize": e.fileSize,
            "downloadedAt": e.downloadedAt.isoformat() if e.downloadedAt else None,
            "createdAt": e.createdAt.isoformat() if e.createdAt else None
        }
        for e in exports
    ]
