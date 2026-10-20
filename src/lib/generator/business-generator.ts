import { BMCBlocks, LeanCanvasBlocks } from '@/types';

export interface ProjectContext {
  name: string;
  sector: string;
  country: string;
  formData: Record<string, string>;
}

// ==============================================================================
// 1. Profils Pays & Devises Africaines
// ==============================================================================
interface CountryInfo {
  currency: string;
  mobileMoney: string[];
  regulatorExample: string;
  majorHub: string;
  nameFr: string;
}

const COUNTRY_MAP: Record<string, CountryInfo> = {
  CM: { currency: 'XAF', mobileMoney: ['MTN MoMo', 'Orange Money'], regulatorExample: 'MINPMEESA / MINADER', majorHub: 'Douala / Yaoundé', nameFr: 'Cameroun' },
  SN: { currency: 'XOF', mobileMoney: ['Wave', 'Orange Money', 'Free Money'], regulatorExample: 'DER / Ministère du Commerce', majorHub: 'Dakar', nameFr: 'Sénégal' },
  CI: { currency: 'XOF', mobileMoney: ['Orange Money', 'Wave', 'MTN MoMo', 'Moov Money'], regulatorExample: 'CEPICI / Ministère de l\'Agriculture', majorHub: 'Abidjan', nameFr: 'Côte d\'Ivoire' },
  NG: { currency: 'NGN', mobileMoney: ['OPay', 'PalmPay', 'Paga'], regulatorExample: 'CAC / CBN', majorHub: 'Lagos', nameFr: 'Nigeria' },
  KE: { currency: 'KES', mobileMoney: ['M-Pesa', 'Airtel Money'], regulatorExample: 'Boresha / CBK', majorHub: 'Nairobi', nameFr: 'Kenya' },
  GH: { currency: 'GHS', mobileMoney: ['MTN Mobile Money', 'Vodafone Cash'], regulatorExample: 'GEPA / GRA', majorHub: 'Accra', nameFr: 'Ghana' },
  CD: { currency: 'USD', mobileMoney: ['Airtel Money', 'Orange Money', 'M-Pesa'], regulatorExample: 'ANAPI / BCC', majorHub: 'Kinshasa', nameFr: 'RD Congo' },
  GN: { currency: 'GNF', mobileMoney: ['Orange Money Guinée', 'MTN Mobile Money'], regulatorExample: 'APIP / BCRG', majorHub: 'Conakry', nameFr: 'Guinée' },
  GA: { currency: 'XAF', mobileMoney: ['Airtel Money', 'Moov Africa'], regulatorExample: 'ANPI-Gabon', majorHub: 'Libreville', nameFr: 'Gabon' },
  BJ: { currency: 'XOF', mobileMoney: ['MTN MoMo', 'Moov Money'], regulatorExample: 'APIEx Bénin', majorHub: 'Cotonou', nameFr: 'Bénin' },
  TG: { currency: 'XOF', mobileMoney: ['T-Money', 'Moov Money'], regulatorExample: 'CFE Togo', majorHub: 'Lomé', nameFr: 'Togo' },
  ML: { currency: 'XOF', mobileMoney: ['Orange Money', 'Moov Africa'], regulatorExample: 'API-Mali', majorHub: 'Bamako', nameFr: 'Mali' },
  BF: { currency: 'XOF', mobileMoney: ['Orange Money', 'Moov Money'], regulatorExample: 'MEBF', majorHub: 'Ouagadougou', nameFr: 'Burkina Faso' },
};

function getCountryInfo(code: string): CountryInfo {
  const upper = (code || 'CM').toUpperCase();
  return COUNTRY_MAP[upper] || COUNTRY_MAP['CM'];
}

// ==============================================================================
// 2. Profils Sectoriels Spécialisés
// ==============================================================================
interface SectorProfile {
  label: string;
  defaultPartners: string[];
  defaultActivities: string[];
  defaultResources: string[];
  defaultChannels: string[];
  defaultCustomerSegments: string[];
  defaultKeyMetrics: string[];
  defaultValues: string[];
  fixedCostLabels: string[];
  variableCostLabels: { item: string; percentage: string }[];
  risksAndMitigations: { risk: string; mitigation: string }[];
  swotStrengths: string[];
  swotWeaknesses: string[];
  swotOpportunities: string[];
  swotThreats: string[];
}

