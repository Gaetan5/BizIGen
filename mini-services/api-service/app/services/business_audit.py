"""
BizGen AI - Business Audit Service
Professional strategic analysis of generated business projects.
Provides viability scoring and corrective actions.
"""
import logging
from typing import Dict, Any, List
from app.services.enhanced_ai_service import enhanced_ai_service

logger = logging.getLogger(__name__)

class BusinessAuditService:
    """
    Strategic Auditor that reviews business plans for weaknesses.
    Acts as a 'Venture Capitalist' reviewing a pitch.
    """
    
    AUDIT_PROMPT = """Tu es un Expert en Capital Risque (VC) et Audit Stratégique.
    Ton rôle est d'analyser le Business Plan suivant et de fournir une évaluation CRITIQUE, HONNÊTE et CONSTRUCTIVE.
    
    ANALYSE LES POINTS SUIVANTS :
    1. VIABILITÉ : Le modèle de revenus est-il réaliste ?
    2. COHÉRENCE : La solution répond-elle vraiment au problème décrit ?
    3. RISQUES : Quels sont les 3 plus gros obstacles (marché, technique, financier) ?
    4. SCORE : Donne une note de viabilité globale sur 100.
    
    TON RÉPONSE DOIT ÊTRE AU FORMAT JSON :
    {
        "viability_score": int,
        "strengths": ["point fort 1", "..."],
        "weaknesses": ["point faible 1", "..."],
        "critical_risks": ["risque 1", "..."],
        "recommendations": ["action 1", "action 2", "action 3"],
        "mentor_comment": "Un court message d'expert pour l'entrepreneur."
    }
    """

    async def audit_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Runs a strategic audit on the project data"""
        try:
            # Flatten context for the AI
            context = f"Projet: {project_data.get('name')}\nSecteur: {project_data.get('sector')}\nContenu: {project_data.get('content')}"
            
            response = await enhanced_ai_service.call_ai(
                system_prompt=self.AUDIT_PROMPT,
                user_prompt=f"ANALYSE CE PROJET :\n{context}",
                temperature=0.4 # More deterministic for audit
            )
            
            # Use the existing robust JSON parser from enhanced_ai_service
            import json
            # Small hack to reuse the internal parser if needed or simple loads
            try:
                return json.loads(response)
            except:
                # Fallback to a basic structure if AI fails JSON
                return {
                    "viability_score": 0,
                    "error": "L'analyse n'a pas pu être finalisée."
                }
                
        except Exception as e:
            logger.error(f"Error during Strategic Audit: {e}")
            return {"error": str(e)}

# Singleton instance
business_audit = BusinessAuditService()
