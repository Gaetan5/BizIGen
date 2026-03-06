// BizGen AI - Constants

import type { Sector } from '@/types';

// ============================================
// App Configuration
// ============================================

export const APP_NAME = 'BizGen AI';
export const APP_TAGLINE = 'Générez votre Business Model Canvas, Lean Canvas et Business Plan en 20 minutes';
export const APP_DESCRIPTION = 'Plateforme SaaS d\'automatisation de documents business pour entrepreneurs africains';

// ============================================
// Sector Labels
// ============================================

export const SECTOR_LABELS: Record<Sector, { label: string; description: string; icon: string }> = {
  TECH: {
    label: 'Tech / Digital',
    description: 'Startups technologiques, SaaS, applications mobiles, e-commerce',
    icon: 'Laptop',
  },
  AGRO: {
    label: 'Agriculture',
    description: 'Production agricole, élevage, pêche, foresterie',
    icon: 'Leaf',
  },
  AGRO_ALIMENTAIRE: {
    label: 'Agro-alimentaire',
    description: 'Transformation alimentaire, industrie alimentaire',
    icon: 'UtensilsCrossed',
  },
  SERVICES: {
    label: 'Services',
    description: 'Conseil, formation, services professionnels',
    icon: 'Briefcase',
  },
  COMMERCE: {
    label: 'Commerce',
    description: 'Commerce de détail, grossiste, import/export',
    icon: 'ShoppingCart',
  },
  AUTRE: {
    label: 'Autre secteur',
    description: 'Autres types d\'activités',
    icon: 'Grid3X3',
  },
};

// ============================================
// Country Options (Africa focused)
// ============================================

