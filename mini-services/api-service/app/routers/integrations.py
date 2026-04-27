"""
BizGen AI - Integrations Router
Endpoints for connecting and pushing data to external services.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Dict, Any
import logging

from app.schemas import IntegrationPushRequest, IntegrationResponse, IntegrationService
from app.services.integration_hub import integration_hub
from app.routers.auth import get_current_user
from app.models.models import User

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/integrations",
    tags=["Integrations"],
    responses={404: {"description": "Not found"}},
)

@router.post("/push", response_model=IntegrationResponse)
async def push_to_external_service(
    request: IntegrationPushRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Pousse le contenu d'un projet vers un service tiers (GitHub, Drive, OneDrive).
    """
    logger.info(f"Push request to {request.service} for project {request.project_id}")
    
    # Simulation de récupération de contenu si non fourni
    content = request.content or f"# Documentation BizGen - Projet {request.project_id}\n\nContenu généré automatiquement."
    
    try:
        if request.service == IntegrationService.GITHUB:
            # Pour GitHub, target_path est le nom du repo ou le chemin complet
            result = await integration_hub.push_to_github(
                repo_full_name=request.target_path,
                path=request.filename,
                content=content,
                token=request.token
            )
        
        elif request.service == IntegrationService.GOOGLE_DRIVE:
            result = await integration_hub.push_to_google_drive(
                filename=request.filename,
                content=content,
                access_token=request.token
            )
            
        elif request.service == IntegrationService.ONEDRIVE:
            result = await integration_hub.push_to_onedrive(
                filename=request.filename,
                content=content,
                access_token=request.token
            )
        
        else:
            raise HTTPException(status_code=400, detail="Service non supporté")
            
        if result.get("status") == "success":
            return IntegrationResponse(
                success=True,
                service=request.service,
                url=result.get("url"),
                message="Transfert réussi"
            )
        else:
            return IntegrationResponse(
                success=False,
                service=request.service,
                message=result.get("message", "Erreur lors du transfert")
            )
            
    except Exception as e:
        logger.error(f"Integration Hub Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne du hub d'intégration: {str(e)}")

@router.get("/status")
async def get_integration_status():
    """
    Récupère l'état des intégrations pour l'utilisateur courant.
    """
    return {
        "services": [
            {"id": "github", "name": "GitHub", "connected": False},
            {"id": "google_drive", "name": "Google Drive", "connected": False},
            {"id": "onedrive", "name": "OneDrive", "connected": False}
        ]
    }
