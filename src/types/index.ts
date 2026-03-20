// BizGen AI - Type Definitions

// ============================================
// Enums
// ============================================

export type Sector = 'TECH' | 'AGRO' | 'AGRO_ALIMENTAIRE' | 'SERVICES' | 'COMMERCE' | 'AUTRE';
export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'GENERATING' | 'COMPLETED' | 'ARCHIVED';
export type Role = 'USER' | 'CONSULTANT' | 'ADMIN';
export type Plan = 'FREE' | 'BASIC' | 'PRO';
export type SubStatus = 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED';
export type DocType = 'BMC_ONLY' | 'LEAN_ONLY' | 'BP_ONLY' | 'FULL';
export type GenStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
export type CanvasType = 'BUSINESS_MODEL_CANVAS' | 'LEAN_CANVAS';
export type ExportFormat = 'PDF' | 'PNG' | 'DOCX' | 'JSON';

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  locale: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Project Types
// ============================================

export interface Project {
  id: string;
  userId: string;
  name: string;
  sector: Sector;
  subSector: string | null;
  country: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface FormInput {
  id: string;
  projectId: string;
  stepNumber: number;
  questionKey: string;
  answerValue: string;
  answerType: 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'FILE_URL' | 'BOOLEAN';
  createdAt: Date;
}

// ============================================
// Generated Document Types
// ============================================

export interface GeneratedDocument {
  id: string;
  projectId: string;
  type: DocType;
  status: GenStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasData {
  id: string;
  docId: string;
  canvasType: CanvasType;
  blocks: BMCBlocks | LeanCanvasBlocks;
  rawContent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Business Model Canvas
// ============================================

export interface BMCBlocks {
  key_partners: string[];
  key_activities: string[];
  key_resources: string[];
  value_propositions: string[];
  customer_relationships: string[];
  channels: string[];
  customer_segments: string[];
  cost_structure: {
    fixed_costs: Array<{ item: string; amount: string; currency: string }>;
    variable_costs: Array<{ item: string; percentage: string }>;
    total_monthly_estimate: string;
  };
  revenue_streams: Array<{ source: string; model: string; pricing: string }>;
}

// ============================================
// Lean Canvas
// ============================================

export interface LeanCanvasBlocks {
  problem: string[];
  existing_alternatives: string[];
  solution: string[];
  key_metrics: string[];
  unique_value_proposition: string;
  high_level_concept: string;
  unfair_advantage: string[];
  channels: string[];
  customer_segments: {
    target: string;
    early_adopters: string;
  };
  cost_structure: {
    fixed: string;
    variable: string;
  };
  revenue_streams: {
    model: string;
    pricing: string;
    break_even: string;
  };
}

// ============================================
// Business Plan
// ============================================

export interface SWOTAnalysis {
  strengths: Array<{ item: string; impact: 'high' | 'medium' | 'low' }>;
  weaknesses: Array<{ item: string; mitigation: string }>;
  opportunities: Array<{ item: string; timeline: string }>;
  threats: Array<{ item: string; strategy: string }>;
}

export interface FinancialProjections {
  assumptions: string[];
  year1Revenue: string;
  year2Revenue: string;
  year3Revenue: string;
  year1Costs: string;
  breakEvenMonth: number;
  requiredFunding: string;
}

export interface BusinessPlan {
  executiveSummary: string;
  companyOverview: string;
  marketAnalysis: string;
  competitiveAnalysis: string;
  swot: SWOTAnalysis;
  operationsPlan: string;
  financialProjections: FinancialProjections;
  team: string;
  milestones: string[];
}

// ============================================
// Subscription Types
// ============================================

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubId: string | null;
  status: SubStatus;
  plan: Plan;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  projectsUsed: number;
  exportsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanLimits {
  maxProjects: number;
  maxExports: number;
  features: string[];
  price: number;
  priceId?: string;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxProjects: 1,
    maxExports: 3,
    features: ['1 projet/mois', 'Exports PNG', 'BMC & Lean Canvas'],
    price: 0,
  },
  BASIC: {
    maxProjects: 5,
    maxExports: 20,
    features: ['5 projets/mois', 'Exports PDF', 'Business Plan complet', 'Sans watermark'],
    price: 7,
  },
  PRO: {
    maxProjects: -1, // unlimited
    maxExports: -1,
    features: ['Projets illimités', 'Exports PDF/Word', 'Templates premium', 'Support prioritaire', 'API access'],
    price: 19,
  },
};

// ============================================
// Form Types
// ============================================

export interface FormQuestion {
  id: string;
  key: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'file';
  required: boolean;
  options?: { value: string; label: string }[];
  conditional?: {
    dependsOn: string;
    value: string | string[];
  };
  step: number;
}

export interface FormStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateRequest {
  projectId: string;
  type: 'bmc' | 'lean' | 'bp' | 'all';
}

export interface GenerateResponse {
  documentId: string;
  status: GenStatus;
  message: string;
}
