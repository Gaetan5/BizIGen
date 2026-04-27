"""
BizGen AI - Competitor Discovery Service
Finds real market players and analyzes the competitive landscape.
"""
import logging
from typing import List, Dict, Any
from app.services.enhanced_ai_service import enhanced_ai_service

logger = logging.getLogger(__name__)

class CompetitorDiscoveryService:
    """
    Expert Market Intelligence Agent.
    Discovers competitors based on sector and region.
    """
    
    DISCOVERY_PROMPT = """Tu es un Analyste en Intelligence Économique spécialisé dans les marchés africains.
    Ta mission : Identifier les acteurs réels du marché pour le projet décrit.
    
    POUR LE SECTEUR ET LE PAYS DONNÉS, TROUVE :
    1. CONCURRENTS DIRECTS : Entreprises offrant le même service.
    2. CONCURRENTS INDIRECTS : Entreprises offrant un service différent mais répondant au même besoin.
    3. BARRIÈRES À L'ENTRÉE : Ce qui rend le marché difficile.
    
    RÉPONDS AU FORMAT JSON :
    {
        "direct_competitors": [{"name": "...", "strength": "...", "weakness": "..."}],
        "indirect_competitors": [{"name": "...", "why": "..."}],
        "market_threats": ["menace 1", "menace 2"],
        "differentiation_strategy": "Conseil d'expert pour se démarquer."
    }
    """

    async def discover_competitors(self, sector: str, country: str, description: str) -> Dict[str, Any]:
        """Discover and analyze competitors for a given context"""
        try:
            user_prompt = f"SECTEUR : {sector}\nPAYS : {country}\nDESCRIPTION DU PROJET : {description}"
            
            response = await enhanced_ai_service.call_ai(
                system_prompt=self.DISCOVERY_PROMPT,
                user_prompt=user_prompt,
                temperature=0.4
            )
            
            import json
            return json.loads(response)
            
        except Exception as e:
            logger.error(f"Error in Competitor Discovery: {e}")
            return {
                "error": "Impossible d'effectuer la recherche concurrentielle pour le moment.",
                "direct_competitors": [],
                "indirect_competitors": []
            }

# Singleton instance
competitor_discovery = CompetitorDiscoveryService()
