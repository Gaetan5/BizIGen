"""
BizGen AI - Simulation Service
Stress-tests business plans against external shocks and crises.
"""
import logging
import json
from typing import Dict, Any, List
from app.services.enhanced_ai_service import enhanced_ai_service

logger = logging.getLogger(__name__)

class SimulationService:
    """
    Expert Risk Management Agent.
    Simulates 'What-If' scenarios to test business resilience.
    """
    
    SIMULATION_PROMPT = """Tu es un Expert en Gestion de Risques et Planification de Continuité d'Activité.
    Ta mission : Simuler l'impact d'une crise majeure sur le projet décrit.
    
    SCÉNARIOS POSSIBLES :
    - Crise Économique (Inflation massive, dévaluation).
    - Arrivée d'un Concurrent Géant (Entrée de Google/Amazon sur le marché).
    - Choc Réglementaire (Nouvelle loi interdisant le modèle actuel).
    - Rupture de la Chaîne Logistique (Fermeture des frontières).
    
    ANALYSES REQUISES :
    1. IMPACT IMMÉDIAT : Que se passe-t-il le jour 1 ?
    2. RÉSILIENCE : Combien de temps l'entreprise peut-elle survivre ?
    3. STRATÉGIE DE PIVOT : Comment adapter le modèle pour survivre ?
    
    RÉPONDS AU FORMAT JSON :
    {
        "scenario_name": "...",
        "probability_pct": int,
        "impact_severity": "Low/Medium/High/Critical",
        "detailed_impact": "...",
        "survival_estimate": "...",
        "pivot_strategy": "...",
        "preventive_actions": ["..."]
    }
    """

    async def run_simulation(self, project_data: Dict[str, Any], scenario_type: str = "Economic") -> Dict[str, Any]:
        """Simulates a crisis scenario for a project"""
        try:
            logger.info(f"Running {scenario_type} simulation for {project_data.get('name')}")
            
            user_prompt = f"""
            PROJET : {str(project_data)[:3000]}
            TYPE DE SCÉNARIO SOUHAITÉ : {scenario_type}
            
            Simule l'impact et propose des solutions de survie.
            """
            
            response = await enhanced_ai_service.call_ai(
                system_prompt=self.SIMULATION_PROMPT,
                user_prompt=user_prompt,
                temperature=0.7 # More creativity for simulation
            )
            
            return json.loads(response)
            
        except Exception as e:
            logger.error(f"Error during simulation: {e}")
            return {"error": "Échec de la simulation de crise."}

simulation_service = SimulationService()
