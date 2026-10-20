'use client';

import { useState } from 'react';
import { Lightbulb, Sparkles, ChevronDown, ChevronUp, Check, Plus } from 'lucide-react';

// ============================================
// SECTOR SUGGESTIONS DATA
// ============================================

export interface SectorSuggestion {
  questionKey: string;
  suggestions: string[];
}

type SuggestionMap = Record<string, SectorSuggestion[]>;

const SECTOR_SUGGESTIONS: Record<string, SuggestionMap> = {
  // ============================
  // TECH
  // ============================
  TECH: {
    CM: [
      {
        questionKey: 'description',
        suggestions: [
          'Nous développons une plateforme SaaS mobile-first qui simplifie la gestion des opérations et des stocks pour les PME et commerçants locaux.',
          'Nous proposons une solution FinTech permettant aux professionnels et particuliers d\'effectuer des paiements et transferts automatisés via Mobile Money.',
          'Nous concevons une application web et mobile connectant les prestataires de services qualifiés aux entreprises et ménages en temps réel.',
        ],
      },
      {
        questionKey: 'problem_solved',
        suggestions: [
          'Les PME manquent d\'outils digitaux simples et abordables pour gérer leurs opérations quotidiennes (ventes, stocks, facturation), entraînant des pertes de 20% de chiffre d\'affaires.',
          'L\'accès aux services bancaires traditionnels reste trop complexe et coûteux, excluant les acteurs informels des circuits de paiement modernes.',
          'Les entreprises perdent un temps précieux dans des démarches manuelles non digitalisées et sans traçabilité des données.',
        ],
      },
      {
        questionKey: 'solution',
        suggestions: [
          'Une application mobile légère fonctionnant hors-ligne (Offline-first) avec synchronisation automatique et intégration native MTN MoMo et Orange Money.',
          'Un tableau de bord SaaS accessible sur smartphone et ordinateur avec alertes SMS/WhatsApp automatiques pour les relances clients.',
          'Une plateforme sécurisée d\'interopérabilité API reliant les comptes bancaires, portefeuilles mobiles et logiciels comptables OHADA.',
        ],
      },
      {
        questionKey: 'unique_value',
        suggestions: [
          'La seule plateforme 100% conçue pour les connexions instables, avec encaissement Mobile Money direct sans frais cachés.',
          'Une interface intuitive en français facile à prendre en main en moins de 10 minutes, sans formation technique préalable.',
          'Un support client local ultra-réactif disponible par WhatsApp 7j/7 avec des serveurs hautement sécurisés.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'PME, commerçants de détail et grossistes des grands centres urbains (Douala, Yaoundé, Bafoussam, Garoua).',
          'Professionnels indépendants, consultants et prestataires de services utilisant activement leur smartphone Android.',
          'Entreprises en phase de croissance cherchant à digitaliser leur force de vente terrain.',
        ],
      },
      {
        questionKey: 'revenue_model',
        suggestions: [
          'Abonnement SaaS mensuel ou annuel par paliers (Starter: 5 000 XAF/mois, Pro: 15 000 XAF/mois, Entreprise: sur devis).',
          'Modèle freemium avec commission de 1,5% sur les encaissements traités et fonctionnalités premium activables.',
          'Forfait mensuel tout compris incluant les sauvegardes cloud, les mises à jour et le support technique dédié.',
        ],
      },
      {
        questionKey: 'pricing',
        suggestions: [
          'Pack Starter : 5 000 XAF / mois par utilisateur. Pack Business : 25 000 XAF / mois jusqu\'à 5 postes.',
          'Commission fixe de 1,8% par transaction Mobile Money réussie, sans frais d\'installation ni engagement.',
          'Abonnement annuel à 60 000 XAF avec 2 mois offerts et formation sur site incluse.',
        ],
      },
      {
        questionKey: 'sales_channels',
        suggestions: [
          'Marketing digital ciblé (Facebook, Instagram, LinkedIn), démonstrations en ligne et bouche-à-oreille.',
          'Force de vente terrain directe dans les zones commerciales et partenariats avec les associations professionnelles.',
          'Téléchargement direct depuis le site web et le Google Play Store avec période d\'essai gratuite de 14 jours.',
        ],
      },
      {
        questionKey: 'key_partners',
        suggestions: [
          'Opérateurs télécoms (MTN Cameroun pour l\'API MoMo, Orange Cameroun pour Orange Money).',
          'Fournisseurs d\'hébergement cloud et de cybersécurité (AWS, Google Cloud, Cloudflare).',
          'Incubateurs locaux (ActivSpaces, Silicon Mountain) et groupements patronaux (GECAM, CCIMA).',
        ],
      },
      {
        questionKey: 'monthly_costs',
        suggestions: [
          'Salaires équipe (3 ingénieurs + 1 commercial): 2 200 000 XAF, Hébergement cloud: 180 000 XAF, Marketing: 300 000 XAF, Locaux: 200 000 XAF.',
          'Salaires fondateurs & support: 1 500 000 XAF, Serveurs & API: 120 000 XAF, Budget pub: 250 000 XAF, Divers: 150 000 XAF.',
        ],
      },
      {
        questionKey: 'required_funding',
        suggestions: [
          '15 000 000 XAF : 50% en R&D et développement produit, 35% en acquisition commerciale et 15% en fonds de roulement.',
          '25 000 000 XAF pour accélérer la conquête commerciale à Douala et Yaoundé et recruter 3 profils clés.',
        ],
      },
    ],
  },

  // ============================
  // AGRO
  // ============================
  AGRO: {
    CM: [
      {
        questionKey: 'description',
        suggestions: [
          'Nous opérons une exploitation agricole moderne spécialisée dans la production et la distribution durable de denrées vivrières à haute valeur ajoutée.',
          'Nous développons une ferme intégrée combinant maraîchage biologique, élevage et production d\'intrants naturels pour approvisionner les marchés urbains.',
          'Nous structurons une chaîne de collecte, de stockage et d\'évacuation des récoltes de petits producteurs vers les circuits de distribution urbains.',
        ],
      },
      {
        questionKey: 'problem_solved',
        suggestions: [
          'Les petits exploitants perdent jusqu\'à 35% de leurs récoltes post-récolte faute de stockage adapté et de logistique d\'évacuation rapide.',
          'L\'accès aux semences améliorées et fertilisants de qualité est coûteux et difficile en milieu rural, limitant les rendements.',
          'L\'instabilité des cours et le monopole des intermédiaires informels privent les producteurs d\'une juste rémunération.',
        ],
      },
      {
        questionKey: 'solution',
        suggestions: [
          'Mise en place d\'une unité de production rigoureuse avec système d\'irrigation moderne permettant des récoltes régulières toute l\'année.',
          'Réseau de collecte groupée avec pesée électronique transparente et paiement instantané via Mobile Money.',
          'Contrats d\'approvisionnement direct avec les centrales d\'achat et supermarchés garantissant des prix stables et rémunérateurs.',
        ],
      },
      {
        questionKey: 'unique_value',
        suggestions: [
          'Des récoltes fraîches garanties sans rupture de stock grâce à notre maîtrise de l\'irrigation et du calendrier cultural.',
          'Traçabilité complète du champ à l\'assiette avec respect strict des normes de sécurité sanitaire.',
          'Partenariat gagnant-gagnant offrant des prix justes aux producteurs et des tarifs compétitifs aux acheteurs urbains.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'Grossistes et commerçants des grands marchés vivriers urbains (Marché Sandaga Douala, Marché Mokolo Yaoundé).',
          'Établissements de restauration, hôtels, traiteurs et cantines scolaires/d\'entreprises.',
          'Supermarchés locaux, supérettes de quartier et groupements d\'achats familiaux.',
        ],
      },
      {
        questionKey: 'revenue_model',
        suggestions: [
          'Vente directe en gros et demi-gros au kilogramme ou à la caisse selon mercuriale négociée.',
          'Contrats d\'approvisionnement récurrents bimensuels avec paiement garanti sous 7 jours par Mobile Money.',
          'Vente de produits calibrés et conditionnés prêts pour les rayons de la grande distribution.',
        ],
      },
      {
        questionKey: 'pricing',
        suggestions: [
          'Prix de gros dégressif au-delà de 500 kg avec acompte de 40% à la réservation de récolte.',
          'Tarification transparente indexée sur la qualité et la fraîcheur, 15% plus compétitive que les intermédiaires informels.',
        ],
      },
      {
        questionKey: 'sales_channels',
        suggestions: [
          'Livraisons directes aux entrepôts des grossistes et supermarchés partenaires.',
          'Commandes anticipées via catalogue WhatsApp Business avec service de livraison rapide.',
          'Comptoir de vente directe à la ferme et stands lors des foires agropastorales régionales.',
        ],
      },
      {
        questionKey: 'key_partners',
        suggestions: [
          'Coopératives agricoles locales, MINADER (Ministère de l\'Agriculture) et IRAD pour les semences certifiées.',
          'Transporteurs ruraux et prestataires logistiques spécialisés dans le fret de denrées périssables.',
          'Afriland First Bank (crédit agricole de campagne) et opérateurs MTN MoMo / Orange Money.',
        ],
      },
      {
        questionKey: 'monthly_costs',
        suggestions: [
          'Main d\'œuvre permanente (régisseur + 4 ouvriers): 950 000 XAF, Carburant & logistique: 350 000 XAF, Intrants: 400 000 XAF, Maintenance: 150 000 XAF.',
          'Charges salariales d\'exploitation: 1 200 000 XAF, Énergie & irrigation: 300 000 XAF, Fret vers Douala: 450 000 XAF.',
        ],
      },
      {
        questionKey: 'required_funding',
        suggestions: [
          '20 000 000 XAF pour l\'installation d\'un système d\'irrigation solaire au goutte-à-goutte, l\'achat d\'un utilitaire et le fonds de roulement.',
          '12 000 000 XAF pour l\'aménagement de 5 hectares, la sécurisation du site et les semences certifiées.',
        ],
      },
    ],
  },

  // ============================
  // AGRO_ALIMENTAIRE
  // ============================
  AGRO_ALIMENTAIRE: {
    CM: [
      {
        questionKey: 'description',
        suggestions: [
          'Nous créons une unité de transformation agroalimentaire locale qui valorise les fruits et denrées du terroir en produits sains, certifiés et emballés aux normes.',
          'Nous produisons une marque locale de jus naturels, farines enrichies et sauces artisanales distribuée en supermarchés et boutiques urbaines.',
          'Nous développons des snacks et produits alimentaires prêts à l\'emploi à base de tubercules locaux (manioc, plantain) pour les actifs urbains.',
        ],
      },
      {
        questionKey: 'problem_solved',
        suggestions: [
          'Plus de 60% des produits transformés consommés en ville sont importés et coûteux, tandis que les récoltes locales pourrissent dans les bassins de production.',
          'Les consommateurs manquent d\'options alimentaires locales garantissant une hygiène irréprochable et une longue durée de conservation sans conservateurs chimiques.',
          'Le secteur informel propose des emballages rudimentaires ne respectant pas les normes sanitaires et ne permettant pas le référencement en magasin.',
        ],
      },
      {
        questionKey: 'solution',
        suggestions: [
          'Une ligne semi-industrielle de pasteurisation, déshydratation et conditionnement hermétique certifiée par l\'ANOR.',
          'Un packaging moderne, recyclable et attrayant mettant en avant l\'origine locale et les valeurs nutritives.',
          'Une logistique de distribution directe réapprovisionnant les points de vente toutes les semaines sans rupture.',
        ],
      },
      {
        questionKey: 'unique_value',
        suggestions: [
          '100% naturel, sans additifs chimiques, fabriqué au Cameroun et accessible à un prix inférieur aux marques importées.',
          'Une qualité organoleptique constante certifiée conforme aux normes sanitaires nationales et internationales.',
          'Un packaging premium valorisant fièrement le savoir-faire africain et séduisant les classes moyennes et la diaspora.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'Ménages urbains des classes moyennes et supérieures de Douala et Yaoundé soucieux de la santé de leur famille.',
          'Grandes surfaces et supérettes (Carrefour, Dovv, Santa Lucia, Spar) et boutiques spécialisées de produits du terroir.',
          'Diaspora et touristes en quête de produits authentiques prêts à être transportés ou exportés.',
        ],
      },
      {
        questionKey: 'revenue_model',
        suggestions: [
          'Vente directe de produits finis aux distributeurs avec marge brute fabricant de 35% à 45%.',
          'Vente au détail via notre boutique pilote et les canaux en ligne (WhatsApp Business & livraison à domicile).',
          'Contrats de fourniture en gros pour les cantines d\'entreprises, hôtels et événements professionnels.',
        ],
      },
      {
        questionKey: 'key_partners',
        suggestions: [
          'ANOR (Agence des Normes et de la Qualité) pour les certifications et homologations sanitaires.',
          'Coopératives de planteurs pour l\'approvisionnement direct en matières premières fraîches.',
          'Distributeurs et grandes surfaces (Dovv, Santa Lucia, Carrefour) et réseaux de stations-service.',
        ],
      },
      {
        questionKey: 'monthly_costs',
        suggestions: [
          'Personnel atelier & conditionnement: 1 400 000 XAF, Énergie atelier: 250 000 XAF, Matières premières: 1 800 000 XAF, Emballages: 500 000 XAF.',
        ],
      },
      {
        questionKey: 'required_funding',
        suggestions: [
          '18 000 000 XAF pour l\'acquisition d\'équipements inox de transformation, la certification aux normes et les stocks d\'emballages initiaux.',
        ],
      },
    ],
  },

  // ============================
  // SERVICES
  // ============================
  SERVICES: {
    CM: [
      {
        questionKey: 'description',
        suggestions: [
          'Nous dirigeons un cabinet de conseil et d\'accompagnement opérationnel dédié à la structuration, la comptabilité et la croissance des PME.',
          'Nous opérons une agence de services digitaux et communication 360° aidant les entreprises locales à booster leurs ventes.',
          'Nous proposons des prestations de formation professionnelle certifiante et de mise à disposition de talents qualifiés.',
        ],
      },
      {
        questionKey: 'problem_solved',
        suggestions: [
          'Les PME et startups n\'ont pas les moyens de recruter des experts à temps plein et souffrent d\'un manque de structuration administrative et financière.',
          'La communication des entreprises traditionnelles est souvent inefficace sur les canaux digitaux, freinant leur acquisition de nouveaux clients.',
          'La pénurie de compétences pratiques immédiatement opérationnelles pèse lourdement sur la productivité des équipes en place.',
        ],
      },
      {
        questionKey: 'solution',
        suggestions: [
          'Des offres d\'accompagnement mensualisées tout-en-un adaptées à la taille et au budget de chaque entreprise cliente.',
          'Des équipes d\'experts seniors intervenant à temps partagé ou en missions commando à fort retour sur investissement.',
          'Des méthodologies éprouvées intégrant les meilleures pratiques internationales et les contraintes réglementaires OHADA.',
        ],
      },
      {
        questionKey: 'unique_value',
        suggestions: [
          'Une tarification transparente au forfait sans dépassement imprévu, orientée vers des résultats concrets et mesurables.',
          'La réactivité d\'une structure à taille humaine alliée à la rigueur méthodologique des grands cabinets.',
          'Une parfaite maîtrise du tissu économique local et un réseau relationnel étendu facilitant les mises en relation d\'affaires.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'Dirigeants de PME et PMI (10 à 100 salariés) cherchant à moderniser leur organisation et réussir leur transition.',
          'Porteurs de projets et entrepreneurs en phase de création ou levée de fonds nécessitant un Business Plan bancable.',
          'Filiales locales de groupes internationaux recherchant des relais opérationnels fiables et réactifs.',
        ],
      },
      {
        questionKey: 'revenue_model',
        suggestions: [
          'Honoraires mensuels récurrents (forfaits Starter à 150 000 XAF, Business à 450 000 XAF, Premium à 900 000 XAF).',
          'Missions d\'audit, diagnostic et cadrage stratégique facturées au projet avec acompte de 50%.',
          'Success fees (intéressement aux résultats) sur les montants de financements levés ou contrats d\'affaires générés.',
        ],
      },
      {
        questionKey: 'key_partners',
        suggestions: [
          'Ordre National des Experts-Comptables, juristes d\'affaires et notaires partenaires.',
          'Chambre de Commerce, d\'Industrie, des Mines et de l\'Artisanat (CCIMA) et syndicats patronaux.',
          'Banques commerciales partenaires (Afriland, Société Générale, BICEC) et fonds d\'investissement régionaux.',
        ],
      },
    ],
  },

  // ============================
  // COMMERCE
  // ============================
  COMMERCE: {
    CM: [
      {
        questionKey: 'description',
        suggestions: [
          'Nous exploitons un réseau de distribution moderne alliant point de vente physique stratégique et vente en ligne avec livraison express.',
          'Nous gérons une centrale d\'achat et d\'approvisionnement direct permettant aux commerçants et ménages d\'acheter au meilleur prix.',
          'Nous distribuons des équipements, vêtements et accessoires de qualité sourcés auprès de fabricants certifiés.',
        ],
      },
      {
        questionKey: 'problem_solved',
        suggestions: [
          'Les clients perdent des heures dans les embouteillages pour trouver des articles fiables et négocier des prix opaques dans les marchés.',
          'La prolifération des contrefaçons et produits de mauvaise qualité crée une méfiance permanente chez les consommateurs.',
          'Les petits revendeurs peinent à s\'approvisionner à bon prix faute de volume et subissent les aléas de la logistique d\'importation.',
        ],
      },
      {
        questionKey: 'solution',
        suggestions: [
          'Un catalogue multicanal actualisé en temps réel avec commande en 1 clic sur WhatsApp et livraison le jour même.',
          'Des garanties claires de conformité avec possibilité d\'échange sous 48h et paiement à la livraison par Mobile Money.',
          'Des commandes groupées permettant d\'obtenir des tarifs grossistes et d\'en faire bénéficier directement nos clients.',
        ],
      },
      {
        questionKey: 'unique_value',
        suggestions: [
          'La certitude d\'acheter des produits authentiques et garantis au prix le plus juste du marché sans mauvaises surprises.',
          'Livraison rapide en moins de 3 heures dans toute l\'agglomération avec suivi par SMS et livreurs dédiés.',
          'Un service après-vente dévoué qui résout chaque réclamation sous 24h avec le sourire.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'Actifs urbains, cadres et étudiants connectés utilisant intensivement WhatsApp et les réseaux sociaux.',
          'Boutiques de quartier, salons de coiffure et commerces de proximité s\'approvisionnant en semi-gros.',
          'Entreprises pour leurs dotations, fournitures professionnelles et cadeaux d\'affaires.',
        ],
      },
      {
        questionKey: 'revenue_model',
        suggestions: [
          'Marge commerciale brute de 30% à 45% sur chaque article vendu au détail.',
          'Tarifs grossistes avec marge de 15% à 20% sur les commandes en volume par carton.',
          'Frais de livraison forfaitaires par zone urbaine (1 500 à 3 000 XAF par course).',
        ],
      },
      {
        questionKey: 'key_partners',
        suggestions: [
          'Fabricants et grossistes officiels partenaires pour un approvisionnement direct et garanti.',
          'Sociétés de messagerie express et réseau de livreurs deux-roues géolocalisés.',
          'Opérateurs MTN MoMo, Orange Money et plateformes de paiement électronique.',
        ],
      },
    ],
  },
};

