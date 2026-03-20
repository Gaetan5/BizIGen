import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

// AI SDK for generation
import ZAI from 'z-ai-web-dev-sdk';

interface GenerateRequest {
  projectId: string;
  type: 'bmc' | 'lean' | 'bp' | 'all';
}

interface BusinessPlan {
  executiveSummary: string;
  companyOverview: {
    mission: string;
    vision: string;
    values: string[];
    legalStructure: string;
    location: string;
  };
  marketAnalysis: {
    industryOverview: string;
    targetMarket: string;
    marketSize: string;
    trends: string[];
  };
  competitiveAnalysis: {
    directCompetitors: string[];
    indirectCompetitors: string[];
    competitiveAdvantage: string;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  marketingStrategy: {
    positioning: string;
    channels: string[];
    pricingStrategy: string;
    salesApproach: string;
  };
  operationsPlan: {
    keyActivities: string[];
    keyResources: string[];
    keyPartners: string[];
    milestones: string[];
  };
  financialProjections: {
    year1Revenue: string;
    year2Revenue: string;
    year3Revenue: string;
    breakEvenMonth: number;
    fundingRequired: string;
    useOfFunds: string[];
  };
  team: {
    founders: string[];
    keyHires: string[];
    advisors: string[];
  };
  riskAnalysis: {
    risks: string[];
    mitigations: string[];
  };
}

// Prompt templates
const BMC_SYSTEM_PROMPT = `Tu es un consultant business senior spécialisé dans la création de Business Model Canvas pour des entreprises en Afrique francophone. Tu as 15 ans d'expérience en stratégie d'entreprise.

Ton rôle : Générer un Business Model Canvas complet, cohérent et actionnable basé sur les informations fournies par l'entrepreneur.

RÈGLES STRICTES:
1. Chaque bloc doit contenir 3-5 éléments concrets et spécifiques
2. Les éléments doivent être cohérents entre eux
3. Utilise le contexte local (méthodes paiement, réglementations, acteurs locaux)
4. Évite les généralités - sois spécifique au projet et au marché
5. Les montants doivent être réalistes pour la taille et le secteur

Tu DOIS répondre UNIQUEMENT avec un JSON valide, sans texte avant ou après.`;

const LEAN_SYSTEM_PROMPT = `Tu es un expert Lean Startup spécialisé dans les marchés émergents africains.
Tu génères des Lean Canvas pour startups innovantes avec focus sur:
- Validation rapide d'hypothèses
- Identification early adopters
- Métriques actionnables
- Avantage déloyal durable

RÈGLES:
1. Problem → 3 problèmes top maximum
2. Existing Alternatives → Solutions actuelles des clients
3. Solution → Fonctionnalités minimales pour MVP
4. Key Metrics → 3 métriques max, mesurables
5. Unique Value Proposition → 1 phrase claire
6. Unfair Advantage → Ce qui ne peut pas être copié facilement

Tu DOIS répondre UNIQUEMENT avec un JSON valide.`;

const BP_SYSTEM_PROMPT = `Tu es un consultant senior spécialisé dans la rédaction de Business Plans pour entreprises africaines. Tu as 20 ans d'expérience en financement et stratégie d'entreprise.

Ton rôle: Générer un Business Plan professionnel et complet adapté aux réalités du marché africain.

RÈGLES STRICTES:
1. Le plan doit être réaliste et adapté au contexte local (Mobile Money, réglementations, infrastructures)
2. Les montants doivent être cohérents avec la zone géographique
3. Identifier les risques spécifiques au marché africain
4. Proposer des stratégies adaptées aux canaux de distribution locaux
5. Inclure des métriques pertinentes pour le secteur

Tu DOIS répondre UNIQUEMENT avec un JSON valide, sans texte avant ou après.`;

function getBMCUserPrompt(formData: Record<string, string>, sector: string, country: string): string {
  return `
INFORMATIONS PROJET:
- Nom: ${formData.company_name || 'Projet'}
- Secteur: ${sector}
- Pays: ${country}
- Description: ${formData.description || 'Non spécifié'}
- Problème résolu: ${formData.problem_solved || 'Non spécifié'}
- Solution proposée: ${formData.solution || 'Non spécifié'}
- Cible: ${formData.target_market || 'Non spécifié'}
- Modèle revenus: ${formData.revenue_model || 'Non spécifié'}
- Concurrents: ${formData.competitors || 'Non spécifié'}
- Taille équipe: ${formData.team_size || 'Non spécifié'}
- Budget mensuel: ${formData.monthly_costs || 'Non spécifié'}
- Financement recherché: ${formData.required_funding || 'Non spécifié'}

GÉNÈRE UN BUSINESS MODEL CANVAS COMPLET AU FORMAT JSON SUIVANT:
{
  "key_partners": ["partenaire 1", "partenaire 2", "partenaire 3"],
  "key_activities": ["activité 1", "activité 2", "activité 3"],
  "key_resources": ["ressource 1", "ressource 2", "ressource 3"],
  "value_propositions": ["proposition 1", "proposition 2", "proposition 3"],
  "customer_relationships": ["relation 1", "relation 2", "relation 3"],
  "channels": ["canal 1", "canal 2", "canal 3"],
  "customer_segments": ["segment 1", "segment 2", "segment 3"],
  "cost_structure": {
    "fixed_costs": [{"item": "...", "amount": "...", "currency": "XAF"}],
    "variable_costs": [{"item": "...", "percentage": "..."}],
    "total_monthly_estimate": "Montant en XAF"
  },
  "revenue_streams": [{"source": "...", "model": "...", "pricing": "..."}]
}
`;
}

function getLeanUserPrompt(formData: Record<string, string>, sector: string): string {
  return `
INFORMATIONS PROJET:
- Nom: ${formData.company_name || 'Projet'}
- Secteur: ${sector}
- Description: ${formData.description || 'Non spécifié'}
- Problème résolu: ${formData.problem_solved || 'Non spécifié'}
- Solution proposée: ${formData.solution || 'Non spécifié'}
- Unicité: ${formData.unique_value || 'Non spécifié'}
- Cible: ${formData.target_market || 'Non spécifié'}
- Modèle revenus: ${formData.revenue_model || 'Non spécifié'}
- Coûts mensuels: ${formData.monthly_costs || 'Non spécifié'}

GÉNÈRE UN LEAN CANVAS COMPLET AU FORMAT JSON SUIVANT:
{
  "problem": ["problème 1", "problème 2", "problème 3"],
  "existing_alternatives": ["alternative 1", "alternative 2"],
  "solution": ["fonctionnalité 1", "fonctionnalité 2", "fonctionnalité 3"],
  "key_metrics": ["métrique 1", "métrique 2", "métrique 3"],
  "unique_value_proposition": "Une phrase claire et percutante",
  "high_level_concept": "Analogie ou métaphore",
  "unfair_advantage": ["avantage 1", "avantage 2"],
  "channels": ["canal 1", "canal 2"],
  "customer_segments": {
    "target": "Description du segment principal",
    "early_adopters": "Qui sont les premiers clients"
  },
  "cost_structure": {
    "fixed": "Montant et description",
    "variable": "Description des coûts variables"
  },
  "revenue_streams": {
    "model": "Modèle de revenus",
    "pricing": "Prix et fréquence",
    "break_even": "Hypothèse break-even"
  }
}
`;
}

async function generateBMC(formData: Record<string, string>, sector: string, country: string) {
  const zai = await ZAI.create();
  
  const response = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: BMC_SYSTEM_PROMPT },
      { role: 'user', content: getBMCUserPrompt(formData, sector, country) }
    ],
    model: 'gpt-4o-mini',
  });

  // Parse JSON from response
  const content = response.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }
  
  return JSON.parse(jsonMatch[0]);
}

