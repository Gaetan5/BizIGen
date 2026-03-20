// BizGen AI - Project Templates by Sector

import type { Sector } from '@/types';

export interface ProjectTemplate {
  id: string;
  name: string;
  sector: Sector;
  description: string;
  icon: string;
  preview: string;
  defaultAnswers: Record<string, string>;
  highlights: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'tech-saas',
    name: 'SaaS B2B',
    sector: 'TECH',
    description: 'Startup technologique avec modèle d\'abonnement mensuel',
    icon: '💻',
    preview: 'Plateforme SaaS pour entreprises avec abonnement mensuel et freemium',
    defaultAnswers: {
      company_name: 'MonSaaS',
      description: 'Une plateforme SaaS qui aide les entreprises à automatiser leurs processus métier',
      problem_solved: 'Les entreprises perdent du temps sur des tâches répétitives et manquent de visibilité sur leurs données',
      solution: 'Une plateforme intuitive qui automatise les workflows et fournit des analytics en temps réel',
      unique_value: 'Interface intuitive + IA intégrée + Intégrations natives avec les outils existants',
      target_market: 'PME et startups dans la tech, le marketing et la finance',
      revenue_model: 'Abonnement mensuel (Freemium + Plans Pro/Enterprise)',
      team_size: '2-5 personnes',
      monthly_costs: '2,000,000 XAF (salaires + infrastructure + marketing)',
    },
    highlights: ['Modèle Freemium', 'Intégrations API', 'Analytics avancés'],
  },
  {
    id: 'tech-marketplace',
    name: 'Marketplace',
    sector: 'TECH',
    description: 'Plateforme connectant acheteurs et vendeurs',
    icon: '🛒',
    preview: 'Marketplace sectorielle pour artisans et clients avec commission sur transactions',
    defaultAnswers: {
      company_name: 'ArtisanMarket',
      description: 'Marketplace connectant les artisans locaux aux clients',
      problem_solved: 'Les artisans ont du mal à trouver des clients au-delà de leur réseau local',
      solution: 'Une plateforme qui met en avant les produits artisanaux et facilite les transactions',
      unique_value: 'Focus sur l\'artisanat local + Certification qualité + Livraison intégrée',
      target_market: 'Artisans et consommateurs recherchant des produits authentiques',
      revenue_model: 'Commission de 10-15% sur chaque transaction',
      team_size: '6-10 personnes',
      monthly_costs: '3,500,000 XAF (équipe + marketing + logistique)',
    },
    highlights: ['Commission sur transactions', 'Paiement Mobile Money', 'Livraison intégrée'],
  },
  {
    id: 'tech-fintech',
    name: 'Fintech / Mobile Money',
    sector: 'TECH',
    description: 'Solution de paiement mobile innovante',
    icon: '💳',
    preview: 'Application de paiement mobile pour particuliers et commerçants',
    defaultAnswers: {
      company_name: 'PayMobile',
      description: 'Solution de paiement mobile innovante pour l\'Afrique',
      problem_solved: 'Les populations non bancarisées n\'ont pas accès aux services financiers de base',
      solution: 'Application mobile permettant paiements, transferts et épargne sans compte bancaire',
      unique_value: 'Kyc simplifié + Agent network + Intégration avec tous les opérateurs',
      target_market: 'Population non bancarisée, petits commerçants, migrants',
      revenue_model: 'Frais de transaction (1-2%) + Services premium',
      team_size: '11-50 personnes',
      monthly_costs: '15,000,000 XAF (équipe tech + compliance + réseau agents)',
    },
    highlights: ['KYC simplifié', 'Multi-opérateurs', 'Réseau d\'agents'],
  },
  {
    id: 'agro-transformation',
    name: 'Agro-transformation',
    sector: 'AGRO_ALIMENTAIRE',
    description: 'Transformation de produits agricoles locaux',
    icon: '🏭',
    preview: 'Unité de transformation de produits locaux avec certification qualité',
    defaultAnswers: {
      company_name: 'AgriTrans',
      description: 'Transformation et valorisation des produits agricoles locaux',
      problem_solved: 'Les agriculteurs vendent leurs produits bruts à bas prix et perdent en valeur ajoutée',
      solution: 'Transformer localement les produits agricoles pour augmenter leur valeur',
      unique_value: 'Chaîne courte + Certification Bio + Traçabilité complète',
      target_market: 'Supermarchés, restaurants, et consommateurs urbains',
      revenue_model: 'Vente directe et partenariats B2B avec grandes surfaces',
      team_size: '11-50 personnes',
      monthly_costs: '8,000,000 XAF (salaires + matières premières + énergie)',
    },
    highlights: ['Label Bio', 'Export potentiel', 'Partenariats coopératives'],
  },
  {
    id: 'services-consulting',
    name: 'Consulting Digital',
    sector: 'SERVICES',
    description: 'Cabinet de conseil en transformation digitale',
    icon: '🎯',
    preview: 'Cabinet de conseil pour entreprises en transformation digitale',
    defaultAnswers: {
      company_name: 'DigitalConsult',
      description: 'Cabinet de conseil spécialisé en transformation digitale',
      problem_solved: 'Les entreprises traditionnelles ont du mal à s\'adapter au numérique',
      solution: 'Accompagnement personnalisé pour la digitalisation des processus',
      unique_value: 'Expertise locale + Méthodologie éprouvée + Formation incluse',
      target_market: 'PME en transformation, startups, administrations',
      revenue_model: 'Facturation à la mission ou abonnement mensuel',
      team_size: '2-5 personnes',
      monthly_costs: '1,500,000 XAF (salaires + outils + marketing)',
    },
    highlights: ['Formation incluse', 'Support continu', 'Méthodologie agile'],
  },
  {
    id: 'services-formation',
    name: 'Centre de Formation',
    sector: 'SERVICES',
    description: 'Organisme de formation professionnelle',
    icon: '📚',
    preview: 'Centre de formation en compétences numériques',
    defaultAnswers: {
      company_name: 'SkillUp',
      description: 'Centre de formation professionnelle aux métiers du numérique',
      problem_solved: 'Décalage entre les compétences académiques et les besoins des entreprises',
      solution: 'Formations pratiques orientées métier avec certification',
      unique_value: 'Formateurs praticiens + Lab de pratique + Placement entreprises',
      target_market: 'Jeunes diplômés, demandeurs d\'emploi, entreprises en reconversion',
      revenue_model: 'Frais de formation + Contrats professionnalisation',
      team_size: '6-10 personnes',
      monthly_costs: '3,000,000 XAF (formateurs + locaux + équipements)',
    },
    highlights: ['Certifications', 'Placement pro', 'E-learning'],
  },
  {
    id: 'commerce-ecommerce',
    name: 'E-commerce',
    sector: 'COMMERCE',
    description: 'Boutique en ligne spécialisée',
    icon: '🛍️',
    preview: 'E-commerce de niche avec livraison rapide',
    defaultAnswers: {
      company_name: 'QuickShop',
      description: 'Boutique en ligne spécialisée avec livraison express',
      problem_solved: 'Les clients attendent trop longtemps leurs achats en ligne',
      solution: 'E-commerce avec livraison en 24h dans les grandes villes',
      unique_value: 'Livraison express + Paiement à la livraison + Retours gratuits',
      target_market: 'Jeunes urbains connectés, 18-40 ans',
      revenue_model: 'Marge sur produits + options de livraison premium',
      team_size: '6-10 personnes',
      monthly_costs: '4,000,000 XAF (stock + équipe + marketing digital)',
    },
    highlights: ['Livraison 24h', 'Paiement mobile', 'Retours faciles'],
  },
  {
    id: 'commerce-import',
    name: 'Import/Export',
    sector: 'COMMERCE',
    description: 'Commerce international de produits spécifiques',
    icon: '🌍',
    preview: 'Entreprise d\'import/export de produits spécialisés',
    defaultAnswers: {
      company_name: 'GlobalTrade',
      description: 'Commerce international de produits entre l\'Afrique et l\'Europe/Asie',
      problem_solved: 'Difficulté d\'accès aux produits internationaux de qualité',
      solution: 'Import de produits demandés + Export de produits locaux',
      unique_value: 'Réseau fournisseurs fiables + Logistique optimisée + Conformité douanière',
      target_market: 'Distributeurs locaux, grossistes, exportateurs',
      revenue_model: 'Marge sur import/export + Services logistiques',
      team_size: '6-10 personnes',
      monthly_costs: '5,000,000 XAF (stock + logistique + équipe)',
    },
    highlights: ['Réseau international', 'Douanes simplifiées', 'Logistique intégrée'],
  },
  {
    id: 'agro-production',
    name: 'Production Agricole',
    sector: 'AGRO',
    description: 'Ferme agricole moderne avec cultures variées',
    icon: '🌾',
    preview: 'Exploitation agricole diversifiée avec techniques modernes',
    defaultAnswers: {
      company_name: 'GreenFarm',
      description: 'Exploitation agricole moderne avec cultures maraîchères',
      problem_solved: 'Pénurie de légumes frais de qualité dans les villes',
      solution: 'Production intensive de légumes avec techniques modernes',
      unique_value: 'Agriculture raisonnée + Irrigation goutte-à-goutte + Certification qualité',
      target_market: 'Marchés urbains, restaurants, supermarchés',
      revenue_model: 'Vente en gros et détail sur les marchés',
      team_size: '6-10 personnes',
      monthly_costs: '2,500,000 XAF (salaires + intrants + énergie)',
    },
    highlights: ['Irrigation moderne', 'Variétés adaptées', 'Circuits courts'],
  },
  {
    id: 'agro-elevage',
    name: 'Élevage Moderne',
    sector: 'AGRO',
    description: 'Ferme d\'élevage intensive ou semi-intensive',
    icon: '🐔',
    preview: 'Ferme d\'élevage avicole ou bovine moderne',
    defaultAnswers: {
      company_name: 'PoultryFarm',
      description: 'Élevage avicole moderne pour production d\'œufs et poulets de chair',
      problem_solved: 'Déficit de production locale de protéines animales',
      solution: 'Élevage moderne avec alimentation optimisée et biosécurité',
      unique_value: 'Race améliorée + Alimentation locale + Contrôle vétérinaire',
      target_market: 'Restaurants, hôtels, ménages, supermarchés',
      revenue_model: 'Vente d\'œufs et poulets, sous-produits (fientes)',
      team_size: '6-10 personnes',
      monthly_costs: '4,000,000 XAF (aliments + poussins + équipements)',
    },
    highlights: ['Race améliorée', 'Biosécurité', 'Production continue'],
  },
];

export function getTemplatesBySector(sector: Sector): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter(t => t.sector === sector);
}

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(t => t.id === id);
}

export function getAllSectors(): Sector[] {
  return ['TECH', 'AGRO', 'AGRO_ALIMENTAIRE', 'SERVICES', 'COMMERCE', 'AUTRE'];
}
