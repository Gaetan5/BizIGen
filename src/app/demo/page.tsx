'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  FileText, 
  Target, 
  Zap,
  Loader2,
  CheckCircle2,
  Lightbulb,
  Users,
  Building2,
  Globe,
  Clock,
  Rocket,
  Download,
  Eye,
  ArrowLeft,
  Check,
  Star,
  TrendingUp,
  Heart,
  Handshake,
  Truck,
  DollarSign,
  Settings,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

// BMC Canvas data structure
interface BMCData {
  keyPartners: string[];
  keyActivities: string[];
  keyResources: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

// Lean Canvas data structure
interface LeanData {
  problem: string[];
  solution: string[]
  uniqueValueProposition: string;
  unfairAdvantage: string;
  customerSegments: string[];
  channels: string[];
  keyMetrics: string[];
  costStructure: string[];
  revenueStreams: string[];
}

// PDF Export Modal State
interface ExportModal {
  isOpen: boolean;
  type: 'pdf' | 'png' | 'docx';
  isGenerating: boolean;
  progress: number;
}

export default function DemoPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCanvas, setShowCanvas] = useState(false);
  const [bmcData, setBmcData] = useState<BMCData | null>(null);
  const [leanData, setLeanData] = useState<LeanData | null>(null);
  const [exportModal, setExportModal] = useState<ExportModal>({ isOpen: false, type: 'pdf', isGenerating: false, progress: 0 });
  
  // Form state
  const [projectName, setProjectName] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');
  const [targetMarket, setTargetMarket] = useState('');

  // Get typing text based on progress
  const getTypingText = (progressValue: number) => {
    const texts = [
      'Analyse du secteur...',
      'Identification des segments clients...',
      'Génération des propositions de valeur...',
      'Définition des canaux de distribution...',
      'Calcul de la structure de coûts...',
      'Finalisation du Business Model Canvas...'
    ];
    const currentIndex = Math.floor(progressValue / 20);
    return currentIndex < texts.length ? texts[currentIndex] : texts[texts.length - 1];
  };

  const handleGenerate = async () => {
    setStep(2);
    setIsLoading(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate BMC data based on inputs
    const generatedBMC = generateBMCData(projectName, sector, targetMarket, description);
    setBmcData(generatedBMC);
    
    // Generate Lean Canvas data
    const generatedLean = generateLeanData(projectName, sector, targetMarket);
    setLeanData(generatedLean);
    
    setIsLoading(false);
    setTimeout(() => {
      setShowCanvas(true);
      setStep(3);
    }, 500);
  };

  const generateBMCData = (
    name: string, 
    sectorValue: string, 
    market: string, 
    desc: string
  ): BMCData => {
    const sectorData: Record<string, BMCData> = {
      tech: {
        keyPartners: ['Fournisseurs cloud (AWS, GCP)', 'Intégrateurs API', 'Partenaires technologiques', 'Incubateurs/Accélérateurs'],
        keyActivities: ['Développement produit', 'R&D continue', 'Support client', 'Marketing digital'],
        keyResources: ['Équipe technique', 'Infrastructure cloud', 'Propriété intellectuelle', 'Base de données clients'],
        valuePropositions: ['Solution SaaS innovative', 'Gain de productivité', 'Accessibilité 24/7', 'Support réactif'],
        customerRelationships: ['Support en ligne', 'Documentation complète', 'Communauté utilisateurs', 'Onboarding personnalisé'],
        channels: ['Site web', 'App stores', 'Réseaux sociaux', 'Partenariats'],
        customerSegments: [market || 'PME technologiques', 'Startups', 'Grands comptes', 'Freelances'],
        costStructure: ['Infrastructure cloud', 'Salaires équipe', 'Marketing', 'R&D'],
        revenueStreams: ['Abonnements mensuels', 'Plans annuels', 'Services premium', 'API Enterprise']
      },
      agriculture: {
        keyPartners: ['Coopératives agricoles', 'Fournisseurs d\'intrants', 'ONG agricoles', 'Institutions financières'],
        keyActivities: ['Production agricole', 'Transformation', 'Distribution', 'Formation des producteurs'],
        keyResources: ['Terres agricoles', 'Équipements', 'Main d\'œuvre qualifiée', 'Réseau de distribution'],
        valuePropositions: ['Produits de qualité', 'Traçabilité garantie', 'Prix équitables', 'Approvisionnement fiable'],
        customerRelationships: ['Relation directe', 'Suivi qualité', 'Formation continue', 'Support technique'],
        channels: ['Marchés locaux', 'Supermarchés', 'Export', 'Vente directe'],
        customerSegments: [market || 'Consommateurs locaux', 'Restaurants', 'Hôtels', 'Exportateurs'],
        costStructure: ['Intrants agricoles', 'Main d\'œuvre', 'Transport', 'Transformation'],
        revenueStreams: ['Vente de produits', 'Services de formation', 'Certification bio', 'Export']
      },
      ecommerce: {
        keyPartners: ['Fournisseurs produits', 'Services de livraison', 'Plateformes paiement', 'Influenceurs'],
        keyActivities: ['Gestion catalogue', 'Marketing digital', 'Service client', 'Logistique'],
        keyResources: ['Plateforme e-commerce', 'Stocks', 'Équipe logistique', 'Base clients'],
        valuePropositions: ['Large choix de produits', 'Livraison rapide', 'Prix compétitifs', 'Paiement sécurisé'],
        customerRelationships: ['Chat support', 'Programme fidélité', 'Newsletter', 'Réseaux sociaux'],
        channels: ['Site web', 'Application mobile', 'Marketplace', 'Réseaux sociaux'],
        customerSegments: [market || 'Acheteurs en ligne', 'Jeunes adultes', 'Familles', 'Entreprises'],
        costStructure: ['Achat marchandises', 'Marketing', 'Logistique', 'Plateforme'],
        revenueStreams: ['Vente de produits', 'Livraison', 'Abonnement premium', 'Publicité']
      },
      fintech: {
        keyPartners: ['Banques partenaires', 'Régulateurs', 'Fournisseurs API', 'Investisseurs'],
        keyActivities: ['Développement plateforme', 'Conformité réglementaire', 'Acquisition clients', 'Gestion des risques'],
        keyResources: ['Licence réglementaire', 'Technologie sécurisée', 'Partenariats bancaires', 'Data clients'],
        valuePropositions: ['Services financiers accessibles', 'Transactions rapides', 'Frais réduits', 'Sécurité renforcée'],
        customerRelationships: ['Support 24/7', 'Chatbot intelligent', 'Conseiller dédié', 'Communauté'],
        channels: ['Application mobile', 'Site web', 'API intégration', 'Partenaires'],
        customerSegments: [market || 'Non-bancarisés', 'PME', 'Jeunes professionnels', 'Diaspora'],
        costStructure: ['Infrastructure IT', 'Conformité', 'Support client', 'Marketing'],
        revenueStreams: ['Frais de transaction', 'Abonnements', 'Intérêts', 'Services premium']
      },
      health: {
        keyPartners: ['Hôpitaux', 'Laboratoires', 'Assurances santé', 'Médecins partenaires'],
        keyActivities: ['Soins patients', 'Recherche médicale', 'Prévention', 'Formation continue'],
        keyResources: ['Personnel médical', 'Équipements médicaux', 'Dossiers patients', 'Certifications'],
        valuePropositions: ['Soins de qualité', 'Accessibilité', 'Suivi personnalisé', 'Technologie médicale'],
        customerRelationships: ['Suivi patient', 'Téléconsultation', 'Dossiers numériques', 'Programmes de prévention'],
        channels: ['Cliniques', 'Plateforme en ligne', 'Téléphone', 'Partenaires'],
        customerSegments: [market || 'Patients', 'Entreprises', 'Assurances', 'Familles'],
        costStructure: ['Personnel', 'Équipements', 'Locaux', 'Consommables médicaux'],
        revenueStreams: ['Consultations', 'Soins', 'Abonnements', 'Partenariats entreprises']
      },
      education: {
        keyPartners: ['Écoles partenaires', 'Formateurs', 'Éditeurs', 'Entreprises'],
        keyActivities: ['Création de contenu', 'Formation', 'Certification', 'Support apprenants'],
        keyResources: ['Plateforme LMS', 'Contenu pédagogique', 'Formateurs', 'Certifications'],
        valuePropositions: ['Formation de qualité', 'Flexibilité', 'Certifications reconnues', 'Prix accessibles'],
        customerRelationships: ['Tutorat', 'Communauté apprenants', 'Suivi de progression', 'Support'],
        channels: ['Plateforme en ligne', 'Applications', 'Partenaires', 'Réseaux sociaux'],
        customerSegments: [market || 'Étudiants', 'Professionnels', 'Entreprises', 'Demandeurs d\'emploi'],
        costStructure: ['Développement contenu', 'Plateforme', 'Formateurs', 'Marketing'],
        revenueStreams: ['Abonnements', 'Formations certifiantes', 'B2B', 'Premium']
      },
      services: {
        keyPartners: ['Clients entreprises', 'Sous-traitants', 'Fournisseurs', 'Partenaires techniques'],
        keyActivities: ['Prestation de services', 'Gestion de projets', 'Relation client', 'Développement business'],
        keyResources: ['Personnel qualifié', 'Outils métier', 'Réseau clients', 'Expertise métier'],
        valuePropositions: ['Expertise pointue', 'Réactivité', 'Solutions sur mesure', 'Accompagnement'],
        customerRelationships: ['Contact direct', 'Suivi projets', 'Support dédié', 'Conseil'],
        channels: ['Réseau professionnel', 'Site web', 'Recommandations', 'Appels d\'offres'],
        customerSegments: [market || 'PME', 'Grandes entreprises', 'Particuliers', 'Institutions'],
        costStructure: ['Salaires', 'Outils', 'Formation', 'Marketing'],
        revenueStreams: ['Honoraires', 'Forfaits', 'Abonnements', 'Projets']
      },
      logistics: {
        keyPartners: ['Transporteurs', 'Entrepôts', 'Douanes', 'Clients réguliers'],
        keyActivities: ['Transport', 'Stockage', 'Distribution', 'Suivi des expéditions'],
        keyResources: ['Flotte de véhicules', 'Entrepôts', 'Système de suivi', 'Personnel logistique'],
        valuePropositions: ['Livraison rapide', 'Traçabilité', 'Fiabilité', 'Coûts optimisés'],
        customerRelationships: ['Suivi en temps réel', 'Support 24/7', 'Compte dédié', 'Portail client'],
        channels: ['Force commerciale', 'Site web', 'Marketplace', 'Partenaires'],
        customerSegments: [market || 'E-commerçants', 'Entreprises', 'Diaspora', 'Import/Export'],
        costStructure: ['Carburant', 'Maintenance', 'Personnel', 'Entrepôts'],
        revenueStreams: ['Frais de livraison', 'Stockage', 'Services express', 'Contrats annuels']
      }
    };

    return sectorData[sectorValue] || sectorData.tech;
  };

  const generateLeanData = (name: string, sectorValue: string, market: string): LeanData => {
    const leanBySector: Record<string, LeanData> = {
      tech: {
        problem: ['Temps perdu en tâches manuelles', 'Solutions existantes trop complexes', 'Coûts élevés des outils actuels', 'Manque de solutions locales'],
        solution: ['Automatisation intelligente', 'Interface intuitive', 'Prix accessible', 'Support en français'],
        uniqueValueProposition: 'La première solution SaaS adaptée aux PME africaines',
        unfairAdvantage: 'Expertise locale et support en français 24/7',
        customerSegments: [market || 'PME tech', 'Startups', 'Freelances'],
        channels: ['Site web', 'App Store', 'Partenariats'],
        keyMetrics: ['Utilisateurs actifs/jour', 'Taux de rétention', 'NPS Score', 'ARR'],
        costStructure: ['Infrastructure', 'Marketing', 'Support'],
        revenueStreams: ['Abonnements', 'Premium', 'API Enterprise']
      },
      agriculture: {
        problem: ['Faible productivité', 'Accès limité aux marchés', 'Prix non rémunérateurs', 'Manque de formation'],
        solution: ['Formation technique', 'Accès aux marchés', 'Certification qualité', 'Financement intégré'],
        uniqueValueProposition: 'Plateforme complète pour les agriculteurs africains',
        unfairAdvantage: 'Réseau de coopératives établi et partenaires financiers',
        customerSegments: [market || 'Petits agriculteurs', 'Coopératives', 'Exportateurs'],
        channels: ['Agents terrain', 'SMS/USSD', 'Marchés locaux'],
        keyMetrics: ['Surface cultivée', 'Volume vendu', 'Revenu/ménage', 'Adoption'],
        costStructure: ['Logistique', 'Formation', 'Plateforme'],
        revenueStreams: ['Commission', 'Abonnement', 'Services']
      },
      ecommerce: {
        problem: ['Livraison non fiable', 'Paiement complexe', 'Confiance limitée', 'SAV inexistant'],
        solution: ['Livraison trackée', 'Paiement Mobile Money', 'Avis clients', 'Support réactif'],
        uniqueValueProposition: 'E-commerce de confiance pour l\'Afrique francophone',
        unfairAdvantage: 'Intégration Mobile Money native et logistique optimisée',
        customerSegments: [market || 'Acheteurs en ligne', 'Diaspora', 'Entreprises'],
        channels: ['Site web', 'App', 'Réseaux sociaux'],
        keyMetrics: ['Commandes/jour', 'Panier moyen', 'Taux de retour', 'CAC'],
        costStructure: ['Stock', 'Livraison', 'Marketing'],
        revenueStreams: ['Marge produits', 'Livraison', 'Premium']
      },
      fintech: {
        problem: ['Non-bancarisation', 'Transferts coûteux', 'Accès crédit limité', 'Épargne difficile'],
        solution: ['Wallet digital', 'Transferts instantanés', 'Microcrédits', 'Épargne automatique'],
        uniqueValueProposition: 'Services financiers accessibles à tous en Afrique',
        unfairAdvantage: 'Licence réglementaire et partenariats bancaires établis',
        customerSegments: [market || 'Non-bancarisés', 'Diaspora', 'PME'],
        channels: ['App mobile', 'Agents', 'Partenaires'],
        keyMetrics: ['Utilisateurs actifs', 'Volume transactions', 'NPA', 'ARPU'],
        costStructure: ['Conformité', 'Infrastructure', 'Support'],
        revenueStreams: ['Frais transactions', 'Abonnements', 'Intérêts']
      },
      health: {
        problem: ['Accès soins limité', 'Files d\'attente longues', 'Dossiers médicaux perdus', 'Coûts imprévus'],
        solution: ['Téléconsultation', 'RDV en ligne', 'Dossier numérique', 'Assurance intégrée'],
        uniqueValueProposition: 'Santé accessible et organisée pour l\'Afrique',
        unfairAdvantage: 'Réseau de médecins partenaires et intégration assurances',
        customerSegments: [market || 'Patients', 'Entreprises', 'Assureurs'],
        channels: ['App', 'Cliniques', 'Assureurs'],
        keyMetrics: ['Consultations/mois', 'Satisfaction patient', 'Rétention', 'CAC'],
        costStructure: ['Médecins', 'Plateforme', 'Support'],
        revenueStreams: ['Consultations', 'Abonnements', 'B2B']
      },
      education: {
        problem: ['Éducation inégale', 'Coûts élevés', 'Manque de flexibilité', 'Contenu inadapté'],
        solution: ['Cours en ligne', 'Prix accessibles', 'Apprentissage flexible', 'Contenu localisé'],
        uniqueValueProposition: 'Formation professionnelle accessible en Afrique francophone',
        unfairAdvantage: 'Partenariats entreprises et certifications reconnues',
        customerSegments: [market || 'Étudiants', 'Professionnels', 'Entreprises'],
        channels: ['Plateforme', 'Partenaires', 'Réseaux'],
        keyMetrics: ['Apprenants actifs', 'Taux complétion', 'Satisfaction', 'LTV'],
        costStructure: ['Contenu', 'Plateforme', 'Formateurs'],
        revenueStreams: ['Abonnements', 'Certificats', 'B2B']
      },
      services: {
        problem: ['Qualité variable', 'Tarifs opaques', 'Délais non respectés', 'Suivi difficile'],
        solution: ['Qualité garantie', 'Devis transparents', 'Engagement délais', 'Suivi en temps réel'],
        uniqueValueProposition: 'Services professionnels fiables et transparents',
        unfairAdvantage: 'Équipe qualifiée et processus standardisés',
        customerSegments: [market || 'PME', 'Particuliers', 'Institutions'],
        channels: ['Site web', 'Références', 'Partenariats'],
        keyMetrics: ['Projets/mois', 'Satisfaction client', 'Références', 'Marge'],
        costStructure: ['Personnel', 'Outils', 'Marketing'],
        revenueStreams: ['Honoraires', 'Forfaits', 'Abonnements']
      },
      logistics: {
        problem: ['Livraison non fiable', 'Suivi inexistant', 'Coûts imprévus', 'Délais non respectés'],
        solution: ['Livraison trackée', 'GPS temps réel', 'Prix transparent', 'Engagement délais'],
        uniqueValueProposition: 'Logistique fiable et tracée pour l\'Afrique',
        unfairAdvantage: 'Flotte propre et technologie de tracking avancée',
        customerSegments: [market || 'E-commerçants', 'Entreprises', 'Importateurs'],
        channels: ['App', 'Site web', 'Partenaires'],
        keyMetrics: ['Livraisons/jour', 'Taux succès', 'Délai moyen', 'NPS'],
        costStructure: ['Carburant', 'Personnel', 'Maintenance'],
        revenueStreams: ['Livraison', 'Stockage', 'Express']
      }
    };

    return leanBySector[sectorValue] || leanBySector.tech;
  };

  const resetDemo = () => {
    setStep(1);
    setProjectName('');
    setSector('');
    setDescription('');
    setTargetMarket('');
    setBmcData(null);
    setLeanData(null);
    setShowCanvas(false);
    setProgress(0);
    setExportModal({ isOpen: false, type: 'pdf', isGenerating: false, progress: 0 });
  };

  const handleExport = async (type: 'pdf' | 'png' | 'docx') => {
    setExportModal({ isOpen: true, type, isGenerating: true, progress: 0 });
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportModal(prev => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          return { ...prev, isGenerating: false, progress: 100 };
        }
        return { ...prev, progress: prev.progress + 10 };
      });
    }, 200);
  };

  const closeExportModal = () => {
    setExportModal({ isOpen: false, type: 'pdf', isGenerating: false, progress: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">BizGen AI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="hidden sm:flex gap-1 bg-primary/10 text-primary border-primary/20">
              <Play className="w-3 h-3" />
              Mode Démonstration
            </Badge>
            <Link href="/register">
              <Button className="btn-gradient shadow-lg shadow-primary/25">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Title */}
          <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
            <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30">
              <Play className="w-3 h-3 mr-1" />
              Démonstration interactive
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Testez <span className="gradient-text">BizGen AI</span> en action
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment notre IA génère votre Business Model Canvas en quelques secondes. 
              Aucun compte requis pour cette démonstration.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 md:mb-12">
            <StepIndicator number={1} title="Projet" active={step >= 1} completed={step > 1} />
            <div className={`w-8 md:w-16 h-0.5 rounded-full transition-all duration-500 ${step > 1 ? 'bg-primary' : 'bg-muted'}`} />
            <StepIndicator number={2} title="Génération" active={step >= 2} completed={step > 2} />
            <div className={`w-8 md:w-16 h-0.5 rounded-full transition-all duration-500 ${step > 2 ? 'bg-primary' : 'bg-muted'}`} />
            <StepIndicator number={3} title="Résultat" active={step >= 3} completed={false} />
          </div>

          {/* Step Content */}
          <div className="animate-fade-in-up-delay-1">
            {step === 1 && (
              <Card className="border-border/50 bg-card/80 backdrop-blur shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    Décrivez votre projet
                  </CardTitle>
                  <CardDescription className="text-base">
                    Remplissez les informations ci-dessous pour générer votre Business Model Canvas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="projectName" className="text-base font-medium">Nom du projet *</Label>
                      <Input
                        id="projectName"
                        placeholder="Ex: AgriConnect, PayAfrica, EduTech..."
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="h-12 rounded-xl border-border/50 focus:border-primary/50 text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sector" className="text-base font-medium">Secteur d'activité *</Label>
                      <Select value={sector} onValueChange={setSector}>
                        <SelectTrigger className="h-12 rounded-xl border-border/50 text-base">
                          <SelectValue placeholder="Sélectionnez un secteur" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="tech">💻 Technologie / SaaS</SelectItem>
                          <SelectItem value="agriculture">🌾 Agriculture</SelectItem>
                          <SelectItem value="ecommerce">🛒 E-commerce</SelectItem>
                          <SelectItem value="fintech">💳 Fintech</SelectItem>
                          <SelectItem value="health">🏥 Santé</SelectItem>
                          <SelectItem value="education">📚 Éducation</SelectItem>
                          <SelectItem value="services">🔧 Services</SelectItem>
                          <SelectItem value="logistics">🚚 Logistique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-medium">Description du projet</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre projet en quelques phrases. Quels problèmes résout-il? Quelle solution proposez-vous?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="rounded-xl border-border/50 focus:border-primary/50 resize-none text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetMarket" className="text-base font-medium">Marché cible</Label>
                    <Input
                      id="targetMarket"
                      placeholder="Ex: Petits agriculteurs au Cameroun, PME en Afrique de l'Ouest..."
                      value={targetMarket}
                      onChange={(e) => setTargetMarket(e.target.value)}
                      className="h-12 rounded-xl border-border/50 focus:border-primary/50 text-base"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      * Champs obligatoires
                    </p>
                    <Button 
                      onClick={handleGenerate} 
                      className="btn-gradient gap-2 shadow-lg shadow-primary/25 hover:scale-105 transition-transform w-full sm:w-auto"
                      size="lg"
                      disabled={!projectName || !sector}
                    >
                      <Sparkles className="w-5 h-5" />
                      Générer mon BMC
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && isLoading && (
              <Card className="border-border/50 bg-card/80 backdrop-blur shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-emerald-500/5 animate-gradient opacity-50" />
                <CardHeader className="relative">
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
                    Génération en cours
                  </CardTitle>
                  <CardDescription className="text-base">
                    Notre IA analyse votre projet et génère votre Business Model Canvas
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-8 md:py-12 relative">
                  <div className="max-w-md mx-auto">
                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium text-primary">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-3 rounded-full" />
                    </div>

                    {/* Animation */}
                    <div className="text-center space-y-6">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 animate-pulse-glow" />
                        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-2xl shadow-primary/30">
                          <Sparkles className="w-12 h-12 text-primary-foreground animate-bounce-subtle" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-lg font-medium">{getTypingText(progress)}</p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Veuillez patienter...</span>
                        </div>
                      </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-3 gap-3 mt-8">
                      <div className="text-center p-3 rounded-xl bg-muted/50">
                        <FileText className="w-5 h-5 mx-auto text-primary mb-1" />
                        <p className="text-xs text-muted-foreground">BMC</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-muted/50">
                        <Target className="w-5 h-5 mx-auto text-primary mb-1" />
                        <p className="text-xs text-muted-foreground">Lean</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-muted/50">
                        <Building2 className="w-5 h-5 mx-auto text-primary mb-1" />
                        <p className="text-xs text-muted-foreground">BP</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && bmcData && (
              <div className="space-y-6 animate-scale-in">
                {/* BMC Canvas */}
                <Card className="border-border/50 bg-card/80 backdrop-blur shadow-xl">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                          Business Model Canvas - {projectName}
                        </CardTitle>
                        <CardDescription className="text-base">
                          Généré en quelques secondes par notre IA
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => handleExport('png')}>
                          <Eye className="w-4 h-4" />
                          Aperçu
                        </Button>
                        <Button className="btn-gradient gap-2 rounded-xl shadow-lg shadow-primary/25" onClick={() => handleExport('pdf')}>
                          <Download className="w-4 h-4" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Visual BMC Canvas */}
                    <div className="grid grid-cols-5 gap-2 md:gap-3 bg-muted/50 p-2 md:p-3 rounded-xl">
                      {/* Row 1 */}
                      <BMCCell 
                        title="Partenaires clés" 
                        icon={<Handshake className="w-4 h-4" />}
                        items={bmcData.keyPartners}
                        color="emerald"
                      />
                      <BMCCell 
                        title="Activités clés" 
                        icon={<Settings className="w-4 h-4" />}
                        items={bmcData.keyActivities}
                        color="teal"
                      />
                      <BMCCell 
                        title="Proposition de valeur" 
                        icon={<Star className="w-4 h-4" />}
                        items={bmcData.valuePropositions}
                        color="primary"
                        featured
                      />
                      <BMCCell 
                        title="Relations clients" 
                        icon={<Heart className="w-4 h-4" />}
                        items={bmcData.customerRelationships}
                        color="cyan"
                      />
                      <BMCCell 
                        title="Segments clients" 
                        icon={<Users className="w-4 h-4" />}
                        items={bmcData.customerSegments}
                        color="green"
                      />
                      
                      {/* Row 2 */}
                      <div className="col-span-1"></div>
                      <BMCCell 
                        title="Ressources clés" 
                        icon={<Briefcase className="w-4 h-4" />}
                        items={bmcData.keyResources}
                        color="teal"
                      />
                      <div className="col-span-1"></div>
                      <BMCCell 
                        title="Canaux" 
                        icon={<Truck className="w-4 h-4" />}
                        items={bmcData.channels}
                        color="cyan"
                      />
                      <div className="col-span-1"></div>
                      
                      {/* Row 3 */}
                      <BMCCell 
                        title="Structure de coûts" 
                        icon={<DollarSign className="w-4 h-4" />}
                        items={bmcData.costStructure}
                        color="red"
                        fullWidth
                      />
                      <BMCCell 
                        title="Sources de revenus" 
                        icon={<TrendingUp className="w-4 h-4" />}
                        items={bmcData.revenueStreams}
                        color="emerald"
                        fullWidth
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs for other documents */}
                <Card className="border-border/50 bg-card/80 backdrop-blur shadow-xl">
                  <Tabs defaultValue="lean" className="w-full">
                    <CardHeader className="pb-0">
                      <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="lean" className="gap-2 text-base">
                          <Target className="w-4 h-4" />
                          Lean Canvas
                        </TabsTrigger>
                        <TabsTrigger value="bp" className="gap-2 text-base">
                          <Building2 className="w-4 h-4" />
                          Business Plan
                        </TabsTrigger>
                      </TabsList>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <TabsContent value="lean" className="mt-0">
                        {leanData ? (
                          <div className="grid grid-cols-5 gap-2 md:gap-3 bg-muted/50 p-2 md:p-3 rounded-xl">
                            {/* Row 1 */}
                            <LeanCell title="Problème" items={leanData.problem} color="red" />
                            <LeanCell title="Solution" items={leanData.solution} color="green" />
                            <LeanCell title="Proposition de valeur unique" value={leanData.uniqueValueProposition} featured color="primary" />
                            <LeanCell title="Avantage déloyal" value={leanData.unfairAdvantage} color="purple" />
                            <LeanCell title="Segments clients" items={leanData.customerSegments} color="cyan" />
                            
                            {/* Row 2 */}
                            <div className="col-span-1"></div>
                            <div className="col-span-1"></div>
                            <LeanCell title="Canaux" items={leanData.channels} color="teal" />
                            <div className="col-span-1"></div>
                            <div className="col-span-1"></div>
                            
                            {/* Row 3 */}
                            <div className="col-span-1"></div>
                            <LeanCell title="Métriques clés" items={leanData.keyMetrics} color="amber" />
                            <div className="col-span-1"></div>
                            <div className="col-span-1"></div>
                            <div className="col-span-1"></div>
                            
                            {/* Row 4 */}
                            <LeanCell title="Structure de coûts" items={leanData.costStructure} fullWidth color="red" />
                            <LeanCell title="Sources de revenus" items={leanData.revenueStreams} fullWidth color="emerald" />
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-xl p-6 md:p-8 text-center border border-primary/20">
                            <Target className="w-16 h-16 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-bold mb-2">Lean Canvas</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                              Créez un compte pour générer votre Lean Canvas complet.
                            </p>
                            <Link href="/register">
                              <Button className="btn-gradient gap-2 shadow-lg shadow-primary/25">
                                <Sparkles className="w-4 h-4" />
                                Créer mon compte gratuit
                              </Button>
                            </Link>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="bp" className="mt-0">
                        <div className="bg-gradient-to-r from-emerald-500/5 to-primary/5 rounded-xl p-6 md:p-8 text-center border border-emerald-500/20">
                          <Building2 className="w-16 h-16 mx-auto text-primary mb-4" />
                          <h3 className="text-xl font-bold mb-2">Business Plan complet</h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Document de 20-50 pages avec analyse marché, SWOT, prévisions financières et plan d'action.
                          </p>
                          <Link href="/register">
                            <Button className="btn-gradient gap-2 shadow-lg shadow-primary/25">
                              <Sparkles className="w-4 h-4" />
                              Créer mon compte gratuit
                            </Button>
                          </Link>
                        </div>
                      </TabsContent>
                    </CardContent>
                  </Tabs>
                </Card>

                {/* CTA */}
                <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-primary/10">
                  <CardContent className="py-8 md:py-12 text-center">
                    <Rocket className="w-14 h-14 md:w-16 md:h-16 mx-auto text-primary mb-4" />
                    <h3 className="text-xl md:text-2xl font-bold mb-2">Prêt à lancer votre projet?</h3>
                    <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                      Créez votre compte gratuit pour accéder à toutes les fonctionnalités, 
                      sauvegarder vos projets et exporter vos documents.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button onClick={resetDemo} variant="outline" className="gap-2 rounded-xl w-full sm:w-auto">
                        <ArrowLeft className="w-4 h-4" />
                        Refaire la démo
                      </Button>
                      <Link href="/register" className="w-full sm:w-auto">
                        <Button className="btn-gradient gap-2 shadow-lg shadow-primary/25 w-full">
                          <Sparkles className="w-4 h-4" />
                          Créer mon compte gratuit
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Trust badges */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Gratuit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Sans carte bancaire</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>3 projets inclus</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <FeatureHighlight
              icon={<Clock className="w-6 h-6" />}
              title="Rapide"
              description="Génération en moins de 45 secondes"
            />
            <FeatureHighlight
              icon={<Globe className="w-6 h-6" />}
              title="Adapté à l'Afrique"
              description="Contextualisé pour les marchés locaux"
            />
            <FeatureHighlight
              icon={<Users className="w-6 h-6" />}
              title="500+ entrepreneurs"
              description="Nous font déjà confiance"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 BizGen AI. Fait avec ❤️ à Douala, Cameroun.</p>
        </div>
      </footer>
      
      {/* Export Modal */}
      <ExportModal 
        isOpen={exportModal.isOpen}
        type={exportModal.type}
        isGenerating={exportModal.isGenerating}
        progress={exportModal.progress}
        onClose={closeExportModal}
      />
    </div>
  );
}

// Step Indicator Component
function StepIndicator({ number, title, active, completed }: { 
  number: number; 
  title: string; 
  active: boolean; 
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
        ${completed ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 
          active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 
          'bg-muted text-muted-foreground'}
      `}>
        {completed ? <Check className="w-4 h-4" /> : number}
      </div>
      <span className={`text-sm md:text-base hidden sm:inline ${active ? 'font-medium' : 'text-muted-foreground'}`}>
        {title}
      </span>
    </div>
  );
}

// BMC Cell Component
function BMCCell({ 
  title, 
  icon, 
  items, 
  color,
  featured = false,
  fullWidth = false 
}: { 
  title: string; 
  icon: React.ReactNode; 
  items: string[];
  color: string;
  featured?: boolean;
  fullWidth?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    teal: 'bg-teal-500/10 border-teal-500/20',
    primary: 'bg-primary/10 border-primary/20',
    cyan: 'bg-cyan-500/10 border-cyan-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    red: 'bg-red-500/10 border-red-500/20',
  };

  const iconColorClasses: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    teal: 'text-teal-600 dark:text-teal-400',
    primary: 'text-primary',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className={`
      ${fullWidth ? 'col-span-5 md:col-span-2' : ''} 
      ${featured ? 'md:col-span-1 row-span-2' : ''} 
      p-3 md:p-4 rounded-xl border ${colorClasses[color]} 
      transition-all duration-300 hover:scale-[1.02] cursor-pointer
    `}>
      <div className={`flex items-center gap-2 mb-2 ${iconColorClasses[color]}`}>
        {icon}
        <h4 className="text-xs md:text-sm font-semibold">{title}</h4>
      </div>
      <ul className="space-y-1">
        {items.slice(0, featured ? 4 : 3).map((item, i) => (
          <li key={i} className="text-xs md:text-sm text-muted-foreground flex items-start gap-1">
            <span className="text-primary mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Feature Highlight Component
function FeatureHighlight({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center p-4 md:p-6 rounded-xl bg-card/50 border border-border/50 card-hover">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Lean Canvas Cell Component
function LeanCell({ 
  title, 
  items, 
  value,
  color,
  featured = false,
  fullWidth = false 
}: { 
  title: string; 
  items?: string[];
  value?: string;
  color: string;
  featured?: boolean;
  fullWidth?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    teal: 'bg-teal-500/10 border-teal-500/20',
    primary: 'bg-primary/10 border-primary/20',
    cyan: 'bg-cyan-500/10 border-cyan-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    red: 'bg-red-500/10 border-red-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
  };

  return (
    <div className={`
      ${fullWidth ? 'col-span-5 md:col-span-2' : ''} 
      ${featured ? 'md:row-span-2' : ''} 
      p-3 md:p-4 rounded-xl border ${colorClasses[color]} 
      transition-all duration-300 hover:scale-[1.02] cursor-pointer
    `}>
      <h4 className="text-xs md:text-sm font-semibold mb-2">{title}</h4>
      {value && <p className="text-sm font-medium">{value}</p>}
      {items && (
        <ul className="space-y-1">
          {items.slice(0, featured ? 4 : 3).map((item, i) => (
            <li key={i} className="text-xs md:text-sm text-muted-foreground flex items-start gap-1">
              <span className="text-primary mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Export Modal Component
function ExportModal({ 
  isOpen, 
  type, 
  isGenerating, 
  progress,
  onClose 
}: { 
  isOpen: boolean; 
  type: 'pdf' | 'png' | 'docx';
  isGenerating: boolean;
  progress: number;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const typeLabels = { pdf: 'PDF', png: 'PNG', docx: 'Word' };
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
            {isGenerating ? (
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-xl">
            {isGenerating ? `Export ${typeLabels[type]} en cours...` : 'Export terminé !'}
          </CardTitle>
          <CardDescription>
            {isGenerating ? 'Préparation de votre document' : 'Votre document est prêt'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGenerating ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">{progress}%</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Ceci est une démonstration. Créez un compte pour exporter vos vrais documents.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
                  Fermer
                </Button>
                <Link href="/register" className="flex-1">
                  <Button className="btn-gradient w-full rounded-xl">
                    Créer un compte
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