// Suggestions génériques transversales d'experts pour toutes autres questions ou pays
const GENERAL_EXPERT_SUGGESTIONS: Record<string, string[]> = {
  description: [
    'Notre entreprise apporte une réponse moderne et structurée aux besoins fondamentaux du marché local avec un ancrage solide.',
    'Nous développons une activité à fort impact économique et social combinant excellence opérationnelle et accessibilité financière.',
  ],
  problem_solved: [
    'Le manque de professionnalisme, les retards chroniques et l\'opacité tarifaire nuisent à l\'efficacité des acteurs locaux.',
    'L\'offre actuelle est fragmentée, peu fiable et ne répond pas aux exigences croissantes de qualité et de réactivité.',
  ],
  solution: [
    'Une offre claire, standardisée et disponible immédiatement, s\'appuyant sur les technologies mobiles et un service de proximité.',
    'Une solution intégrée de bout en bout qui élimine les intermédiaires inutiles pour réduire les coûts et sécuriser la prestation.',
  ],
  unique_value: [
    'Notre engagement indéfectible sur la qualité, la ponctualité et la satisfaction client garantie avec paiement sécurisé.',
    'Une expertise technique pointue associée à une tarification compétitive pensée pour le pouvoir d\'achat local.',
  ],
  target_market: [
    'PME, professionnels et ménages urbains actifs exigeant un service de qualité et un gain de temps précieux.',
    'Acteurs économiques locaux en phase de développement recherchant des prestataires fiables et transparents.',
  ],
  revenue_model: [
    'Ventes directes au comptant combinées à des abonnements récurrents et des prestations sur mesure.',
    'Tarification transparente par pallier de volume avec acompte Mobile Money sécurisé.',
  ],
  sales_channels: [
    'WhatsApp Business, démarchage direct de proximité, bouche-à-oreille et campagnes ciblées sur réseaux sociaux.',
    'Points de contact physiques stratégiques et partenariats avec des prescripteurs d\'affaires locaux.',
  ],
  key_partners: [
    'Opérateurs de paiement mobile locaux, transporteurs et prestataires logistiques fiables.',
    'Institutions financières locales, associations professionnelles et mentors sectoriels chevronnés.',
  ],
  monthly_costs: [
    'Salaires de l\'équipe permanente, loyer des locaux d\'exploitation, énergie, télécoms et logistique de distribution.',
  ],
  required_funding: [
    '15 000 000 XAF pour financer les équipements opérationnels, le marketing d\'acquisition et le fonds de roulement initial.',
  ],
};

