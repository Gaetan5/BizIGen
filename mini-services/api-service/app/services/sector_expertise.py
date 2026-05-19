"""
BizGen AI - Sector Expertise Service
Provides domain-specific knowledge and KPIs for specialized industries.
Focuses on African and Emerging Markets.
"""
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

SECTOR_KNOWLEDGE = {
    "Agriculture": {
        "critical_factors": ["Saisonnalité", "Logistique du froid", "Accès aux intrants", "Régulation foncière"],
        "typical_kpis": ["Rendement à l'hectare", "Taux de perte post-récolte", "Coût de collecte"],
        "expert_prompt": "Agis comme un Ingénieur Agronome et Business Developer Agri. Focus sur la chaîne de valeur et la résilience climatique."
    },
    "Fintech": {
        "critical_factors": ["Conformité (KYC/AML)", "Sécurité des données", "Interopérabilité", "Coût d'acquisition client (CAC)"],
        "typical_kpis": ["LTV (Lifetime Value)", "Churn Rate", "Volume Transactionnel (GTV)"],
        "expert_prompt": "Agis comme un Expert en Systèmes de Paiement et Régulation Bancaire. Focus sur la sécurité, la fraude et l'adoption utilisateur."
    },
    "E-commerce": {
        "critical_factors": ["Logistique du dernier kilomètre", "Confiance client", "Paiement à la livraison", "Gestion des stocks"],
        "typical_kpis": ["Panier moyen", "Taux de conversion", "Délai de livraison"],
        "expert_prompt": "Agis comme un Expert en Growth Hacking et Logistique E-commerce. Focus sur l'expérience client et l'optimisation des flux."
    },
    "Sante": {
        "critical_factors": ["Éthique", "Accessibilité", "Qualité des soins", "Gestion des données sensibles"],
        "typical_kpis": ["Taux de consultation", "Satisfaction patient", "Coût par patient"],
        "expert_prompt": "Agis comme un Consultant en Santé Publique et Management Hospitalier. Focus sur l'impact social et la rigueur médicale."
    }
}

class SectorExpertiseService:
    """
    Expert Knowledge Hub.
    Injects industry-specific context into AI generations.
    """
    
    def get_expertise(self, sector: str) -> Dict[str, Any]:
        """Returns specialized data for a given sector"""
        # Match flexible (ex: 'Agri-business' -> 'Agriculture')
        for key in SECTOR_KNOWLEDGE:
            if key.lower() in sector.lower():
                return SECTOR_KNOWLEDGE[key]
        
        # Default fallback
        return {
            "critical_factors": ["Rentabilité", "Marché", "Équipe"],
            "typical_kpis": ["Revenu", "Coûts", "Marge"],
            "expert_prompt": "Agis comme un Consultant Business généraliste."
        }

    def enrich_prompt(self, sector: str, original_prompt: str) -> str:
        """Enriches a prompt with sector-specific instructions"""
        expertise = self.get_expertise(sector)
        return f"{expertise['expert_prompt']}\nPrends en compte ces facteurs critiques : {', '.join(expertise['critical_factors'])}\n{original_prompt}"

sector_expertise = SectorExpertiseService()
