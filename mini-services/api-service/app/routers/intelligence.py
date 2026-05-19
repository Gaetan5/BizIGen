"""
BizGen AI - Intelligence Router
Endpoints for market research, automated reporting and multi-format exports.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from typing import Optional
from app.services.report_service import report_service
from app.routers.auth import get_current_user
from app.models.models import User

from app.services.pitch_deck_service import pitch_deck_service
from app.services.export_service import export_service
from app.services.business_audit import business_audit
from app.services.simulation_service import simulation_service
from app.services.financial_planner import financial_planner
from app.services.report_service import report_service

router = APIRouter(prefix="/intelligence", tags=["Market Intelligence"])

@router.post("/financial-plan")
async def get_financial_plan(
    project_id: str,
    format: str = Query("json", enum=["json", "csv"]),
    current_user: User = Depends(get_current_user)
):
    """
    Génère un modèle financier complet sur 3 ans (P&L, Cash-flow).
    """
    from app.database import async_session
    from app.models.models import Project
    from sqlalchemy import select
    
    async with async_session() as session:
        result = await session.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
            
        # 1. Génération des chiffres par l'IA expert CFO
        financial_data = await financial_planner.generate_full_projections(
            {"name": project.name, "sector": project.sector, "description": project.description or ""},
            country_code="CM" # Par défaut Cameroun, à rendre dynamique
        )
        
        if format == "json":
            return financial_data
            
        # 2. Export CSV pour Excel
        csv_content = report_service.export_financials_csv(financial_data)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=finances_{project.name}.csv"}
        )

@router.post("/audit-report-pdf")
async def get_audit_report_pdf(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Génère un rapport d'audit certifié au format PDF.
    """
    from app.database import async_session
    from app.models.models import Project
    from sqlalchemy import select
    
    async with async_session() as session:
        result = await session.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
            
        # 1. Lancer l'audit stratégique (si non déjà fait ou pour refresh)
        audit_results = await business_audit.audit_project(
            project.name, project.sector, "Afrique", project.description or ""
        )
        
        # 2. Générer le PDF Consulting
        pdf_content = export_service.generate_audit_report_pdf(audit_results, project.name)
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=audit_{project.name}.pdf"}
        )

@router.post("/simulate-crisis")
async def simulate_crisis(
    project_id: str,
    scenario: str = Query("Economic", enum=["Economic", "Competitor", "Regulatory", "SupplyChain"]),
    current_user: User = Depends(get_current_user)
):
    """
    Simule une crise sur le projet et propose des stratégies de pivot.
    """
    from app.database import async_session
    from app.models.models import Project
    from sqlalchemy import select
    
    async with async_session() as session:
        result = await session.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
            
        return await simulation_service.run_simulation(
            {"name": project.name, "sector": project.sector, "content": project.content},
            scenario_type=scenario
        )

@router.post("/pitch-deck")
async def generate_pitch_deck(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Génère un Pitch Deck (Slides) complet pour un projet donné.
    """
    from app.database import async_session
    from app.models.models import Project
    from sqlalchemy import select
    
    async with async_session() as session:
        result = await session.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
            
        # 1. Synthèse des slides par l'IA
        # On passe le contenu JSON du projet (Business Plan)
        deck_data = await pitch_deck_service.generate_deck_content(project.content)
        deck_data["project_name"] = project.name
        
        # 2. Génération du PDF Slides
        pdf_content = export_service.generate_pitch_deck_pdf(deck_data)
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=pitch_deck_{project.name}.pdf"}
        )

@router.get("/market-report")
async def get_market_report(
    subject: str,
    sector: str,
    country: str,
    format: str = Query("json", enum=["json", "pdf", "csv", "docx"]),
    current_user: User = Depends(get_current_user)
):
    """
    Génère un rapport de marché complet avec recherche web et IA.
    """
    try:
        report_data = await report_service.generate_market_report(subject, sector, country)
        
        if format == "json":
            return report_data
            
        elif format == "csv":
            csv_content = report_service.export_to_csv(report_data)
            return Response(
                content=csv_content,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=report_{subject}.csv"}
            )
            
        elif format == "pdf":
            # Simulation d'export PDF
            pdf_content = report_service.export_to_pdf(report_data)
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=report_{subject}.pdf"}
            )
            
        else:
            raise HTTPException(status_code=400, detail="Format non supporté pour le moment.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du rapport : {str(e)}")

@router.post("/analyze-subject")
async def analyze_subject(subject: str, current_user: User = Depends(get_current_user)):
    """
    Analyse approfondie d'un sujet via recherche web.
    """
    # ... Logique similaire sans export forcé
    return await report_service.generate_market_report(subject, "General", "Global")
