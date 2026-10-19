"""
BizGen AI - Sector Expertise Service
Provides domain-specific knowledge and KPIs for specialized industries.
Focuses on African and Emerging Markets.
"""
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

SECTOR_KNOWLEDGE: Dict[str, Dict[str, Any]] = {
    "Agriculture": {
        "aliases": ["agro", "agri", "agriculture", "elevage", "peche", "ferme"],
        "critical_factors": [
            "Saisonnalité des récoltes et aléas climatiques",
            "Logistique du froid et conservation post-récolte",
            "Accès aux intrants certifiés et semences de qualité",
            "Structuration en coopératives et groupements de producteurs",
            "Circuits de distribution (marchés vivriers, grossistes, agro-industries)",
            "Régulation foncière et droits d'exploitation"
        ],
        "typical_kpis": [
            "Rendement à l'hectare (t/ha)",
            "Taux de perte post-récolte (%)",
            "Coût moyen de collecte et transport au kg",
            "Marge nette par cycle de production",
            "Délai d'écoulement des stocks périssables"
        ],
        "expert_prompt": "Agis comme un Ingénieur Agronome et Stratège Agro-business senior spécialisé dans les marchés africains. Mets l'accent sur la résilience climatique, la maîtrise des coûts de collecte, la valorisation de la chaîne de valeur locale et la sécurité alimentaire."
    },
    "Agroalimentaire": {
        "aliases": ["agro_alimentaire", "agro-alimentaire", "transformation", "alimentaire", "food"],
        "critical_factors": [
            "Normes sanitaires, traçabilité et hygiène (HACCP)",
            "Emballage alimentaire adapté aux climats chauds et humides",
            "Régularité de l'approvisionnement en matières premières",
            "Maîtrise des coûts énergétiques de transformation",
            "Canaux de référencement (GMS, supérettes, boutiques de quartier, marchés)"
        ],
        "typical_kpis": [
            "Rendement de transformation matière",
            "Durée de conservation (DLC/DLUO)",
            "Coût de revient unitaire industriel",
            "Taux de rotation en rayon",
            "Marge brute distributeur vs marge fabricant"
        ],
        "expert_prompt": "Agis comme un Directeur Industriel Agroalimentaire et Expert en Packaging & Distribution. Intègre les impératifs d'homologation sanitaire locale, d'accessibilité prix pour les ménages et de résistance des emballages aux conditions climatiques."
    },
    "Tech": {
        "aliases": ["tech", "digital", "saas", "logiciel", "software", "informatique", "mobile", "app", "ia", "ai", "plateforme"],
        "critical_factors": [
            "Accessibilité mobile-first et optimisation bande passante / mode hors-ligne",
            "Coût d'acquisition client (CAC) et viralité organique",
            "Intégration native des paiements locaux (Mobile Money MTN/Orange/Wave)",
            "Scalabilité de l'infrastructure cloud et sécurité des données",
            "Rétention utilisateur et onboarding intuitif"
        ],
        "typical_kpis": [
            "CAC (Coût d'acquisition client)",
            "LTV (Lifetime Value) et ratio LTV/CAC > 3",
            "MRR / ARR (Revenu récurrent mensuel/annuel)",
            "Taux d'attrition (Churn rate mensuel)",
            "DAU / MAU (Utilisateurs actifs quotidiens/mensuels)"
        ],
        "expert_prompt": "Agis comme un CTO et Product Strategist SaaS / Tech chevronné. Conçois une architecture lean, mobile-first, adaptée aux contraintes de connectivité africaines et optimisée pour une monétisation via Mobile Money et abonnements modulaires."
    },
    "Logistique": {
        "aliases": ["logistique", "transport", "livraison", "delivery", "fret", "supply chain", "flotte"],
        "critical_factors": [
            "Optimisation du dernier kilomètre et adressage informel (points de repère)",
            "Coût du carburant, maintenance de la flotte et transition électrique (motos/véhicules)",
            "Sécurité des marchandises et traçabilité géolocalisée en temps réel",
            "Paiement à la livraison (Cash-on-Delivery) vs prépaiement Mobile Money",
            "Densification des tournées et réduction des trajets à vide"
        ],
        "typical_kpis": [
            "Coût moyen par livraison réussie",
            "Taux de livraison au premier passage (%)",
            "Délai moyen de livraison (Lead time)",
            "Taux d'utilisation de la flotte (%)",
            "Taux d'incident / avarie sur colis"
        ],
        "expert_prompt": "Agis comme un Directeur Supply Chain & Mobilité Urbaine expert des corridors logistiques d'Afrique. Focus sur l'adressage alternatif, la gestion des flottes de deux-roues/tricycles, la résilience aux congestions urbaines et la décarbonation progressive."
    },
    "Fintech": {
        "aliases": ["fintech", "finance", "banque", "paiement", "microfinance", "credit", "tontine", "assurance", "insurtech"],
        "critical_factors": [
            "Conformité réglementaire stricte (KYC/AML, licences BCEAO/BEAC/BMA)",
            "Interopérabilité multi-opérateurs et passerelles API bancaires",
            "Prévention des fraudes et sécurité transactionnelle (chiffrement, 2FA)",
            "Gestion des réserves de liquidité (float) et trésorerie réseau d'agents",
            "Confiance des utilisateurs non bancarisés et éducation financière"
        ],
        "typical_kpis": [
            "Volume total traité (GTV - Gross Transaction Value)",
            "Taux de réussite des transactions (%)",
            "Take rate net (% de commission conservée)",
            "Coût de conformité et de vérification d'identité",
            "Délai moyen de règlement / settlement"
        ],
        "expert_prompt": "Agis comme un Expert Bancaire et Régulateur Fintech senior. Priorise la conformité prudentielle, la sécurité antifraude, les partenariats télécoms indispensables et la rentabilité du modèle transactionnel."
    },
    "Commerce": {
        "aliases": ["commerce", "retail", "distribution", "boutique", "vente", "import", "export", "grossiste", "negociant"],
        "critical_factors": [
            "Gestion rigoureuse du BFR (Besoin en Fonds de Roulement) et trésorerie",
            "Négociation des délais de paiement fournisseurs vs encaissement clients",
            "Optimisation des stocks pour éviter les ruptures et le surstockage",
            "Omnicanalité (point de vente physique + WhatsApp Commerce + réseaux sociaux)",
            "Fidélisation client et attractivité de l'assortiment"
        ],
        "typical_kpis": [
            "Taux de marge commerciale brute (%)",
            "Vitesse de rotation des stocks (jours)",
            "Panier moyen par client",
            "Taux de démarque inconnue / pertes",
            "Chiffre d'affaires par mètre carré ou par canal"
        ],
        "expert_prompt": "Agis comme un Directeur Commercial et Expert en Retail & Distribution africain. Analyse minutieusement la structure des marges, les cycles d'approvisionnement (importation, dédouanement), la gestion du cash et la synergie physique/digital."
    },
    "Services": {
        "aliases": ["services", "conseil", "consulting", "agence", "formation", "b2b", "prestation", "rh", "juridique", "marketing"],
        "critical_factors": [
            "Rétention des talents clés et gestion des compétences",
            "Taux d'occupation / facturabilité des consultants",
            "Signature de contrats cadres récurrents (Retainers)",
            "Positionnement d'expertise différenciant et réputation de marque",
            "Maîtrise des délais de paiement clients (recouvrement créances)"
        ],
        "typical_kpis": [
            "TJM moyen (Taux Journalier Moyen)",
            "Taux d'utilisation facturable (Billable rate %)",
            "Part du chiffre d'affaires récurrent (MRR)",
            "DSO (Days Sales Outstanding - délai moyen de paiement client)",
            "Marge opérationnelle par mission"
        ],
        "expert_prompt": "Agis comme un Associé Dirigeant de Cabinet de Conseil et Services Professionnels. Concentre-toi sur la monétisation de la valeur intellectuelle, la fidélisation par abonnement de service et la protection de la trésorerie."
    },
    "Sante": {
        "aliases": ["sante", "health", "medtech", "medical", "pharmacie", "clinique", "soins"],
        "critical_factors": [
            "Conformité avec les ordres professionnels de santé et ministère",
            "Secret médical, protection et confidentialité des dossiers patients",
            "Disponibilité continue et chaîne du froid des produits pharmaceutiques",
            "Modèle de solvabilité des patients (mutuelles, forfaits famille, tiers-payant)",
            "Accessibilité géographique pour les zones périurbaines et rurales"
        ],
        "typical_kpis": [
            "Coût moyen de prise en charge par patient",
            "Taux de satisfaction et fidélité patient",
            "Délai d'accès au praticien / diagnostic",
            "Taux de recouvrement des prestations médicales",
            "Taux de disponibilité des médicaments essentiels"
        ],
        "expert_prompt": "Agis comme un Médecin de Santé Publique et Directeur d'Établissement Hospitalier / MedTech. Rapproche l'exigence déontologique et médicale de la soutenabilité financière locale."
    },
    "Education": {
        "aliases": ["education", "edtech", "ecole", "formation_pro", "cours", "elearning", "pedagogie"],
        "critical_factors": [
            "Adéquation des cursus avec les besoins réels du marché de l'emploi",
            "Accessibilité sur smartphone à faible consommation de données",
            "Taux de complétion des formations et mentorat actif",
            "Modèles de financement des apprenants (bourses, ISA, échelonnement)",
            "Accréditations et partenariats entreprises"
        ],
        "typical_kpis": [
            "Taux de complétion des cours (%)",
            "Taux d'insertion professionnelle à 6 mois",
            "Coût par apprenant formé",
            "Net Promoter Score (NPS) étudiants",
            "Part des revenus institutionnels / B2B entreprises"
        ],
        "expert_prompt": "Agis comme un Directeur Pédagogique et Entrepreneur EdTech. Mets en valeur l'impact mesurable sur l'employabilité, la gamification pédagogique et l'accessibilité technique sur terminaux d'entrée de gamme."
    },
    "Energie": {
        "aliases": ["energie", "energy", "solaire", "cleantech", "renouvelable", "dechet", "recyclage", "eau"],
        "critical_factors": [
            "Modèle économique Pay-As-You-Go (PAYG) couplé au Mobile Money",
            "Résistance du matériel aux conditions extrêmes (poussière, surtensions, chaleur)",
            "Réseau de techniciens de maintenance pour le SAV de proximité",
            "Accès aux financements concessionnels et crédits carbone",
            "Éducation des ménages au retour sur investissement énergétique"
        ],
        "typical_kpis": [
            "Taux de recouvrement des mensualités PAYG",
            "Coût d'installation par kilowatt ou par foyer",
            "Durée de vie moyenne des composants (batteries, onduleurs)",
            "Taux de disponibilité opérationnelle du réseau",
            "Volume de CO2 évité / économies d'énergie générées"
        ],
        "expert_prompt": "Agis comme un Ingénieur Énergies Renouvelables et Développeur de Projets d'Infrastructure Décentralisée. Optimise le modèle financier PAYG, l'anticipation de la dépréciation des batteries et la solidité du SAV."
    }
}