export function getSuggestionsForField(
  sector: string,
  country: string,
  questionKey: string,
  projectName?: string
): string[] {
  const normSector = (sector || 'TECH').toUpperCase();
  const normCountry = (country || 'CM').toUpperCase();

  let results: string[] = [];

  const sectorData = SECTOR_SUGGESTIONS[normSector];
  if (sectorData) {
    const countryData = sectorData[normCountry] || sectorData['CM'];
    if (countryData) {
      const match = countryData.find(s => s.questionKey === questionKey);
      if (match && match.suggestions.length > 0) {
        results = [...match.suggestions];
      }
    }
  }

  // Fallback si pas de résultat sectoriel spécifique
  if (results.length === 0 && GENERAL_EXPERT_SUGGESTIONS[questionKey]) {
    results = [...GENERAL_EXPERT_SUGGESTIONS[questionKey]];
  }

  // Remplacement contextuel du nom de projet si fourni
  if (projectName && projectName.trim().length > 0) {
    const cleanName = projectName.trim();
    results = results.map(s =>
      s.replace(/Notre entreprise/g, cleanName)
       .replace(/Nous/g, `${cleanName}`)
    );
  }

  return results;
}

// ============================================
// COMPOSANT SMART SUGGESTIONS
// ============================================

interface SmartSuggestionsProps {
  sector: string;
  country: string;
  questionKey: string;
  currentValue?: string;
  projectName?: string;
  onSelect: (suggestion: string) => void;
}