async function generateLeanCanvas(formData: Record<string, string>, sector: string) {
  const zai = await ZAI.create();
  
  const response = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: LEAN_SYSTEM_PROMPT },
      { role: 'user', content: getLeanUserPrompt(formData, sector) }
    ],
    model: 'gpt-4o-mini',
  });

  // Parse JSON from response
  const content = response.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }
  
  return JSON.parse(jsonMatch[0]);
}

function getBPUserPrompt(formData: Record<string, string>, sector: string, country: string): string {
  return `
INFORMATIONS PROJET:
- Nom: ${formData.company_name || 'Projet'}
- Secteur: ${sector}
- Pays: ${country}
- Description: ${formData.description || 'Non spécifié'}
- Problème résolu: ${formData.problem_solved || 'Non spécifié'}
- Solution proposée: ${formData.solution || 'Non spécifié'}
- Unicité: ${formData.unique_value || 'Non spécifié'}
- Cible: ${formData.target_market || 'Non spécifié'}
- Taille marché: ${formData.market_size || 'Non spécifié'}
- Modèle revenus: ${formData.revenue_model || 'Non spécifié'}
- Prix: ${formData.pricing || 'Non spécifié'}
- Canaux: ${formData.sales_channels || 'Non spécifié'}
- Concurrents: ${formData.competitors || 'Non spécifié'}
- Ressources: ${formData.key_resources || 'Non spécifié'}
- Activités: ${formData.key_activities || 'Non spécifié'}
- Partenaires: ${formData.key_partners || 'Non spécifié'}
- Coûts mensuels: ${formData.monthly_costs || 'Non spécifié'}
- Revenus projetés: ${formData.projected_revenue_m6 || 'Non spécifié'}
- Financement recherché: ${formData.required_funding || 'Non spécifié'}
- Taille équipe: ${formData.team_size || 'Non spécifié'}

GÉNÈRE UN BUSINESS PLAN COMPLET AU FORMAT JSON SUIVANT:
{
  "executiveSummary": "Résumé exécutif de 150-200 mots",
  "companyOverview": {
    "mission": "Mission de l'entreprise",
    "vision": "Vision à 5 ans",
    "values": ["valeur 1", "valeur 2", "valeur 3"],
    "legalStructure": "Structure juridique recommandée",
    "location": "Localisation recommandée"
  },
  "marketAnalysis": {
    "industryOverview": "Aperçu du secteur dans le pays",
    "targetMarket": "Description détaillée du marché cible",
    "marketSize": "Taille du marché en devise locale",
    "trends": ["tendance 1", "tendance 2", "tendance 3"]
  },
  "competitiveAnalysis": {
    "directCompetitors": ["concurrent 1", "concurrent 2"],
    "indirectCompetitors": ["concurrent indirect 1", "concurrent indirect 2"],
    "competitiveAdvantage": "Avantage concurrentiel principal"
  },
  "swot": {
    "strengths": ["force 1", "force 2", "force 3"],
    "weaknesses": ["faiblesse 1", "faiblesse 2"],
    "opportunities": ["opportunité 1", "opportunité 2", "opportunité 3"],
    "threats": ["menace 1", "menace 2"]
  },
  "marketingStrategy": {
    "positioning": "Positionnement sur le marché",
    "channels": ["canal 1", "canal 2", "canal 3"],
    "pricingStrategy": "Stratégie de prix",
    "salesApproach": "Approche commerciale"
  },
  "operationsPlan": {
    "keyActivities": ["activité 1", "activité 2", "activité 3"],
    "keyResources": ["ressource 1", "ressource 2", "ressource 3"],
    "keyPartners": ["partenaire 1", "partenaire 2"],
    "milestones": ["Jalon 1: ...", "Jalon 2: ...", "Jalon 3: ..."]
  },
  "financialProjections": {
    "year1Revenue": "Revenu année 1 en devise locale",
    "year2Revenue": "Revenu année 2",
    "year3Revenue": "Revenu année 3",
    "breakEvenMonth": 12,
    "fundingRequired": "Montant nécessaire",
    "useOfFunds": ["Usage 1: %", "Usage 2: %", "Usage 3: %"]
  },
  "team": {
    "founders": ["Profil fondateur 1", "Profil fondateur 2"],
    "keyHires": ["Recrutement clé 1", "Recrutement clé 2"],
    "advisors": ["Conseiller 1", "Conseiller 2"]
  },
  "riskAnalysis": {
    "risks": ["Risque 1", "Risque 2", "Risque 3"],
    "mitigations": ["Mitigation 1", "Mitigation 2", "Mitigation 3"]
  }
}
`;
}

