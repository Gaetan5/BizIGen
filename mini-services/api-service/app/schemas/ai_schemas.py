"""
BizGen AI - AI Response Schemas
Pydantic models for validating AI-generated content
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from enum import Enum


class CostItem(BaseModel):
    """Fixed cost item"""
    item: str = Field(..., min_length=1, max_length=200)
    amount: str = Field(..., pattern=r'^[\d\s,\.]+[A-Z]*$')
    currency: str = Field(default="XAF", max_length=10)


class VariableCostItem(BaseModel):
    """Variable cost item"""
    item: str = Field(..., min_length=1, max_length=200)
    percentage: str = Field(..., pattern=r'^\d+[\.,]?\d*%?$')


class CostStructure(BaseModel):
    """Cost structure block"""
    fixed_costs: List[CostItem] = Field(default_factory=list, max_length=10)
    variable_costs: List[VariableCostItem] = Field(default_factory=list, max_length=10)
    total_monthly_estimate: str = Field(..., min_length=1)


class RevenueStream(BaseModel):
    """Revenue stream item"""
    source: str = Field(..., min_length=1, max_length=200)
    model: str = Field(..., min_length=1, max_length=200)
    pricing: str = Field(..., min_length=1, max_length=200)


class BMCResponse(BaseModel):
    """
    Business Model Canvas Response Schema
    Validates all 9 blocks of the BMC
    """
    key_partners: List[str] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="Key partners (2-10 items)"
    )
    key_activities: List[str] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="Key activities (2-10 items)"
    )
    key_resources: List[str] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="Key resources (2-10 items)"
    )
    value_propositions: List[str] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="Value propositions (2-10 items)"
    )
    customer_relationships: List[str] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="Customer relationships (2-10 items)"
    )
    channels: List[str] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="Channels (2-10 items)"
    )
    customer_segments: List[str] = Field(
        ...,
        min_length=2,
        max_length=10,
        description="Customer segments (2-10 items)"
    )
    cost_structure: CostStructure
    revenue_streams: List[RevenueStream] = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Revenue streams (1-10 items)"
    )

    @field_validator('key_partners', 'key_activities', 'key_resources', 
                     'value_propositions', 'customer_relationships', 
                     'channels', 'customer_segments')
    @classmethod
    def validate_list_items(cls, v: List[str]) -> List[str]:
        """Ensure each item is non-empty and reasonable length"""
        validated = []
        for item in v:
            if not item or not item.strip():
                continue
            if len(item) > 500:
                item = item[:500]
            validated.append(item.strip())
        if len(validated) < 2:
            raise ValueError('List must have at least 2 non-empty items')
        return validated


class CustomerSegmentsLean(BaseModel):
    """Customer segments for Lean Canvas"""
    target: str = Field(..., min_length=10, max_length=1000)
    early_adopters: str = Field(..., min_length=10, max_length=1000)


class CostStructureLean(BaseModel):
    """Cost structure for Lean Canvas"""
    fixed: str = Field(..., min_length=5, max_length=500)
    variable: str = Field(..., min_length=5, max_length=500)


class RevenueStreamsLean(BaseModel):
    """Revenue streams for Lean Canvas"""
    model: str = Field(..., min_length=5, max_length=500)
    pricing: str = Field(..., min_length=5, max_length=500)
    break_even: str = Field(..., min_length=5, max_length=500)


class LeanCanvasResponse(BaseModel):
    """
    Lean Canvas Response Schema
    Validates all blocks of the Lean Canvas
    """
    problem: List[str] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Problems (1-5 items)"
    )
    existing_alternatives: List[str] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Existing alternatives (1-5 items)"
    )
    solution: List[str] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Solutions (1-5 items)"
    )
    key_metrics: List[str] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Key metrics (1-5 items)"
    )
    unique_value_proposition: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="Unique value proposition"
    )
    high_level_concept: str = Field(
        ...,
        min_length=5,
        max_length=200,
        description="High level concept"
    )
    unfair_advantage: List[str] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Unfair advantages (1-5 items)"
    )
    channels: List[str] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Channels (1-5 items)"
    )
    customer_segments: CustomerSegmentsLean
    cost_structure: CostStructureLean
    revenue_streams: RevenueStreamsLean


class CompanyOverview(BaseModel):
    """Company overview section"""
    mission: str = Field(..., min_length=20, max_length=1000)
    vision: str = Field(..., min_length=20, max_length=1000)
    values: List[str] = Field(..., min_length=2, max_length=10)
    legalStructure: str = Field(..., min_length=5, max_length=200)
    location: str = Field(..., min_length=5, max_length=200)


class MarketAnalysis(BaseModel):
    """Market analysis section"""
    industryOverview: str = Field(..., min_length=50, max_length=2000)
    targetMarket: str = Field(..., min_length=50, max_length=2000)
    marketSize: str = Field(..., min_length=10, max_length=500)
    trends: List[str] = Field(..., min_length=2, max_length=10)


class CompetitiveAnalysis(BaseModel):
    """Competitive analysis section"""
    directCompetitors: List[str] = Field(..., min_length=1, max_length=10)
    indirectCompetitors: List[str] = Field(..., min_length=1, max_length=10)
    competitiveAdvantage: str = Field(..., min_length=20, max_length=1000)


class SWOTAnalysis(BaseModel):
    """SWOT analysis section"""
    strengths: List[str] = Field(..., min_length=2, max_length=10)
    weaknesses: List[str] = Field(..., min_length=1, max_length=10)
    opportunities: List[str] = Field(..., min_length=2, max_length=10)
    threats: List[str] = Field(..., min_length=1, max_length=10)


class MarketingStrategy(BaseModel):
    """Marketing strategy section"""
    positioning: str = Field(..., min_length=20, max_length=1000)
    channels: List[str] = Field(..., min_length=2, max_length=10)
    pricingStrategy: str = Field(..., min_length=10, max_length=500)
    salesApproach: str = Field(..., min_length=20, max_length=1000)


class OperationsPlan(BaseModel):
    """Operations plan section"""
    keyActivities: List[str] = Field(..., min_length=2, max_length=10)
    keyResources: List[str] = Field(..., min_length=2, max_length=10)
    keyPartners: List[str] = Field(..., min_length=1, max_length=10)
    milestones: List[str] = Field(..., min_length=2, max_length=10)


class FinancialProjections(BaseModel):
    """Financial projections section"""
    year1Revenue: str = Field(..., min_length=5, max_length=200)
    year2Revenue: str = Field(..., min_length=5, max_length=200)
    year3Revenue: str = Field(..., min_length=5, max_length=200)
    breakEvenMonth: int = Field(..., ge=1, le=60)
    fundingRequired: str = Field(..., min_length=5, max_length=200)
    useOfFunds: List[str] = Field(..., min_length=2, max_length=10)


class Team(BaseModel):
    """Team section"""
    founders: List[str] = Field(..., min_length=1, max_length=10)
    keyHires: List[str] = Field(..., min_length=1, max_length=10)
    advisors: List[str] = Field(default_factory=list, max_length=10)


class RiskAnalysis(BaseModel):
    """Risk analysis section"""
    risks: List[str] = Field(..., min_length=2, max_length=10)
    mitigations: List[str] = Field(..., min_length=2, max_length=10)


class BusinessPlanResponse(BaseModel):
    """
    Complete Business Plan Response Schema
    Validates all sections of a business plan
    """
    executiveSummary: str = Field(
        ...,
        min_length=100,
        max_length=2000,
        description="Executive summary (100-2000 chars)"
    )
    companyOverview: CompanyOverview
    marketAnalysis: MarketAnalysis
    competitiveAnalysis: CompetitiveAnalysis
    swot: SWOTAnalysis
    marketingStrategy: MarketingStrategy
    operationsPlan: OperationsPlan
    financialProjections: FinancialProjections
    team: Team
    riskAnalysis: RiskAnalysis

    @field_validator('executiveSummary')
    @classmethod
    def validate_executive_summary(cls, v: str) -> str:
        """Ensure executive summary is substantial"""
        word_count = len(v.split())
        if word_count < 50:
            raise ValueError('Executive summary must be at least 50 words')
        return v


class AIResponseType(str, Enum):
    """Types of AI responses"""
    BMC = "bmc"
    LEAN_CANVAS = "lean"
    BUSINESS_PLAN = "bp"
    CHAT = "chat"


from typing import List, Optional, Dict, Union, Any

class ValidatedAIResponse(BaseModel):
    """Wrapper for strictly validated AI response"""
    response_type: AIResponseType
    content: Union[BMCResponse, LeanCanvasResponse, BusinessPlanResponse, Dict[str, str]]
    is_valid: bool = True
    validation_errors: Optional[List[str]] = None
    raw_response: Optional[str] = None
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None
    generation_time_ms: Optional[float] = None


# Validation functions
def validate_bmc(data: Dict[str, Any]) -> ValidatedAIResponse:
    """Validate BMC response"""
    try:
        validated = BMCResponse(**data)
        return ValidatedAIResponse(
            response_type=AIResponseType.BMC,
            content=validated.model_dump(),
            is_valid=True
        )
    except Exception as e:
        return ValidatedAIResponse(
            response_type=AIResponseType.BMC,
            content=data,
            is_valid=False,
            validation_errors=[str(e)]
        )


def validate_lean_canvas(data: Dict[str, Any]) -> ValidatedAIResponse:
    """Validate Lean Canvas response"""
    try:
        validated = LeanCanvasResponse(**data)
        return ValidatedAIResponse(
            response_type=AIResponseType.LEAN_CANVAS,
            content=validated.model_dump(),
            is_valid=True
        )
    except Exception as e:
        return ValidatedAIResponse(
            response_type=AIResponseType.LEAN_CANVAS,
            content=data,
            is_valid=False,
            validation_errors=[str(e)]
        )


def validate_business_plan(data: Dict[str, Any]) -> ValidatedAIResponse:
    """Validate Business Plan response"""
    try:
        validated = BusinessPlanResponse(**data)
        return ValidatedAIResponse(
            response_type=AIResponseType.BUSINESS_PLAN,
            content=validated.model_dump(),
            is_valid=True
        )
    except Exception as e:
        return ValidatedAIResponse(
            response_type=AIResponseType.BUSINESS_PLAN,
            content=data,
            is_valid=False,
            validation_errors=[str(e)]
        )


def validate_ai_response(response_type: AIResponseType, data: Dict[str, Any]) -> ValidatedAIResponse:
    """Validate AI response based on type"""
    validators = {
        AIResponseType.BMC: validate_bmc,
        AIResponseType.LEAN_CANVAS: validate_lean_canvas,
        AIResponseType.BUSINESS_PLAN: validate_business_plan,
    }
    
    validator = validators.get(response_type)
    if validator:
        return validator(data)
    
    # Default: return as-is for chat responses
    return ValidatedAIResponse(
        response_type=response_type,
        content=data,
        is_valid=True
    )
