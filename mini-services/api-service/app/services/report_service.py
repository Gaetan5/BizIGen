"""
BizGen AI - Report Service
Orchestrates search, AI analysis, and multi-format exports.
"""
import logging
import csv
import io
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

from app.services.search_service import search_service
from app.services.enhanced_ai_service import enhanced_ai_service
from app.services.export_service import ExportService

logger = logging.getLogger(__name__)

class ReportService:
    """
    Expert Intelligence Service.
    1. Searches the web.
    2. Analyzes data with AI.
    3. Exports to PDF, CSV, DOCX.
    """
    
    def __init__(self):
        self.export_service = ExportService()

    async def generate_market_report(self, subject: str, sector: str, country: str) -> Dict[str, Any]:
        """
        Génère un rapport de marché complet avec recherche web.
        """
        logger.info(f"Generating market report for {subject} in {country}")
        
        # 1. Recherche Web
        search_query = f"marché {subject} {sector} {country} 2025 2026 statistiques acteurs"
        search_results = await search_service.search(search_query)
        
        search_context = "\n".join([
            f"SOURCE: {r['title']} ({r['link']})\nEXTRAIT: {r['snippet']}" 
            for r in search_results
        ])
        
        # 2. Analyse AI
        system_prompt = """Tu es un Expert en Intelligence Économique. 
        Ton but est de produire un rapport de marché structuré, logique et basé sur des faits.
        Structure ton analyse en :
        1. Résumé Exécutif
        2. Analyse de la Demande
        3. Analyse de l'Offre (Acteurs)
        4. Opportunités et Menaces
        5. Recommandations Stratégiques
        
        Réponds au format JSON uniquement :
        {
            "title": "...",
            "summary": "...",
            "sections": [
                {"title": "...", "content": "...", "data_points": [{"label": "...", "value": "..."}]}
            ],
            "recommendations": ["..."]
        }
        """
        
        user_prompt = f"""Rapport pour : {subject}
        Secteur : {sector}
        Pays : {country}
        
        CONTEXTE WEB RÉCENT :
        {search_context}
        """
        
        ai_response = await enhanced_ai_service.call_ai(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.3
        )
        
        import json
        report_data = json.loads(ai_response)
        
        # 3. Préparation des Exports
        # On retourne les données pour que l'API puisse appeler les méthodes d'export
        return report_data

    def export_to_csv(self, report_data: Dict[str, Any]) -> bytes:
        """Exporte les points de données du rapport en CSV"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(["Section", "Indicateur", "Valeur"])
        
        for section in report_data.get("sections", []):
            section_title = section.get("title")
            for dp in section.get("data_points", []):
                writer.writerow([section_title, dp.get("label"), dp.get("value")])
        
        return output.getvalue().encode('utf-8')

    def export_financials_csv(self, financial_data: Dict[str, Any]) -> bytes:
        """Exporte les projections financières sur 3 ans en CSV (Format Excel)"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        currency = financial_data.get("currency", "XAF")
        writer.writerow([f"PROJECTIONS FINANCIÈRES (Devise: {currency})"])
        writer.writerow([])
        
        # Header des années
        writer.writerow(["Indicateur", "Année 1", "Année 2", "Année 3"])
        
        indicators = [
            ("revenue", "Chiffre d'Affaires"),
            ("cogs", "Coût des Ventes (COGS)"),
            ("opex", "Dépenses Opérationnelles (OPEX)"),
            ("ebitda", "EBITDA"),
            ("tax_amount", "Impôts estimé"),
            ("net_profit", "Bénéfice Net")
        ]
        
        projections = financial_data.get("projections", {})
        for key, label in indicators:
            writer.writerow([
                label,
                projections.get("year1", {}).get(key, 0),
                projections.get("year2", {}).get(key, 0),
                projections.get("year3", {}).get(key, 0)
            ])
            
        writer.writerow([])
        writer.writerow(["KPIs STRATÉGIQUES"])
        kpis = financial_data.get("kpis", {})
        writer.writerow(["Point Mort (Seuil Rentabilité)", kpis.get("break_even_point")])
        writer.writerow(["ROI estimé (%)", f"{kpis.get('roi_pct')}%"])
        writer.writerow(["Besoin en financement", kpis.get("funding_needed")])
        
        return output.getvalue().encode('utf-8-sig') # BOM for Excel

    def export_to_pdf(self, report_data: Dict[str, Any]) -> bytes:
        """Exporte le rapport en PDF via ExportService (mock/extensibilité)"""
        # Note: On utiliserait une méthode dédiée dans ExportService
        # Pour cet exemple, on simule l'appel
        # return self.export_service.generate_custom_report_pdf(report_data)
        return b"PDF_CONTENT_MOCK"

report_service = ReportService()
