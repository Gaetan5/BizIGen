import logging
import json
from typing import Dict, List
from app.services.enhanced_ai_service import enhanced_ai_service
from app.services.financial_engine import financial_engine
from app.services.sector_expertise import sector_expertise
from app.schemas.intelligence_schemas import FinancialPlanResponse

logger = logging.getLogger(__name__)

class FinancialPlannerService:
    """
    Expert Financial Controller Agent with strict typing.
    """
    
    PLANNER_PROMPT = """Tu es un CFO expert. Génère les projections financières sur 3 ans au format JSON strict.
    """

    async def generate_full_projections(self, project_data: Dict, country_code: str = "CM") -> FinancialPlanResponse:
        """Generates complete 3-year financial model with Honesty Check and strict typing"""
        try:
            logger.info(f"Generating financial projections")
            
            system_prompt = sector_expertise.enrich_prompt(project_data.get('sector', 'General'), self.PLANNER_PROMPT)
            
            user_prompt = f"Modèle financier pour : {project_data.get('name')} | Secteur: {project_data.get('sector')}"
            
            response = await enhanced_ai_service.call_ai(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.2
            )
            
            data = json.loads(response.strip().replace("```json", "").replace("```", ""))
            
            # Validation Pydantic (Supprime le Any)
            validated_data = FinancialPlanResponse(**data)
            
            # HONESTY CHECK
            warnings = []
            for year in ["year1", "year2", "year3"]:
                y_data = getattr(validated_data.projections, year)
                if y_data.revenue > 0:
                    margin_pct = (y_data.net_profit / y_data.revenue) * 100
                    if margin_pct > 70:
                        warnings.append(f"Marge de {round(margin_pct)}% en {year} est suspecte.")
            
            validated_data.honesty_check = {
                "is_realistic": len(warnings) == 0,
                "warnings": warnings
            }
            
            return validated_data
            
        except Exception as e:
            logger.error(f"Financial Planning Error: {e}")
            # Retourne un objet par défaut pour éviter le crash
            raise ValueError(f"Erreur de planification financière : {e}")

financial_planner = FinancialPlannerService()
