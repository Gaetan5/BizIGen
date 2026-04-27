"""
BizGen AI - Onboarding Router
Conversational project creation API
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.database import get_db
from app.models.models import User, Project, FormInput
from app.routers.auth import get_current_user
from app.services.onboarding_service import onboarding_service

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

class OnboardingChatRequest(BaseModel):
    message: str
    projectId: Optional[str] = None
    collectedData: Dict[str, Any] = {}

class OnboardingChatResponse(BaseModel):
    reply: str
    extractedData: Dict[str, Any]
    isComplete: bool = False

@router.post("/chat", response_model=OnboardingChatResponse)
async def onboarding_chat(
    request: OnboardingChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Handle a step in the conversational onboarding"""
    
    # 1. Extract data from the new message
    new_data = await onboarding_service.extract_data(request.message)
    
    # 2. Merge with already collected data
    merged_data = {**request.collectedData, **{k: v for k, v in new_data.items() if v}}
    
    # 3. Get next question from AI
    next_question = await onboarding_service.get_next_step(merged_data)
    
    # 4. Determine if we have enough to start (basic threshold)
    required_fields = ["company_name", "sector", "description", "target_market"]
    is_complete = all(merged_data.get(field) for field in required_fields)
    
    return OnboardingChatResponse(
        reply=next_question,
        extractedData=merged_data,
        isComplete=is_complete
    )
