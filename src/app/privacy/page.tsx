import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'accueil
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
      <div className="prose dark:prose-invert space-y-4 text-muted-foreground">
        <p>
          Chez <strong>BizGen AI</strong>, nous accordons une importance primordiale à la confidentialité et à la sécurité de vos données entrepreneuriales.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">1. Collecte des Données</h2>
        <p>
          Nous collectons uniquement les informations nécessaires au fonctionnement de la plateforme : adresse email, nom, et les informations stratégiques saisies dans le cadre de vos projets d'entreprise.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">2. Utilisation et Confidentialité de vos Projets</h2>
        <p>
          Vos données de projet (Business Model Canvas, Business Plans, prévisions financières) restent votre propriété exclusive et ne sont ni revendues, ni partagées avec des tiers non autorisés.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">3. Sécurité et Hébergement</h2>
        <p>
          Tous les flux sont chiffrés via HTTPS / TLS et les mots de passe sont hachés de manière irréversible via bcrypt.
        </p>
      </div>
    </div>
  );
}
