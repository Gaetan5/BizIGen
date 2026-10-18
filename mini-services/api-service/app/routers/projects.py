"""
BizGen AI - Projects Router
Handles project CRUD and form inputs
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
import json
import math

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
    name: str = Field(..., min_length=1, max_length=150, description="Nom du projet")
    sector: str = Field(..., min_length=2, max_length=50, description="Secteur d'activité")
    subSector: Optional[str] = Field(None, max_length=100)
    country: str = Field(..., min_length=2, max_length=10, description="Code pays (ex: CM, CI, SN)")

    @field_validator("name", "sector", "country")
    @classmethod
    def strip_and_validate(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Field cannot be empty or whitespace only")
        return cleaned


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    sector: Optional[str] = Field(None, min_length=2, max_length=50)
    subSector: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, min_length=2, max_length=10)
    status: Optional[str] = Field(None, pattern="^(DRAFT|IN_PROGRESS|GENERATING|COMPLETED|ARCHIVED)$")

    @field_validator("name", "sector", "country")
    @classmethod
    def strip_and_validate_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Field cannot be empty or whitespace only")
            return cleaned
        return v


class BulkFormInputs(BaseModel):
    answers: Optional[dict] = None
    inputs: Optional[List[dict]] = None


class ProjectResponse(BaseModel):
    id: str
    userId: str
    name: str
    sector: str
    subSector: Optional[str] = None
    country: str
    status: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class FormInputItem(BaseModel):
    questionKey: str
    answerValue: str
    stepNumber: Optional[int] = None


class CanvasItem(BaseModel):
    canvasType: str
    blocks: Dict[str, Any] = Field(default_factory=dict)


class GeneratedDocDetail(BaseModel):
    status: Optional[str] = None
    version: int = 0
    canvases: List[CanvasItem] = Field(default_factory=list)
    rawContent: Optional[str] = None


class ProjectSummary(BaseModel):
    id: str
    name: str
    sector: str
    status: str
    createdAt: Optional[str] = None


class ProjectDetailResponse(BaseModel):
    id: str
    userId: str
    name: str
    sector: str
    subSector: Optional[str] = None
    country: str
    status: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    project: ProjectSummary
    formInputs: List[FormInputItem] = Field(default_factory=list)
    generatedDoc: Optional[GeneratedDocDetail] = None


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
    
    # Check current project count
    result = await db.execute(
        select(func.count(Project.id)).where(Project.userId == current_user.id)
    )
    current_count = result.scalar() or 0
    
    from app.services.payment_service import payment_service
    if not payment_service.can_create_project(user_plan, current_count):
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
    
    await db.commit()
    await db.refresh(project)
    
    return ProjectResponse.model_validate(project)


@router.get("")
async def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    sortBy: str = Query("updatedAt"),
    sortOrder: str = Query("desc"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all projects for current user with pagination, filter and sorting"""
    from sqlalchemy.orm import selectinload
    
    # Count total query
    count_query = select(func.count(Project.id)).where(Project.userId == current_user.id)
    if status:
        count_query = count_query.where(Project.status == status)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Build select query
    query = (
        select(Project)
        .where(Project.userId == current_user.id)
        .options(
            selectinload(Project.generatedDoc).selectinload(GeneratedDocument.canvases),
            selectinload(Project.generatedDoc).selectinload(GeneratedDocument.exports)
        )
    )
    if status:
        query = query.where(Project.status == status)

    # Sorting
    sort_column = getattr(Project, sortBy, Project.updatedAt)
    if sortOrder.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # Pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    projects = result.scalars().all()
    
    total_docs = 0
    exports_used = 0
    project_list = []
    
    for p in projects:
        gen_doc = p.generatedDoc
        if gen_doc:
            canvas_count = len(gen_doc.canvases)
            total_docs += canvas_count + (1 if gen_doc.rawContent else 0)
            exports_used += len(gen_doc.exports)
        
        project_list.append(ProjectResponse.model_validate(p))
    
    total_pages = math.ceil(total / limit) if total > 0 else 0
    has_next = page < total_pages

    return {
        "projects": project_list,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": total_pages,
            "hasNext": has_next
        },
        "totalDocs": total_docs,
        "exportsUsed": exports_used
    }