const SECTOR_PROFILES: Record<string, SectorProfile> = {
  TECH: {
    label: 'Tech & Digital',
    defaultPartners: [
      'Fournisseurs d\'infrastructure cloud et serveurs sécurisés (AWS, Azure, GCP)',
      'Opérateurs télécoms pour intégration API USSD et SMS transactionnels',
      'Incubateurs, accélérateurs tech et hubs d\'innovation locaux',
      'Communautés de développeurs et plateformes de recrutement tech',
    ],
    defaultActivities: [
      'Développement continu de fonctionnalités et conception UX/UI mobile-first',
      'Déploiement, monitoring de sécurité et maintenance des infrastructures API',
      'Acquisition digitale d\'utilisateurs (growth marketing) et support technique réactif',
      'Intégration et optimisation des flux de paiement Mobile Money',
    ],
    defaultResources: [
      'Équipe technique qualifiée (ingénieurs logiciels, DevOps, Product Manager)',
      'Code source propriétaire, propriété intellectuelle et architecture cloud résiliente',
      'Base de données utilisateurs sécurisée conforme aux réglementations de protection des données',
      'Outils de suivi produit, analytique et communication d\'équipe',
    ],
    defaultChannels: [
      'Application web et mobile téléchargeable (PWA / Google Play)',
      'Campagnes marketing ciblées sur réseaux sociaux (LinkedIn, Facebook, TikTok)',
      'Prescripteurs d\'affaires, cabinets conseils et partenaires intégrateurs',
      'Webinaires de démonstration et salons professionnels du numérique',
    ],
    defaultCustomerSegments: [
      'PME et entreprises en phase de transition numérique recherchant l\'efficacité',
      'Professionnels indépendants et jeunes actifs urbains connectés',
      'Organisations et institutions nécessitant une automatisation de leurs processus',
    ],
    defaultKeyMetrics: [
      'Coût d\'Acquisition Client (CAC) et Lifetime Value (LTV)',
      'Revenu Récurrent Mensuel (MRR) et taux de croissance',
      'Taux d\'attrition mensuel (Churn rate) inférieur à 5%',
      'Nombre d\'utilisateurs actifs mensuels (MAU) et taux d\'engagement',
    ],
    defaultValues: ['Innovation continue', 'Sécurité et confidentialité', 'Simplicité d\'usage', 'Agilité opérationnelle'],
    fixedCostLabels: ['Salaires équipe tech & support', 'Hébergement cloud & licences SaaS', 'Loyer bureau / coworking & connectivité', 'Frais juridiques & conformité'],
    variableCostLabels: [
      { item: 'Commissions passerelles de paiement', percentage: '2.5%' },
      { item: 'Budget publicitaire & acquisition digitale', percentage: '15.0%' },
      { item: 'Consommation API tierces & bande passante', percentage: '4.0%' },
    ],
    risksAndMitigations: [
      { risk: 'Instabilité de la connectivité réseau internet des utilisateurs finaux', mitigation: 'Conception d\'une architecture Offline-first avec synchronisation automatique en tâche de fond.' },
      { risk: 'Cyberattaques ou fuite de données utilisateurs sensibles', mitigation: 'Chiffrement de bout en bout, audits de sécurité réguliers et sauvegardes géoredondantes.' },
      { risk: 'Concurrence soudaine d\'acteurs internationaux à gros capitaux', mitigation: 'Ancrage local fort, tarification en monnaie locale et intégration native des moyens de paiement locaux.' },
    ],
    swotStrengths: [
      'Produit hautement scalable à faible coût marginal de distribution',
      'Parfaite adéquation avec les usages mobiles et les paiements locaux',
      'Capacité d\'itération rapide et flexibilité face aux retours utilisateurs',
    ],
    swotWeaknesses: [
      'Besoin continu d\'investissements en acquisition utilisateur au lancement',
      'Sensibilité aux coupures d\'énergie et fluctuations de débit télécoms',
    ],
    swotOpportunities: [
      'Croissance exponentielle du taux de pénétration des smartphones en Afrique',
      'Digitalisation accélérée des processus administratifs et commerciaux',
    ],
    swotThreats: [
      'Évolution des réglementations sur les données et fiscalité numérique',
      'Pression sur les salaires des développeurs qualifiés convoités à l\'international',
    ],
  },

  AGRO: {
    label: 'Agriculture & Élevage',
    defaultPartners: [
      'Coopératives agricoles régionales et groupements de producteurs locaux',
      'Fournisseurs d\'intrants certifiés (semences améliorées, fertilisants bio)',
      'Instituts de recherche agronomique et ministères de tutelle',
      'Transporteurs ruraux et prestataires de logistique de collecte',
    ],
    defaultActivities: [
      'Planification et conduite rigoureuse des cycles culturaux / d\'élevage',
      'Contrôle qualité sanitaire, calibrage et conditionnement protecteur',
      'Gestion des approvisionnements et contractualisation avec les producteurs',
      'Logistique d\'évacuation rapide des récoltes vers les bassins de consommation',
    ],
    defaultResources: [
      'Terres arables exploitables avec accès sécurisé à l\'eau et systèmes d\'irrigation',
      'Équipe agronomique et ouvriers qualifiés formés aux bonnes pratiques agricoles',
      'Infrastructures de stockage ventilées et équipements de manutention',
      'Fonds de roulement suffisant pour couvrir le cycle de production jusqu\'à la vente',
    ],
    defaultChannels: [
      'Marchés de gros et plateformes d\'approvisionnement urbaines',
      'Contrats directs avec les agro-industries, supermarchés et restaurants',
      'Groupements d\'achats et précommandes via canaux digitaux (WhatsApp Business)',
      'Boutiques de vente directe et points relais de quartier',
    ],
    defaultCustomerSegments: [
      'Grossistes et demi-grossistes des grands marchés de distribution urbaine',
      'Professionnels de l\'alimentation (hôtels, restaurants, traiteurs, cantines)',
      'Ménages urbains recherchant des denrées fraîches, saines et abordables',
    ],
    defaultKeyMetrics: [
      'Rendement à l\'hectare ou gain moyen par cycle de production',
      'Taux de perte post-récolte maintenu sous le seuil critique (< 8%)',
      'Coût de revient unitaire complet au kilogramme récolté',
      'Délai moyen d\'écoulement des denrées récoltées (< 48h)',
    ],
    defaultValues: ['Durabilité environnementale', 'Respect des producteurs', 'Excellence sanitaire', 'Souveraineté alimentaire'],
    fixedCostLabels: ['Salaires ouvriers permanents et régisseurs', 'Location / entretien des terres et systèmes d\'irrigation', 'Carburant et logistique de suivi', 'Assurance récolte et sécurité du site'],
    variableCostLabels: [
      { item: 'Achat de semences, engrais et intrants de campagne', percentage: '32.0%' },
      { item: 'Main d\'œuvre saisonnière de récolte et tri', percentage: '15.0%' },
      { item: 'Emballages, sacs et caisses de transport', percentage: '6.0%' },
      { item: 'Transport et fret vers les marchés', percentage: '12.0%' },
    ],
    risksAndMitigations: [
      { risk: 'Aléas climatiques (sécheresses prolongées ou inondations soudaines)', mitigation: 'Installation de systèmes d\'irrigation au goutte-à-goutte et diversification variétale résistante.' },
      { risk: 'Attaques parasitaires ou épiphyties sur les cultures', mitigation: 'Protocoles de biosécurité stricts et surveillance phytosanitaire hebdomadaire préventive.' },
      { risk: 'Effondrement saisonnier des cours lors des pics de récolte', mitigation: 'Capacités de stockage tampon, pré-ventes contractuelles et transformation primaire de conservation.' },
    ],
    swotStrengths: [
      'Forte demande structurelle locale et dépendance réduite aux importations',
      'Conditions agrologiques favorables et potentiel de hauts rendements',
      'Relations directes de confiance avec les réseaux de distribution',
    ],
    swotWeaknesses: [
      'Dépendance aux cycles de trésorerie longs inhérents à l\'agriculture',
      'État parfois dégradé des voies d\'accès rurales en saison pluvieuse',
    ],
    swotOpportunities: [
      'Politiques publiques prioritaires de soutien à la sécurité alimentaire',
      'Accorissements de prix sur les produits locaux de qualité certifiée',
    ],
    swotThreats: [
      'Variabilité climatique accrue et instabilité des prix des intrants importés',
      'Concurrence ponctuelle de produits d\'importation subventionnés',
    ],
  },

  AGRO_ALIMENTAIRE: {
    label: 'Agro-alimentaire & Transformation',
    defaultPartners: [
      'Coopératives de petits producteurs pour approvisionnement direct en matières premières',
      'Fournisseurs d\'emballages alimentaires hermétiques et écologiques',
      'Laboratoires d\'analyses sanitaires et organismes de certification (normes nationales / HACCP)',
      'Grandes surfaces, supérettes et réseaux de boutiquiers de quartier',
    ],
    defaultActivities: [
      'Transformation industrielle / semi-industrielle et contrôle qualité strict',
      'Conditionnement aux normes de conservation et étiquetage attractif',
      'Gestion de la traçabilité matière de la ferme jusqu\'au point de vente',
      'Animation commerciale sur les points de vente et dégustations promotionnelles',
    ],
    defaultResources: [
      'Ligne de transformation mécanisée et respectueuse des normes d\'hygiène',
      'Emballages certifiés adaptés à la chaleur et à l\'humidité ambiantes',
      'Équipe de production qualifiée en agroalimentaire et contrôle qualité',
      'Chambre de stockage tempérée et réseau de livraison dédié',
    ],
    defaultChannels: [
      'Réseaux de supermarchés, supérettes et épiceries fines urbaines',
      'Boutiques de quartier et stations-services à fort trafic',
      'Boutique en ligne avec livraison à domicile pour les consommateurs urbains',
      'Vente institutionnelle auprès des cantines scolaires et d\'entreprises',
    ],
    defaultCustomerSegments: [
      'Ménages urbains et classes moyennes recherchant praticité, goût et hygiène',
      'Diaspora en quête de saveurs authentiques du terroir aux normes internationales',
      'Établissements de restauration et hôtellerie en quête d\'ingrédients prêts à l\'emploi',
    ],
    defaultKeyMetrics: [
      'Rendement de transformation matière et taux de rebuts (< 2%)',
      'Taux de rotation sur les rayons partenaires (sell-through)',
      'Marge brute par unité conditionnée vendue (> 35%)',
      'Durée de conservation garantie (DLC/DLUO sans conservateurs nocifs)',
    ],
    defaultValues: ['Hygiène irréprochable', 'Valorisation du terroir', 'Accessibilité prix', 'Transparence nutritive'],
    fixedCostLabels: ['Salaires équipe de transformation & qualité', 'Location de l\'atelier aux normes et énergie', 'Amortissement des machines de production', 'Assurances et certifications sanitaires'],
    variableCostLabels: [
      { item: 'Achat de matières premières agricoles fraîches', percentage: '38.0%' },
      { item: 'Emballages primaires, étiquettes et cartons', percentage: '14.0%' },
      { item: 'Transport de distribution et frais de livraison', percentage: '8.0%' },
    ],
    risksAndMitigations: [
      { risk: 'Rupture d\'approvisionnement en matières premières en contre-saison', mitigation: 'Contrats d\'approvisionnement pluriannuels et constitution de stocks tampons déshydratés ou surgelés.' },
      { risk: 'Contamination sanitaire ou altération organoleptique d\'un lot', mitigation: 'Système HACCP documenté, numéros de lots stricts et tests bactériologiques pré-expédition.' },
      { risk: 'Refus de paiement ou délais excessifs des centrales d\'achat', mitigation: 'Diversification des circuits avec 40% de vente au comptant ou en circuits courts.' },
    ],
    swotStrengths: [
      'Forte valeur ajoutée créée localement sur les matières premières du pays',
      'Marque différenciante répondant aux aspirations d\'une consommation saine',
      'Marges plus élevées que le commerce de denrées brutes',
    ],
    swotWeaknesses: [
      'Coûts énergétiques élevés nécessitant des générateurs ou installations solaires',
      'Exigences d\'investissements initiaux en machines de transformation',
    ],
    swotOpportunities: [
      'Engouement massif pour les produits "Consommer Local" et "Made in Africa"',
      'Opportunités d\'exportation régionale au sein des zones de libre-échange (ZLECAf)',
    ],
    swotThreats: [
      'Pression des marques multinationales d\'importation disposant de gros budgets marketing',
      'Inflation sur les coûts du fret et des emballages importés',
    ],
  },

  SERVICES: {
    label: 'Services & Conseil',
    defaultPartners: [
      'Cabinets d\'expertise comptable, juristes et consultants spécialisés associés',
      'Chambres de commerce, associations patronales et réseaux d\'entrepreneurs',
      'Écoles supérieures, universités et organismes de formation professionnelle',
      'Fournisseurs de logiciels de gestion et plateformes d\'automatisation',
    ],
    defaultActivities: [
      'Réalisation des missions de conseil, d\'audit et d\'accompagnement client',
      'Veille méthodologique, conception d\'outils et livrables à forte valeur ajoutée',
      'Prospection commerciale B2B, réponse aux appels d\'offres et networking',
      'Suivi de la satisfaction client et fidélisation par des revues régulières',
    ],
    defaultResources: [
      'Équipe d\'experts consultants séniors disposant d\'une solide expérience métier',
      'Méthodologies éprouvées, bases de données sectorielles et templates exclusifs',
      'Espace professionnel d\'accueil et outils collaboratifs en ligne',
      'Réseau de contacts et réputation établie auprès des décideurs économiques',
    ],
    defaultChannels: [
      'Prospection directe B2B ciblée et recommandations par les pairs (bouche-à-oreille)',
      'Leadership d\'opinion sur LinkedIn (articles de fond, études de cas, décryptages)',
      'Animation d\'ateliers, masterclasses et tables rondes sectorielles',
      'Partenariats avec des banques d\'affaires et incubateurs d\'entreprises',
    ],
    defaultCustomerSegments: [
      'Dirigeants de PME cherchant à structurer leur croissance et optimiser leurs finances',
      'Grandes entreprises et filiales locales nécessitant une expertise agile',
      'Bailleurs de fonds, ONG et institutions publiques finançant des programmes de développement',
    ],
    defaultKeyMetrics: [
      'Taux d\'occupation et de facturation des consultants (TJM)',
      'Taux de conversion des propositions commerciales en contrats fermes (> 35%)',
      'Indice de satisfaction client (NPS > 60) et taux de renouvellement de mandat',
      'Chiffre d\'affaires moyen par client sur 12 mois (LTV B2B)',
    ],
    defaultValues: ['Rigueur intellectuelle', 'Orientation résultats', 'Confidentialité stricte', 'Accompagnement humain'],
    fixedCostLabels: ['Rémunérations consultants permanents & management', 'Loyer bureaux professionnels & infrastructure IT', 'Marketing corporate, site internet & relations publiques', 'Assurance responsabilité civile professionnelle'],
    variableCostLabels: [
      { item: 'Honoraires des experts externes associés ponctuellement', percentage: '25.0%' },
      { item: 'Frais de déplacements, hébergements et missions clients', percentage: '8.0%' },
      { item: 'Production de supports et documentations physiques de restitution', percentage: '3.0%' },
    ],
    risksAndMitigations: [
      { risk: 'Allongement imprévu des délais de paiement des clients institutionnels', mitigation: 'Facturation échelonnée obligatoire (30% à la commande, 40% à mi-parcours, solde à la remise).' },
      { risk: 'Dépendance à un petit nombre de clients représentant la majorité des revenus', mitigation: 'Politique commerciale imposant qu\'aucun client ne représente plus de 25% du portefeuille.' },
      { risk: 'Départ d\'un consultant clé emportant des compétences critiques', mitigation: 'Standardisation et capitalisation des méthodologies dans un référentiel partagé.' },
    ],
    swotStrengths: [
      'Structure de coûts souple avec un besoin minime en capital d\'amorçage lourd',
      'Capacité d\'adaptation immédiate aux besoins précis exprimés par le client',
      'Fort niveau de rentabilité opérationnelle dès la première année d\'exercice',
    ],
    swotWeaknesses: [
      'Scalabilité plus lente que les produits standardisés, liée au temps humain',
      'Nécessité de bâtir une légitimité forte pour convaincre les grands comptes',
    ],
    swotOpportunities: [
      'Professionnalisation accrue des PME africaines en quête de conformité et financements',
      'Croissance des investissements directs étrangers requérant des relais locaux fiables',
    ],
    swotThreats: [
      'Arrivée de cabinets internationaux sur les appels d\'offres prestigieux',
      'Tendance des entreprises à internaliser certaines fonctions en période de crise',
    ],
  },

  COMMERCE: {
    label: 'Commerce & Distribution',
    defaultPartners: [
      'Fabricants d\'origine et grossistes importateurs fiables',
      'Agences de dédouanement et transitaires maritimes / aériens',
      'Sociétés de livraison urbaine et livreurs deux-roues indépendants',
      'Gestionnaires d\'espaces commerciaux et plateformes e-commerce',
    ],
    defaultActivities: [
      'Sourcing rigoureux des produits au meilleur ratio qualité-prix',
      'Négociation des conditions d\'achat, d\'expédition et dédouanement',
      'Gestion dynamique des stocks et inventaires physiques réguliers',
      'Merchandising physique et digital, service après-vente et fidélisation',
    ],
    defaultResources: [
      'Emplacement commercial stratégique à fort passage piéton / carrefour urbain',
      'Catalogue digital attractif et plateforme de commande multicanal',
      'Entrepôt de stockage sécurisé avec contrôle d\'accès et vidéo-surveillance',
      'Trésorerie active dédiée aux commandes en volume pour obtenir de fortes remises',
    ],
    defaultChannels: [
      'Point de vente physique (boutique, showroom ou comptoir de vente)',
      'Vente digitale via WhatsApp Business, Instagram et TikTok avec paiement MoMo',
      'Site e-commerce avec livraison express le jour même dans l\'agglomération',
      'Réseau d\'affiliés, revendeurs indépendants et comités d\'entreprises',
    ],
    defaultCustomerSegments: [
      'Consommateurs urbains recherchant les dernières nouveautés fiables au juste prix',
      'Petits commerçants et revendeurs de quartier s\'approvisionnant en semi-gros',
      'Entreprises et administrations pour leurs besoins réguliers en fournitures et équipements',
    ],
    defaultKeyMetrics: [
      'Taux de rotation des stocks (Turnover ratio > 6 fois/an)',
      'Panier moyen par transaction et nombre quotidien de tickets',
      'Marge commerciale brute consolidée (> 30%)',
      'Taux de réachat des clients dans les 90 jours (> 45%)',
    ],
    defaultValues: ['Transparence des prix', 'Fiabilité des produits', 'Rapidité de livraison', 'Écoute client'],
    fixedCostLabels: ['Loyer de l\'espace commercial & entrepôt', 'Salaires de l\'équipe de vente & caissiers', 'Énergie, climatisation & sécurité physique', 'Assurances marchandises & frais bancaires'],
    variableCostLabels: [
      { item: 'Coût d\'achat des marchandises et fret', percentage: '55.0%' },
      { item: 'Droits de douane, taxes et transit', percentage: '12.0%' },
      { item: 'Emballages personnalisés et sacs de vente', percentage: '2.5%' },
      { item: 'Commissions des coursiers de livraison', percentage: '4.5%' },
    ],
    risksAndMitigations: [
      { risk: 'Surstock de produits à faible rotation bloquant la trésorerie', mitigation: 'Commandes en petits lots tests avant tout réassort massif et opérations de déstockage rapides.' },
      { risk: 'Retards douaniers ou blocages sur les lignes d\'importation', mitigation: 'Anticipation des commandes avec 6 semaines de marge et diversification des transitaires.' },
      { risk: 'Pertes par démarque inconnue ou avaries lors de la manutention', mitigation: 'Inventaires tournants hebdomadaires, logiciels de caisse synchronisés et caméras.' },
    ],
    swotStrengths: [
      'Modèle éprouvé générant des flux de trésorerie quotidiens au comptant',
      'Large marché de masse avec forte vitesse d\'adoption des consommateurs',
      'Capacité à réagir en temps réel aux tendances et modes de consommation',
    ],
    swotWeaknesses: [
      'Forte intensité capitalistique pour financer les volumes de stocks initiaux',
      'Sensibilité aux variations du pouvoir d\'achat des ménages',
    ],
    swotOpportunities: [
      'Adoption fulgurante du commerce conversationnel via WhatsApp et Mobile Money',
      'Modernisation des habitudes d\'achat vers des points de vente formels et rassurants',
    ],
    swotThreats: [
      'Concurrence agressive du secteur informel non assujetti aux mêmes charges fiscales',
      'Fluctuations des cours des devises (Euro/Dollar) impactant le prix d\'importation',
    ],
  },
};

