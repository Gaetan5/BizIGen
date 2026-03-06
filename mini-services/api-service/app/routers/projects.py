"""
BizGen AI - Projects Router
Handles project CRUD and form inputs
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import json

from app.database import get_db
from app.models.models import (
    User, Project, FormInput, GeneratedDocument, 
    CanvasData, Subscription
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


# ============================================
# SCHEMAS
# ============================================

class ProjectCreate(BaseModel):
    name: str
    sector: str = "AUTRE"
    subSector: Optional[str] = None
    country: str = "CM"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None


class BulkFormInputs(BaseModel):
    answers: dict


class ProjectResponse(BaseModel):
    id: str
    userId: str
    name: str
    sector: str
    subSector: Optional[str]
    country: str
    status: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


# ============================================
# PROJECT ENDPOINTS
# ============================================

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new project"""
    
    # Get user subscription
    result = await db.execute(
        select(Subscription).where(Subscription.userId == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    user_plan = subscription.plan if subscription else "FREE"
    
    # Check project limits
    result = await db.execute(
        select(func.count(Project.id)).where(Project.userId == current_user.id)
    )
    current_count = result.scalar() or 0
    
    # Plan limits
    limits = {"FREE": 1, "BASIC": 5, "PRO": -1}
    max_projects = limits.get(user_plan, 1)
    
    if max_projects != -1 and current_count >= max_projects:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Project limit reached. Please upgrade your plan."
        )
    
    # Create project
    project = Project(
        userId=current_user.id,
        name=project_data.name,
        sector=project_data.sector,
        subSector=project_data.subSector,
        country=project_data.country,
        status="DRAFT"
    )
    db.add(project)
    
    # Update subscription usage
    if subscription:
        subscription.projectsUsed += 1
    
    await db.flush()
    
    return ProjectResponse.model_validate(project)


@router.get("")
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all projects for current user with stats"""
    
    result = await db.execute(
        select(Project)
        .where(Project.userId == current_user.id)
        .order_by(Project.updatedAt.desc())
    )
    projects = result.scalars().all()
    
    # Get stats
    total_docs = 0
    exports_used = 0
    
    for p in projects:
        result = await db.execute(
            select(GeneratedDocument).where(GeneratedDocument.projectId == p.id)
        )
        gen_doc = result.scalar_one_or_none()
        if gen_doc:
            # Count canvases
            result = await db.execute(
                select(func.count(CanvasData.id)).where(CanvasData.docId == gen_doc.id)
            )
            canvas_count = result.scalar() or 0
            total_docs += canvas_count + (1 if gen_doc.rawContent else 0)
            
            # Count exports
            from app.models.models import Export
            result = await db.execute(
                select(func.count(Export.id)).where(Export.docId == gen_doc.id)
            )
            exports_used += result.scalar() or 0
    
    return {
        "projects": [ProjectResponse.model_validate(p) for p in projects],
        "totalDocs": total_docs,
        "exportsUsed": exports_used
    }


@router.get("/{project_id}")
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get project details with generated documents"""
    
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
    
    # Get form inputs
    result = await db.execute(
        select(FormInput)
        .where(FormInput.projectId == project_id)
        .order_by(FormInput.stepNumber)
    )
    form_inputs = result.scalars().all()
    
    # Get generated document
    result = await db.execute(
        select(GeneratedDocument)
        .where(GeneratedDocument.projectId == project_id)
    )
    gen_doc = result.scalar_one_or_none()
    
    canvases = []
    if gen_doc:
        result = await db.execute(
            select(CanvasData)
            .where(CanvasData.docId == gen_doc.id)
        )
        canvas_list = result.scalars().all()
        for c in canvas_list:
            canvases.append({
                "canvasType": c.canvasType,
                "blocks": json.loads(c.blocks) if c.blocks else {},
            })
    
    return {
        "project": {
            "id": project.id,
            "name": project.name,
            "sector": project.sector,
            "status": project.status,
            "createdAt": project.createdAt.isoformat() if project.createdAt else None,
        },
        "formInputs": [
            {
                "questionKey": i.questionKey,
                "answerValue": i.answerValue,
                "stepNumber": i.stepNumber
            }
            for i in form_inputs
        ],
        "generatedDoc": {
            "status": gen_doc.status if gen_doc else None,
            "version": gen_doc.version if gen_doc else 0,
            "canvases": canvases,
            "rawContent": gen_doc.rawContent if gen_doc else None
        } if gen_doc else None
    }


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update project"""
    
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
    
    if project_data.name:
        project.name = project_data.name
    if project_data.status:
        project.status = project_data.status
        if project_data.status == "COMPLETED":
            project.completedAt = datetime.utcnow()
    
    project.updatedAt = datetime.utcnow()
    
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete project"""
    
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
    
    await db.delete(project)
    
    return {"success": True, "message": "Project deleted"}


# ============================================
# FORM INPUTS
# ============================================

@router.post("/{project_id}/inputs")
async def save_form_inputs(
    project_id: str,
    inputs_data: BulkFormInputs,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save form inputs (bulk)"""
    
    # Verify project exists
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
    
    # Delete existing inputs
    result = await db.execute(
        select(FormInput).where(FormInput.projectId == project_id)
    )
    existing = result.scalars().all()
    for inp in existing:
        await db.delete(inp)
    
    # Create new inputs
    step_number = 1
    for key, value in inputs_data.answers.items():
        form_input = FormInput(
            projectId=project_id,
            stepNumber=step_number,
            questionKey=key,
            answerValue=str(value),
            answerType="TEXT"
        )
        db.add(form_input)
        step_number += 1
    
    # Update project status
    project.status = "IN_PROGRESS"
    project.updatedAt = datetime.utcnow()
    
    return {"success": True, "message": "Form inputs saved"}


@router.get("/{project_id}/inputs")
async def get_form_inputs(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all form inputs for project"""
    
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
        select(FormInput)
        .where(FormInput.projectId == project_id)
        .order_by(FormInput.stepNumber)
    )
    inputs = result.scalars().all()
    
    return [
        {
            "id": i.id,
            "questionKey": i.questionKey,
            "answerValue": i.answerValue,
            "stepNumber": i.stepNumber
        }
        for i in inputs
    ]
