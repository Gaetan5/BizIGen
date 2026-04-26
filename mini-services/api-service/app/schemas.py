"""
BizGen AI - Pydantic Schemas for API Validation
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================
# User Schemas
# ============================================

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    role: str = "USER"
    avatar_url: Optional[str] = None
    locale: str = "fr"
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserWithSubscription(UserResponse):
    subscription: Optional["SubscriptionResponse"] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


# ============================================
# Project Schemas
# ============================================

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sector: str = "AUTRE"
    sub_sector: Optional[str] = None
    country: str = "CM"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    status: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: str
    user_id: str
    status: str = "DRAFT"
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class ProjectWithDocResponse(ProjectResponse):
    generated_doc: Optional["GeneratedDocResponse"] = None
    form_inputs: List["FormInputResponse"] = []


# ============================================
# Form Input Schemas
# ============================================

class FormInputBase(BaseModel):
    step_number: int = 1
    question_key: str
    answer_value: str
    answer_type: str = "TEXT"


class FormInputCreate(FormInputBase):
    pass


class FormInputBulkCreate(BaseModel):
    answers: Dict[str, str]  # key-value pairs


class FormInputResponse(FormInputBase):
    id: str
    project_id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# Canvas Schemas
# ============================================

class BMCBlocks(BaseModel):
    """Business Model Canvas blocks"""
    key_partners: List[str] = []
    key_activities: List[str] = []
    key_resources: List[str] = []
    value_propositions: List[str] = []
    customer_relationships: List[str] = []
    channels: List[str] = []
    customer_segments: List[str] = []
    cost_structure: Dict[str, Any] = {}
    revenue_streams: List[Dict[str, str]] = []


class LeanCanvasBlocks(BaseModel):
    """Lean Canvas blocks"""
    problem: List[str] = []
    existing_alternatives: List[str] = []
    solution: List[str] = []
    key_metrics: List[str] = []
    unique_value_proposition: str = ""
    high_level_concept: str = ""
    unfair_advantage: List[str] = []
    channels: List[str] = []
    customer_segments: Dict[str, str] = {}
    cost_structure: Dict[str, str] = {}
    revenue_streams: Dict[str, str] = {}


class CanvasDataResponse(BaseModel):
    id: str
    doc_id: str
    canvas_type: str
    blocks: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# Business Plan Schemas
# ============================================

class BusinessPlanResponse(BaseModel):
    executive_summary: str = ""
    company_overview: Dict[str, Any] = {}
    market_analysis: Dict[str, Any] = {}
    competitive_analysis: Dict[str, Any] = {}
    swot: Dict[str, List[str]] = {}
    marketing_strategy: Dict[str, Any] = {}
    operations_plan: Dict[str, Any] = {}
    financial_projections: Dict[str, Any] = {}
    team: Dict[str, List[str]] = {}
    risk_analysis: Dict[str, List[str]] = {}


# ============================================
# Generated Document Schemas
# ============================================

class GeneratedDocResponse(BaseModel):
    id: str
    project_id: str
    doc_type: str = "FULL"
    status: str = "PENDING"
    version: int = 1
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class GeneratedDocWithCanvas(GeneratedDocResponse):
    canvases: List[CanvasDataResponse] = []
    raw_content: Optional[str] = None


# ============================================
# Generation Schemas
# ============================================

class GenerateRequest(BaseModel):
    project_id: str
    type: str = "all"  # bmc, lean, bp, all


class GenerateResponse(BaseModel):
    success: bool
    document_id: str
    status: str
    results: Optional[Dict[str, Any]] = None


# ============================================
# Export Schemas
# ============================================

class ExportRequest(BaseModel):
    project_id: str
    doc_type: str  # bmc, lean, bp
    format: str  # pdf, png, docx


class ExportResponse(BaseModel):
    success: bool
    export_id: str
    file_name: str
    format: str
    file_url: str
    file_size: int = 0
    message: str = ""


# ============================================
# Subscription Schemas
# ============================================

class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    status: str = "INACTIVE"
    plan: str = "FREE"
    projects_used: int = 0
    exports_used: int = 0
    current_period_end: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class PlanLimits(BaseModel):
    max_projects: int
    max_exports: int
    features: List[str]
    price: float


# ============================================
# API Response Schemas
# ============================================

class SuccessResponse(BaseModel):
    success: bool = True
    message: str = "Operation successful"


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    timestamp: datetime


# ============================================
# AI Chat Schemas
# ============================================

class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class ChatRequest(BaseModel):
    project_id: Optional[str] = None
    message: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    success: bool = True
    response: str
    suggestions: List[str] = []


# Update forward references
UserWithSubscription.model_rebuild()
ProjectWithDocResponse.model_rebuild()