function getSectorProfile(sectorKey: string): SectorProfile {
  const upper = (sectorKey || 'AUTRE').toUpperCase();
  if (SECTOR_PROFILES[upper]) return SECTOR_PROFILES[upper];

  // Détection par mot clé
  if (upper.includes('AGRO') && upper.includes('ALIM')) return SECTOR_PROFILES['AGRO_ALIMENTAIRE'];
  if (upper.includes('AGRI') || upper.includes('AGRO') || upper.includes('ELEVAGE') || upper.includes('PECHE')) return SECTOR_PROFILES['AGRO'];
  if (upper.includes('TECH') || upper.includes('DIGIT') || upper.includes('LOGIC') || upper.includes('APP') || upper.includes('SAAS')) return SECTOR_PROFILES['TECH'];
  if (upper.includes('SERV') || upper.includes('CONSEIL') || upper.includes('FORMAT') || upper.includes('AGENCE')) return SECTOR_PROFILES['SERVICES'];
  if (upper.includes('COMM') || upper.includes('VENTE') || upper.includes('RETAIL') || upper.includes('DISTRIB') || upper.includes('MARKET')) return SECTOR_PROFILES['COMMERCE'];

  // Profil par défaut polyvalent PME moderne
  return {
    label: 'Entreprise & Activités Spécialisées',
    defaultPartners: [
      'Fournisseurs stratégiques et prestataires d\'intrants locaux',
      'Opérateurs de télécommunications et passerelles de paiement électronique',
      'Institutions financières d\'accompagnement et microfinance',
      'Associations professionnelles et réseaux de prescripteurs',
    ],
    defaultActivities: [
      'Production, exécution des prestations et contrôle qualité méticuleux',
      'Relation commerciale, fidélisation et gestion personnalisée de la clientèle',
      'Gestion logistique, approvisionnements et distribution des commandes',
      'Pilotage financier rigoureux et conformité réglementaire locale',
    ],
    defaultResources: [
      'Infrastructures opérationnelles et équipements adaptés aux standards requis',
      'Équipe fondatrice et collaborateurs dotés d\'une solide expertise métier',
      'Outils de gestion numérique et visibilité multicanal active',
      'Fonds de roulement initial assurant l\'autonomie opérationnelle',
    ],
    defaultChannels: [
      'Canal direct en face-à-face et démarchage commercial de proximité',
      'Canaux digitaux interactifs (WhatsApp Business, réseaux sociaux, site vitrine)',
      'Recommandations client, bouche-à-oreille et réseau relationnel',
      'Événements professionnels, foires et rencontres sectorielles',
    ],
    defaultCustomerSegments: [
      'Clients cibles prioritaires en attente de qualité, de réactivité et de sérieux',
      'PME, professionnels et organisations recherchant un partenaire fiable',
      'Grand public et ménages urbains attentifs au meilleur rapport qualité-prix',
    ],
    defaultKeyMetrics: [
      'Chiffre d\'affaires mensuel réalisé et marge brute dégagée',
      'Nombre de nouveaux clients acquis et taux de fidélisation',
      'Délai de traitement des commandes et satisfaction client globale',
    ],
    defaultValues: ['Engagement client', 'Rigueur opérationnelle', 'Intégrité et respect', 'Qualité garantie'],
    fixedCostLabels: ['Salaires de base de l\'équipe', 'Loyer et charges des locaux d\'exploitation', 'Frais administratifs, télécoms & énergie', 'Assurances et conformité légale'],
    variableCostLabels: [
      { item: 'Matières premières, intrants et fournitures directes', percentage: '35.0%' },
      { item: 'Logistique, transport et déplacements', percentage: '10.0%' },
      { item: 'Actions promotionnelles et communication commerciale', percentage: '8.0%' },
    ],
    risksAndMitigations: [
      { risk: 'Retards de règlement impactant la trésorerie opérationnelle', mitigation: 'Mise en place systématique d\'acomptes à la commande et relances proactives.' },
      { risk: 'Augmentation imprévue des coûts des intrants ou approvisionnements', mitigation: 'Contrats avec plusieurs fournisseurs alternatifs et ajustement maîtrisé des marges.' },
      { risk: 'Concurrence locale agressive sur les tarifs', mitigation: 'Positionnement sur l\'excellence du service, la réactivité et la fidélisation relationnelle.' },
    ],
    swotStrengths: [
      'Offre conçue spécifiquement pour répondre aux attentes réelles du marché local',
      'Grande agilité décisionnelle et proximité immédiate avec les bénéficiaires',
      'Maîtrise rigoureuse des charges de structure',
    ],
    swotWeaknesses: [
      'Marque encore en phase d\'installation nécessitant un effort continu de notoriété',
      'Ressources financières limitées imposant une gestion quotidienne prudente',
    ],
    swotOpportunities: [
      'Marché local demandeur d\'acteurs structurés et fiables pour remplacer l\'informel',
      'Facilités offertes par les paiements mobiles pour accélérer les encaissements',
    ],
    swotThreats: [
      'Contexte macroéconomique et sensibilité du pouvoir d\'achat des clients',
      'Aléas d\'infrastructure (approvisionnement électrique, voies de transport)',
    ],
  };
}

