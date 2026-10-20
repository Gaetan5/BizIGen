import { BMCBlocks, LeanCanvasBlocks } from '@/types';

interface ProjectContext {
  name: string;
  sector: string;
  country: string;
  formData: Record<string, string>;
}

export function generateExpertBMC(ctx: ProjectContext): BMCBlocks {
  const { name, sector, country, formData } = ctx;
  const desc = formData.description || formData.solution || name;
  const target = formData.target_market || 'PME, coopératives et consommateurs locaux';
  const currency = country.toUpperCase() === 'GUINEA' ? 'GNF' : country.toUpperCase() === 'CONGO_DRC' ? 'USD' : 'XAF';

  // Partenaires Clés
  const key_partners = [
    `Coopératives et producteurs locaux de la filière ${sector}`,
    `Réseaux de distribution et commerçants de proximité (${country})`,
    `Opérateurs de paiement mobile (Orange Money, MTN MoMo, Wave)`,
    `Institutions financières locales et microfinance (financement de campagne)`,
    `Transporteurs et prestataires logistiques locaux`,
  ];

  // Activités Clés
  const key_activities = [
    formData.key_activities || `Production, conditionnement et contrôle qualité des produits`,
    `Approvisionnement régulier auprès des producteurs partenaires`,
    `Gestion de la logistique de distribution vers les points de vente`,
    `Déploiement commercial et marketing direct sur le terrain et via réseaux sociaux`,
    `Service après-vente et fidélisation de la clientèle locale`,
  ];

  // Ressources Clés
  const key_resources = [
    formData.key_resources || `Infrastructures de stockage et unités de traitement`,
    `Équipe opérationnelle et commerciale de terrain qualifiée`,
    `Réseau logistique et véhicules de livraison adaptés au climat et voirie`,
    `Plateforme digitale / outils de gestion des stocks et commandes`,
    `Trésorerie d'exploitation et fonds de roulement initial`,
  ];

  // Propositions de Valeur
  const value_propositions = [
    formData.solution || `Offre locale de haute qualité, fraîche et compétitive pour ${name}`,
    `Approvisionnement garanti et régulier sans rupture de stock`,
    `Paiement simplifié et sécurisé via Mobile Money`,
    `Traçabilité totale et respect des normes sanitaires et environnementales`,
    `Tarifs équitables et transparents adaptés au pouvoir d'achat local`,
  ];

  // Relations Clients
  const customer_relationships = [
    `Accompagnement commercial de proximité et visites terrain régulières`,
    `Support réactif direct via WhatsApp Business et téléphone`,
    `Programme d'avantages et réductions sur volume pour clients fidèles`,
    `Collecte active de retours clients pour amélioration continue`,
  ];

  // Canaux
  const channels = [
    formData.sales_channels || `Points de vente partenaires et boutiques de quartier`,
    `Canal direct B2B auprès des hôtels, restaurants et grossistes`,
    `Commandes directes via WhatsApp Business et catalogue en ligne`,
    `Marchés locaux et foires promotionnelles régionales`,
  ];

  // Segments Clients
  const customer_segments = [
    target,
    `Ménages urbains et semi-urbains soucieux de la qualité alimentaire`,
    `Professionnels de la restauration et traiteurs de la place`,
    `Revendeurs et grossistes régionaux`,
  ];

  // Structure des Coûts
  const cost_structure = {
    fixed_costs: [
      { item: 'Loyer des locaux et entrepôts', amount: '350 000', currency },
      { item: 'Salaires de base équipe opérationnelle', amount: '900 000', currency },
      { item: 'Abonnements outils & télécoms / énergie', amount: '150 000', currency },
      { item: 'Assurances et conformité légale', amount: '100 000', currency },
    ],
    variable_costs: [
      { item: 'Achat de matières premières et intrants', percentage: '45%' },
      { item: 'Carburant et logistique de livraison', percentage: '12%' },
      { item: 'Emballages et étiquetage de marque', percentage: '8%' },
      { item: 'Frais de transactions Mobile Money', percentage: '2%' },
    ],
    total_monthly_estimate: `1 500 000 ${currency}`,
  };

  // Sources de Revenus
  const revenue_streams = [
    {
      source: 'Ventes directes de produits finis',
      model: formData.revenue_model || 'Vente directe au comptant et précommandes',
      pricing: formData.pricing || 'Prix unitaire dégressif selon volume d\'achat',
    },
    {
      source: 'Contrats récurrents de livraison B2B',
      model: 'Abonnement ou facturation bimensuelle avec acompte Mobile Money',
      pricing: 'Tarif grossiste négocié avec livraison prioritaire',
    },
    {
      source: 'Services additionnels de livraison express',
      model: 'Frais de livraison forfaitaires par zone urbaine',
      pricing: `1 000 à 2 500 ${currency} par course`,
    },
  ];

  return {
    key_partners,
    key_activities,
    key_resources,
    value_propositions,
    customer_relationships,
    channels,
    customer_segments,
    cost_structure,
    revenue_streams,
  };
}

