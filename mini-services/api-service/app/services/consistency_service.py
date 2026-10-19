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
        
        # 4. Cohérence Lean Canvas vs BMC
        if lean:
            if not lean.unique_value_proposition or len(lean.unique_value_proposition) < 10:
                issues.append({
                    "type": "WARNING",
                    "message": "Proposition de valeur unique (UVP) trop floue dans le Lean Canvas.",
                    "fix": "Formulez une promesse claire et mémorable pour vos early adopters."
                })
                score -= 10

        # 5. Cohérence Financière (R01 & R07 - Diagnostic Scoring)
        if hasattr(financials, "metrics") and financials.metrics:
            break_even_month = getattr(financials.metrics, "break_even_month", None)
            if break_even_month and break_even_month > 36:
                issues.append({
                    "type": "WARNING",
                    "message": f"Point mort atteint après {break_even_month} mois (> 3 ans) : rentabilité lointaine.",
                    "fix": "Augmentez le panier moyen ou réduisez les coûts fixes de départ."
                })
                score -= 10

        return {
            "consistency_score": max(0, score),
            "is_logically_sound": score > 70,
            "issues": issues,
            "expert_verdict": "Projet hautement cohérent et prêt" if score >= 85 else ("Projet cohérent" if score > 70 else "Des ajustements logiques sont nécessaires.")
        }

consistency_service = ConsistencyService()
