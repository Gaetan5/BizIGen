import logging
import json
from typing import List, Dict, Optional
from app.services.search_service import search_service
from app.services.enhanced_ai_service import enhanced_ai_service
from app.schemas.intelligence_schemas import MarketIntelligenceResponse

logger = logging.getLogger(__name__)

class CompetitorDiscoveryService:
    """
    Expert Market Intelligence Agent.
    Finds REAL market players using live web data.
    """
    
    DISCOVERY_PROMPT = """Tu es un Analyste en Intelligence Économique.
    Ta mission : Extraire les concurrents RÉELS à partir des données web fournies.
    
    CONSIGNES :
    - Ne cite que des entreprises mentionnées dans le contexte de recherche.
    - Sois objectif sur leurs forces et faiblesses.
    - Si aucun concurrent n'est trouvé, signale-le comme une opportunité ou un risque de marché inexploré.
    
    RÉPONDS EXCLUSIVEMENT AU FORMAT JSON :
    {
        "direct_competitors": [{"name": "...", "strength": "...", "weakness": "...", "url_source": "..."}],
        "indirect_competitors": [{"name": "...", "why": "..."}],
        "market_threats": ["..."],
        "differentiation_strategy": "..."
    }
    """

    async def discover_competitors(self, sector: str, country: str, description: str) -> MarketIntelligenceResponse:
        """Discovers real competitors using live search data and strict typing"""
        try:
            # 1. Recherche Web intensive
            query = f"entreprises concurrentes {sector} {country} {description[:50]}"
            search_results = await search_service.search(query, num_results=5)
            
            search_context = json.dumps([
                {"title": r['title'], "snippet": r['snippet'], "link": r['link']} 
                for r in search_results
            ], ensure_ascii=False)

            # 2. Analyse par l'IA
            user_prompt = f"""
            SECTEUR : {sector}
            PAYS : {country}
            PROJET : {description}
            
            DONNÉES WEB TROUVÉES :
            {search_context}
            """
            
            response = await enhanced_ai_service.call_ai(
                system_prompt=self.DISCOVERY_PROMPT,
                user_prompt=user_prompt,
                temperature=0.2
            )
            
            # 3. Validation Stricte
            clean_json = response.strip().replace("```json", "").replace("```", "")
            data = json.loads(clean_json)
            return MarketIntelligenceResponse(**data)
            
        except Exception as e:
            logger.error(f"Competitor Discovery Failure: {e}")
            return MarketIntelligenceResponse(
                direct_competitors=[],
                indirect_competitors=[],
                market_threats=["Échec de la recherche"],
                differentiation_strategy="Veuillez réessayer plus tard."
            )

competitor_discovery = CompetitorDiscoveryService()