// ==============================================================================
// 3. Utilitaires de Parsing et d'Enrichissement des Réponses Utilisateur
// ==============================================================================
function parseList(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(/[\n,;•\-\*]+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
}

function cleanText(val: string | undefined, fallback: string): string {
  if (!val || val.trim().length === 0) return fallback;
  return val.trim();
}

/**
 * Fusionne intelligemment les entrées personnalisées de l'utilisateur avec
 * les recommandations expertes du secteur pour garantir un rendu riche et complet.
 */
function mergeUserAndDefaults(userItems: string[], defaults: string[], max = 5): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const item of userItems) {
    const norm = item.toLowerCase();
    if (!seen.has(norm)) {
      seen.add(norm);
      result.push(item);
    }
  }

  for (const def of defaults) {
    if (result.length >= max) break;
    const norm = def.toLowerCase();
    if (!seen.has(norm)) {
      seen.add(norm);
      result.push(def);
    }
  }

  return result.slice(0, max);
}

// ==============================================================================
// 4. Générateur Expert du Business Model Canvas (BMC)
// ==============================================================================
export function generateExpertBMC(ctx: ProjectContext): BMCBlocks {
  const { name, sector, country, formData } = ctx;
  const countryInfo = getCountryInfo(country);
  const profile = getSectorProfile(sector);

  const projectName = cleanText(formData.company_name, name || 'Votre Entreprise');
  const currency = countryInfo.currency;

  // 1. Partenaires Clés
  const userPartners = parseList(formData.key_partners);
  const enrichedPartners = [
    ...profile.defaultPartners.map(p => `${p} (${countryInfo.nameFr})`),
    `Opérateurs de paiement mobile (${countryInfo.mobileMoney.join(', ')})`,
  ];
  const key_partners = mergeUserAndDefaults(userPartners, enrichedPartners, 5);

  // 2. Activités Clés
  const userActivities = parseList(formData.key_activities);
  const enrichedActivities = [
    formData.solution ? `Déploiement et perfectionnement de la solution : ${formData.solution.slice(0, 100)}...` : '',
    ...profile.defaultActivities,
  ].filter(Boolean);
  const key_activities = mergeUserAndDefaults(userActivities, enrichedActivities, 5);

  // 3. Ressources Clés
  const userResources = parseList(formData.key_resources);
  const enrichedResources = [
    formData.tech_stack ? `Stack technologique : ${formData.tech_stack}` : '',
    formData.team_size ? `Équipe opérationnelle (${formData.team_size}) et encadrement` : '',
    ...profile.defaultResources,
  ].filter(Boolean);
  const key_resources = mergeUserAndDefaults(userResources, enrichedResources, 5);

  // 4. Propositions de Valeur
  const userSolutions = parseList(formData.solution);
  const userUniques = parseList(formData.unique_value);
  const enrichedValues = [
    formData.solution || `Solution innovante et accessible développée par ${projectName}`,
    formData.unique_value || `Proposition de valeur différenciée pour le marché au ${countryInfo.nameFr}`,
    ...profile.defaultValues.map(v => `${v} adaptée aux spécificités locales de ${countryInfo.majorHub}`),
    `Facilité de paiement instantané via ${countryInfo.mobileMoney.join(' & ')}`,
    `Service client direct et accompagnement réactif de proximité`,
  ];
  const value_propositions = mergeUserAndDefaults([...userUniques, ...userSolutions], enrichedValues, 5);

  // 5. Relations Clients
  const segType = (formData.customer_segment || 'b2c').toLowerCase();
  const relDefaults =
    segType === 'b2b'
      ? [
          'Gestion de compte dédiée avec point de contact unique pour chaque client professionnel',
          'Accords de niveau de service (SLA) clairs et revues trimestrielles de performance',
          'Support prioritaire par téléphone et canal WhatsApp Business VIP',
          'Accompagnement personnalisé à la mise en œuvre et formation sur site',
        ]
      : segType === 'marketplace'
      ? [
          'Interface en libre-service transparente avec système de notation et avis vérifiés',
          'Médiation proactive et résolution des litiges sous 24h ouvrées',
          'Programme d\'avantages et de fidélisation pour vendeurs et acheteurs fréquents',
          'Assistance continue multicanal (chat in-app, SMS et WhatsApp)',
        ]
      : [
          'Accueil chaleureux et assistance réactive via WhatsApp Business et téléphone',
          'Expérience utilisateur intuitive avec parcours sans friction en français et langues locales',
          'Programme de récompenses et réductions sur les achats récurrents',
          'Écoute active des retours pour amélioration continue du service',
        ];
  const customer_relationships = relDefaults;

  // 6. Canaux de Distribution
  const userChannels = parseList(formData.sales_channels);
  const enrichedChannels = [
    ...profile.defaultChannels,
    `Canal direct conversationnel WhatsApp Business pour ${countryInfo.nameFr}`,
  ];
  const channels = mergeUserAndDefaults(userChannels, enrichedChannels, 5);

  // 7. Segments Clients
  const userTargets = parseList(formData.target_market);
  const enrichedSegments = [
    formData.target_market || `Clients et professionnels cibles au ${countryInfo.nameFr}`,
    ...profile.defaultCustomerSegments,
  ];
  const customer_segments = mergeUserAndDefaults(userTargets, enrichedSegments, 4);

  // 8. Structure des Coûts
  const userCosts = formData.monthly_costs || '';
  const fixed_costs = profile.fixedCostLabels.map((lbl, idx) => {
    let amount = '350 000';
    if (idx === 0) amount = '1 200 000';
    else if (idx === 1) amount = '450 000';
    else if (idx === 2) amount = '200 000';
    return { item: lbl, amount, currency };
  });

  const cost_structure = {
    fixed_costs,
    variable_costs: profile.variableCostLabels,
    total_monthly_estimate: userCosts.length > 5 ? userCosts : `2 200 000 ${currency}`,
  };

  // 9. Sources de Revenus
  const userPricing = cleanText(formData.pricing, 'Tarification compétitive alignée sur le marché');
  const userRevenueModel = cleanText(formData.revenue_model, 'Ventes directes et abonnements');

  const revenue_streams = [
    {
      source: `Activité principale de ${projectName}`,
      model: userRevenueModel,
      pricing: userPricing,
    },
    {
      source: 'Offres complémentaires & Services à valeur ajoutée',
      model: 'Facturation ponctuelle ou commissions sur volume',
      pricing: 'Tarif standard selon cahier des charges et volume d\'achat',
    },
    {
      source: 'Contrats récurrents & Abonnements premium',
      model: 'Engagement mensuel ou trimestriel avec remises pour fidélité',
      pricing: `Facturation flexible par Mobile Money (${countryInfo.mobileMoney[0] || 'MoMo'})`,
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

// ==============================================================================
// 5. Générateur Expert du Lean Canvas
// ==============================================================================
export function generateExpertLeanCanvas(ctx: ProjectContext): LeanCanvasBlocks {
  const { name, sector, country, formData } = ctx;
  const countryInfo = getCountryInfo(country);
  const profile = getSectorProfile(sector);

  const projectName = cleanText(formData.company_name, name || 'Votre Projet');
  const currency = countryInfo.currency;

  // Problèmes
  const userProblems = parseList(formData.problem_solved);
  const defaultProblems = [
    formData.problem_solved || `Manque d'options fiables, transparentes et abordables dans le secteur ${profile.label} au ${countryInfo.nameFr}`,
    'Processus manuels ou intermédiaires opaques entraînant des surcoûts et des pertes de temps considérables',
    'Difficulté d\'accès aux services modernes avec un moyen de paiement simple et sécurisé',
  ];
  const problem = mergeUserAndDefaults(userProblems, defaultProblems, 3);

  // Alternatives existantes
  const userCompetitors = parseList(formData.competitors);
  const existing_alternatives = userCompetitors.length > 0
    ? userCompetitors
    : [
        'Acteurs informels de quartier sans standard de qualité ni garantie de service',
        'Solutions importées inadaptées aux contraintes de connectivité et aux monnaies locales',
        'Système D et démarches manuelles longues par téléphone et déplacements physiques',
      ];

  // Solutions
  const userSolutions = parseList(formData.solution);
  const defaultSolutions = [
    formData.solution || `Plateforme et offre optimisée mise au point par ${projectName}`,
    `Parcours simplifié avec paiement intégré (${countryInfo.mobileMoney.join(', ')})`,
    `Accompagnement client direct et garantie de conformité locale`,
  ];
  const solution = mergeUserAndDefaults(userSolutions, defaultSolutions, 3);

  // Métriques Clés
  const key_metrics = profile.defaultKeyMetrics;

  // Proposition de valeur unique
  const unique_value_proposition = cleanText(
    formData.unique_value,
    `${projectName} : La solution de référence en ${profile.label} qui simplifie et sécurise votre quotidien au ${countryInfo.nameFr}.`
  );

  const high_level_concept = `${projectName} applique le meilleur des standards modernes au secteur ${profile.label} pour le marché de ${countryInfo.nameFr}.`;

  // Avantage Déloyal / Unfair Advantage
  const unfair_advantage = [
    formData.unique_value ? `Avantage concurrentiel propriétaire : ${formData.unique_value}` : 'Ancrage local fort et compréhension fine des habitudes de consommation locales',
    `Partenariats directs et intégration native des écosystèmes Mobile Money (${countryInfo.mobileMoney[0] || 'MoMo'})`,
    'Structure de coûts allégée permettant une tarification ultra-compétitive et durable',
  ];

  // Canaux
  const userChannels = parseList(formData.sales_channels);
  const channels = mergeUserAndDefaults(userChannels, profile.defaultChannels, 4);

  // Segments et Early Adopters
  const customer_segments = {
    target: cleanText(formData.target_market, `Professionnels, ménages et organisations actives au ${countryInfo.nameFr}`),
    early_adopters: 'La première cohorte d\'utilisateurs pionniers et prescripteurs touchés via les canaux directs et recommandations.',
  };

  // Coûts et Revenus
  const cost_structure = {
    fixed: `Coûts fixes estimés à 1 800 000 ${currency} / mois (salaires clés, locaux, outils et conformité)`,
    variable: 'Coûts opérationnels directs, commissions de paiement et investissements d\'acquisition commerciale',
  };

  const revenue_streams = {
    model: cleanText(formData.revenue_model, 'Vente directe, abonnements récurrents et commissions sur flux'),
    pricing: cleanText(formData.pricing, `Grille tarifaire accessible en devise ${currency} avec remises sur engagement`),
    break_even: 'Atteinte du seuil d\'équilibre d\'exploitation projetée entre le 6e et le 9e mois d\'activité.',
  };

  return {
    problem,
    existing_alternatives,
    solution,
    key_metrics,
    unique_value_proposition,
    high_level_concept,
    unfair_advantage,
    channels,
    customer_segments,
    cost_structure,
    revenue_streams,
  };
}

// ==============================================================================
// 6. Générateur Expert du Business Plan (BP)
// ==============================================================================
export function generateExpertBusinessPlan(ctx: ProjectContext): Record<string, unknown> {
  const { name, sector, country, formData } = ctx;
  const countryInfo = getCountryInfo(country);
  const profile = getSectorProfile(sector);

  const projectName = cleanText(formData.company_name, name || 'Votre Entreprise');
  const currency = countryInfo.currency;

  const problemSolved = cleanText(formData.problem_solved, `les inefficacités et le manque de professionnalisme dans la filière ${profile.label}`);
  const solutionProvided = cleanText(formData.solution, `une offre structurée, accessible et moderne adaptée au contexte local`);
  const targetMarket = cleanText(formData.target_market, `les professionnels et ménages du ${countryInfo.nameFr}`);
  const uniqueValue = cleanText(formData.unique_value, `notre engagement de qualité, nos tarifs transparents et notre réactivité locale`);
  const fundingAsked = cleanText(formData.required_funding, `15 000 000 ${currency}`);
  const teamSize = cleanText(formData.team_size, 'Équipe fondatrice et opérationnelle');

  // Vision et Mission parfaitement articulées sur le projet
  const mission = `Donner à ${targetMarket} les moyens de réussir et de s'épanouir en éliminant ${problemSolved} grâce à ${solutionProvided}.`;
  const vision = `Faire de ${projectName} le champion et la marque de référence du secteur ${profile.label} au ${countryInfo.nameFr} d'ici 3 ans, puis étendre l'impact aux marchés régionaux.`;
  const values = profile.defaultValues;

  const executiveSummary = `${projectName} est une initiative entrepreneuriale ambitieuse établie au ${countryInfo.nameFr}, intervenant dans le secteur ${profile.label}.

Le projet répond directement à un constat sans appel : ${problemSolved}. Face à cette situation, ${projectName} apporte une solution concrète : ${solutionProvided}.

Notre proposition de valeur repose sur ${uniqueValue}. Grâce à un modèle économique robuste combinant ${cleanText(formData.revenue_model, 'ventes directes et services récurrents')} et en nous appuyant sur les technologies mobiles (${countryInfo.mobileMoney.join(', ')}), ${projectName} cible une base solide de clients.

Pour soutenir notre plan de déploiement, accélérer notre conquête commerciale et pérenniser nos opérations, nous mobilisons un besoin de financement de ${fundingAsked}. Ce business plan détaille notre stratégie, nos opérations, notre feuille de route et nos prévisions financières rigoureuses.`;

  return {
    executiveSummary,
    companyOverview: {
      mission,
      vision,
      values,
      legalStructure: 'Société à Responsabilité Limitée (SARL) ou équivalent OHADA',
      location: `${countryInfo.majorHub}, ${countryInfo.nameFr}`,
    },
    marketAnalysis: {
      industryOverview: `Le marché du secteur ${profile.label} au ${countryInfo.nameFr} connaît une dynamique forte, stimulée par l'urbanisation, l'essor de la classe moyenne et l'adoption rapide des outils digitaux et du Mobile Money.`,
      targetMarket,
      marketSize: cleanText(formData.market_size, `Marché global adressable estimé à plusieurs centaines de millions de ${currency} dans la zone urbaine prioritaire.`),
      trends: [
        'Exigence accrue des clients finaux pour la traçabilité, la conformité et la sécurité',
        `Standardisation des transactions instantanées via ${countryInfo.mobileMoney.join(' et ')}`,
        'Préférence affirmée pour des solutions locales ancrées et immédiatement disponibles',
      ],
    },
    competitiveAnalysis: {
      directCompetitors: parseList(formData.competitors).length > 0
        ? parseList(formData.competitors)
        : ['Opérateurs traditionnels informels', 'Acteurs historiques aux méthodes peu digitalisées'],
      indirectCompetitors: ['Solutions de substitution manuelles', 'Plateformes généralistes étrangères'],
      competitiveAdvantage: uniqueValue,
    },
    swot: {
      strengths: profile.swotStrengths,
      weaknesses: profile.swotWeaknesses,
      opportunities: profile.swotOpportunities,
      threats: profile.swotThreats,
    },
    marketingStrategy: {
      positioning: `Leader de confiance et de proximité dans le secteur ${profile.label}, alliant rigueur professionnelle et accessibilité financière.`,
      channels: parseList(formData.sales_channels).length > 0 ? parseList(formData.sales_channels) : profile.defaultChannels,
      pricingStrategy: cleanText(formData.pricing, `Politique de prix transparente et compétitive avec marges saines et remises sur volume`),
      salesApproach: 'Approche consultative, prospection active sur le terrain et animation de communautés digitales engagées.',
    },
    operationsPlan: {
      keyActivities: parseList(formData.key_activities).length > 0 ? parseList(formData.key_activities) : profile.defaultActivities,
      keyResources: parseList(formData.key_resources).length > 0 ? parseList(formData.key_resources) : profile.defaultResources,
      keyPartners: parseList(formData.key_partners).length > 0 ? parseList(formData.key_partners) : profile.defaultPartners,
      milestones: [
        'Mois 1-3 : Finalisation des protocoles opérationnels, mise en place des partenariats clés et tests pilotes',
        'Mois 4-6 : Lancement commercial officiel, déploiement des canaux de vente et acquisition des 100 premiers clients de référence',
        'Mois 7-9 : Optimisation des marges opérationnelles, réduction des délais de livraison et consolidation de la trésorerie',
        'Mois 10-12 : Atteinte du seuil de rentabilité, élargissement de la gamme de services et préparation de l\'expansion régionale',
      ],
    },
    financialProjections: {
      year1Revenue: cleanText(formData.projected_revenue_m6, `28 000 000 ${currency}`),
      year2Revenue: `55 000 000 ${currency}`,
      year3Revenue: `110 000 000 ${currency}`,
      breakEvenMonth: 8,
      fundingRequired: fundingAsked,
      useOfFunds: [
        'Équipements, outils techniques et aménagements opérationnels (35%)',
        'Fonds de roulement initial et couverture des approvisionnements (30%)',
        'Marketing, acquisition commerciale et expansion terrain (20%)',
        'Réserve de sécurité et trésorerie prudentielle (15%)',
      ],
    },
    team: {
      founders: [`Direction Générale & Stratégie (${teamSize})`],
      keyHires: ['Responsable Commercial & Partenariats', 'Responsable des Opérations & Qualité'],
      advisors: ['Cabinet d\'expertise comptable et fiscale', 'Mentor chevronné du secteur'],
    },
    riskAnalysis: {
      risks: profile.risksAndMitigations.map(r => r.risk),
      mitigations: profile.risksAndMitigations.map(r => r.mitigation),
    },
  };
}
