"""
BizGen AI - Enhanced Generate Router
With streaming, caching, and robust validation
"""
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
import json
import asyncio
import logging

from app.database import get_db
from app.models.models import User, Project, FormInput, GeneratedDocument, CanvasData, AuditLog
from app.routers.auth import get_current_user
from app.services.enhanced_ai_service import (
    enhanced_ai_service,
    AIServiceError,
    AIValidationError,
    AITimeoutError,
)
from app.schemas.ai_schemas import AIResponseType

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate", tags=["AI Generation"])


# ============================================
# SCHEMAS
# ============================================

class GenerateRequest(BaseModel):
    """Generate documents request"""
    projectId: str
    type: str = Field(default="all", pattern="^(bmc|lean|bp|all)$")


class GenerateResponse(BaseModel):
    """Generate documents response"""
    success: bool
    documentId: Optional[str] = None
    status: str
    results: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    validation_errors: Optional[list] = None


class StreamProgress(BaseModel):
    """Progress update for streaming"""
    step: str
    progress: int  # 0-100
    message: str
    timestamp: str


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
    """
    Generate BMC, Lean Canvas, and/or Business Plan
    With validation and caching
    """
    start_time = datetime.utcnow()
    
    # Get project with form inputs
    result = await db.execute(
        select(Project).where(
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
        select(FormInput).where(FormInput.projectId == project.id)
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
        select(GeneratedDocument).where(GeneratedDocument.projectId == project.id)
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
    errors = []
    
    try:
        # Generate BMC
        if request.type in ["bmc", "all"]:
            try:
                logger.info(f"Generating BMC for project {project.id}")
                validated = await enhanced_ai_service.generate_bmc(
                    form_data=form_data,
                    sector=project.sector,
                    country=project.country,
                    use_cache=True,
                )
                
                if validated.is_valid:
                    results["bmc"] = validated.content
                    
                    # Save canvas
                    result = await db.execute(
                        select(CanvasData).where(
                            CanvasData.docId == gen_doc.id,
                            CanvasData.canvasType == "BUSINESS_MODEL_CANVAS"
                        )
                    )
                    existing_canvas = result.scalar_one_or_none()
                    
                    if existing_canvas:
                        existing_canvas.blocks = json.dumps(validated.content, ensure_ascii=False)
                        existing_canvas.updatedAt = datetime.utcnow()
                    else:
                        canvas = CanvasData(
                            docId=gen_doc.id,
                            canvasType="BUSINESS_MODEL_CANVAS",
                            blocks=json.dumps(validated.content, ensure_ascii=False)
                        )
                        db.add(canvas)
                    
                    logger.info(f"BMC generated successfully for project {project.id}")
                else:
                    errors.append(f"BMC validation failed: {validated.validation_errors}")
                    results["bmc_error"] = validated.validation_errors
                    
            except AIValidationError as e:
                errors.append(f"BMC validation error: {str(e)}")
                logger.error(f"BMC validation error: {e}")
            except AIServiceError as e:
                errors.append(f"BMC generation error: {str(e)}")
                logger.error(f"BMC generation error: {e}")
        
        # Generate Lean Canvas
        if request.type in ["lean", "all"]:
            try:
                logger.info(f"Generating Lean Canvas for project {project.id}")
                validated = await enhanced_ai_service.generate_lean_canvas(
                    form_data=form_data,
                    sector=project.sector,
                    use_cache=True,
                )
                
                if validated.is_valid:
                    results["lean"] = validated.content
                    
                    # Save canvas
                    result = await db.execute(
                        select(CanvasData).where(
                            CanvasData.docId == gen_doc.id,
                            CanvasData.canvasType == "LEAN_CANVAS"
                        )
                    )
                    existing_canvas = result.scalar_one_or_none()
                    
                    if existing_canvas:
                        existing_canvas.blocks = json.dumps(validated.content, ensure_ascii=False)
                        existing_canvas.updatedAt = datetime.utcnow()
                    else:
                        canvas = CanvasData(
                            docId=gen_doc.id,
                            canvasType="LEAN_CANVAS",
                            blocks=json.dumps(validated.content, ensure_ascii=False)
                        )
                        db.add(canvas)
                    
                    logger.info(f"Lean Canvas generated successfully for project {project.id}")
                else:
                    errors.append(f"Lean validation failed: {validated.validation_errors}")
                    
            except AIServiceError as e:
                errors.append(f"Lean Canvas error: {str(e)}")
                logger.error(f"Lean Canvas error: {e}")
        
        # Generate Business Plan
        if request.type in ["bp", "all"]:
            try:
                logger.info(f"Generating Business Plan for project {project.id}")
                validated = await enhanced_ai_service.generate_business_plan(
                    form_data=form_data,
                    sector=project.sector,
                    country=project.country,
                    use_cache=True,
                )
                
                if validated.is_valid:
                    results["bp"] = validated.content
                    gen_doc.rawContent = json.dumps(validated.content, ensure_ascii=False)
                    logger.info(f"Business Plan generated successfully for project {project.id}")
                else:
                    errors.append(f"BP validation failed: {validated.validation_errors}")
                    
            except AIServiceError as e:
                errors.append(f"Business Plan error: {str(e)}")
                logger.error(f"Business Plan error: {e}")
        
        # Update status
        if results:
            gen_doc.status = "COMPLETED"
            gen_doc.version = (gen_doc.version or 0) + 1
            project.status = "COMPLETED"
            project.completedAt = datetime.utcnow()
        else:
            gen_doc.status = "FAILED"
            project.status = "DRAFT"
        
        # Create audit log
        audit = AuditLog(
            userId=current_user.id,
            action="GENERATE_DOCUMENTS",
            entityType="Project",
            entityId=project.id,
            metadata=json.dumps({
                "type": request.type,
                "results_count": len(results),
                "errors": errors,
                "duration_ms": int((datetime.utcnow() - start_time).total_seconds() * 1000)
            }, ensure_ascii=False)
        )
        db.add(audit)
        
        await db.flush()
        
        return GenerateResponse(
            success=len(results) > 0,
            documentId=gen_doc.id,
            status=gen_doc.status,
            results=results if results else None,
            error="; ".join(errors) if errors else None,
        )
        
    except Exception as e:
        logger.exception(f"Unexpected error during generation: {e}")
        gen_doc.status = "FAILED"
        project.status = "DRAFT"
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating documents: {str(e)}"
        )


@router.post("/stream")
async def generate_documents_stream(
    request: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Stream generation progress with real-time updates
    Uses Server-Sent Events (SSE)
    """
    
    async def generate_with_progress():
        """Generator for streaming progress updates"""
        
        # Initial validation
        yield f"data: {json.dumps({'step': 'init', 'progress': 5, 'message': 'Validation du projet...'})}\n\n"
        await asyncio.sleep(0.1)
        
        # Get project
        result = await db.execute(
            select(Project).where(
                Project.id == request.projectId,
                Project.userId == current_user.id
            )
        )
        project = result.scalar_one_or_none()
        
        if not project:
            yield f"data: {json.dumps({'step': 'error', 'progress': 0, 'message': 'Projet non trouvé'})}\n\n"
            return
        
        # Get form inputs
        result = await db.execute(
            select(FormInput).where(FormInput.projectId == project.id)
        )
        form_inputs = result.scalars().all()
        
        if not form_inputs:
            yield f"data: {json.dumps({'step': 'error', 'progress': 0, 'message': 'Aucune donnée de formulaire'})}\n\n"
            return
        
        form_data = {inp.questionKey: inp.answerValue for inp in form_inputs}
        
        # Update status
        project.status = "GENERATING"
        await db.flush()
        
        total_steps = 3 if request.type == "all" else 1
        current_step = 0
        
        # Generate BMC
        if request.type in ["bmc", "all"]:
            current_step += 1
            progress = int((current_step / total_steps) * 90)
            yield f"data: {json.dumps({'step': 'bmc', 'progress': progress, 'message': 'Génération du Business Model Canvas...'})}\n\n"
            
            try:
                validated = await enhanced_ai_service.generate_bmc(
                    form_data=form_data,
                    sector=project.sector,
                    country=project.country,
                )
                
                if validated.is_valid:
                    yield f"data: {json.dumps({'step': 'bmc_complete', 'progress': progress + 5, 'message': 'BMC généré avec succès!'})}\n\n"
                else:
                    yield f"data: {json.dumps({'step': 'bmc_error', 'progress': progress, 'message': f'Erreur BMC: {validated.validation_errors}'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'step': 'bmc_error', 'progress': progress, 'message': f'Erreur: {str(e)}'})}\n\n"
        
        # Generate Lean Canvas
        if request.type in ["lean", "all"]:
            current_step += 1
            progress = int((current_step / total_steps) * 90)
            yield f"data: {json.dumps({'step': 'lean', 'progress': progress, 'message': 'Génération du Lean Canvas...'})}\n\n"
            
            try:
                validated = await enhanced_ai_service.generate_lean_canvas(
                    form_data=form_data,
                    sector=project.sector,
                )
                
                if validated.is_valid:
                    yield f"data: {json.dumps({'step': 'lean_complete', 'progress': progress + 5, 'message': 'Lean Canvas généré!'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'step': 'lean_error', 'progress': progress, 'message': f'Erreur: {str(e)}'})}\n\n"
        
        # Generate Business Plan
        if request.type in ["bp", "all"]:
            current_step += 1
            progress = int((current_step / total_steps) * 90)
            yield f"data: {json.dumps({'step': 'bp', 'progress': progress, 'message': 'Génération du Business Plan...'})}\n\n"
            
            try:
                validated = await enhanced_ai_service.generate_business_plan(
                    form_data=form_data,
                    sector=project.sector,
                    country=project.country,
                )
                
                if validated.is_valid:
                    yield f"data: {json.dumps({'step': 'bp_complete', 'progress': progress + 5, 'message': 'Business Plan généré!'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'step': 'bp_error', 'progress': progress, 'message': f'Erreur: {str(e)}'})}\n\n"
        
        # Update final status
        project.status = "COMPLETED"
        project.completedAt = datetime.utcnow()
        await db.flush()
        
        # Complete
        yield f"data: {json.dumps({'step': 'complete', 'progress': 100, 'message': 'Génération terminée avec succès!', 'projectId': project.id})}\n\n"
    
    return StreamingResponse(
        generate_with_progress(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/status/{project_id}")
async def get_generation_status(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get generation status for a project"""
    
    result = await db.execute(
        select(Project).where(
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
        select(GeneratedDocument).where(GeneratedDocument.projectId == project_id)
    )
    gen_doc = result.scalar_one_or_none()
    
    return {
        "projectStatus": project.status,
        "documentStatus": gen_doc.status if gen_doc else None,
        "version": gen_doc.version if gen_doc else 0,
        "completedAt": project.completedAt.isoformat() if project.completedAt else None
    }


@router.get("/metrics")
async def get_ai_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get AI service metrics (admin only)"""
    
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return enhanced_ai_service.get_metrics()


@router.post("/cache/clear")
async def clear_ai_cache(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear AI generation cache (admin only)"""
    
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    enhanced_ai_service.cache.clear()
    
    return {"success": True, "message": "AI cache cleared"}
