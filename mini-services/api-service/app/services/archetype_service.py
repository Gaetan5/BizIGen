"""
BizGen AI - Archetype & Diagnostic Scoring Service
Leverages structured business archetypes and diagnostic scoring rules to enrich AI analysis,
enforce market benchmarks, and evaluate business consistency.
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)

class ArchetypeService:
    """
    Manages curated business archetypes and diagnostic scoring rules
    specifically calibrated for African and emerging markets.
    """

    def __init__(self):
        self.archetypes: List[Dict[str, Any]] = []
        self.diagnostic_rules: Dict[str, Any] = {}
        self._load_data()

    def _find_data_file(self, filename: str) -> Optional[Path]:
        """Searches for a data file across standard locations"""
        candidate_paths = [
            Path("/app/data") / filename,
            Path(__file__).parent.parent.parent / "data" / filename,
            Path(__file__).parent.parent.parent.parent.parent / "data" / filename,
            Path("data") / filename,
            Path("mini-services/api-service/data") / filename,
        ]
        for p in candidate_paths:
            if p.exists():
                return p
        return None

    def _load_data(self):
        """Loads archetypes and scoring rules from JSON files"""
        try:
            archetype_path = self._find_data_file("bizigen-archetypes-sample.json")
            if archetype_path:
                with open(archetype_path, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    self.archetypes = content.get("archetypes", [])
                    logger.info(f"Loaded {len(self.archetypes)} business archetypes from {archetype_path}")
            else:
                logger.warning("bizigen-archetypes-sample.json not found in candidate paths")

            scoring_path = self._find_data_file("bizigen-diagnostic-scoring.json")
            if scoring_path:
                with open(scoring_path, "r", encoding="utf-8") as f:
                    self.diagnostic_rules = json.load(f)
                    logger.info(f"Loaded diagnostic scoring rules from {scoring_path}")
            else:
                logger.warning("bizigen-diagnostic-scoring.json not found in candidate paths")
        except Exception as e:
            logger.error(f"Error loading archetype or diagnostic data: {e}")

    def find_best_archetype(
        self,
        sector: str,
        description: str = "",
        revenue_model: Optional[str] = None,
        client_type: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Finds the closest matching business archetype based on sector, keywords, and business model.
        Returns None if no close match is found.
        """
        if not self.archetypes:
            return None

        best_archetype = None
        highest_score = -1

        text_corpus = f"{sector} {description}".lower()

        for arch in self.archetypes:
            score = 0
            meta = arch.get("meta", {})
            arch_sector = meta.get("secteur", "").lower()
            arch_subsector = meta.get("sous_secteur", "").lower()

            # 1. Sector match (up to 40 pts)
            if sector.lower() in arch_sector or arch_sector in sector.lower():
                score += 35
            if sector.lower() in arch_subsector or arch_subsector in sector.lower():
                score += 40

            # 2. Keyword matches (up to 30 pts)
            mots_cles = meta.get("mots_cles", [])
            matched_keywords = sum(1 for kw in mots_cles if kw.lower() in text_corpus)
            score += min(30, matched_keywords * 10)

            # 3. Revenue model match (15 pts)
            arch_rev_models = [m.lower() for m in meta.get("modele_revenus", [])]
            if revenue_model:
                rev_clean = revenue_model.lower()
                if any(m in rev_clean or rev_clean in m for m in arch_rev_models):
                    score += 15

            # 4. Client type match (15 pts)
            arch_client_type = meta.get("type_clientele", "")
            if client_type and client_type.upper() == arch_client_type.upper():
                score += 15

            if score > highest_score:
                highest_score = score
                best_archetype = arch

        # Minimum relevance threshold (at least 30 pts)
        if highest_score >= 30:
            return best_archetype
        return None

    def get_archetype_enrichment(
        self,
        sector: str,
        description: str = "",
        revenue_model: Optional[str] = None,
        client_type: Optional[str] = None
    ) -> str:
        """
        Extracts actionable benchmarks, local context constraints, and hypotheses
        from the best matched archetype to inject into AI prompt generation.
        """
        archetype = self.find_best_archetype(sector, description, revenue_model, client_type)
        if not archetype:
            return ""

        meta = archetype.get("meta", {})
        contexte = archetype.get("contexte_local", {})
        benchmarks = archetype.get("benchmarks", {})
        hypotheses = archetype.get("hypotheses_a_valider", [])
        bp = archetype.get("business_plan", {})
        unit_econ = bp.get("financier", {}).get("unit_economics", {})

        nuggets = [
            f"=== ARCHÉTYPE DE RÉFÉRENCE MARCHÉ : {meta.get('sous_secteur', meta.get('secteur'))} ===",
            f"Résumé modèle : {archetype.get('idee', {}).get('solution', '')}",
        ]

        if unit_econ:
            nuggets.append(
                f"Unit Economics types : Prix unitaire moyen ~{unit_econ.get('prix_moyen_xaf', 'N/A')} XAF | "
                f"Coût variable unitaire ~{unit_econ.get('cout_variable_xaf', 'N/A')} XAF | "
                f"Marge unitaire ~{unit_econ.get('marge_unitaire_xaf', 'N/A')} XAF"
            )

        if benchmarks:
            bm_strs = []
            if isinstance(benchmarks, list):
                for b in benchmarks:
                    if isinstance(b, dict):
                        metrique = b.get("metrique", "")
                        valeur = b.get("valeur_indicative", b.get("valeur", ""))
                        if metrique and valeur:
                            bm_strs.append(f"{metrique}: {valeur}")
            elif isinstance(benchmarks, dict):
                for k, v in benchmarks.items():
                    if isinstance(v, dict):
                        val = v.get("valeur") or v.get("taux") or v.get("estimation") or v
                        bm_strs.append(f"{k.replace('_', ' ')}: {val}")
                    else:
                        bm_strs.append(f"{k.replace('_', ' ')}: {v}")
            if bm_strs:
                nuggets.append(f"Benchmarks sectoriels observés : {'; '.join(bm_strs)}")

        if contexte:
            paiements = contexte.get("paiement", [])
            juridique = contexte.get("juridique_fiscal", [])
            infra = contexte.get("infrastructure", [])
            if paiements:
                nuggets.append(f"Pratiques de paiement locales : {', '.join(paiements)}")
            if juridique:
                nuggets.append(f"Cadre réglementaire & fiscal à anticiper : {', '.join(juridique)}")
            if infra:
                nuggets.append(f"Réalités d'infrastructure : {', '.join(infra)}")

        if hypotheses:
            hyp_critiques = []
            if isinstance(hypotheses, list):
                for h in hypotheses:
                    if isinstance(h, dict) and h.get("hypothese"):
                        hyp_critiques.append(h.get("hypothese"))
                    elif isinstance(h, str):
                        hyp_critiques.append(h)
            if hyp_critiques:
                nuggets.append(f"Hypothèses critiques et pièges du modèle : {'; '.join(hyp_critiques[:4])}")

        return "\n".join(nuggets)

    def evaluate_diagnostic(self, form_data: Dict[str, Any], sector: str) -> Dict[str, Any]:
        """
        Evaluates the entrepreneur's inputs against diagnostic scoring rules (0-100)
        and detects business coherence alerts (règles de cohérence).
        """
        score = 75  # Base score
        issues: List[Dict[str, str]] = []
        rule_alerts: List[str] = []

        # 1. R01: Marge unitaire négative ou nulle
        pricing = str(form_data.get("pricing", "")).lower()
        costs = str(form_data.get("monthly_costs", "")).lower()

        # 2. R03: Revenus déclarés sans canaux d'acquisition
        channels = str(form_data.get("sales_channels", "")).strip()
        revenue_model = str(form_data.get("revenue_model", "")).strip()
        if revenue_model and (not channels or channels.lower() in ["non spécifié", "aucun", "none"]):
            rule_alerts.append("R03: Revenus déclarés sans canal d'acquisition défini.")
            issues.append({
                "rule_id": "r03",
                "severity": "CRITICAL",
                "message": "Aucun moyen d'atteindre vos clients n'est décrit. Précisez vos canaux d'acquisition."
            })
            score -= 15

        # 3. R05: Secteur réglementé sans conformité déclarée
        regulated_sectors = ["sante", "health", "finance", "fintech", "banque", "pharmacie", "education", "transport"]
        if any(reg in sector.lower() for reg in regulated_sectors):
            desc = str(form_data.get("description", "")).lower()
            partners = str(form_data.get("key_partners", "")).lower()
            if not any(w in desc or w in partners for w in ["licence", "agrement", "ministère", "ordre", "banque centrale", "conformite", "agree", "homologation"]):
                rule_alerts.append("R05: Secteur réglementé sans agrément ou conformité explicite.")
                issues.append({
                    "rule_id": "r05",
                    "severity": "WARNING",
                    "message": f"Le secteur '{sector}' exige généralement un agrément ou une licence. Vérifiez vos autorisations."
                })
                score -= 10

        # 4. R04: Validation client faible
        description = str(form_data.get("description", "")).lower()
        if not form_data.get("problem_solved") or len(str(form_data.get("problem_solved"))) < 20:
            issues.append({
                "rule_id": "r04",
                "severity": "WARNING",
                "message": "Le problème client est trop succinct. Plus de détails sont nécessaires pour valider le besoin réel."
            })
            score -= 10

        final_score = max(20, min(100, score))

        if final_score >= 80:
            level = "Prêt pour financement ou lancement"
        elif final_score >= 60:
            level = "Prometteur"
        elif final_score >= 40:
            level = "À valider sur le terrain"
        else:
            level = "Idée à clarifier"

        return {
            "score": final_score,
            "level": level,
            "issues": issues,
            "alerts": rule_alerts
        }

archetype_service = ArchetypeService()
