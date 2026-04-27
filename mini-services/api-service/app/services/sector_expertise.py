"""
BizGen AI - Sector Expertise Service
Provides deep, professional knowledge for specific business verticals.
"""
from enum import Enum
from typing import Dict, Any, List

class BusinessSector(str, Enum):
    FINANCE = "finance"
    TRADING = "trading"
    TECH_INNOVATION = "tech_innovation"
    ELECTRONIC_MONEY = "electronic_money"
    COMMERCE = "commerce"
    AGRITECH = "agritech"
    LOGISTICS = "logistics"
    STOCK_MARKET = "stock_market"

SECTOR_KNOWLEDGE: Dict[BusinessSector, Dict[str, Any]] = {
    BusinessSector.FINANCE: {
        "focus": ["EBITDA", "Flux de trésorerie", "ROI", "Leverage", "Gestion des risques"],
        "directives": "Focus sur la solidité financière, les projections de cash-flow et l'analyse de rentabilité.",
        "keywords": ["Capitaux propres", "Dette", "Fonds de roulement", "Marge nette"]
    },
    BusinessSector.TRADING: {
        "focus": ["Liquidité", "Volatility", "Risk/Reward", "Indicateurs techniques", "Execution"],
        "directives": "Analyse pointue de la volatilité des marchés, stratégies de couverture (hedging) et psychologie des marchés.",
        "keywords": ["Arbitrage", "Spread", "Leverage", "Drawdown", "Slippage"]
    },
    BusinessSector.TECH_INNOVATION: {
        "focus": ["Scalabilité", "MVP", "Stack technologique", "Propriété intellectuelle"],
        "directives": "Mise en avant de l'avantage technologique, de la roadmap produit et de la scalabilité exponentielle.",
        "keywords": ["API", "SaaS", "Architecture Cloud", "UX/UI", "Agile"]
    },
    BusinessSector.ELECTRONIC_MONEY: {
        "focus": ["Interopérabilité", "Conformité KYC/AML", "Agent Network", "Transaction volume"],
        "directives": "Expertise sur le Mobile Money, la réglementation BCEAO/CEMAC et la sécurisation des transactions.",
        "keywords": ["Gateway", "Wallet", "Ledger", "Cash-in/Cash-out", "QR Payment"]
    },
    BusinessSector.STOCK_MARKET: {
        "focus": ["Capitalisation boursière", "Dividendes", "Analyses fondamentales", "P/E Ratio"],
        "directives": "Focus sur la valorisation boursière, les rapports annuels et les stratégies d'investissement à long terme.",
        "keywords": ["Blue chips", "IPO", "Market Cap", "Volatility Index", "Yield"]
    }
}

class SectorExpertiseService:
    def get_expertise(self, sector_name: str) -> str:
        """Get specialized directives for a specific sector"""
        # Default expertise
        default_expertise = "Focus sur la croissance business et la rentabilité commerciale."
        
        # Try to match the sector
        sector_name_lower = sector_name.lower()
        
        for sector_enum, knowledge in SECTOR_KNOWLEDGE.items():
            if sector_enum.value in sector_name_lower or sector_name_lower in sector_enum.value:
                focus_str = ", ".join(knowledge["focus"])
                return f"\nEXPERTISE SECTORIELLE ({sector_enum.value.upper()}) :\n- Directives : {knowledge['directives']}\n- Points clés : {focus_str}\n- Terminologie : {', '.join(knowledge['keywords'])}"
        
        return f"\nEXPERTISE BUSINESS GÉNÉRALE :\n{default_expertise}"

# Singleton instance
sector_expertise = SectorExpertiseService()