export function SmartSuggestions({
  sector,
  country,
  questionKey,
  currentValue = '',
  projectName = '',
  onSelect,
}: SmartSuggestionsProps) {
  const [expanded, setExpanded] = useState(false);
  const suggestions = getSuggestionsForField(sector, country, questionKey, projectName);

  if (suggestions.length === 0) return null;

  const displaySuggestions = expanded ? suggestions : suggestions.slice(0, 2);

  return (
    <div className="mt-2.5 space-y-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Suggestions expertes sectorielles
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          Cliquez pour insérer
        </span>
      </div>

      <div className="space-y-1.5">
        {displaySuggestions.map((suggestion, idx) => {
          const isSelected = currentValue?.includes(suggestion);
          return (
            <div
              key={idx}
              className={`group flex items-start gap-2 p-2.5 rounded-lg text-xs leading-relaxed transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                  : 'bg-background/80 border-border/50 hover:bg-muted/70 hover:border-amber-500/30 text-foreground/80 hover:text-foreground'
              }`}
              onClick={() => onSelect(suggestion)}
            >
              <div className="mt-0.5 shrink-0">
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                )}
              </div>
              <div className="flex-1">
                <span>{suggestion}</span>
              </div>
              {currentValue && currentValue.length > 5 && !isSelected && (
                <button
                  type="button"
                  title="Ajouter au texte existant"
                  onClick={(e) => {
                    e.stopPropagation();
                    const combined = `${currentValue.trim()}\n\n${suggestion}`;
                    onSelect(combined);
                  }}
                  className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5 text-[10px]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Ajouter</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {suggestions.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline pt-1 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Voir +{suggestions.length - 2} autre{suggestions.length - 2 > 1 ? 's' : ''} suggestion{suggestions.length - 2 > 1 ? 's' : ''}
            </>
          )}
        </button>
      )}
    </div>
  );
}
