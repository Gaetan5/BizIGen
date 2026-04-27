"""
BizGen AI - Financial Engine
Ensures mathematical accuracy and consistency in generated business plans.
Corrects AI "hallucinations" in financial tables and projections.
"""
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class FinancialEngine:
    """
    Mathematical validator for financial projections.
    Focuses on XAF/EUR/USD consistency and basic accounting rules.
    """
    
    def validate_and_fix_bmc_finances(self, bmc_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensures the cost structure and revenue streams in the BMC are consistent.
        """
        try:
            cost_structure = bmc_data.get("cost_structure", {})
            fixed_costs = cost_structure.get("fixed_costs", [])
            
            # Recalculate total monthly estimate if possible
            total_calc = 0
            for cost in fixed_costs:
                try:
                    # Clean amount string (remove spaces, currency symbols)
                    amount_str = str(cost.get("amount", "0")).replace(" ", "").replace("XAF", "").replace("€", "")
                    total_calc += float(amount_str)
                except (ValueError, TypeError):
                    continue
            
            # If AI hallucinated the total, fix it
            if total_calc > 0:
                cost_structure["total_monthly_estimate_calc"] = total_calc
                # We don't overwrite the AI's string directly to keep its formatting, 
                # but we provide a validated version.
            
            return bmc_data
            
        except Exception as e:
            logger.error(f"Error in Financial Validation: {e}")
            return bmc_data

    def calculate_ratios(self, revenue: float, costs: float) -> Dict[str, float]:
        """Calculate key performance indicators"""
        if revenue <= 0:
            return {"margin": 0.0, "break_even_months": 0.0}
            
        margin = ((revenue - costs) / revenue) * 100
        # Simplistic break-even for MVP
        break_even = costs / (revenue * 0.2) if revenue > 0 else 0
        
        return {
            "gross_margin_pct": round(margin, 2),
            "estimated_break_even_months": round(break_even, 1)
        }

# Singleton instance
financial_engine = FinancialEngine()