export function generateExpertLeanCanvas(ctx: ProjectContext): LeanCanvasBlocks {
  const { name, sector, country, formData } = ctx;
  const currency = country.toUpperCase() === 'GUINEA' ? 'GNF' : country.toUpperCase() === 'CONGO_DRC' ? 'USD' : 'XAF';

  return {
    problem: [
      formData.problem_solved || 'Pénuries régulières et instabilité des prix des produits de base',
      'Difficulté d\'accès à des produits locaux de qualité traçable et contrôlée',
      'Logistique inefficace et délais de livraison excessifs sur le dernier kilomètre',
    ],
    existing_alternatives: [
      'Importations coûteuses dépendantes des fluctuations douanières et devises',
      'Marchés informels sans garantie d\'hygiène ni constance d\'approvisionnement',
      'Solutions artisanales locales à capacité de production très limitée',
    ],
    solution: [
      formData.solution || `Chaîne d'approvisionnement intégrée et valorisation locale pour ${name}`,
      'Système de commande rapide multicanal (WhatsApp & Digital)',
      'Livraison fiable et groupée avec paiement sécurisé à la livraison',
    ],
    key_metrics: [
      'Volume mensuel de commandes traitées',
      'Coût d\'acquisition client (CAC) et panier moyen',
      'Taux de réachat et rétention à 60 jours (> 65%)',
      'Délai moyen de livraison sur commande (< 24h)',
    ],
    unique_value_proposition:
      formData.unique_value || `${name} : La garantie d'un approvisionnement direct, qualitatif et économique adapté aux réalités locales.`,
    high_level_concept: `La référence de distribution moderne pour le secteur ${sector} au ${country}.`,
    unfair_advantage: [
      'Accords d\'exclusivité d\'approvisionnement direct avec les producteurs locaux',
      'Connaissance fine du maillage territorial et logistique urbaine',
      'Marque reconnue pour sa rigueur et sa relation client de confiance',
    ],
    channels: [
      'WhatsApp Business et catalogue direct',
      'Force de vente terrain dédiée aux commerces et restaurants',
      'Bouche-à-oreille et partenariats de proximité',
      'Campagnes ciblées sur réseaux sociaux (Facebook, TikTok)',
    ],
    customer_segments: {
      target: formData.target_market || `Commerçants, restaurateurs et familles urbaines au ${country}`,
      early_adopters: 'Les 50 premiers clients professionnels et ménages du quartier pilote',
    },
    cost_structure: {
      fixed: `1 500 000 ${currency} / mois (locaux, équipe clé, télécoms)`,
      variable: 'Matières premières (45%), logistique et carburant (12%), conditionnement (8%)',
    },
    revenue_streams: {
      model: formData.revenue_model || 'Marge directe sur ventes et abonnements d\'approvisionnement',
      pricing: formData.pricing || 'Tarifs unitaires compétitifs avec marge brute de 35%',
      break_even: 'Atteinte de l\'équilibre d\'exploitation au mois 8 avec 120 clients récurrents',
    },
  };
}

