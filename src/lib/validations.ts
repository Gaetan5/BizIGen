import { z } from 'zod';

export const bmcSchema = z.object({
  key_partners: z.array(z.string()),
  key_activities: z.array(z.string()),
  key_resources: z.array(z.string()),
  value_propositions: z.array(z.string()),
  customer_relationships: z.array(z.string()),
  channels: z.array(z.string()),
  customer_segments: z.array(z.string()),
  cost_structure: z.object({
    fixed_costs: z.array(z.object({
      item: z.string(),
      amount: z.string(),
      currency: z.string().default('XAF'),
    })),
    variable_costs: z.array(z.object({
      item: z.string(),
      percentage: z.string(),
    })),
    total_monthly_estimate: z.string(),
  }),
  revenue_streams: z.array(z.object({
    source: z.string(),
    model: z.string(),
    pricing: z.string(),
  })),
});

export const leanCanvasSchema = z.object({
  problem: z.array(z.string()),
  existing_alternatives: z.array(z.string()),
  solution: z.array(z.string()),
  key_metrics: z.array(z.string()),
  unique_value_proposition: z.string(),
  high_level_concept: z.string(),
  unfair_advantage: z.array(z.string()),
  channels: z.array(z.string()),
  customer_segments: z.object({
    target: z.string(),
    early_adopters: z.string(),
  }),
  cost_structure: z.object({
    fixed: z.string(),
    variable: z.string(),
  }),
  revenue_streams: z.object({
    model: z.string(),
    pricing: z.string(),
    break_even: z.string(),
  }),
});

export const businessPlanSchema = z.object({
  executiveSummary: z.string(),
  companyOverview: z.object({
    mission: z.string(),
    vision: z.string(),
    values: z.array(z.string()),
    legalStructure: z.string(),
    location: z.string(),
  }),
  marketAnalysis: z.object({
    industryOverview: z.string(),
    targetMarket: z.string(),
    marketSize: z.string(),
    trends: z.array(z.string()),
  }),
  competitiveAnalysis: z.object({
    directCompetitors: z.array(z.string()),
    indirectCompetitors: z.array(z.string()),
    competitiveAdvantage: z.string(),
  }),
  swot: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }),
  marketingStrategy: z.object({
    positioning: z.string(),
    channels: z.array(z.string()),
    pricingStrategy: z.string(),
    salesApproach: z.string(),
  }),
  operationsPlan: z.object({
    keyActivities: z.array(z.string()),
    keyResources: z.array(z.string()),
    keyPartners: z.array(z.string()),
    milestones: z.array(z.string()),
  }),
  financialProjections: z.object({
    year1Revenue: z.string(),
    year2Revenue: z.string(),
    year3Revenue: z.string(),
    breakEvenMonth: z.number(),
    fundingRequired: z.string(),
    useOfFunds: z.array(z.string()),
  }),
  team: z.object({
    founders: z.array(z.string()),
    keyHires: z.array(z.string()),
    advisors: z.array(z.string()),
  }),
  riskAnalysis: z.object({
    risks: z.array(z.string()),
    mitigations: z.array(z.string()),
  }),
});

export type BMCData = z.infer<typeof bmcSchema>;
export type LeanCanvasData = z.infer<typeof leanCanvasSchema>;
export type BusinessPlanData = z.infer<typeof businessPlanSchema>;
