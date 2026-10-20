'use client';

import { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';

// ============================================
// SECTOR SUGGESTIONS DATA
// ============================================

export interface SectorSuggestion {
  questionKey: string;
  suggestions: string[];
}

type SuggestionMap = Record<string, SectorSuggestion[]>;

/**
 * Suggestions sectorielles prédictives par secteur et par pays.
 * Chaque suggestion est un texte pré-rédigé que l'utilisateur
 * peut insérer en un clic dans le champ correspondant.
 */
const SECTOR_SUGGESTIONS: Record<string, SuggestionMap> = {
  // ============================
  // TECH
  // ============================
  TECH: {
    CM: [
      {
        questionKey: 'problem_solved',
        suggestions: [
          'Les PME camerounaises manquent d\'outils digitaux accessibles et abordables pour gérer leurs opérations quotidiennes (stocks, factures, comptabilité).',
          'L\'accès aux services bancaires traditionnels reste limité pour 60% de la population, freinant l\'inclusion financière.',
          'Les étudiants universitaires n\'ont pas accès à des ressources d\'apprentissage en ligne adaptées au contexte local.',
        ],
      },
      {
        questionKey: 'solution',
        suggestions: [
          'Application mobile/web SaaS légère fonctionnant sur smartphones bas de gamme avec mode hors-ligne et synchronisation automatique.',
          'Plateforme de paiement mobile intégrée avec MTN Mobile Money et Orange Money, accessible via USSD et application.',
          'Marketplace éducative avec contenus produits par des enseignants locaux, accessibles via SMS et application légère.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'PME et micro-entreprises de Douala et Yaoundé (+ 500 000 entreprises informelles), commerçants des marchés centraux.',
          'Jeunes actifs 18-35 ans en zone urbaine et périurbaine, utilisateurs de smartphones Android (85% du marché).',
          'Étudiants des universités publiques (Yaoundé I, Douala, Buea), professionnels en reconversion.',
        ],
      },
      {
        questionKey: 'revenue_model',
        suggestions: [
          'Freemium : version gratuite limitée + abonnement PRO à 5 000 XAF/mois. Commission de 1,5% sur les transactions.',
          'Abonnement mensuel (Basic: 3 000 XAF, Pro: 15 000 XAF, Enterprise: sur devis). Revenus publicitaires ciblés.',
          'Commission sur chaque transaction (2-5%), frais d\'inscription pour les vendeurs premium, partenariats B2B.',
        ],
      },
      {
        questionKey: 'sales_channels',
        suggestions: [
          'Marketing digital (Facebook, WhatsApp Business, TikTok), agents commerciaux terrain dans les marchés, Google Play Store.',
          'Partenariats avec les coopératives de commerçants, bouche-à-oreille via groupes WhatsApp, présence salons tech (ACTIVSPACES).',
          'Distribution via réseau d\'agents MTN/Orange Money, publicité radio FM locale, influenceurs digitaux camerounais.',
        ],
      },
      {
        questionKey: 'key_partners',
        suggestions: [
          'MTN Cameroun (API MoMo), Orange Cameroun (Orange Money), hébergeurs cloud (AWS, Azure, Google Cloud).',
          'Incubateurs locaux (ActivSpaces, Silicon Mountain), MINPMEESA (Ministère PME), banques partenaires (Afriland First Bank).',
          'Fournisseurs de paiement (Flutterwave, CinetPay), operateurs télécom, ONG d\'inclusion digitale.',
        ],
      },
      {
        questionKey: 'monthly_costs',
        suggestions: [
          'Salaires: 2 500 000 XAF (3 développeurs + 1 commercial), Infrastructure cloud: 150 000 XAF, Marketing digital: 300 000 XAF, Loyer bureau: 200 000 XAF.',
          'Salaires: 1 200 000 XAF (équipe 2 personnes), Serveurs/API: 80 000 XAF, Marketing: 200 000 XAF, Déplacements: 100 000 XAF.',
          'Salaires: 4 000 000 XAF (équipe 5), Cloud AWS: 250 000 XAF, Marketing: 500 000 XAF, Loyer Douala: 350 000 XAF, Divers: 200 000 XAF.',
        ],
      },
    ],
    SN: [
      {
        questionKey: 'problem_solved',
        suggestions: [
          'Les commerçants du marché Sandaga et de Touba n\'ont pas d\'outil simple pour suivre leurs stocks et ventes quotidiennes.',
          'Le secteur informel sénégalais (90% de l\'économie) n\'a pas accès aux financements faute de traçabilité des transactions.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'Commerçants et artisans de Dakar, Thiès et Touba (250 000+ micro-entrepreneurs). Utilisateurs de Wave et Orange Money.',
          'Diaspora sénégalaise en Europe (400 000 personnes) effectuant des transferts d\'argent mensuels.',
        ],
      },
      {
        questionKey: 'key_partners',
        suggestions: [
          'Wave, Orange Money Sénégal, Sonatel, DER (Délégation à l\'Entrepreneuriat Rapide), CTIC Dakar.',
          'BCEAO, microfinances locales (PAMECAS), incubateurs (CTIC, Jokkolabs), universités (UCAD, ISM).',
        ],
      },
    ],
    CI: [
      {
        questionKey: 'problem_solved',
        suggestions: [
          'Les agriculteurs ivoiriens de cacao et de café perdent 20-30% de marge face aux intermédiaires qui fixent les prix.',
          'Les jeunes diplômés d\'Abidjan peinent à trouver des emplois qualifiés faute de plateforme de mise en relation fiable.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'Producteurs de cacao et café des régions de San-Pédro, Soubré et Man (800 000 exploitants familiaux).',
          'Jeunes diplômés 22-35 ans d\'Abidjan et des villes secondaires, utilisateurs smartphones Android.',
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
        questionKey: 'problem_solved',
        suggestions: [
          'Les petits producteurs agricoles perdent jusqu\'à 40% de leurs récoltes post-récolte faute de moyens de stockage, de conservation et de transformation locaux.',
          'L\'accès aux intrants agricoles de qualité (semences certifiées, engrais) est limité et coûteux pour les exploitants ruraux.',
          'Les agriculteurs n\'ont pas de visibilité sur les prix du marché en temps réel et vendent à perte aux intermédiaires.',
        ],
      },
      {
        questionKey: 'solution',
        suggestions: [
          'Réseau de centres de collecte et de stockage réfrigéré dans les zones rurales du Centre et de l\'Ouest Cameroun, avec application de suivi.',
          'Plateforme de mise en relation directe producteurs-acheteurs avec prix transparents et logistique intégrée (camions réfrigérés).',
          'Coopérative d\'achat groupé d\'intrants avec financement par Mobile Money et livraison en zones rurales.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'Petits agriculteurs (< 5 hectares) des régions du Centre, Ouest et Nord-Ouest Cameroun (2,5 millions d\'exploitants).',
          'Acheteurs grossistes des marchés de Douala (Marché Central, New Deido), exportateurs cacao/café, restaurants et hôtels.',
          'Coopératives agricoles enregistrées au MINADER, GIC (Groupes d\'Initiative Commune), agriculteurs connectés smartphone.',
        ],
      },
      {
        questionKey: 'revenue_model',
        suggestions: [
          'Commission de 5-8% sur chaque transaction facilitée + frais de stockage (500 XAF/kg/semaine) + services à valeur ajoutée (certification qualité).',
          'Abonnement coopérative: 25 000 XAF/mois (accès plateforme + suivi prix). Marge sur achat groupé d\'intrants: 10-15%.',
          'Marge commerciale sur transformation primaire (15-25%), vente directe aux supermarchés et exportateurs avec contrats annuels.',
        ],
      },
      {
        questionKey: 'key_partners',
        suggestions: [
          'MINADER (Ministère de l\'Agriculture), IRAD (Institut de Recherche Agricole), coopératives cacaoyères, ONCC.',
          'MTN Mobile Money, transporteurs locaux, IITA (Institut International d\'Agriculture Tropicale), FAO Cameroun.',
          'Exportateurs certifiés (Cargill, Barry Callebaut pour le cacao), marchés de gros, Afriland First Bank (crédit agricole).',
        ],
      },
      {
        questionKey: 'monthly_costs',
        suggestions: [
          'Personnel (5 agents terrain + 1 gestionnaire): 1 500 000 XAF, Location entrepôt: 200 000 XAF, Transport: 400 000 XAF, Énergie (froid): 250 000 XAF.',
          'Salaires: 800 000 XAF, Achat intrants: variable, Logistique: 300 000 XAF, Communication (crédit tel + marketing): 150 000 XAF.',
        ],
      },
    ],
  },

  // ============================
  // AGRO-ALIMENTAIRE
  // ============================
  AGRO_ALIMENTAIRE: {
    CM: [
      {
        questionKey: 'problem_solved',
        suggestions: [
          'Les consommateurs urbains manquent de produits alimentaires locaux transformés, de qualité et à prix abordable (jus, farines, condiments).',
          'Les matières premières locales (manioc, plantain, arachide) sont sous-valorisées : 70% sont exportées brutes sans transformation.',
          'L\'absence de normes d\'hygiène et de traçabilité dans les circuits informels crée un problème de confiance des consommateurs.',
        ],
      },
      {
        questionKey: 'solution',
        suggestions: [
          'Unité semi-industrielle de transformation et conditionnement de produits locaux (farine de manioc, chips de plantain, pâte d\'arachide) avec certification ANOR.',
          'Marque premium de jus naturels et smoothies locaux (gingembre-citron, baobab, mangue) avec packaging moderne et distribution en supermarchés.',
          'Plateforme de commande en ligne de plats traditionnels camerounais préparés dans une cuisine certifiée HACCP.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'Ménages urbains des classes moyennes de Douala et Yaoundé (revenu > 150 000 XAF/mois), consommateurs supermarchés (Dovv, Santa Lucia, Carrefour).',
          'Diaspora camerounaise en France et en Europe (300 000 personnes) recherchant des produits du terroir.',
          'Restaurants, hôtels et traiteurs de Douala (1 500+ établissements), cantines scolaires et d\'entreprise.',
        ],
      },
      {
        questionKey: 'key_partners',
        suggestions: [
          'ANOR (Agence des Normes et de la Qualité), coopératives de producteurs, distributeurs (Dovv, Santa Lucia), transporteurs frigorifiques.',
          'Laboratoires d\'analyse alimentaire (Pasteur Cameroun), CICC, packaging providers locaux, banques (Société Générale Cameroun).',
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
        questionKey: 'problem_solved',
        suggestions: [
          'Les PME camerounaises n\'ont pas accès à des services de conseil stratégique, comptabilité et juridique abordables et de qualité.',
          'Le manque de compétences digitales dans les entreprises traditionnelles freine la transformation numérique du tissu économique.',
          'Les freelancers et consultants peinent à trouver des missions régulières et les entreprises manquent de talents qualifiés à temps partiel.',
        ],
      },
      {
        questionKey: 'solution',
        suggestions: [
          'Cabinet de conseil tout-en-un pour PME : comptabilité, fiscalité, création d\'entreprise, avec offres packagées accessibles.',
          'Programme de formation professionnelle certifiante en compétences digitales (marketing digital, data, développement web) adapté au marché local.',
          'Plateforme de mise en relation entre freelancers qualifiés et entreprises, avec gestion de contrats et paiement sécurisé.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'PME formelles et informelles de Douala et Yaoundé (200 000+ entreprises), entrepreneurs en phase de création.',
          'Professionnels en activité et étudiants 20-40 ans recherchant des compétences numériques employables.',
          'Multinationales et grandes entreprises camerounaises cherchant des consultants spécialisés pour des missions ponctuelles.',
        ],
      },
      {
        questionKey: 'revenue_model',
        suggestions: [
          'Forfaits mensuels : Starter (50 000 XAF), Business (150 000 XAF), Premium (350 000 XAF). Honoraires ponctuels sur création d\'entreprise.',
          'Formation : 75 000-250 000 XAF par module (20h). Certifications professionnelles : 150 000 XAF. Parcours complet : 500 000 XAF.',
          'Commission 15% sur chaque mission freelance facilitée + abonnement premium entreprise (100 000 XAF/mois).',
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
        questionKey: 'problem_solved',
        suggestions: [
          'Les consommateurs de Douala et Yaoundé doivent se déplacer physiquement dans plusieurs marchés pour trouver les meilleurs prix.',
          'Les commerçants du marché Mokolo ou Mboppi n\'ont aucune présence en ligne et perdent des clients face aux plateformes étrangères.',
          'L\'import de produits (électronique, vêtements, cosmétiques) depuis la Chine et Dubaï est complexe, opaque et risqué pour les petits commerçants.',
        ],
      },
      {
        questionKey: 'solution',
        suggestions: [
          'Application marketplace locale type "Jumia killer" avec livraison dernière kilomètre par réseau de livreurs moto.',
          'Service d\'import groupé et sécurisé depuis la Chine/Dubaï avec pré-inspection qualité, dédouanement et livraison entrepôt.',
          'Réseau de boutiques physiques + e-commerce spécialisé (cosmétiques africains, mode locale) avec click-and-collect.',
        ],
      },
      {
        questionKey: 'target_market',
        suggestions: [
          'Consommateurs urbains 18-45 ans de Douala et Yaoundé utilisant smartphones (3 millions de mobinautes actifs).',
          'Commerçants revendeurs des marchés centraux cherchant à s\'approvisionner à meilleur prix (50 000+ revendeurs).',
          'Femmes actives 25-50 ans, consommatrices de cosmétiques et mode, suivant les tendances via Instagram et TikTok.',
        ],
      },
    ],
  },
};

// Fallback suggestions for countries not specifically mapped
const GENERIC_SUGGESTIONS: SectorSuggestion[] = [
  {
    questionKey: 'revenue_model',
    suggestions: [
      'Modèle freemium avec conversion vers abonnement payant mensuel.',
      'Commission sur transactions (2-8%) avec volume minimum garanti.',
      'Vente directe + services premium sur abonnement mensuel.',
    ],
  },
  {
    questionKey: 'sales_channels',
    suggestions: [
      'Réseaux sociaux (Facebook, WhatsApp, Instagram), agents commerciaux terrain, bouche-à-oreille.',
      'Google Play / App Store, partenariats avec associations professionnelles, salons et foires.',
      'Site web + SEO local, publicité radio, partenariats avec opérateurs télécoms.',
    ],
  },
];

// ============================================
// GET SUGGESTIONS FOR A GIVEN CONTEXT
// ============================================

export function getSuggestionsForField(
  sector: string,
  country: string,
  questionKey: string
): string[] {
  // Try sector + country specific
  const sectorData = SECTOR_SUGGESTIONS[sector];
  if (sectorData) {
    const countryData = sectorData[country];
    if (countryData) {
      const fieldSugg = countryData.find(s => s.questionKey === questionKey);
      if (fieldSugg) return fieldSugg.suggestions;
    }
    // Try sector with CM as default if country not found
    const defaultCountry = sectorData['CM'];
    if (defaultCountry) {
      const fieldSugg = defaultCountry.find(s => s.questionKey === questionKey);
      if (fieldSugg) return fieldSugg.suggestions;
    }
  }

  // Try generic
  const generic = GENERIC_SUGGESTIONS.find(s => s.questionKey === questionKey);
  if (generic) return generic.suggestions;

  return [];
}

// ============================================
// SUGGESTION CHIPS COMPONENT
// ============================================

interface SmartSuggestionsProps {
  sector: string;
  country: string;
  questionKey: string;
  onSelect: (suggestion: string) => void;
  currentValue?: string;
}

export function SmartSuggestions({
  sector,
  country,
  questionKey,
  onSelect,
  currentValue,
}: SmartSuggestionsProps) {
  const [expanded, setExpanded] = useState(false);
  const suggestions = getSuggestionsForField(sector, country, questionKey);

  if (suggestions.length === 0) return null;

  const displaySuggestions = expanded ? suggestions : suggestions.slice(0, 2);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-amber-500" />
        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Suggestions intelligentes
        </span>
      </div>
      <div className="space-y-1.5">
        {displaySuggestions.map((suggestion, idx) => {
          const isSelected = currentValue?.includes(suggestion);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(suggestion)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs leading-relaxed transition-all duration-200 border ${
                isSelected
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-muted/30 border-transparent hover:bg-muted/60 hover:border-muted-foreground/20 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-start gap-2">
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <span>{suggestion}</span>
              </div>
            </button>
          );
        })}
      </div>
      {suggestions.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Moins de suggestions
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              +{suggestions.length - 2} suggestion{suggestions.length - 2 > 1 ? 's' : ''}
            </>
          )}
        </button>
      )}
    </div>
  );
}
