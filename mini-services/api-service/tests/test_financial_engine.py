"""
Tests for BizGen AI - Financial Engine
Ensures mathematical accuracy and compliance with tax rules.
"""
import pytest
from app.services.financial_engine import financial_engine

def test_tax_calculation_cm():
    """Test des taxes au Cameroun (IS 30%, TVA 19.25%)"""
    ebitda = 1000000 # 1 Million XAF
    
    # 1. Test des taxes (OHADA)
    tax_data = financial_engine.calculate_taxes(ebitda, country_code="CM")
    
    # IS = 30% de 1M = 300,000
    assert tax_data["tax_amount"] == 300000
    # Net = 1M - 300k = 700,000
    assert tax_data["net_profit"] == 700000

def test_break_even_calculation():
    """Test du calcul du point mort"""
    fixed_costs = 500000
    unit_price = 1000
    unit_cost = 600 # Marge de 400
    
    bep = financial_engine.calculate_break_even(fixed_costs, unit_price, unit_cost)
    
    # 500,000 / (1000 - 600) = 500,000 / 400 = 1250 unités
    assert bep == 1250

def test_negative_ebitda():
    """Vérifie que l'impôt est à 0 en cas de perte"""
    ebitda = -50000
    tax_data = financial_engine.calculate_taxes(ebitda, country_code="CM")
    
    assert tax_data["tax_amount"] == 0
    assert tax_data["net_profit"] == -50000
