'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  ChevronRight,
  Sparkles,
  FileText,
  CreditCard,
  Users,
  Zap,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const faqCategories = [
  {
    category: 'Général',
    icon: HelpCircle,
    questions: [
      {
        question: 'Qu\'est-ce que BizGen AI ?',
        answer: 'BizGen AI est une plateforme SaaS qui utilise l\'intelligence artificielle pour générer automatiquement votre Business Model Canvas, Lean Canvas et Business Plan complet en 20 minutes environ, au lieu des 40 heures habituelles.',
      },
      {
        question: 'Comment fonctionne la génération de documents ?',
        answer: 'Vous répondez à un formulaire intelligent adapté à votre secteur d\'activité. Notre IA analyse vos réponses et génère des documents professionnels contextualisés pour le marché africain (méthodes de paiement, réglementations, acteurs locaux).',
      },
      {
        question: 'Mes données sont-elles sécurisées ?',
        answer: 'Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais vos informations avec des tiers. Vos documents business restent confidentiels.',
      },
    ],
  },
  {
    category: 'Documents générés',
    icon: FileText,
    questions: [
      {
        question: 'Quels types de documents puis-je générer ?',
        answer: 'Vous pouvez générer 3 types de documents : Business Model Canvas (9 blocs), Lean Canvas (idéal startups), et Business Plan complet (20-50 pages avec analyse marché, SWOT, prévisions financières).',
      },
      {
        question: 'Puis-je modifier les documents générés ?',
        answer: 'Oui ! Tous les documents sont éditables. Vous pouvez ajouter, modifier ou supprimer des éléments directement dans l\'interface. Les documents se mettent à jour en temps réel.',
      },
      {
        question: 'Dans quels formats puis-je exporter ?',
        answer: 'Les exports disponibles dépendent de votre plan : PNG (gratuit), PDF (Basic et Pro), DOCX/Word (Pro uniquement). Tous les exports sont sans watermark sauf le plan gratuit.',
      },
    ],
  },
  {
    category: 'Abonnement & Paiement',
    icon: CreditCard,
    questions: [
      {
        question: 'Quels sont les moyens de paiement acceptés ?',
        answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), MTN Mobile Money, Orange Money, et Wave. Les paiements sont sécurisés via Stripe et Flutterwave.',
      },
      {
        question: 'Puis-je annuler mon abonnement ?',
        answer: 'Oui, vous pouvez annuler à tout moment depuis votre compte. Vous conserverez l\'accès jusqu\'à la fin de la période facturée. Aucun remboursement partiel n\'est effectué.',
      },
      {
        question: 'Y a-t-il des réductions pour les startups ?',
        answer: 'Oui ! Si vous êtes incubé ou faites partie d\'un programme d\'accélération, contactez-nous pour bénéficier d\'un tarif préférentiel.',
      },
    ],
  },
  {
    category: 'Technique',
    icon: Zap,
    questions: [
      {
        question: 'L\'API est-elle disponible ?',
        answer: 'L\'accès API est disponible pour les plans Pro. Vous pouvez intégrer BizGen AI dans vos propres applications pour automatiser la génération de documents business.',
      },
      {
        question: 'Combien de temps prend la génération ?',
        answer: 'La génération complète (BMC + Lean Canvas + Business Plan) prend généralement moins de 45 secondes. Le formulaire initial prend 15-20 minutes à remplir.',
      },
    ],
  },
];

const quickGuides = [
  {
    title: 'Guide de démarrage',
    description: 'Apprenez à créer votre premier projet',
    icon: Sparkles,
    href: '#',
  },
  {
    title: 'Comprendre le BMC',
    description: 'Maîtrisez les 9 blocs du Business Model Canvas',
    icon: FileText,
    href: '#',
  },
  {
    title: 'Lean Canvas vs BMC',
    description: 'Quelle méthode choisir pour votre projet ?',
    icon: BookOpen,
    href: '#',
  },
  {
    title: 'Structurer son Business Plan',
    description: 'Les sections essentielles d\'un business plan',
    icon: Users,
    href: '#',
  },
];

export default function HelpPage() {
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message envoyé ! Nous vous répondrons sous 24h.');
      setContactForm({ subject: '', message: '', email: '' });
    } catch {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Centre d'aide</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trouvez des réponses à vos questions ou contactez notre équipe support
        </p>
      </div>

      {/* Quick Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <HelpCircle className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans l'aide..."
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      {/* Quick Guides */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Guides rapides</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickGuides.map((guide) => (
            <Card key={guide.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <guide.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{guide.title}</h3>
                <p className="text-sm text-muted-foreground">{guide.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Questions fréquentes</h2>
        <div className="space-y-4">
          {faqCategories.map((category) => (
            <Card key={category.category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <category.icon className="w-5 h-5 text-primary" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`${category.category}-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contacter le support
            </CardTitle>
            <CardDescription>
              Notre équipe vous répond sous 24 heures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Comment puis-je vous aider ?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Décrivez votre question ou problème..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Autres moyens de contact
            </CardTitle>
            <CardDescription>
              Nous sommes disponibles sur plusieurs canaux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Réponse rapide</p>
                </div>
              </div>
              <Badge variant="secondary">Bientôt</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@bizgen.ai</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Copier
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950 rounded-full flex items-center justify-center">
                  <span className="text-lg">🐦</span>
                </div>
                <div>
                  <p className="font-medium">Twitter/X</p>
                  <p className="text-sm text-muted-foreground">@bizgenai</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Suivre
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
