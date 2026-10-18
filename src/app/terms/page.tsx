import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'accueil
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-6">Conditions Générales d'Utilisation</h1>
      <div className="prose dark:prose-invert space-y-4 text-muted-foreground">
        <p>
          Bienvenue sur <strong>BizGen AI</strong>. En accédant à nos services, vous acceptez les présentes conditions générales d'utilisation.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">1. Objet du Service</h2>
        <p>
          BizGen AI met à disposition des porteurs de projets et dirigeants d'entreprise une suite d'outils numériques d'assistance à la création de documents stratégiques (Business Model Canvas, Lean Canvas, Business Plan, prévisions financières).
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">2. Responsabilité de l'Utilisateur</h2>
        <p>
          Les documents et calculs générés constituent des outils d'aide à la décision. L'utilisateur demeure responsable de la validation de ses hypothèses économiques auprès des organismes financiers et légaux compétents.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">3. Abonnements et Tarification</h2>
        <p>
          Les conditions des formules Freemium, Basic et Pro sont détaillées dans l'espace Abonnements de la plateforme.
        </p>
      </div>
    </div>
  );
}