@router.get("/{project_id}", response_model=ProjectDetailResponse)
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
    
    # Get generated document with canvases eagerly loaded
    result = await db.execute(
        select(GeneratedDocument)
        .options(selectinload(GeneratedDocument.canvases))
        .where(GeneratedDocument.projectId == project_id)
    )
    gen_doc = result.scalar_one_or_none()
    
    canvases = []
    if gen_doc and gen_doc.canvases:
        for c in gen_doc.canvases:
            canvases.append({
                "canvasType": c.canvasType,
                "blocks": json.loads(c.blocks) if c.blocks else {},
            })
    
    return {
        "id": project.id,
        "userId": project.userId,
        "name": project.name,
        "sector": project.sector,
        "subSector": project.subSector,
        "country": project.country,
        "status": project.status,
        "createdAt": project.createdAt.isoformat() if project.createdAt else None,
        "updatedAt": project.updatedAt.isoformat() if project.updatedAt else None,
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
    
    if project_data.name is not None:
        project.name = project_data.name
    if project_data.sector is not None:
        project.sector = project_data.sector
    if project_data.subSector is not None:
        project.subSector = project_data.subSector
    if project_data.country is not None:
        project.country = project_data.country
    if project_data.status is not None:
        project.status = project_data.status
    
    project.updatedAt = datetime.utcnow()
    await db.commit()
    await db.refresh(project)
    
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
    await db.commit()
    
    return {"success": True, "message": "Project deleted"}


# ============================================
# FORM INPUTS
# ============================================

async def _save_inputs_logic(project_id: str, payload: dict, current_user: User, db: AsyncSession):
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
    
    # Delete existing inputs atomically in a single SQL operation
    await db.execute(
        delete(FormInput).where(FormInput.projectId == project_id)
    )
    
    count = 0
    # Can receive inputs as list or answers as dict
    if "inputs" in payload and isinstance(payload["inputs"], list):
        step_number = 1
        for item in payload["inputs"]:
            q_key = item.get("questionKey")
            a_val = item.get("answerValue", "")
            if q_key:
                form_input = FormInput(
                    projectId=project_id,
                    stepNumber=step_number,
                    questionKey=q_key,
                    answerValue=str(a_val),
                    answerType="TEXT"
                )
                db.add(form_input)
                step_number += 1
                count += 1
    elif "answers" in payload and isinstance(payload["answers"], dict):
        step_number = 1
        for key, value in payload["answers"].items():
            form_input = FormInput(
                projectId=project_id,
                stepNumber=step_number,
                questionKey=key,
                answerValue=str(value),
                answerType="TEXT"
            )
            db.add(form_input)
            step_number += 1
            count += 1
    
    # Update project status
    project.status = "IN_PROGRESS"
    project.updatedAt = datetime.utcnow()
    await db.commit()
    
    return {"success": True, "message": "Form inputs saved", "savedCount": count}


@router.post("/{project_id}/inputs")
async def save_form_inputs_endpoint(
    project_id: str,
    inputs_data: BulkFormInputs,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save form inputs (via /inputs)"""
    return await _save_inputs_logic(project_id, inputs_data.model_dump(), current_user, db)


@router.post("/{project_id}/form")
async def save_form_endpoint(
    project_id: str,
    inputs_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save form inputs (via /form)"""
    return await _save_inputs_logic(project_id, inputs_data, current_user, db)


@router.get("/{project_id}/form")
async def get_form_dict(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get form inputs as key-value map for test compatibility"""
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
    
    return {
        "inputs": {i.questionKey: i.answerValue for i in inputs}
    }


@router.get("/{project_id}/inputs")
async def get_form_inputs(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all form inputs for project as list"""
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
