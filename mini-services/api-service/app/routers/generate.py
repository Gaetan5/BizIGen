"""
BizGen AI - Generate Router
Handles AI-powered document generation
"""
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
import json

from app.database import get_db
from app.models.models import (
    User, Project, FormInput, GeneratedDocument, 
    CanvasData, AuditLog
)
from app.routers.auth import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/generate", tags=["AI Generation"])


# ============================================
# SCHEMAS
# ============================================

class GenerateRequest(BaseModel):
    projectId: str
    type: str = "all"  # bmc, lean, bp, all


class GenerateResponse(BaseModel):
    success: bool
    documentId: str
    status: str
    results: Optional[Dict[str, Any]] = None


# ============================================
# ENDPOINTS
# ============================================

@router.post("", response_model=GenerateResponse)
async def generate_documents(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate BMC, Lean Canvas, and/or Business Plan"""
    
    # Get project with form inputs
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
    
    # Get form inputs
    result = await db.execute(
        select(FormInput)
        .where(FormInput.projectId == project.id)
    )
    form_inputs = result.scalars().all()
    
    if not form_inputs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No form data found. Please complete the form first."
        )
    
    # Convert to dict
    form_data = {inp.questionKey: inp.answerValue for inp in form_inputs}
    
    # Update project status
    project.status = "GENERATING"
    project.updatedAt = datetime.utcnow()
    
    # Create or get generated document
    result = await db.execute(
        select(GeneratedDocument)
        .where(GeneratedDocument.projectId == project.id)
    )
    gen_doc = result.scalar_one_or_none()
    
    if not gen_doc:
        gen_doc = GeneratedDocument(
            projectId=project.id,
            type="FULL",
            status="GENERATING"
        )
        db.add(gen_doc)
        await db.flush()
    else:
        gen_doc.status = "GENERATING"
        gen_doc.updatedAt = datetime.utcnow()
    
    results = {}
    
    try:
        # Generate BMC
        if request.type in ["bmc", "all"]:
            bmc_data = await ai_service.generate_bmc(
                form_data, project.sector, project.country
            )
            results["bmc"] = bmc_data
            
            # Save canvas
            result = await db.execute(
                select(CanvasData).where(
                    CanvasData.docId == gen_doc.id,
                    CanvasData.canvasType == "BUSINESS_MODEL_CANVAS"
                )
            )
            existing_canvas = result.scalar_one_or_none()
            
            if existing_canvas:
                existing_canvas.blocks = json.dumps(bmc_data, ensure_ascii=False)
                existing_canvas.updatedAt = datetime.utcnow()
            else:
                canvas = CanvasData(
                    docId=gen_doc.id,
                    canvasType="BUSINESS_MODEL_CANVAS",
                    blocks=json.dumps(bmc_data, ensure_ascii=False)
                )
                db.add(canvas)
        
        # Generate Lean Canvas
        if request.type in ["lean", "all"]:
            lean_data = await ai_service.generate_lean_canvas(
                form_data, project.sector
            )
            results["lean"] = lean_data
            
            # Save canvas
            result = await db.execute(
                select(CanvasData).where(
                    CanvasData.docId == gen_doc.id,
                    CanvasData.canvasType == "LEAN_CANVAS"
                )
            )
            existing_canvas = result.scalar_one_or_none()
            
            if existing_canvas:
                existing_canvas.blocks = json.dumps(lean_data, ensure_ascii=False)
                existing_canvas.updatedAt = datetime.utcnow()
            else:
                canvas = CanvasData(
                    docId=gen_doc.id,
                    canvasType="LEAN_CANVAS",
                    blocks=json.dumps(lean_data, ensure_ascii=False)
                )
                db.add(canvas)
        
        # Generate Business Plan
        if request.type in ["bp", "all"]:
            bp_data = await ai_service.generate_business_plan(
                form_data, project.sector, project.country
            )
            results["bp"] = bp_data
            
            # Save to raw content
            gen_doc.rawContent = json.dumps(bp_data, ensure_ascii=False)
        
        # Update status to completed
        gen_doc.status = "COMPLETED"
        gen_doc.version = (gen_doc.version or 0) + 1
        project.status = "COMPLETED"
        project.completedAt = datetime.utcnow()
        
        # Create audit log
        audit = AuditLog(
            userId=current_user.id,
            action="GENERATE_DOCUMENTS",
            entityType="Project",
            entityId=project.id,
            metadata=json.dumps({"type": request.type}, ensure_ascii=False)
        )
        db.add(audit)
        
        await db.flush()
        
        return GenerateResponse(
            success=True,
            documentId=gen_doc.id,
            status="COMPLETED",
            results=results
        )
        
    except Exception as e:
        gen_doc.status = "FAILED"
        project.status = "DRAFT"
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating documents: {str(e)}"
        )


@router.get("/status/{project_id}")
async def get_generation_status(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get generation status for a project"""
    
    result = await db.execute(
        select(Project)
        .where(
            Project.id == project_id,
            Project.userId == current_user.id
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    result = await db.execute(
        select(GeneratedDocument)
        .where(GeneratedDocument.projectId == project_id)
    )
    gen_doc = result.scalar_one_or_none()
    
    return {
        "projectStatus": project.status,
        "documentStatus": gen_doc.status if gen_doc else None,
        "version": gen_doc.version if gen_doc else 0,
        "completedAt": project.completedAt.isoformat() if project.completedAt else None
    }
