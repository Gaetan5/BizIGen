"""
BizGen AI - Knowledge Service
Handles local business data injection (RAG light).
Allows the AI to access specific African market reports, fiscal laws, and sector studies.
"""
import os
import logging
from typing import List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class KnowledgeService:
    """
    Expert Knowledge management.
    Reads local reference documents to provide factual context to the AI.
    """
    
    def __init__(self, knowledge_dir: str = "/app/knowledge"):
        self.knowledge_dir = Path(knowledge_dir)
        self._ensure_dir()

    def _ensure_dir(self):
        """Make sure the knowledge directory exists"""
        if not self.knowledge_dir.exists():
            try:
                os.makedirs(self.knowledge_dir, exist_ok=True)
                logger.info(f"Knowledge directory created at {self.knowledge_dir}")
            except Exception as e:
                logger.error(f"Could not create knowledge directory: {e}")

    def get_context_for_sector(self, sector: str) -> str:
        """
        Scans the knowledge directory for text files matching the sector.
        In a production environment, this would use a Vector DB (Chroma/Pinecone).
        For MVP, we use a structured text search.
        """
        context_nuggets = []
        
        try:
            if not self.knowledge_dir.exists():
                return ""

            # Look for sector-specific files (e.g., finance_senegal.txt, tech_africa.txt)
            for file in self.knowledge_dir.glob("*.txt"):
                if sector.lower() in file.name.lower():
                    with open(file, 'r', encoding='utf-8') as f:
                        # Take the first 2000 characters to avoid prompt overflow
                        content = f.read(2000)
                        context_nuggets.append(f"--- SOURCE: {file.name} ---\n{content}")
            
            if not context_nuggets:
                # Fallback to general market info if available
                general_file = self.knowledge_dir / "general_market_africa.txt"
                if general_file.exists():
                    with open(general_file, 'r', encoding='utf-8') as f:
                        return f"--- CONTEXTE GÉNÉRAL ---\n{f.read(1500)}"
            
            return "\n\n".join(context_nuggets)
            
        except Exception as e:
            logger.error(f"Error reading knowledge base: {e}")
            return ""

# Singleton instance
knowledge_service = KnowledgeService()