export function generateExpertBusinessPlan(ctx: ProjectContext): Record<string, unknown> {
  const { name, sector, country, formData } = ctx;
  const currency = country.toUpperCase() === 'GUINEA' ? 'GNF' : country.toUpperCase() === 'CONGO_DRC' ? 'USD' : 'XAF';

  return {
    executiveSummary: `${name} est une entreprise émergente à fort impact dans le secteur ${sector} au ${country}. Portée par une vision d'excellence et d'ancrage local, la structure résout les défis majeurs d'approvisionnement et de distribution grâce à une approche moderne, agile et digitalisée. En capitalisant sur les canaux Mobile Money et la vente de proximité, ${name} prévoit d'atteindre la rentabilité opérationnelle dès la première année d'exercice tout en créant des emplois durables sur le territoire.`,
    companyOverview: {
      mission: `Valoriser les ressources locales et offrir aux populations et professionnels du ${country} des produits irréprochables au meilleur coût.`,
      vision: `Devenir le leader reconnu de la filière ${sector} au ${country} d'ici 3 ans, puis étendre l'impact aux pays limitrophes.`,
      values: ['Excellence opérationnelle', 'Intégrité et transparence', 'Impact social positif', 'Agilité et innovation'],
      legalStructure: 'SARL (Société à Responsabilité Limitée)',
      location: formData.location || `${country}`,
    },
    marketAnalysis: {
      industryOverview: `Le marché du secteur ${sector} au ${country} connaît une croissance annuelle soutenue portée par l'urbanisation, l'essor démographique et la digitalisation des paiements.`,
      targetMarket: formData.target_market || 'Ménages urbains, PME et acteurs de la restauration',
      marketSize: `Marché adressable estimé à plus de 500 millions ${currency}`,
      trends: [
        'Préférence croissante pour le Made in Africa et les circuits courts',
        'Généralisation des paiements mobiles (MTN MoMo, Orange Money)',
        'Exigence accrue de traçabilité et de régularité de livraison',
      ],
    },
    competitiveAnalysis: {
      directCompetitors: ['Distributeurs traditionnels informels', 'Importateurs de produits de grande consommation'],
      indirectCompetitors: ['Marchés de plein air', 'Petites épiceries non organisées'],
      competitiveAdvantage: 'Maîtrise de la chaîne d\'approvisionnement, standard de qualité certifié et service client digital réactif.',
    },
    swot: {
      strengths: [
        'Ancrage local fort et relation directe avec les sources d\'approvisionnement',
        'Modèle de coûts optimisé avec des frais fixes maîtrisés',
        'Équipe dynamique et hautement motivée',
      ],
      weaknesses: [
        'Capacité de trésorerie initiale limitée nécessitant une gestion rigoureuse',
        'Notoriété encore naissante à développer auprès du grand public',
      ],
      opportunities: [
        'Demande forte et non satisfaite pour des solutions fiables et régulières',
        'Accès facilité aux microcrédits et subventions de soutien à l\'entrepreneuriat',
        'Levier puissant des réseaux sociaux pour l\'acquisition client à faible coût',
      ],
      threats: [
        'Fluctuations saisonnières des prix des matières premières',
        'Aléas logistiques et état des infrastructures de transport',
      ],
    },
    marketingStrategy: {
      positioning: 'Rapport qualité/prix optimal, proximité humaine et fiabilité garantie.',
      channels: ['WhatsApp Business', 'Démarchage commercial direct', 'Réseaux sociaux', 'Bouche-à-oreille'],
      pricingStrategy: 'Pénétration de marché avec marge brute saine de 30-35% et remises sur volume.',
      salesApproach: 'Échantillonnage auprès des prescripteurs clés et conversion en commandes récurrentes.',
    },
    operationsPlan: {
      keyActivities: ['Achat & contrôle qualité', 'Conditionnement & stockage', 'Distribution & livraisons', 'Recouvrement'],
      keyResources: ['Entrepôt sécurisé', 'Véhicules de livraison', 'Équipe terrain', 'Outils de gestion'],
      keyPartners: ['Fournisseurs locaux', 'Opérateurs télécoms & banques', 'Coopératives'],
      milestones: [
        'Mois 1-2 : Lancement officiel et signature des 25 premiers clients récurrents',
        'Mois 3-6 : Optimisation de la rotation des stocks et extension de la zone de livraison',
        'Mois 7-12 : Atteinte du seuil de rentabilité et lancement d\'une seconde ligne de produits',
      ],
    },
    financialProjections: {
      year1Revenue: `24 000 000 ${currency}`,
      year2Revenue: `48 000 000 ${currency}`,
      year3Revenue: `95 000 000 ${currency}`,
      breakEvenMonth: 8,
      fundingRequired: formData.required_funding || `10 000 000 ${currency}`,
      useOfFunds: [
        'Équipements et aménagements (40%)',
        'Fonds de roulement et stocks initiaux (35%)',
        'Marketing et acquisition commerciale (15%)',
        'Réserve de trésorerie de sécurité (10%)',
      ],
    },
    team: {
      founders: ['Fondateur principal (Direction générale et développement stratégique)'],
      keyHires: ['Responsable logistique & opérations', 'Commercial(e) de terrain'],
      advisors: ['Expert comptable partenaire', 'Mentor sectoriel'],
    },
    riskAnalysis: {
      risks: [
        'Risque de rupture d\'approvisionnement matière',
        'Retards de paiement clients B2B',
        'Panne de moyen logistique de transport',
      ],
      mitigations: [
        'Diversification des sources d\'approvisionnement avec au moins 3 fournisseurs qualifiés',
        'Politique stricte d\'acompte 50% à la commande pour les nouveaux clients B2B',
        'Contrat de maintenance préventive et partenariat de secours avec un transporteur tiers',
      ],
    },
  };
}