async function generateBusinessPlan(formData: Record<string, string>, sector: string, country: string): Promise<BusinessPlan> {
  const zai = await ZAI.create();
  
  const response = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: BP_SYSTEM_PROMPT },
      { role: 'user', content: getBPUserPrompt(formData, sector, country) }
    ],
    model: 'gpt-4o-mini',
  });

  // Parse JSON from response
  const content = response.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { projectId, type } = body;

    // Get project and form inputs
    const project = await db.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id,
      },
      include: {
        formInputs: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Convert form inputs to object
    const formData: Record<string, string> = {};
    project.formInputs.forEach(input => {
      formData[input.questionKey] = input.answerValue;
    });

    // Update project status
    await db.project.update({
      where: { id: projectId },
      data: { status: 'GENERATING' },
    });

    // Create or get generated document
    let generatedDoc = await db.generatedDocument.findUnique({
      where: { projectId },
    });

    if (!generatedDoc) {
      generatedDoc = await db.generatedDocument.create({
        data: {
          projectId,
          type: 'FULL',
          status: 'GENERATING',
        },
      });
    } else {
      await db.generatedDocument.update({
        where: { id: generatedDoc.id },
        data: { status: 'GENERATING' },
      });
    }

    // Generate based on type
    const results: { bmc?: unknown; lean?: unknown } = {};

    if (type === 'bmc' || type === 'all') {
      try {
        const bmcBlocks = await generateBMC(formData, project.sector, project.country);
        results.bmc = bmcBlocks;

        // Save BMC canvas
        await db.canvasData.upsert({
          where: {
            docId_canvasType: {
              docId: generatedDoc.id,
              canvasType: 'BUSINESS_MODEL_CANVAS',
            },
          },
          update: {
            blocks: JSON.stringify(bmcBlocks),
          },
          create: {
            docId: generatedDoc.id,
            canvasType: 'BUSINESS_MODEL_CANVAS',
            blocks: JSON.stringify(bmcBlocks),
          },
        });
      } catch (error) {
        console.error('BMC generation error:', error);
      }
    }

    if (type === 'lean' || type === 'all') {
      try {
        const leanBlocks = await generateLeanCanvas(formData, project.sector);
        results.lean = leanBlocks;

        // Save Lean Canvas
        await db.canvasData.upsert({
          where: {
            docId_canvasType: {
              docId: generatedDoc.id,
              canvasType: 'LEAN_CANVAS',
            },
          },
          update: {
            blocks: JSON.stringify(leanBlocks),
          },
          create: {
            docId: generatedDoc.id,
            canvasType: 'LEAN_CANVAS',
            blocks: JSON.stringify(leanBlocks),
          },
        });
      } catch (error) {
        console.error('Lean Canvas generation error:', error);
      }
    }

    // Generate Business Plan
    if (type === 'bp' || type === 'all') {
      try {
        const businessPlan = await generateBusinessPlan(formData, project.sector, project.country);
        
        // Save Business Plan as raw content on the generated document
        await db.generatedDocument.update({
          where: { id: generatedDoc.id },
          data: {
            rawContent: JSON.stringify(businessPlan),
          },
        });
        
        // Also return it in results
        (results as Record<string, unknown>).bp = businessPlan;
      } catch (error) {
        console.error('Business Plan generation error:', error);
      }
    }

    // Update statuses
    await db.generatedDocument.update({
      where: { id: generatedDoc.id },
      data: { 
        status: 'COMPLETED',
        version: { increment: 1 },
      },
    });

    await db.project.update({
      where: { id: projectId },
      data: { 
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      documentId: generatedDoc.id,
      status: 'COMPLETED',
      results,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
