"""
BizGen AI - Production Sanity Checks
Run this script to verify the integrity of business services.
"""
import sys
import os

# Add app to path
sys.path.append(os.getcwd())

from app.services.financial_engine import financial_engine
from app.services.sector_expertise import sector_expertise
from app.services.consistency_service import consistency_service

def run_checks():
    print("🚀 DÉBUT DES VÉRIFICATIONS D'INTÉGRITÉ PROFESSIONNELLE\n")
    
    # 1. Vérification Moteur Financier
    print("1. Test Moteur Financier (OHADA)...")
    try:
        tax_data = financial_engine.calculate_taxes(1000000, "CM")
        if tax_data["tax_amount"] == 300000:
            print("✅ OK: Taxes calculées avec succès (30% IS).")
        else:
            print(f"❌ ERREUR: Calcul des taxes incorrect ({tax_data['tax_amount']}).")
    except Exception as e:
        print(f"❌ ERREUR CRITIQUE: {e}")

    # 2. Vérification Expertise Sectorielle
    print("\n2. Test Expertise Sectorielle...")
    expertise = sector_expertise.get_expertise("Agriculture")
    if "Saisonnalité" in expertise["critical_factors"]:
        print("✅ OK: Hub de connaissances sectorielles opérationnel.")
    else:
        print("❌ ERREUR: Expertise sectorielle incomplète.")

    # 3. Vérification de la Cohérence Logique
    print("\n3. Test Moteur de Cohérence...")
    from app.schemas.ai_schemas import BMCResponse
    from app.schemas.intelligence_schemas import FinancialPlanResponse
    import asyncio
    
    try:
        # Données incohérentes typées (Respectant les longueurs minimales)
        test_bmc = BMCResponse(
            key_partners=["Fournisseur A", "Banque B"],
            key_activities=["Développement", "Ventes"],
            key_resources=["Serveurs", "Équipe"],
            value_propositions=["Solution A", "Service B"],
            customer_relationships=["Automatisé", "Direct"],
            channels=["Un seul canal", "Réseaux Sociaux"],
            customer_segments=["PME", "Particuliers"],
            cost_structure={"fixed_costs":[], "variable_costs":[], "total_monthly_estimate":"0"},
            revenue_streams=[{"source":"Abonnement", "model":"SaaS", "pricing":"Fixe"}]
        )
        test_financials = FinancialPlanResponse(
            currency="XAF",
            projections={
                "year1": {"revenue": 50000000, "opex": 1000, "cogs": 0, "ebitda": 0, "net_profit": 0, "tax_amount": 0},
                "year2": {"revenue": 0, "opex": 0, "cogs": 0, "ebitda": 0, "net_profit": 0, "tax_amount": 0},
                "year3": {"revenue": 0, "opex": 0, "cogs": 0, "ebitda": 0, "net_profit": 0, "tax_amount": 0}
            },
            monthly_cashflow_y1=[0]*12,
            kpis={"break_even_point": 0, "roi_pct": 0, "funding_needed": 0}
        )
        
        report = asyncio.run(consistency_service.check_alignment(test_bmc, test_financials))
        if report["consistency_score"] < 100:
            print("✅ OK: Incohérence détectée avec succès (Revenus vs Canaux).")
        else:
            print("❌ ERREUR: Le moteur de cohérence n'a pas détecté l'anomalie.")
    except Exception as e:
        print(f"❌ ERREUR: {e}")

    # 4. Vérification des Chemins d'Export
    print("\n4. Test Structure d'Export...")
    export_path = os.path.join(os.getcwd(), "app/services/export")
    if os.path.exists(export_path):
        print("✅ OK: Architecture modulaire de l'ExportService en place.")
    else:
        print("❌ ERREUR: Structure d'export manquante.")

    print("\n🏁 VÉRIFICATIONS TERMINÉES.")

if __name__ == "__main__":
    run_checks()
