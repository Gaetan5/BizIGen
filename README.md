# 🚀 BizGen AI — Plateforme Intelligente de Business Model Canvas & Business Plan

[![CI/CD Pipeline](https://github.com/Gaetan5/BizIGen/actions/workflows/ci.yml/badge.svg)](https://github.com/Gaetan5/BizIGen/actions/workflows/ci.yml)
[![Deployment](https://github.com/Gaetan5/BizIGen/actions/workflows/deploy.yml/badge.svg)](https://github.com/Gaetan5/BizIGen/actions/workflows/deploy.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Container-Docker_Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![Security OWASP](https://img.shields.io/badge/Security-OWASP_Top_10_Hardened-brightgreen)](https://owasp.org)

**BizGen AI** est la plateforme SaaS d'excellence dédiée à la modélisation stratégique, à l'évaluation de viabilité et à la génération assistée par intelligence artificielle de **Business Model Canvas (BMC)**, **Lean Canvas** et **Business Plans complets**, optimisée pour les marchés émergents et l'écosystème entrepreneurial africain.

---

## 🌐 Liens Officiels & Déploiement

* **Application Web en Production** : [https://bizgen.boukarou-os.com](https://bizgen.boukarou-os.com)
* **Documentation Interactive de l'API (Swagger UI)** : [https://bizgen.boukarou-os.com/docs](https://bizgen.boukarou-os.com/docs)
* **Spécification OpenAPI (JSON Schema)** : [https://bizgen.boukarou-os.com/openapi.json](https://bizgen.boukarou-os.com/openapi.json)
* **Documentation ReDoc** : [https://bizgen.boukarou-os.com/redoc](https://bizgen.boukarou-os.com/redoc)

---

## 🏗️ Architecture Globale du Système

```
                             Utilisateurs (Web & Mobile PWA)
                                           │
                                           ▼ (HTTPS : 443 / SSL Let's Encrypt)
                          ┌─────────────────────────────────┐
                          │    Nginx Gateway (Reverse Proxy)│
                          │   HSTS / Anti-DDoS / Rate Limit │
                          └────────────────┬────────────────┘
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     │                                           │
                     ▼                                           ▼
          ┌─────────────────────┐                     ┌─────────────────────┐
          │  Frontend Next.js   │                     │   FastAPI Backend   │
          │  (Port Host: 3070)  │                     │  (Port Host: 3071)  │
          │  App Router & React │                     │  Uvicorn Worker     │
          │  NextAuth v4        │                     │  Pydantic v2        │
          └──────────┬──────────┘                     └──────────┬──────────┘
                     │                                           │
                     └─────────────── Service-to-Service ────────┘
                                   (X-Internal-API-Key)
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     │                                           │
                     ▼                                           ▼
          ┌─────────────────────┐                     ┌─────────────────────┐
          │     PostgreSQL      │                     │     Redis Cache     │
          │  (Relational Data)  │                     │ (Queue & Rate Limit)│
          └─────────────────────┘                     └─────────────────────┘
```

---

## ✨ Fonctionnalités Majeures

### 1. 🧠 Moteur d'IA & Diagnostic Stratégique
* **Streaming SSE Temps Réel** : Assistant conversationnel avec rendu fluide mot par mot (`/chat/stream`).
* **Archétypes de Marché** : Détection des modèles d'affaires (B2B SaaS, Marketplace, Agrobusiness, Fintech Mobile Money, Import-Export).
* **Viability Score & Mentoring** : Évaluation algorithmique multidimensionnelle (Marché, Monétisation, Risque opérationnel) avec recommandations personnalisées.
* **Découverte de Concurrents** : Identification automatique du paysage concurrentiel local et continental.

### 2. 📄 Génération de Documents & Stockage Résilient
* **Canvas Interactifs** : Business Model Canvas (9 blocs) et Lean Canvas synchronisés en temps réel.
* **Exports Multi-Formats** : PDF haute définition, DOCX exécutif, tableurs financiers CSV, et infographies PNG.
* **Stockage Cloud Résilient** : Service unifié compatible **AWS S3 / Cloudflare R2 / MinIO** avec basculement automatique sur volume local persistant en cas de déconnexion réseau.

### 3. 🛡️ Sécurité & Confidentialité de Niveau Entreprise
* **Contrôle d'accès strict (Anti-IDOR)** : Isolation étanche des données utilisateurs sur l'ensemble des routes CRUD.
* **Anti-CSRF & Cookies Durcis** : Session NextAuth configurée avec `SameSite=Lax`, `HttpOnly` et flags `Secure`.
* **Signature Cryptographique des Webhooks** : Validation par HMAC et `secrets.compare_digest` des paiements Stripe et Flutterwave.
* **En-têtes de Sécurité HTTP** : HSTS preload (`max-age=31536000`), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`.

---

## 📡 Documentation des Endpoints d'API (Swagger / OpenAPI)

Tous les endpoints sont documentés avec leurs schémas de requête/réponse et codes HTTP sur Swagger UI :

| Module | Méthode | Route | Description |
|---|---|---|---|
| **Authentification** | `POST` | `/auth/register` | Inscription nouvel utilisateur & génération JWT |
| | `POST` | `/auth/login` | Connexion & délivrance du Bearer Token |
| | `GET` | `/auth/me` | Informations du profil connecté |
| **Assistant & Chat** | `POST` | `/chat/stream` | **Streaming SSE** temps réel des réponses IA |
| | `POST` | `/chat/message` | Envoi d'un message standard à l'assistant |
| | `GET` | `/chat/history/{project_id}` | Récupération de l'historique conversationnel |
| **Projets** | `GET` | `/projects` | Liste paginée des projets avec filtres |
| | `POST` | `/projects` | Création d'un nouveau projet d'entreprise |
| | `GET` | `/projects/{id}` | Détails complets, formulaires et canvas |
| | `PUT` | `/projects/{id}` | Mise à jour des informations du projet |
| | `DELETE` | `/projects/{id}` | Suppression sécurisée du projet |
| **Génération IA** | `POST` | `/generate/canvas` | Génération IA du BMC ou Lean Canvas |
| | `POST` | `/generate/business-plan` | Synthèse du Business Plan complet |
| **Exports & Stockage**| `POST` | `/export/pdf` | Compilation et sauvegarde cloud du PDF |
| | `GET` | `/export/download/{id}` | Téléchargement sécurisé du document exporté |
| **Paiements & Webhooks**| `POST` | `/webhooks/stripe` | Traitement des abonnements Stripe |
| | `POST` | `/webhooks/flutterwave`| Traitement sécurisé des paiements Mobile Money |
| **Santé Système** | `GET` | `/health` | Statut de l'API, de la base de données et de Redis |

---

## 💻 Démarrage Local (Développement)

### Prérequis
* Node.js v20+
* Python 3.11+
* Docker & Docker Compose

### 1. Cloner le dépôt
```bash
git clone https://github.com/Gaetan5/BizIGen.git
cd BizIGen
```

### 2. Lancement rapide via Docker Compose
```bash
cp .env.example .env
docker compose up --build
```
L'application sera accessible sur :
* Frontend : `http://localhost:3000`
* API Backend : `http://localhost:3001`
* Documentation Swagger : `http://localhost:3001/docs`

---

## 🚀 Pipeline CI/CD & Déploiement Continu

BizGen AI intègre un pipeline CI/CD moderne orchestré par **GitHub Actions** :

1. **Intégration Continue (`.github/workflows/ci.yml`)** :
   * Exécution de la suite complète de tests backend Pytest avec services réels PostgreSQL & Redis.
   * Vérification du typage statique TypeScript (`tsc --noEmit`).
   * Analyse statique ESLint.
   * Compilation de production Next.js.
2. **Déploiement Continu (`.github/workflows/deploy.yml`)** :
   * Déclenchement automatique dès que le CI passe au vert sur `main`.
   * Déploiement sans interruption (Zero Downtime) via SSH sur la VM Oracle.
   * Pull des dernières modifications, reconstruction des images Docker et validation des healthchecks.

---

## 📄 Licence & Droits

Propriété exclusive de **BizGen AI** — Conçu pour propulser les créateurs d'entreprises.  
Tous droits réservés © 2026.
