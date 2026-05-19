import logging
import json
from typing import Dict, List
from app.services.enhanced_ai_service import enhanced_ai_service
from app.schemas.intelligence_schemas import PitchDeckResponse

logger = logging.getLogger(__name__)

class PitchDeckService:
    """
    Expert Presentation Agent with strict type validation.
    """
    
    PITCH_PROMPT = """Tu es un Pitch Designer expert.
    Transforme ce Business Plan en un Pitch Deck de 10 slides percutantes.
    Tu dois impérativement respecter le schéma JSON fourni.
    """

    async def generate_deck_content(self, bp_data: Dict) -> PitchDeckResponse:
        """Distills Business Plan into typed slides"""
        try:
            logger.info(f"Distilling pitch deck")
            
            user_prompt = f"Plan d'affaires à synthétiser : {str(bp_data)[:4000]}"
            
            response = await enhanced_ai_service.call_ai(
                system_prompt=self.PITCH_PROMPT,
                user_prompt=user_prompt,
                temperature=0.4
            )
            
            # Validation Pydantic pour supprimer le 'Any'
            data = json.loads(response.strip().replace("```json", "").replace("```", ""))
            return PitchDeckResponse(**data)
            
        except Exception as e:
            logger.error(f"Error generating pitch deck: {e}")
            # Retour d'un objet vide valide au lieu d'un dictionnaire Any
            return PitchDeckResponse(project_name="Erreur", slides=[])

pitch_deck_service = PitchDeckService()
