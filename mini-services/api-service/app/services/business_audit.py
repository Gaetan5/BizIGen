import logging
import json
from typing import Dict, List, Optional
from app.services.enhanced_ai_service import enhanced_ai_service
from app.services.search_service import search_service
from app.services.sector_expertise import sector_expertise
from app.schemas.intelligence_schemas import AuditResponse

logger = logging.getLogger(__name__)

class BusinessAuditService:
    """
    Strategic Auditor with strict typing and transparency.
    """
    
    AUDIT_PROMPT = """Analyse le projet en te basant sur les données web.
    SOIS HONNÊTE ET CRITIQUE.
    """

    async def audit_project(self, project_name: str, sector: str, country: str, description: str) -> AuditResponse:
        """Runs a strategic audit with strict typing"""
        try:
            # 1. Recherche Web
            search_query = f"marché {sector} {country} défis"
            market_data = await search_service.search(search_query)
            
            market_context = json.dumps([{"title": r['title'], "link": r['link']} for r in market_data])

            # 2. Appel IA
            system_prompt = sector_expertise.enrich_prompt(sector, self.AUDIT_PROMPT)
            user_prompt = f"PROJET: {project_name} | DESCRIPTION: {description} | MARCHÉ: {market_context}"
            
            response = await enhanced_ai_service.call_ai(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.2
            )
            
            # 3. Validation Stricte (Purge Any)
            clean_json = response.strip().replace("```json", "").replace("```", "")
            return AuditResponse(**json.loads(clean_json))
                
        except Exception as e:
            logger.error(f"Audit failure: {e}")
            raise ValueError(f"Échec de l'audit stratégique : {e}")

business_audit = BusinessAuditService()