export const COUNTRIES = [
  { value: 'CM', label: 'Cameroun', currency: 'XAF', flag: '🇨🇲' },
  { value: 'SN', label: 'Sénégal', currency: 'XOF', flag: '🇸🇳' },
  { value: 'CI', label: 'Côte d\'Ivoire', currency: 'XOF', flag: '🇨🇮' },
  { value: 'NG', label: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
  { value: 'KE', label: 'Kenya', currency: 'KES', flag: '🇰🇪' },
  { value: 'GH', label: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
  { value: 'MA', label: 'Maroc', currency: 'MAD', flag: '🇲🇦' },
  { value: 'TN', label: 'Tunisie', currency: 'TND', flag: '🇹🇳' },
  { value: 'ZA', label: 'Afrique du Sud', currency: 'ZAR', flag: '🇿🇦' },
  { value: 'RW', label: 'Rwanda', currency: 'RWF', flag: '🇷🇼' },
  { value: 'OTHER', label: 'Autre pays', currency: 'USD', flag: '🌍' },
];

// ============================================
// Form Steps
// ============================================

export const FORM_STEPS = [
  { number: 1, title: 'Identité', description: 'Informations sur votre entreprise', icon: 'Building2' },
  { number: 2, title: 'Problème & Solution', description: 'Ce que vous résolvez', icon: 'Lightbulb' },
  { number: 3, title: 'Marché', description: 'Vos clients cibles', icon: 'Users' },
  { number: 4, title: 'Modèle économique', description: 'Comment vous gagnez de l\'argent', icon: 'Coins' },
  { number: 5, title: 'Opérations', description: 'Ressources et activités', icon: 'Settings' },
  { number: 6, title: 'Finances', description: 'Projections et besoins', icon: 'TrendingUp' },
];

// ============================================
// BMC Canvas Blocks Config
// ============================================

export const BMC_BLOCKS_CONFIG = [
  { key: 'key_partners', label: 'Partenaires Clés', color: 'bg-blue-50 dark:bg-blue-950', position: { row: 1, col: 1 } },
  { key: 'key_activities', label: 'Activités Clés', color: 'bg-green-50 dark:bg-green-950', position: { row: 1, col: 2 } },
  { key: 'key_resources', label: 'Ressources Clés', color: 'bg-yellow-50 dark:bg-yellow-950', position: { row: 2, col: 2 } },
  { key: 'value_propositions', label: 'Propositions de Valeur', color: 'bg-purple-50 dark:bg-purple-950', position: { row: 1, col: 3, rowSpan: 2 } },
  { key: 'customer_relationships', label: 'Relations Clients', color: 'bg-pink-50 dark:bg-pink-950', position: { row: 1, col: 4 } },
  { key: 'channels', label: 'Canaux', color: 'bg-orange-50 dark:bg-orange-950', position: { row: 2, col: 4 } },
  { key: 'customer_segments', label: 'Segments Clients', color: 'bg-red-50 dark:bg-red-950', position: { row: 1, col: 5, rowSpan: 2 } },
  { key: 'cost_structure', label: 'Structure des Coûts', color: 'bg-gray-50 dark:bg-gray-900', position: { row: 3, col: 1, colSpan: 2.5 } },
  { key: 'revenue_streams', label: 'Sources de Revenus', color: 'bg-emerald-50 dark:bg-emerald-950', position: { row: 3, col: 3.5, colSpan: 2.5 } },
];

// ============================================
// Lean Canvas Blocks Config
// ============================================

export const LEAN_CANVAS_BLOCKS_CONFIG = [
  { key: 'problem', label: 'Problème', color: 'bg-red-50 dark:bg-red-950', position: { row: 1, col: 1 } },
  { key: 'solution', label: 'Solution', color: 'bg-green-50 dark:bg-green-950', position: { row: 2, col: 1 } },
  { key: 'unique_value_proposition', label: 'Proposition de Valeur Unique', color: 'bg-purple-50 dark:bg-purple-950', position: { row: 1, col: 2, rowSpan: 2 } },
  { key: 'unfair_advantage', label: 'Avantage Déloyal', color: 'bg-yellow-50 dark:bg-yellow-950', position: { row: 1, col: 3 } },
  { key: 'customer_segments', label: 'Segments Clients', color: 'bg-blue-50 dark:bg-blue-950', position: { row: 2, col: 3 } },
  { key: 'existing_alternatives', label: 'Alternatives Existantes', color: 'bg-gray-50 dark:bg-gray-900', position: { row: 1, col: 1, subBlock: true } },
  { key: 'key_metrics', label: 'Métriques Clés', color: 'bg-cyan-50 dark:bg-cyan-950', position: { row: 2, col: 1, subBlock: true } },
  { key: 'channels', label: 'Canaux', color: 'bg-orange-50 dark:bg-orange-950', position: { row: 2, col: 2, subBlock: true } },
  { key: 'cost_structure', label: 'Structure des Coûts', color: 'bg-gray-50 dark:bg-gray-900', position: { row: 3, col: 1, colSpan: 2 } },
  { key: 'revenue_streams', label: 'Sources de Revenus', color: 'bg-emerald-50 dark:bg-emerald-950', position: { row: 3, col: 3, colSpan: 2 } },
];

// ============================================
// Pricing Plans
// ============================================

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: '€',
    period: 'mois',
    description: 'Pour découvrir la plateforme',
    features: [
      '1 projet par mois',
      'Business Model Canvas',
      'Lean Canvas',
      'Exports PNG avec watermark',
      'Support email',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 7,
    currency: '€',
    period: 'mois',
    description: 'Pour les entrepreneurs actifs',
    features: [
      '5 projets par mois',
      'Business Plan complet (20-50 pages)',
      'Exports PDF sans watermark',
      'Édition des documents',
      'Support prioritaire',
      'Templates sectoriels',
    ],
    cta: 'Choisir Basic',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    currency: '€',
    period: 'mois',
    description: 'Pour les consultants et équipes',
    features: [
      'Projets illimités',
      'Toutes les fonctionnalités Basic',
      'Exports Word/DOCX',
      'API access',
      'Collaboration équipe',
      'Support dédié',
      'Mises à jour prioritaires',
    ],
    cta: 'Choisir Pro',
    popular: false,
  },
];

// ============================================
// African Context Data
// ============================================

export const AFRICAN_CONTEXT = {
  CM: {
    name: 'Cameroun',
    currency: 'XAF',
    mobileMoney: ['MTN Mobile Money', 'Orange Money'],
    majorCities: ['Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Bafoussam'],
    keySectors: ['Agriculture', 'Pétrole', 'Bois', 'Mines'],
    businessHub: 'Douala',
    exchangeRate: { EUR: 655.957, USD: 600 },
  },
  SN: {
    name: 'Sénégal',
    currency: 'XOF',
    mobileMoney: ['Orange Money', 'Wave', 'Wari'],
    majorCities: ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack'],
    keySectors: ['Agriculture', 'Pêche', 'Tourisme', 'Services'],
    businessHub: 'Dakar',
    exchangeRate: { EUR: 655.957, USD: 600 },
  },
  NG: {
    name: 'Nigeria',
    currency: 'NGN',
    mobileMoney: ['Paga', 'OPay', 'PalmPay'],
    majorCities: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano'],
    keySectors: ['Pétrole', 'Agriculture', 'Services', 'Tech'],
    businessHub: 'Lagos',
    exchangeRate: { EUR: 1600, USD: 1500 },
  },
};

// ============================================
// Default Form Questions
// ============================================

export const DEFAULT_FORM_QUESTIONS = [
  // Step 1: Identity
  {
    id: 'q1',
    key: 'company_name',
    label: 'Nom de votre entreprise ou projet',
    placeholder: 'Ex: AgriTech Solutions',
    type: 'text',
    required: true,
    step: 1,
  },
  {
    id: 'q2',
    key: 'description',
    label: 'Décrivez votre activité en 2-3 phrases',
    placeholder: 'Nous sommes une entreprise qui...',
    type: 'textarea',
    required: true,
    step: 1,
    helpText: 'Soyez clair et concis, cela aidera l\'IA à mieux comprendre votre projet',
  },
  {
    id: 'q3',
    key: 'team_size',
    label: 'Taille de votre équipe',
    type: 'select',
    required: true,
    step: 1,
    options: [
      { value: 'solo', label: 'Solo (juste moi)' },
      { value: '2-5', label: '2-5 personnes' },
      { value: '6-10', label: '6-10 personnes' },
      { value: '11-50', label: '11-50 personnes' },
      { value: '50+', label: 'Plus de 50 personnes' },
    ],
  },
  {
    id: 'q4',
    key: 'funding_stage',
    label: 'Stade de financement',
    type: 'select',
    required: true,
    step: 1,
    options: [
      { value: 'idea', label: 'Idée / Concept' },
      { value: 'bootstrap', label: 'Bootstrapped (autofinancement)' },
      { value: 'seed', label: 'Seed / Amorçage' },
      { value: 'series_a', label: 'Series A' },
      { value: 'growth', label: 'Croissance' },
    ],
  },

  // Step 2: Problem & Solution
  {
    id: 'q5',
    key: 'problem_solved',
    label: 'Quel problème résolvez-vous ?',
    placeholder: 'Les agriculteurs perdent 30% de leurs récoltes faute de débouchés...',
    type: 'textarea',
    required: true,
    step: 2,
    helpText: 'Décrivez le ou les problèmes que votre solution adresse',
  },
  {
    id: 'q6',
    key: 'solution',
    label: 'Quelle est votre solution ?',
    placeholder: 'Nous créons une plateforme qui connecte directement les agriculteurs aux acheteurs...',
    type: 'textarea',
    required: true,
    step: 2,
  },
  {
    id: 'q7',
    key: 'unique_value',
    label: 'Qu\'est-ce qui vous rend unique ?',
    placeholder: 'Nous sommes les seuls à offrir une intégration Mobile Money avec certification blockchain...',
    type: 'textarea',
    required: true,
    step: 2,
    helpText: 'Votre différenciation par rapport à la concurrence',
  },
  {
    id: 'q8',
    key: 'competitors',
    label: 'Qui sont vos principaux concurrents ?',
    placeholder: 'AgriHub, FarmCrowry, intermédiaires traditionnels...',
    type: 'textarea',
    required: false,
    step: 2,
  },

  // Step 3: Market
  {
    id: 'q9',
    key: 'target_market',
    label: 'Qui sont vos clients cibles ?',
    placeholder: 'Petits agriculteurs (moins de 5 hectares), exportateurs européens...',
    type: 'textarea',
    required: true,
    step: 3,
  },
  {
    id: 'q10',
    key: 'market_size',
    label: 'Quelle est la taille de votre marché ?',
    placeholder: '500,000 agriculteurs au Cameroun, marché de 50 milliards XAF...',
    type: 'textarea',
    required: false,
    step: 3,
    helpText: 'Estimez le nombre de clients potentiels et le volume du marché',
  },
  {
    id: 'q11',
    key: 'customer_segment',
    label: 'Quel est votre segment prioritaire ?',
    type: 'select',
    required: true,
    step: 3,
    options: [
      { value: 'b2b', label: 'B2B (entreprises)' },
      { value: 'b2c', label: 'B2C (consommateurs)' },
      { value: 'b2g', label: 'B2G (gouvernement)' },
      { value: 'marketplace', label: 'Marketplace (B2B2C)' },
    ],
  },

  // Step 4: Business Model
  {
    id: 'q12',
    key: 'revenue_model',
    label: 'Comment gagnez-vous de l\'argent ?',
    placeholder: 'Commission de 5% sur chaque transaction + abonnement mensuel pour les exportateurs...',
    type: 'textarea',
    required: true,
    step: 4,
  },
  {
    id: 'q13',
    key: 'pricing',
    label: 'Quels sont vos prix ?',
    placeholder: 'Abonnement: 50,000 XAF/mois, Commission: 5% par transaction...',
    type: 'textarea',
    required: false,
    step: 4,
  },
  {
    id: 'q14',
    key: 'sales_channels',
    label: 'Par quels canaux vendez-vous ?',
    placeholder: 'Application mobile, agents terrain, partenariats coopératives...',
    type: 'textarea',
    required: true,
    step: 4,
  },

  // Step 5: Operations
  {
    id: 'q15',
    key: 'key_resources',
    label: 'De quelles ressources avez-vous besoin ?',
    placeholder: 'Équipe technique (3 devs), base de données agriculteurs, partenariats blockchain...',
    type: 'textarea',
    required: true,
    step: 5,
  },
  {
    id: 'q16',
    key: 'key_activities',
    label: 'Quelles sont vos activités principales ?',
    placeholder: 'Développement plateforme, onboarding agriculteurs, certification qualité...',
    type: 'textarea',
    required: true,
    step: 5,
  },
  {
    id: 'q17',
    key: 'key_partners',
    label: 'Qui sont vos partenaires clés ?',
    placeholder: 'Coopératives agricoles, MTN Mobile Money, exportateurs certifiés...',
    type: 'textarea',
    required: false,
    step: 5,
  },

  // Step 6: Finances
  {
    id: 'q18',
    key: 'monthly_costs',
    label: 'Quels sont vos coûts mensuels ?',
    placeholder: 'Salaires: 1,500,000 XAF, Infrastructure: 200,000 XAF, Marketing: 300,000 XAF...',
    type: 'textarea',
    required: true,
    step: 6,
  },
  {
    id: 'q19',
    key: 'projected_revenue_m6',
    label: 'Revenus projetés dans 6 mois ?',
    placeholder: '5,000,000 XAF par mois',
    type: 'text',
    required: false,
    step: 6,
  },
  {
    id: 'q20',
    key: 'required_funding',
    label: 'De combien de financement avez-vous besoin ?',
    placeholder: '15,000,000 XAF pour développer la plateforme et recruter l\'équipe...',
    type: 'textarea',
    required: false,
    step: 6,
    helpText: 'Indiquez le montant et l\'utilisation prévue',
  },
];

// Sector-specific additional questions
export const SECTOR_QUESTIONS: Record<Sector, typeof DEFAULT_FORM_QUESTIONS> = {
  TECH: [
    ...DEFAULT_FORM_QUESTIONS,
    {
      id: 'q_tech_1',
      key: 'tech_stack',
      label: 'Quelle est votre stack technologique ?',
      placeholder: 'React, Node.js, PostgreSQL, AWS...',
      type: 'textarea',
      required: false,
      step: 5,
    },
    {
      id: 'q_tech_2',
      key: 'mvp_status',
      label: 'État du MVP',
      type: 'select',
      required: false,
      step: 2,
      options: [
        { value: 'idea', label: 'Idée seulement' },
        { value: 'prototype', label: 'Prototype' },
        { value: 'mvp', label: 'MVP fonctionnel' },
        { value: 'production', label: 'En production' },
      ],
    },
  ],
  AGRO: [
    ...DEFAULT_FORM_QUESTIONS,
    {
      id: 'q_agro_1',
      key: 'production_type',
      label: 'Type de production agricole',
      type: 'multiselect',
      required: true,
      step: 1,
      options: [
        { value: 'crops', label: 'Cultures (cacao, café, etc.)' },
        { value: 'livestock', label: 'Élevage' },
        { value: 'fishery', label: 'Pêche/Aquaculture' },
        { value: 'forestry', label: 'Foresterie' },
      ],
    },
    {
      id: 'q_agro_2',
      key: 'supply_chain',
      label: 'Position dans la chaîne de valeur',
      type: 'select',
      required: true,
      step: 5,
      options: [
        { value: 'producer', label: 'Producteur' },
        { value: 'collector', label: 'Collecteur' },
        { value: 'transformer', label: 'Transformateur' },
        { value: 'distributor', label: 'Distributeur' },
        { value: 'exporter', label: 'Exportateur' },
      ],
    },
  ],
  AGRO_ALIMENTAIRE: [
    ...DEFAULT_FORM_QUESTIONS,
    {
      id: 'q_aa_1',
      key: 'transformation_type',
      label: 'Type de transformation',
      type: 'multiselect',
      required: true,
      step: 1,
      options: [
        { value: 'primary', label: 'Première transformation' },
        { value: 'secondary', label: 'Seconde transformation' },
        { value: 'packaging', label: 'Conditionnement' },
        { value: 'distribution', label: 'Distribution' },
      ],
    },
    {
      id: 'q_aa_2',
      key: 'certifications',
      label: 'Certifications visées',
      type: 'multiselect',
      required: false,
      step: 5,
      options: [
        { value: 'haccp', label: 'HACCP' },
        { value: 'iso22000', label: 'ISO 22000' },
        { value: 'organic', label: 'Bio/Agriculture biologique' },
        { value: 'fairtrade', label: 'Commerce équitable' },
      ],
    },
  ],
  SERVICES: [
    ...DEFAULT_FORM_QUESTIONS,
    {
      id: 'q_serv_1',
      key: 'service_type',
      label: 'Type de services',
      type: 'multiselect',
      required: true,
      step: 1,
      options: [
        { value: 'consulting', label: 'Conseil' },
        { value: 'training', label: 'Formation' },
        { value: 'professional', label: 'Services professionnels' },
        { value: 'digital', label: 'Services digitaux' },
      ],
    },
    {
      id: 'q_serv_2',
      key: 'billing_model',
      label: 'Modèle de facturation',
      type: 'select',
      required: true,
      step: 4,
      options: [
        { value: 'hourly', label: 'À l\'heure' },
        { value: 'project', label: 'Au projet' },
        { value: 'retainer', label: 'Abonnement mensuel' },
        { value: 'success', label: 'Au succès / Performance' },
      ],
    },
  ],
  COMMERCE: [
    ...DEFAULT_FORM_QUESTIONS,
    {
      id: 'q_com_1',
      key: 'commerce_type',
      label: 'Type de commerce',
      type: 'select',
      required: true,
      step: 1,
      options: [
        { value: 'retail', label: 'Détail' },
        { value: 'wholesale', label: 'Grossiste' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'import', label: 'Import' },
        { value: 'export', label: 'Export' },
      ],
    },
    {
      id: 'q_com_2',
      key: 'product_categories',
      label: 'Catégories de produits',
      placeholder: 'Électronique, vêtements, alimentation...',
      type: 'textarea',
      required: true,
      step: 1,
    },
  ],
  AUTRE: DEFAULT_FORM_QUESTIONS,
};
