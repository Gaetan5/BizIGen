"""
BizGen AI - Intelligence Schemas
Strict Pydantic models to replace 'Any' and 'Dict'.
Ensures type safety across all expert services.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Union

class ProjectSchema(BaseModel):
    id: str
    name: str
    sector: str = "AUTRE"
    country: str = "CM"
    description: Optional[str] = None

class FinancialYear(BaseModel):
    revenue: float
    cogs: float
    opex: float
    ebitda: float
    tax_amount: float
    net_profit: float

class FinancialProjections(BaseModel):
    year1: FinancialYear
    year2: FinancialYear
    year3: FinancialYear

class FinancialKPIs(BaseModel):
    break_even_point: float
    roi_pct: float
    funding_needed: float

class FinancialPlanResponse(BaseModel):
    currency: str = "XAF"
    projections: FinancialProjections
    kpis: FinancialKPIs
    honesty_check: Optional[Dict] = None

class PitchSlide(BaseModel):
    number: int
    title: str
    content: List[str]
    visual_hint: Optional[str] = None

class PitchDeckResponse(BaseModel):
    project_name: str
    slides: List[PitchSlide]

class Competitor(BaseModel):
    name: str
    strength: str
    weakness: str
    url_source: Optional[str] = None

class IndirectCompetitor(BaseModel):
    name: str
    why: str

class AuditResponse(BaseModel):
    """Schéma de validation strict et transparent pour l'audit IA"""
    viability_score: int = Field(..., ge=0, le=100)
    market_gap: str
    strengths: List[str]
    weaknesses: List[str]
    critical_risks: List[str]
    recommendations: List[str]
    is_bankable: bool
    expert_advice: str
    sources_cited: List[Dict[str, str]] = Field(default_factory=list)
