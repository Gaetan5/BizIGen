'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  Sparkles,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  ShieldCheck,
  Rocket,
  Award,
  Layers,
  BarChart3,
  Globe2,
  Share2,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';

export interface PitchDeckProps {
  projectName: string;
  sector: string;
  country?: string;
  bmcData?: any;
  businessPlanData?: any;
}

interface Slide {
  id: number;
  title: string;
  category: string;
  icon: any;
  color: string;
  headline: string;
  bulletPoints: string[];
  metricLabel?: string;
  metricValue?: string;
  keyTakeaway: string;
}

export function PitchDeckGenerator({
  projectName,
  sector,
  country = 'Cameroun / Zone CEMAC',
  bmcData,
  businessPlanData,
}: PitchDeckProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');

  // Extraction intelligente des données du projet ou valeurs par défaut riches
  const slides: Slide[] = useMemo(() => {
    const pName = projectName || 'Mon Projet Innovant';
    const pSector = sector || 'Technologie & Services';
    const problem = businessPlanData?.executiveSummary?.problem || 
      bmcData?.problem || 'Difficulté d\'accès aux services essentiels et inefficacité des processus manuels sur le marché local.';
    const solution = businessPlanData?.executiveSummary?.solution || 
      bmcData?.solution || 'Plateforme digitale unifiée, rapide, abordable et opérable en environnement connecté ou déconnecté.';
    const valueProp = bmcData?.valuePropositions || 'Gain de productivité de 40% et réduction drastique des coûts opérationnels.';
    const target = bmcData?.customerSegments || 'PME, micro-entrepreneurs et consommateurs de la classe moyenne urbaine.';
    const revenue = bmcData?.revenueStreams || 'Abonnements récurrents SaaS (B2B), commissions par transaction et services à valeur ajoutée.';

    return [
      {
        id: 1,
        title: 'Pitch Deck & Vision',
        category: 'Introduction',
        icon: Rocket,
        color: 'from-blue-600 to-indigo-700',
        headline: pName,
        bulletPoints: [
          `Projet stratégique dans le secteur : ${pSector}`,
          `Marché cible prioritaire : ${country}`,
          'Transformer un besoin criant en opportunité de croissance durable',
          'Présentation investisseurs & partenaires stratégiques'
        ],
        metricLabel: 'Stade de développement',
        metricValue: 'Amorçage / Seed',
        keyTakeaway: `${pName} redéfinit les standards de performance dans le secteur ${pSector}.`
      },
      {
        id: 2,
        title: 'Le Problème & La Douleur Marché',
        category: 'Problème',
        icon: Target,
        color: 'from-rose-600 to-pink-700',
        headline: 'Un point de friction critique et non résolu',
        bulletPoints: [
          typeof problem === 'string' ? problem : 'Friction majeure sur les processus opérationnels existants',
          'Absence de solutions locales intégrées aux moyens de paiement mobile (Mobile Money)',
          'Coûts cachés élevés et perte de temps pour les professionnels et particuliers',
          '70% des acteurs locaux utilisent encore des outils archaïques non connectés'
        ],
        metricLabel: 'Taux d\'insatisfaction actuelle',
        metricValue: '78%',
        keyTakeaway: 'Les alternatives actuelles sont lentes, coûteuses et inadaptées aux réalités terrain.'
      },
      {
        id: 3,
        title: 'Notre Solution & Proposition de Valeur',
        category: 'Solution',
        icon: Sparkles,
        color: 'from-emerald-600 to-teal-700',
        headline: 'Une alternative moderne, ultra-rapide et éprouvée',
        bulletPoints: [
          typeof solution === 'string' ? solution : 'Plateforme technologique intuitive à haute disponibilité',
          typeof valueProp === 'string' ? valueProp : 'Simplicité d\'utilisation et retour sur investissement immédiat',
          'Prise en charge native des devises locales (FCFA / XAF) et paiements instantanés',
          'Accompagnement et support client disponible 24/7 en local'
        ],
        metricLabel: 'Gain d\'efficacité estimé',
        metricValue: '+45%',
        keyTakeaway: 'Une proposition de valeur claire qui supprime les irritants majeurs du secteur.'
      },
      {
        id: 4,
        title: 'Taille du Marché (TAM / SAM / SOM)',
        category: 'Opportunité Marché',
        icon: Globe2,
        color: 'from-violet-600 to-purple-700',
        headline: 'Un marché adressable en forte expansion',
        bulletPoints: [
          'TAM (Total Addressable Market) : Marché global Afrique francophone estimé à 120 Mrd XAF',
          'SAM (Serviceable Addressable Market) : Marché national & sous-région CEMAC estimé à 35 Mrd XAF',
          'SOM (Serviceable Obtainable Market) : Objectif à 3 ans de 3,5 Mrd XAF (10% de part de marché)',
          'Croissance annuelle du marché estimée à +18% par an portée par la digitalisation'
        ],
        metricLabel: 'Objectif SOM à 3 ans',
        metricValue: '3,5 Mrd XAF',
        keyTakeaway: 'Un vivier de croissance à deux chiffres avec de puissantes barrières à l\'entrée.'
      },
      {
        id: 5,
        title: 'Modèle Économique & Monétisation',
        category: 'Business Model',
        icon: DollarSign,
        color: 'from-amber-500 to-orange-600',
        headline: 'Des flux de revenus récurrents et scalables',
        bulletPoints: [
          typeof revenue === 'string' ? revenue : 'Modèle hybride abonnements mensuels / annuels et commissions transactionnelles',
          'Formules adaptées : Tiers Starter, Professionnel, et Entreprise personnalisée',
          'Marge brute ciblée supérieure à 65% grâce à l\'automatisation de la plateforme',
          'LTV (Valeur vie client) estimée à 4x le coût d\'acquisition client (CAC)'
        ],
        metricLabel: 'Marge brute prévisionnelle',
        metricValue: '> 68%',
        keyTakeaway: 'Une unité économique rentable dès les premières cohortes d\'utilisateurs.'
      },
      {
        id: 6,
        title: 'Stratégie Go-To-Market (Acquisition)',
        category: 'Distribution',
        icon: TrendingUp,
        color: 'from-cyan-600 to-blue-700',
        headline: 'Un canal d\'acquisition multi-leviers orienté conversion',
        bulletPoints: [
          'Partenariats stratégiques avec les fédérations professionnelles et distributeurs locaux',
          'Marketing digital de précision (Meta Ads, LinkedIn B2B, Référencement SEO & contenus sectoriels)',
          'Effet de réseau et parrainage incitatif : 10% de réduction par recommandation validée',
          'Équipe de vente terrain (B2B Enterprise) sur les capitales économiques'
        ],
        metricLabel: 'CAC moyen projeté',
        metricValue: '8 500 XAF',
        keyTakeaway: 'Mix équilibré entre viralité digitale et présence terrain auprès des décideurs.'
      },
      {
        id: 7,
        title: 'Paysage Concurrentiel & Avantage Défensif',
        category: 'Concurrence',
        icon: ShieldCheck,
        color: 'from-indigo-600 to-blue-800',
        headline: 'Notre Moat : Pourquoi nous gagnons face aux alternatives',
        bulletPoints: [
          'Acteurs traditionnels : Coûteux, lents et déconnectés des réalités de paiement mobile',
          'Nouveaux entrants : Manque de profondeur fonctionnelle et d\'ancrage réglementaire OHADA',
          'Notre avantage : Expérience utilisateur fluide, tarification en monnaie locale et scalabilité',
          'Barrière technologique : Moteurs de calculs et algorithmes exclusifs'
        ],
        metricLabel: 'Score de différenciation',
        metricValue: '9.2 / 10',
        keyTakeaway: 'Une position unique combinant technologie de pointe et adéquation culturelle locale.'
      },
      {
        id: 8,
        title: 'Trajectoire Financière & Projections 3 Ans',
        category: 'Finances',
        icon: BarChart3,
        color: 'from-teal-600 to-emerald-700',
        headline: 'Rentabilité et seuil d\'équilibre rapide',
        bulletPoints: [
          'Année 1 : 45 000 000 XAF de CA — Phase d\'amorçage et pénétration marché',
          'Année 2 : 140 000 000 XAF de CA — Déploiement grand compte et accélération',
          'Année 3 : 380 000 000 XAF de CA — Expansion sous-régionale CEMAC / CEDEAO',
          'Point mort (Break-even) atteint dès le mois 14 d\'exploitation commerciale'
        ],
        metricLabel: 'Seuil de rentabilité',
        metricValue: 'Mois 14',
        keyTakeaway: 'Structure de coûts maîtrisée permettant un levier opérationnel rapide.'
      },
      {
        id: 9,
        title: 'Traction, Preuves & Jalons Réalisés',
        category: 'Traction',
        icon: Award,
        color: 'from-fuchsia-600 to-purple-800',
        headline: 'Une exécution rigoureuse déjà enclenchée',
        bulletPoints: [
          'Validation du concept auprès de plus de 40 prospects qualifiés en pré-lancement',
          'Architecture produit développée et testée en environnement de pré-production',
          'Conformité stricte avec les normes juridiques et comptables locales (OHADA)',
          'Partenariats de distribution et API bancaires/télécoms en phase de cadrage'
        ],
        metricLabel: 'Taux d\'engagement pilote',
        metricValue: '84%',
        keyTakeaway: 'La phase de validation conceptuelle a confirmé un fort intérêt des utilisateurs.'
      },
      {
        id: 10,
        title: 'L\'Équipe Fondatrice & Expertise Clé',
        category: 'Équipe',
        icon: Users,
        color: 'from-sky-600 to-cyan-800',
        headline: 'Une équipe complémentaire, agile et passionnée',
        bulletPoints: [
          'Direction Générale & Stratégie : Expérience solide en entrepreneuriat et développement commercial',
          'Direction Technique & Produit : Ingénierie logicielle senior, cloud et sécurité des données',
          'Expertise Métier & Finance : Connaissance approfondie du secteur cible et de l\'écosystème local',
          'Comité consultatif (Advisory Board) composé de mentors réputés de l\'écosystème tech/business'
        ],
        metricLabel: 'Complémentarité équipe',
        metricValue: '100%',
        keyTakeaway: 'La bonne équipe pour exécuter cette vision avec vélocité et discipline.'
      },
      {
        id: 11,
        title: 'Besoins de Financement & Utilisation des Fonds',
        category: 'Levée de Fonds',
        icon: DollarSign,
        color: 'from-amber-600 to-red-600',
        headline: 'Recherche de partenaires financiers pour accélérer',
        bulletPoints: [
          'Montant recherché : 50 000 000 XAF (ou équivalent ~76 000 EUR)',
          '40% — R&D Produit, renforcement des infrastructures et IA prédictive',
          '35% — Acquisition client, campagnes marketing et déploiement commercial',
          '15% — Recrutements stratégiques (développeurs, business developers terrain)',
          '10% — Fonds de roulement, conformité juridique et sécurité'
        ],
        metricLabel: 'Ticket recherché',
        metricValue: '50M XAF',
        keyTakeaway: 'Ce financement garantit 18 mois d\'autonomie financière jusqu\'à la profitabilité.'
      },
      {
        id: 12,
        title: 'Vision à 5 Ans & Contact Partenaires',
        category: 'Clôture & Appel à l\'Action',
        icon: Presentation,
        color: 'from-blue-700 to-indigo-900',
        headline: 'Bâtissons ensemble le leader de demain',
        bulletPoints: [
          'Devenir la solution de référence pour plus de 25 000 utilisateurs actifs d\'ici 5 ans',
          'Extension dans 4 pays d\'Afrique Centrale et de l\'Ouest',
          'Opportunité de créer un impact économique mesurable sur le tissu entrepreneurial',
          'Contactez l\'équipe pour consulter la data room complète et planifier une démo'
        ],
        metricLabel: 'Prochaine étape',
        metricValue: 'Entrée au capital',
        keyTakeaway: 'Rejoignez une aventure à fort impact financier, technologique et humain.'
      }
    ];
  }, [projectName, sector, country, bmcData, businessPlanData]);

  const currentSlide = slides[currentSlideIndex];

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-y-auto' : ''}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">Pitch Deck Investisseurs (12 Slides)</h2>
              <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-200">
                Format Standard VC / BA
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Présentation condensée et percutante prête à être pitchée ou exportée
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'slide' ? 'grid' : 'slide')}
            className="text-xs h-8"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            {viewMode === 'slide' ? 'Vue Grille' : 'Vue Slide'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-8"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Imprimer / PDF
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-xs h-8"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Slide Navigation Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Slide {currentSlideIndex + 1} sur {slides.length} : <strong>{currentSlide.title}</strong></span>
          <span>{Math.round(((currentSlideIndex + 1) / slides.length) * 100)}%</span>
        </div>
        <Progress value={((currentSlideIndex + 1) / slides.length) * 100} className="h-1.5" />
      </div>

      {viewMode === 'slide' ? (
        /* SINGLE SLIDE CAROUSEL VIEW */
        <div className="relative">
          <Card className="overflow-hidden border-2 shadow-xl min-h-120 flex flex-col justify-between transition-all duration-300">
            {/* Top Slide Banner */}
            <div className={`p-6 bg-linear-to-r ${currentSlide.color} text-white flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <currentSlide.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-85">
                      Slide {currentSlide.id} • {currentSlide.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{currentSlide.title}</h3>
                </div>
              </div>

              {currentSlide.metricValue && (
                <div className="hidden sm:flex flex-col items-end bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">
                    {currentSlide.metricLabel}
                  </span>
                  <span className="text-xl font-black">{currentSlide.metricValue}</span>
                </div>
              )}
            </div>

            {/* Slide Body */}
            <CardContent className="p-8 flex-1 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-xl font-bold text-foreground mb-4 leading-snug">
                  {currentSlide.headline}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSlide.bulletPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm font-medium leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Takeaway Footer Box */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs sm:text-sm font-semibold text-primary">
                  <strong>Message Clé :</strong> {currentSlide.keyTakeaway}
                </p>
              </div>
            </CardContent>

            {/* Footer Navigation bar */}
            <div className="p-4 bg-muted/30 border-t flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentSlideIndex === 0}
                className="gap-1.5 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédente
              </Button>

              {/* Slide dots */}
              <div className="hidden md:flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      i === currentSlideIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                    }`}
                    title={`Aller à la slide ${i + 1}`}
                  />
                ))}
              </div>

              <Button
                variant={currentSlideIndex === slides.length - 1 ? 'default' : 'outline'}
                size="sm"
                onClick={handleNext}
                disabled={currentSlideIndex === slides.length - 1}
                className="gap-1.5 text-xs"
              >
                Suivante
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* GRID OVERVIEW (ALL 12 SLIDES) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide, idx) => (
            <Card
              key={slide.id}
              onClick={() => {
                setCurrentSlideIndex(idx);
                setViewMode('slide');
              }}
              className="cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden group"
            >
              <div className={`p-4 bg-linear-to-r ${slide.color} text-white flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <slide.icon className="w-4 h-4 opacity-90" />
                  <span className="text-xs font-bold uppercase tracking-wider">Slide {slide.id}</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-white border-white/30 bg-white/10">
                  {slide.category}
                </Badge>
              </div>

              <CardContent className="p-4 flex-1 space-y-3">
                <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {slide.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {slide.headline}
                </p>
                <div className="text-[11px] font-medium text-primary bg-primary/5 p-2 rounded-lg border border-primary/10 line-clamp-2">
                  {slide.keyTakeaway}
                </div>
              </CardContent>

              <div className="p-3 bg-muted/20 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>{slide.bulletPoints.length} points clés</span>
                <span className="font-semibold text-primary group-hover:underline">Ouvrir &rarr;</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
