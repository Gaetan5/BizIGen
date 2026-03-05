# Biz-IGen

**Générez automatiquement votre Business Model Canvas, Lean Canvas et Business Plan complet en moins de 30 minutes – propulsé par l'IA**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
![Status](https://img.shields.io/badge/Status-En%20développement-yellow)
[![Powered by AI](https://img.shields.io/badge/Powered%20by-OpenAI%20%2F%20Claude-orange?logo=openai&logoColor=white)](https://openai.com/)

**Biz-IGen** est une plateforme SaaS qui permet aux entrepreneurs, startups et PME (notamment en Afrique – Cameroun, secteurs tech, agricole, agroalimentaire, innovation) de créer très rapidement des documents stratégiques de qualité professionnelle :

- **Business Model Canvas** (BMC) – 9 blocs visuels interactifs  
- **Lean Canvas** – version allégée et orientée startup  
- **Business Plan complet** (20–50 pages) – résumé exécutif, analyse marché, SWOT/PESTEL, finances prévisionnelles, plan opérationnel, etc.

Tout cela est généré à partir d’un **formulaire d’audit dynamique et intelligent** (questions qui s’adaptent selon le secteur, le pays, le stade du projet) + une génération IA très contextualisée.

## ✨ Pourquoi BizGen AI ?

- Des semaines de travail réduites à 20–40 minutes  
- Contenus et structures adaptés aux réalités africaines et marchés émergents  
- Édition facile : drag-and-drop pour les canvases + éditeur texte pour le business plan  
- Exports PDF, PNG, Word  
- Modèle freemium : 1 projet gratuit par mois  
- Paiement accessible en Afrique (Stripe + Flutterwave / mobile money)  
- Focus secteurs : tech, agriculture, agroalimentaire, innovation sociale

## Fonctionnalités principales (MVP)

- Inscription & connexion (email + Google)  
- Formulaire multi-étapes avec logique conditionnelle  
- Génération automatique de BMC, Lean Canvas et Business Plan complet  
- Visualisation interactive et édition des canvases (drag-and-drop)  
- Éditeur riche pour personnaliser le business plan  
- Prévisualisation et exports multiples  
- Système d’abonnement (Stripe + Flutterwave)  
- Dashboard avec historique des projets  
- Chatbot d’assistance intégré (IA)

## Stack technique recommandée (2026)

- **Frontend** : Next.js 15 (App Router) + Tailwind CSS + shadcn/ui  
- **Backend / API** : Next.js API Routes ou FastAPI (Python)  
- **Base de données** : Supabase (PostgreSQL)  
- **Authentification** : Clerk  
- **IA / LLM** : OpenAI GPT-4o / Claude 3.5 Sonnet + LangChain  
- **Paiements** : Stripe + Flutterwave  
- **Stockage** : Supabase Storage  
- **Hébergement** : Vercel (frontend) + Railway / Render (backend)  
- **Monitoring** : Sentry + PostHog  

**Alternative rapide pour proto** : Bubble.io + Make.com + OpenAI

## Roadmap

Phase     | Période estimée | Principales fonctionnalités
----------|------------------|--------------------------------------
MVP       | Q2 2026         | Auth + Formulaire + Génération BMC/LC/BP + Paiements
V1        | Q3 2026         | Édition avancée + Templates sectoriels + FR/EN
V1.1      | Q4 2026         | Pitch deck generator + CRM + PWA mobile
V2        | 2027            | Marketplace de templates + IA personnalisée

## Installation & Développement local

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE_USERNAME/bizgen-ai.git
cd bizgen-ai

# 2. Installer les dépendances
npm install
# ou yarn install / pnpm install

# 3. Copier le fichier d'environnement
cp .env.example .env.local

# 4. Remplir .env.local avec vos clés (Clerk, OpenAI, Stripe, Supabase...)

# 5. Lancer le serveur
npm run dev
# → http://localhost:3000
