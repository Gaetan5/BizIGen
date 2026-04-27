"""
BizGen AI - Business Agent Service
Expert-level entrepreneurial advisor focusing on African markets.
Strict business context enforcement.
"""
import logging
from typing import List, Dict, Any, Optional
from app.services.enhanced_ai_service import enhanced_ai_service
from app.config import settings

logger = logging.getLogger(__name__)

class BusinessAgentService:
    """
    Expert Agent for business advice and strategy.
    Focuses on innovation, market research, and local African business context.
    """
    
    SYSTEM_PROMPT = """Tu es l'Expert Business de BizGen.IA, un conseiller stratégique de haut niveau avec 20 ans d'expérience dans l'entrepreneuriat en Afrique.
    
    TON RÔLE :
    - Guider les entrepreneurs dans leur stratégie de marché.
    - Analyser les opportunités d'innovation dans les secteurs clés (Fintech, AgriTech, Logistique, etc.).
    - Répondre de manière précise et professionnelle sur le business, la finance, et le marketing.
    
    RÈGLES STRICTES :
    1. CONTEXTE BUSINESS UNIQUEMENT : Si une question ne concerne pas le business, l'entrepreneuriat ou l'innovation, refuse poliment d'y répondre.
    2. EXPERTISE AFRIQUE : Intègre toujours les réalités locales (paiements mobiles, zones monétaires, infrastructures, culture d'affaires).
    3. TON PROFESSIONNEL : Sois direct, analytique et encourageant. Utilise des termes techniques appropriés.
    4. PAS DE HALLUCINATIONS : Si tu ne sais pas, propose de faire une recherche ou d'approfondir un point spécifique.
    
    STRUCTURE TES RÉPONSES :
    - Diagnostic : Analyse de la situation.
    - Recommandations : Actions concrètes.
    - Risques/Opportunités : Points de vigilance.
    """

    async def get_advice(self, user_query: str, project_context: Optional[Dict[str, Any]] = None) -> str:
        """Get strategic advice from the business agent"""
        try:
            # Sanitize and isolate input
            def sanitize(text: Any) -> str:
                return str(text).replace("```", "").replace("system_prompt", "input").strip()

            context_str = ""
            if project_context:
                context_str = f"""
<current_project_context>
{sanitize(project_context)}
</current_project_context>
"""
            
            user_input = f"""
<entrepreneur_query>
{sanitize(user_query)}
</entrepreneur_query>
"""
            
            user_prompt = f"{context_str}\n{user_input}\n\nRéponds à la question contenue dans <entrepreneur_query> en tenant compte du contexte éventuel dans <current_project_context>."
            
            response = await enhanced_ai_service.call_ai(
                system_prompt=self.SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.7
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in Business Agent Service: {e}")
            return "Désolé, je rencontre une difficulté technique pour analyser votre demande business. Veuillez réessayer."

# Singleton instance
business_agent = BusinessAgentService()
