import logging
from typing import Optional, List
from app.services.enhanced_ai_service import enhanced_ai_service
from app.services.search_service import search_service
from app.services.sector_expertise import sector_expertise
from app.schemas.intelligence_schemas import ProjectSchema

logger = logging.getLogger(__name__)

class BusinessAgentService:
    """
    Expert Mentor Agent with strict typing.
    """
    
    SYSTEM_PROMPT = """Tu es le Mentor Business de BizGen.IA.
    Ton but est d'aider l'entrepreneur à confronter son idée à la réalité.
    
    POSTURE :
    - Sois un 'Sparring Partner' : pose des questions difficiles.
    - Sois basé sur les faits : utilise les données web fournies.
    - Sois proactif : suggère la prochaine étape.
    """

    async def get_mentorship(self, query: str, project_data: Optional[ProjectSchema] = None) -> str:
        """Get strategic advice with real-world grounding and strict typing"""
        try:
            sector = project_data.sector if project_data else 'General'
            country = project_data.country if project_data else 'Afrique'
            
            # 1. Recherche Web
            context_market = ""
            if any(word in query.lower() for word in ["marché", "chiffre", "prix", "concurrence", "statistique"]):
                search_results = await search_service.search(f"{query} {sector} {country}")
                context_market = "\n".join([f"- {r['snippet']}" for r in search_results])

            # 2. Expertise Sectorielle
            system_prompt = sector_expertise.enrich_prompt(sector, self.SYSTEM_PROMPT)
            
            # 3. Construction du message
            proj_info = project_data.model_dump() if project_data else {}
            user_prompt = f"""
            CONTEXTE PROJET : {proj_info}
            DONNÉES MARCHÉ : {context_market}
            QUESTION : {query}
            """
            
            response = await enhanced_ai_service.call_ai(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.7
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Mentor Agent Error: {e}")
            return "Je rencontre une difficulté pour vous conseiller actuellement. Concentrons-nous sur les fondamentaux de votre projet."

# Singleton instance
business_agent = BusinessAgentService()
