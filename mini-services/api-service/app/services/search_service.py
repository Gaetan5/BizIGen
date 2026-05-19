"""
BizGen AI - Search Service
Handles web searching to provide real-time market data to the AI.
"""
import httpx
import logging
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class SearchService:
    """
    Service for performing web searches.
    Can use Serper.dev, Tavily or fallback to a simulated search if no key is provided.
    """
    
    def __init__(self):
        self.api_key = os.getenv("SERPER_API_KEY")
        self.enabled = bool(self.api_key)
        
    async def search(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """
        Perform a web search and return structured results.
        """
        if not self.enabled:
            logger.warning("SearchService: No API key found. Returning simulated results.")
            return self._simulated_search(query)
            
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "X-API-KEY": self.api_key,
                    "Content-Type": "application/json"
                }
                payload = {
                    "q": query,
                    "num": num_results,
                    "gl": "fr", # Focus on French/African context
                    "hl": "fr"
                }
                
                response = await client.post(
                    "https://google.serper.dev/search",
                    headers=headers,
                    json=payload,
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                results = []
                # Process organic results
                for item in data.get("organic", []):
                    results.append({
                        "title": item.get("title"),
                        "link": item.get("link"),
                        "snippet": item.get("snippet"),
                        "source": "web"
                    })
                
                # Add answer box if available
                if "answerBox" in data:
                    results.insert(0, {
                        "title": "Direct Answer",
                        "link": data["answerBox"].get("link"),
                        "snippet": data["answerBox"].get("answer"),
                        "source": "knowledge_graph"
                    })
                    
                return results
                
        except Exception as e:
            logger.error(f"Search error: {e}")
            return self._simulated_search(query)

    def _simulated_search(self, query: str) -> List[Dict[str, Any]]:
        """Fallback simulated search results for development"""
        return [
            {
                "title": f"Analyse du marché pour {query}",
                "link": "https://bizgen-ai.com/market-analysis",
                "snippet": f"Résultats simulés pour la recherche sur '{query}'. Dans un environnement de production, ce service interroge Google pour obtenir des données en temps réel sur les marchés africains.",
                "source": "simulation"
            }
        ]

import os
search_service = SearchService()
