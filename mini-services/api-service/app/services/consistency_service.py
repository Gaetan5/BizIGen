import logging
import json
from typing import Dict, List, Optional
from app.schemas.ai_schemas import BMCResponse, LeanCanvasResponse
from app.schemas.intelligence_schemas import FinancialPlanResponse

logger = logging.getLogger(__name__)

class ConsistencyService:
    """
    Ensures that BMC, Lean Canvas, and Financials are logically aligned.
    """

    async def check_alignment(self, bmc: BMCResponse, financials: FinancialPlanResponse, lean: Optional[LeanCanvasResponse] = None) -> Dict:
        """Runs logical checks across modules with strict typing"""
        issues = []
        score = 100
        
        # 1. Marketing vs Revenue
        revenue_year1 = financials.projections.year1.revenue
        marketing_channels = bmc.channels
        
        if revenue_year1 > 10000000 and len(marketing_channels) < 3:
            issues.append({
                "type": "CRITICAL",
                "message": "Objectif de revenus élevé avec trop peu de canaux d'acquisition identifiés.",
                "fix": "Diversifiez vos canaux de distribution dans le BMC."
            })
            score -= 20

        # 2. Structure de coûts vs Activités
        opex_year1 = financials.projections.year1.opex
        key_activities = bmc.key_activities
        
        if len(key_activities) > 5 and opex_year1 < 500000:
            issues.append({
                "type": "WARNING",
                "message": "Activités clés nombreuses pour un budget opérationnel très faible.",
                "fix": "Vérifiez si vos OPEX couvrent réellement toutes vos activités."
            })
            score -= 10

        # 3. Cohérence du Segment Client
        customer_segments = bmc.customer_segments
        value_props = bmc.value_propositions
        
        if not customer_segments or not value_props:
            issues.append({
                "type": "BLOCKER",
                "message": "Segments clients ou Proposition de valeur manquants.",
                "fix": "Complétez les bases de votre Business Model."
            })
            score -= 30

        return {
            "consistency_score": max(0, score),
            "is_logically_sound": score > 70,
            "issues": issues,
            "expert_verdict": "Projet cohérent" if score > 80 else "Des ajustements logiques sont nécessaires."
        }

consistency_service = ConsistencyService()
