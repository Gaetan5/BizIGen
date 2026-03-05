# Biz-IGen

Plateforme SaaS d'automatisation de Business Model Canvas, Lean Canvas et Business Plan via formulaire d'audit dynamique + IA.

## Fonctionnalités

- **Formulaire dynamique** : Questions conditionnelles selon secteur, taille, pays
- **Génération IA** : BMC, Lean Canvas, Business Plan complet en PDF/Word
- **Authentification** : Clerk (email/Google + 2FA)
- **Abonnements** : Stripe + Flutterwave (paiements Afrique)
- **Support** : Chatbot IA

## Stack Technique

- **Frontend** : Next.js 16 + Tailwind CSS + shadcn/ui
- **Backend** : Next.js API Routes
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Clerk
- **IA** : Grok (xAI)
- **Paiements** : Stripe + Flutterwave

## Installation

1. Clonez le repo
2. Installez les dépendances : `npm install`
3. Configurez les variables d'environnement :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROK_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `FLUTTERWAVE_SECRET_KEY`
4. Lancez le serveur : `npm run dev`

## Structure du Projet

- `src/app/` : Pages Next.js
- `src/lib/` : Utilitaires (Supabase, types)
- `src/components/` : Composants UI (shadcn)

## Roadmap MVP

- ✅ Sprint 1 : Auth + Dashboard
- ✅ Sprint 2 : Formulaire dynamique
- ✅ Sprint 3 : IA BMC + Lean Canvas
- ✅ Sprint 4 : IA Business Plan + Export PDF
- ✅ Sprint 5 : Paiements Stripe + Flutterwave
- ✅ Sprint 6 : Édition + Support Chatbot IA
- ✅ Sprint 7 : Tests E2E (Playwright)
- 🔄 Sprint 8 : Beta Launch & Déploiement

## Variables d'Environnement

Créer `.env.local` :
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GROK_API_KEY=xai-...
STRIPE_SECRET_KEY=sk_test_...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Déploiement Production

1. **Supabase** : Créer projet, exécuter `database/schema.sql`
2. **Clerk** : Configurer app, ajouter URLs de prod
3. **Stripe** : Créer produits (basic/pro), webhook endpoint
4. **Flutterwave** : Configurer pour XAF, Cameroun
5. **Vercel** : Déployer frontend, ajouter env vars
6. **Railway** : Backend si API séparée (optionnel)

## Tests

```bash
npm run test  # E2E tests
npm run lint  # Code quality
```

## Métriques MVP

- Authentification : ✅ Clerk
- Performance : <45s génération IA
- Mobile-friendly : ✅ Responsive
- Paiements Afrique : ✅ Flutterwave
- Support : ✅ Chatbot IA

🚀 **Prêt pour beta test avec entrepreneurs camerounais !**
