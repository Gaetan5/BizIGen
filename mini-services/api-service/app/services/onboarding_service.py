"""
BizGen AI - Onboarding Service
Handles conversational project creation.
Extracts structured data from natural language chat.
"""
import logging
import json
from typing import Dict, Any, List, Optional
from app.services.enhanced_ai_service import enhanced_ai_service

logger = logging.getLogger(__name__)

class OnboardingService:
    """
    Conversational onboarding expert.
    Helps users define their project through a friendly business discussion.
    """
    
    EXTRACTOR_PROMPT = """Tu es un Expert en Analyse Business.
    Ton rôle est d'extraire des informations structurées à partir d'une discussion avec un entrepreneur.
    
    D'après le message de l'utilisateur, extrais les champs suivants en JSON (si présents) :
    {
        "company_name": "nom de l'entreprise",
        "sector": "secteur d'activité",
        "description": "description courte",
        "problem_solved": "le problème adressé",
        "target_market": "la cible",
        "revenue_model": "comment l'argent est gagné"
    }
    
    Si une information manque, laisse le champ vide ou null.
    Réponds UNIQUEMENT avec le JSON.
    """

    NEXT_QUESTION_PROMPT = """Tu es BizGen AI. Tu aides un entrepreneur à configurer son projet.
    Basé sur les données déjà collectées : {collected_data}
    
    Ta mission :
    1. Analyse ce qu'il manque pour un Business Model Canvas complet.
    2. Pose LA question la plus pertinente pour avancer (sois bref, pro et encourageant).
    3. Si tout est complet, félicite-le et propose de lancer la génération.
    
    RÉPONDS EN FRANÇAIS.
    """

    async def extract_data(self, user_message: str) -> Dict[str, Any]:
        """Extract structured data from user input"""
        try:
            response = await enhanced_ai_service.call_ai(
                system_prompt=self.EXTRACTOR_PROMPT,
                user_prompt=f"MESSAGE DE L'UTILISATEUR :\n{user_message}",
                temperature=0.1 # Very deterministic
            )
            return json.loads(response)
        except Exception as e:
            logger.error(f"Onboarding extraction error: {e}")
            return {}

    async def get_next_step(self, collected_data: Dict[str, Any]) -> str:
        """Decide the next question to ask the user"""
        try:
            response = await enhanced_ai_service.call_ai(
                system_prompt=self.NEXT_QUESTION_PROMPT.format(collected_data=json.dumps(collected_data)),
                user_prompt="Quelle est la prochaine question ?",
                temperature=0.7
            )
            return response
        except Exception as e:
            logger.error(f"Onboarding next step error: {e}")
            return "Pouvez-vous m'en dire plus sur votre modèle de revenus ?"

# Singleton instance
onboarding_service = OnboardingService()
