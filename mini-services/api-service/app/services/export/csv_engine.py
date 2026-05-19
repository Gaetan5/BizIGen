"""
BizGen AI - CSV Engine
Handles data exports to CSV/Excel formats.
"""
import io
import csv
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class CSVEngine:
    """Specialized engine for data exports"""

    @staticmethod
    def export_financials(financial_data: Dict[str, Any]) -> bytes:
        """Génère un fichier CSV professionnel pour les projections financières"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        currency = financial_data.get("currency", "XAF")
        writer.writerow([f"BIZGEN AI - PROJECTIONS FINANCIÈRES ({currency})"])
        writer.writerow([])
        writer.writerow(["Compte de Résultat", "Année 1", "Année 2", "Année 3"])
        
        projections = financial_data.get("projections", {})
        keys = [
            ("revenue", "Chiffre d'Affaires"),
            ("cogs", "Coût des Ventes"),
            ("opex", "Dépenses Opérationnelles"),
            ("ebitda", "EBITDA"),
            ("tax_amount", "Impôts"),
            ("net_profit", "Bénéfice Net")
        ]
        
        for key, label in keys:
            writer.writerow([
                label,
                projections.get("year1", {}).get(key, 0),
                projections.get("year2", {}).get(key, 0),
                projections.get("year3", {}).get(key, 0)
            ])
            
        writer.writerow([])
        writer.writerow(["INDICATEURS CLÉS"])
        kpis = financial_data.get("kpis", {})
        writer.writerow(["Point Mort", kpis.get("break_even_point")])
        writer.writerow(["ROI (%)", f"{kpis.get('roi_pct')}%"])
        
        return output.getvalue().encode('utf-8-sig')

csv_engine = CSVEngine()
