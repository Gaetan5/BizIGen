"""
BizGen AI - Export Router
Handles document exports (PDF, DOCX, PNG)
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
import json
import io

from app.database import get_db
from app.models.models import User, Project, GeneratedDocument, CanvasData, Export, Subscription
from app.routers.auth import get_current_user
from app.services.export_service import export_service
from app.services.storage_service import storage_service
from app.services.payment_service import payment_service

router = APIRouter(prefix="/export", tags=["Exports"])


# ============================================
# SCHEMAS
# ============================================

from pydantic import Field

class ExportRequest(BaseModel):
    projectId: str
    docType: Optional[str] = None
    type: Optional[str] = None
    format: str = Field(..., pattern="^(pdf|png|docx|csv)$")

    def get_doc_type(self) -> str:
        return (self.docType or self.type or "bmc").lower()


class ExportResponse(BaseModel):
    success: bool = True
    exportId: str
    fileName: str
    format: str
    fileUrl: str
    url: str
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
    
    doc_type = request.get_doc_type()
    
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
    
    if doc_type == "bmc":
        bmc_canvas = next(
            (c for c in canvases if c.canvasType == "BUSINESS_MODEL_CANVAS"), None
        )
        if bmc_canvas:
            export_data = json.loads(bmc_canvas.blocks)
    
    elif doc_type == "lean":
        lean_canvas = next(
            (c for c in canvases if c.canvasType == "LEAN_CANVAS"), None
        )
        if lean_canvas:
            export_data = json.loads(lean_canvas.blocks)
    
    elif doc_type == "bp":
        if gen_doc.rawContent:
            export_data = json.loads(gen_doc.rawContent)
    
    # Generate export
    try:
        file_bytes = export_service.export_document(
            doc_type=doc_type,
            format_type=request.format,
            data=export_data,
            project_name=project.name
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Save file persistently in Cloud / Local volume
    filename = f"{project.name}_{doc_type}.{request.format}"
    content_type = "application/pdf" if request.format == "pdf" else "application/octet-stream"
    safe_name, file_hash, file_size = await storage_service.save_file(
        file_bytes=file_bytes,
        filename=filename,
        content_type=content_type
    )

    # Generate export record
    export_record = Export(
        docId=gen_doc.id,
        userId=current_user.id,
        format=request.format.upper(),
        fileUrl=f"/export/download/{safe_name}?type={doc_type}",
        fileSize=file_size
    )
    db.add(export_record)
    
    # Update subscription usage
    if subscription:
        subscription.exportsUsed += 1
    
    await db.commit()
    await db.refresh(export_record)
    
    # Set final download URL
    file_url = f"/export/download/{safe_name}?type={doc_type}"
    export_record.fileUrl = file_url
    await db.commit()
    
    return ExportResponse(
        success=True,
        exportId=export_record.id,
        fileName=filename,
        format=request.format,
        fileUrl=file_url,
        url=file_url,
        fileSize=file_size,
        message="Export ready. Use the download endpoint to get the file."
    )


@router.get("/download/{export_id}")
async def download_export(
    export_id: str,
    type: Optional[str] = None,
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
    
    # Determine doc_type
    doc_type = (type or "").lower()
    if not doc_type and export_record.fileUrl and "?type=" in export_record.fileUrl:
        doc_type = export_record.fileUrl.split("?type=")[-1].split("&")[0].lower()
    if not doc_type:
        doc_type = "bmc"
    
    export_data = {}
    if doc_type == "bp" and gen_doc.rawContent:
        export_data = json.loads(gen_doc.rawContent)
    elif doc_type == "lean":
        lean_canvas = next((c for c in canvases if c.canvasType == "LEAN_CANVAS"), None)
        if lean_canvas and lean_canvas.blocks:
            export_data = json.loads(lean_canvas.blocks)
    else:  # bmc
        bmc_canvas = next((c for c in canvases if c.canvasType == "BUSINESS_MODEL_CANVAS"), None)
        if bmc_canvas and bmc_canvas.blocks:
            export_data = json.loads(bmc_canvas.blocks)
        elif canvases and canvases[0].blocks:
            export_data = json.loads(canvases[0].blocks)
    
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
