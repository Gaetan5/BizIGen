'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Target, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface BusinessPlanData {
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

interface BusinessPlanViewerProps {
  data: BusinessPlanData;
  projectName: string;
}

export function BusinessPlanViewer({ data, projectName }: BusinessPlanViewerProps) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Résumé Exécutif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{data.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Aperçu de l'Entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Mission</h4>
              <p>{data.companyOverview.mission}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Vision</h4>
              <p>{data.companyOverview.vision}</p>
            </div>
          </div>
          <Separator />
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Valeurs</h4>
              <div className="flex flex-wrap gap-2">
                {data.companyOverview.values.map((value, i) => (
                  <Badge key={i} variant="secondary">{value}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Structure Juridique</h4>
              <p>{data.companyOverview.legalStructure}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Localisation</h4>
              <p>{data.companyOverview.location}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analyse du Marché
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Aperçu du Secteur</h4>
            <p>{data.marketAnalysis.industryOverview}</p>
          </div>
          <Separator />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Marché Cible</h4>
              <p>{data.marketAnalysis.targetMarket}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Taille du Marché</h4>
              <p className="font-semibold text-primary">{data.marketAnalysis.marketSize}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Tendances du Marché</h4>
            <ul className="space-y-1">
              {data.marketAnalysis.trends.map((trend, i) => (
                <li key={i} className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Analyse Concurrentielle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Concurrents Directs</h4>
              <ul className="space-y-1">
                {data.competitiveAnalysis.directCompetitors.map((comp, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    {comp}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Concurrents Indirects</h4>
              <ul className="space-y-1">
                {data.competitiveAnalysis.indirectCompetitors.map((comp, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    {comp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Separator />
          <div className="p-4 bg-primary/5 rounded-lg">
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Avantage Concurrentiel</h4>
            <p className="font-medium">{data.competitiveAnalysis.competitiveAdvantage}</p>
          </div>
        </CardContent>
      </Card>

      {/* SWOT Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse SWOT</CardTitle>
          <CardDescription>Forces, Faiblesses, Opportunités et Menaces</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4" />
                Forces
              </h4>
              <ul className="space-y-1 text-sm">
                {data.swot.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            
            {/* Weaknesses */}
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Faiblesses
              </h4>
              <ul className="space-y-1 text-sm">
                {data.swot.weaknesses.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
            
            {/* Opportunities */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4" />
                Opportunités
              </h4>
              <ul className="space-y-1 text-sm">
                {data.swot.opportunities.map((o, i) => (
                  <li key={i}>• {o}</li>
                ))}
              </ul>
            </div>
            
            {/* Threats */}
            <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                Menaces
              </h4>
              <ul className="space-y-1 text-sm">
                {data.swot.threats.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Stratégie Marketing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Positionnement</h4>
            <p>{data.marketingStrategy.positioning}</p>
          </div>
          <Separator />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Canaux de Distribution</h4>
              <div className="flex flex-wrap gap-2">
                {data.marketingStrategy.channels.map((channel, i) => (
                  <Badge key={i} variant="outline">{channel}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Stratégie de Prix</h4>
              <p>{data.marketingStrategy.pricingStrategy}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Approche Commerciale</h4>
            <p>{data.marketingStrategy.salesApproach}</p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Projections Financières
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Année 1</p>
              <p className="text-2xl font-bold text-primary">{data.financialProjections.year1Revenue}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Année 2</p>
              <p className="text-2xl font-bold text-primary">{data.financialProjections.year2Revenue}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Année 3</p>
              <p className="text-2xl font-bold text-primary">{data.financialProjections.year3Revenue}</p>
            </div>
          </div>
          <Separator />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Point d'équilibre</p>
              <p className="text-xl font-semibold">Mois {data.financialProjections.breakEvenMonth}</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Financement Requis</p>
              <p className="text-xl font-semibold text-primary">{data.financialProjections.fundingRequired}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Utilisation des Fonds</h4>
            <ul className="space-y-1">
              {data.financialProjections.useOfFunds.map((use, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {use}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Operations Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Opérationnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Activités Clés</h4>
              <ul className="space-y-1 text-sm">
                {data.operationsPlan.keyActivities.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Ressources Clés</h4>
              <ul className="space-y-1 text-sm">
                {data.operationsPlan.keyResources.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Partenaires Clés</h4>
              <ul className="space-y-1 text-sm">
                {data.operationsPlan.keyPartners.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Jalons</h4>
            <div className="space-y-2">
              {data.operationsPlan.milestones.map((milestone, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-muted rounded">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-sm">{milestone}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Équipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Fondateurs</h4>
              <ul className="space-y-1 text-sm">
                {data.team.founders.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Recrutements Clés</h4>
              <ul className="space-y-1 text-sm">
                {data.team.keyHires.map((h, i) => (
                  <li key={i}>• {h}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Conseillers</h4>
              <ul className="space-y-1 text-sm">
                {data.team.advisors.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Analyse des Risques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.riskAnalysis.risks.map((risk, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{risk}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="text-green-600 font-medium">Mitigation:</span> {data.riskAnalysis.mitigations[i]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
