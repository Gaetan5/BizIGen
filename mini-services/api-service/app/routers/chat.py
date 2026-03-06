"""
BizGen AI - Chat Router
AI-powered chat assistant for project assistance
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from pydantic import BaseModel
import json

from app.database import get_db
from app.models.models import User, Project, FormInput, GeneratedDocument, CanvasData
from app.routers.auth import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/chat", tags=["AI Chat"])


# ============================================
# SCHEMAS
# ============================================

class ChatRequest(BaseModel):
    message: str
    projectId: Optional[str] = None
    context: Optional[str] = None


class ChatResponse(BaseModel):
    success: bool
    response: str
    suggestions: List[str] = []


# ============================================
# ENDPOINTS
# ============================================

@router.post("", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Chat with AI assistant for project guidance"""
    
    project_data = None
    
    # If project_id provided, get project context
    if request.projectId:
        result = await db.execute(
            select(Project)
            .where(
                Project.id == request.projectId,
                Project.userId == current_user.id
            )
        )
        project = result.scalar_one_or_none()
        
        if project:
            # Get form inputs
            result = await db.execute(
                select(FormInput)
                .where(FormInput.projectId == project.id)
            )
            form_inputs = result.scalars().all()
            
            # Get generated document
            result = await db.execute(
                select(GeneratedDocument)
                .where(GeneratedDocument.projectId == project.id)
            )
            gen_doc = result.scalar_one_or_none()
            
            # Get canvas data
            canvases_data = {}
            if gen_doc:
                result = await db.execute(
                    select(CanvasData)
                    .where(CanvasData.docId == gen_doc.id)
                )
                canvases = result.scalars().all()
                for canvas in canvases:
                    canvases_data[canvas.canvasType] = json.loads(canvas.blocks) if canvas.blocks else {}
            
            project_data = {
                "name": project.name,
                "sector": project.sector,
                "status": project.status,
                "formInputs": {inp.questionKey: inp.answerValue for inp in form_inputs},
                "canvases": canvases_data,
            }
    
    try:
        result = await ai_service.chat(
            message=request.message,
            context=request.context,
            project_data=project_data
        )
        
        return ChatResponse(
            success=True,
            response=result["response"],
            suggestions=result.get("suggestions", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI chat error: {str(e)}"
        )


@router.post("/suggest-questions/{project_id}")
async def suggest_questions(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get suggested questions based on project state"""
    
    # Get project
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
    
    # Generate contextual suggestions based on project status
    suggestions = []
    
    if project.status == "DRAFT":
        suggestions = [
            "Quelles informations dois-je fournir pour mon Business Model Canvas ?",
            "Comment bien définir ma proposition de valeur ?",
            "Quels sont les éléments clés d'un bon pitch ?"
        ]
    elif project.status == "IN_PROGRESS":
        suggestions = [
            "Comment valider mon hypothèse de marché ?",
            "Quelles métriques devrais-je suivre en priorité ?",
            "Comment identifier mes early adopters ?"
        ]
    elif project.status == "COMPLETED":
        suggestions = [
            "Comment améliorer mon Business Model Canvas ?",
            "Quelles stratégies de croissance suggérez-vous ?",
            "Comment préparer mon pitch pour les investisseurs ?"
        ]
    else:
        suggestions = [
            "Comment puis-je vous aider avec votre projet ?",
            "Quelle est la prochaine étape pour mon business ?",
            "Quels conseils pour réussir mon projet ?"
        ]
    
    return {
        "success": True,
        "suggestions": suggestions
    }