class SectorExpertiseService:
    """
    Expert Knowledge Hub.
    Injects industry-specific context into AI generations.
    """
    
    def get_expertise(self, sector: str) -> Dict[str, Any]:
        """Returns specialized data for a given sector with alias resolution"""
        if not sector:
            sector = "Autre"
            
        clean_sector = sector.lower().strip()
        
        # 1. Exact or alias match
        for key, data in SECTOR_KNOWLEDGE.items():
            if key.lower() == clean_sector:
                return data
            for alias in data.get("aliases", []):
                if alias in clean_sector or clean_sector in alias:
                    return data
        
        # 2. Substring match
        for key, data in SECTOR_KNOWLEDGE.items():
            if key.lower() in clean_sector or clean_sector in key.lower():
                return data
        
        # 3. Default fallback with structured business logic
        return {
            "aliases": ["general"],
            "critical_factors": [
                "Clarté de la proposition de valeur",
                "Rentabilité unitaire et marge opérationnelle",
                "Maîtrise du Besoin en Fonds de Roulement (BFR)",
                "Solidité de l'équipe et exécution opérationnelle",
                "Résilience face aux contraintes du marché local"
            ],
            "typical_kpis": [
                "Chiffre d'affaires mensuel récurrent",
                "Seuil de rentabilité (Point mort)",
                "Coût d'acquisition client",
                "Taux de marge nette",
                "Délai d'amortissement de l'investissement"
            ],
            "expert_prompt": f"Agis comme un Consultant Senior en Stratégie d'Entreprise spécialisé dans le secteur '{sector}' sur les marchés africains. Propose une analyse rigoureuse, réaliste et directement actionnable."
        }

    def enrich_prompt(self, sector: str, original_prompt: str) -> str:
        """Enriches a prompt with sector-specific instructions"""
        expertise = self.get_expertise(sector)
        return (
            f"EXPERTISE SECTORIELLE SPÉCIFIQUE ({sector.upper()}) :\n"
            f"{expertise['expert_prompt']}\n"
            f"Facteurs critiques incontournables à intégrer : {', '.join(expertise['critical_factors'])}\n"
            f"KPIs standards de référence : {', '.join(expertise['typical_kpis'])}\n\n"
            f"{original_prompt}"
        )

sector_expertise = SectorExpertiseService()
