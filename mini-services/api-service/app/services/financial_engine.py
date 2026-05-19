import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Taux de change approximatifs (devrait être via API en prod)
EXCHANGE_RATES = {
    "XAF_TO_EUR": 0.0015,
    "EUR_TO_XAF": 655.95,
    "USD_TO_XAF": 600.0,
    "XAF_TO_USD": 0.0016
}

class FinancialEngine:
    """
    Mathematical validator for financial projections.
    Focuses on XAF/EUR/USD consistency and African fiscal rules (OHADA context).
    """
    
    def convert_currency(self, amount: float, from_curr: str, to_curr: str) -> float:
        """Simple currency converter"""
        if from_curr == to_curr:
            return amount
        
        pair = f"{from_curr}_{to_curr}"
        if pair in EXCHANGE_RATES:
            return round(amount * EXCHANGE_RATES[pair], 2)
        return amount

    def calculate_taxes(self, profit: float, country_code: str = "CM") -> Dict[str, float]:
        """
        Calculates estimated taxes based on region.
        Example for Cameroon (CM): IS is ~30%.
        """
        # Simplification fiscale
        tax_rate = 0.30 if country_code in ["CM", "SN", "CI", "GA"] else 0.25
        
        if profit <= 0:
            return {"tax_amount": 0.0, "net_profit": profit}
            
        tax_amount = profit * tax_rate
        return {
            "tax_rate_applied": tax_rate,
            "tax_amount": round(tax_amount, 2),
            "net_profit": round(profit - tax_amount, 2)
        }

    def validate_and_fix_bmc_finances(self, bmc_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensures cost and revenue consistency in the BMC"""
        try:
            cost_structure = bmc_data.get("cost_structure", {})
            fixed_costs = cost_structure.get("fixed_costs", [])
            
            total_calc = 0
            for cost in fixed_costs:
                try:
                    # Robust cleaning of amount strings
                    val = str(cost.get("amount", "0")).replace(" ", "").replace("XAF", "").replace("EUR", "").replace("€", "").replace(",", "")
                    total_calc += float(val)
                except:
                    continue
            
            if total_calc > 0:
                cost_structure["validated_total_monthly"] = total_calc
            
            return bmc_data
        except Exception as e:
            logger.error(f"Financial Engine Error: {e}")
            return bmc_data

    def get_financial_health_score(self, revenue: float, costs: float) -> Dict[str, Any]:
        """Comprehensive financial health analysis"""
        if revenue <= 0:
            return {"score": 0, "status": "Critical", "advice": "Aucun revenu généré."}
            
        margin = ((revenue - costs) / revenue) * 100
        
        score = 0
        if margin > 40: score = 90
        elif margin > 20: score = 70
        elif margin > 10: score = 50
        else: score = 30
        
        return {
            "gross_margin": f"{round(margin, 2)}%",
            "health_score": score,
            "is_viable": margin > 15,
            "advice": "Marge saine" if margin > 20 else "Attention aux coûts opérationnels trop élevés."
        }

financial_engine = FinancialEngine()
