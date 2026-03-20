# 🚀 BizGen AI

Plateforme SaaS intelligente pour générer des Business Model Canvas, Lean Canvas et Business Plans complets avec l'IA, conçue spécifiquement pour les entrepreneurs africains.

![BizGen AI](https://img.shields.io/badge/BizGen-AI-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)
![Tests](https://img.shields.io/badge/tests-102%20passing-brightgreen?style=for-the-badge)
![Score](https://img.shields.io/badge/score-92%2F100-success?style=for-the-badge)

## 📖 Table des Matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Stack Technique](#️-stack-technique)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [🐳 Docker](#-docker)
- [📡 API Reference](#-api-reference)
- [🧪 Tests](#-tests)
- [📊 Monitoring](#-monitoring)
- [🔒 Sécurité](#-sécurité)
- [🌍 Paiements Africa](#-paiements-africa)
- [📁 Structure du Projet](#-structure-du-projet)
- [🤝 Contribution](#-contribution)

---

## ✨ Fonctionnalités

### 🎯 Génération IA
- **Business Model Canvas** - Génération automatique des 9 blocs
- **Lean Canvas** - Version startup avec hypothèses validables
- **Business Plan Complet** - Document professionnel de 15+ pages
- **Templates Sectoriels** - 6 secteurs africains pré-configurés:
  - 🌾 Agribusiness
  - 💳 Fintech
  - 🛍️ E-commerce
  - 🏥 Healthtech
  - 🎓 Edtech
  - 🚚 Logistics

### 💬 Assistant Intelligent
- Chat IA contextuel pour affiner vos projets
- Suggestions automatiques basées sur le secteur
- Questions guidées pour compléter le canvas

### 📤 Exports
- **PDF** - Documents professionnels
- **DOCX** - Éditable dans Word/Google Docs
- **PNG** - Partage sur réseaux sociaux

### 💳 Souscriptions
- **Free** - 1 projet/mois, exports PNG
- **Basic** ($9/mois) - 5 projets, exports PDF
- **Pro** ($29/mois) - Projets illimités, tous exports

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 16)                    │
│                     Port 3000 - App Router                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Nginx Reverse Proxy                        │
│                     Port 80/443 (Production)                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   API FastAPI   │ │     Redis       │ │   PostgreSQL    │
│   Port 3001     │ │   Port 6379     │ │   Port 5432     │
│                 │ │                 │ │                 │
│ - Auth JWT      │ │ - Cache         │ │ - Users         │
│ - Generation IA │ │ - Sessions      │ │ - Projects      │
│ - Exports       │ │ - Rate Limit    │ │ - Subscriptions │
│ - WebSocket     │ │ - Queue         │ │ - Analytics     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Services Externes                            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   OpenAI    │  │   Stripe    │  │ Flutterwave │             │
│  │   GPT-4     │  │  (Global)   │  │  (Africa)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │   Sentry    │  │ Prometheus  │                               │
│  │  (Errors)   │  │ (Metrics)   │                               │
│  └─────────────┘  └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Technique

### Frontend
| Technologie | Usage |
|-------------|-------|
| **Next.js 16** | Framework React avec App Router |
| **TypeScript 5** | Type-safe JavaScript |
| **Tailwind CSS 4** | Utility-first CSS |
| **shadcn/ui** | Composants UI accessibles |
| **Framer Motion** | Animations fluides |
| **React Hook Form** | Gestion des formulaires |
| **Zod** | Validation des schémas |
| **Zustand** | State management |
| **TanStack Query** | Data fetching |

### Backend
| Technologie | Usage |
|-------------|-------|
| **FastAPI** | Framework API Python |
| **SQLAlchemy** | ORM asynchrone |
| **PostgreSQL** | Base de données principale |
| **Redis** | Cache et sessions |
| **OpenAI GPT-4** | Génération IA |
| **ReportLab** | Export PDF |
| **python-docx** | Export DOCX |

### Infrastructure
| Technologie | Usage |
|-------------|-------|
| **Docker** | Containerisation |
| **Docker Compose** | Orchestration |
| **Nginx** | Reverse Proxy |
| **Prometheus** | Métriques |
| **Grafana** | Dashboards |
| **Sentry** | Error tracking |
| **GitHub Actions** | CI/CD |

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (optionnel)
- PostgreSQL 16 (ou SQLite pour dev)

### Installation

```bash
# Cloner le repository
git clone https://github.com/Gaetan5/BizIGen.git
cd BizIGen

# Frontend
bun install
bun run dev

# Backend (développement local)
cd mini-services/api-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --port 3001 --reload
```

### Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Variables requises
OPENAI_API_KEY=sk-your-key
SECRET_KEY=your-secret-key-min-32-chars
```

---

## 🐳 Docker

### Démarrage avec Docker

```bash
# Copier la configuration
cp .env.docker.example .env

# Éditer les variables
nano .env

# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### Commandes Make

```bash
make help          # Afficher l'aide
make up            # Démarrer (développement)
make up-prod       # Démarrer (production)
make up-monitor    # Démarrer avec monitoring
make down          # Arrêter
make logs          # Voir les logs
make test          # Exécuter les tests
make shell         # Shell dans le container
```

### Services Docker

| Service | Port | Description |
|---------|------|-------------|
| API | 3001 | FastAPI Backend |
| PostgreSQL | 5432 | Base de données |
| Redis | 6379 | Cache |
| Nginx | 80/443 | Reverse Proxy (prod) |
| Prometheus | 9090 | Monitoring |
| Grafana | 3002 | Dashboards |
| Adminer | 8080 | DB Admin (dev) |
| Redis Commander | 8081 | Redis GUI (dev) |

---

## 📡 API Reference

### Authentification

```http
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/password-reset
```

### Projets

```http
GET    /projects              # Liste des projets
POST   /projects              # Créer un projet
GET    /projects/{id}         # Détails du projet
PUT    /projects/{id}         # Modifier le projet
DELETE /projects/{id}         # Supprimer le projet
```

### Génération IA

```http
POST /generate/bmc            # Générer BMC
POST /generate/lean-canvas    # Générer Lean Canvas
POST /generate/business-plan  # Générer Business Plan
POST /generate/iterate        # Itérer sur une section
```

### Exports

```http
GET /export/{id}/pdf          # Export PDF
GET /export/{id}/docx         # Export DOCX
GET /export/{id}/png          # Export PNG
```

### Chat IA

```http
POST /chat                    # Envoyer un message
GET  /chat/history/{project}  # Historique
```

### Webhooks

```http
POST /webhooks/stripe         # Webhook Stripe
POST /webhooks/flutterwave    # Webhook Flutterwave
```

### Documentation Interactive

- **Swagger UI**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc

---

## 🧪 Tests

### Exécution des Tests

```bash
# Tous les tests
pytest

# Avec coverage
pytest --cov=app --cov-report=html

# Tests spécifiques
pytest tests/test_auth.py -v
pytest tests/test_generation.py -v

# Tests en parallèle
pytest -n auto
```

### Coverage

| Module | Coverage |
|--------|----------|
| Auth | 95% |
| Projects | 92% |
| Generation | 88% |
| Exports | 85% |
| Subscriptions | 90% |
| **Total** | **90%** |

### Types de Tests

- ✅ **102 tests** au total
- Tests unitaires
- Tests d'intégration
- Tests API
- Tests de charge (k6)

---

## 📊 Monitoring

### Sentry (Error Tracking)

```python
# Configuration automatique
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Prometheus Métriques

```http
GET /metrics
```

Métriques disponibles:
- `http_requests_total` - Requêtes HTTP
- `http_request_duration_seconds` - Latence
- `generation_requests_total` - Générations IA
- `active_users` - Utilisateurs actifs

### Grafana Dashboards

Accès: http://localhost:3002 (admin/admin123)

Dashboards inclus:
- API Performance
- Database Metrics
- Redis Cache
- Business Metrics

### Health Checks

```http
GET /health    # Status simple
GET /ready     # Readiness check
```

---

## 🔒 Sécurité

### Implémentations

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ |
| Rate Limiting | ✅ |
| CORS Configuration | ✅ |
| Input Validation | ✅ |
| SQL Injection Protection | ✅ |
| XSS Protection | ✅ |
| CSRF Protection | ✅ |
| Password Hashing (bcrypt) | ✅ |
| HTTPS Enforcement | ✅ |
| Security Headers | ✅ |

### Rate Limiting

| Endpoint | Limite |
|----------|--------|
| API générale | 100 req/min |
| Auth endpoints | 10 req/min |
| Génération IA | 20 req/min |

### Headers de Sécurité

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

---

## 🌍 Paiements Africa

### Stripe (Global)

```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Flutterwave (Africa)

Paiements mobiles supportés:
- 🇳🇬 Nigeria - USSD, Cards
- 🇰🇪 Kenya - M-Pesa
- 🇬🇭 Ghana - Mobile Money
- 🇺🇬 Uganda - Mobile Money
- 🇿🇦 South Africa - EFT

```env
FLUTTERWAVE_SECRET_KEY=FLWSECK_xxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_xxx
```

---

## 📁 Structure du Projet

```
bizgen-ai/
├── src/                          # Frontend Next.js
│   ├── app/                      # App Router
│   │   ├── (auth)/              # Pages auth
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/         # Pages dashboard
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── assistant/
│   │   │   ├── subscription/
│   │   │   └── admin/
│   │   └── api/                 # API Routes
│   ├── components/              # Composants React
│   │   ├── ui/                  # shadcn/ui
│   │   ├── canvas/              # Canvas components
│   │   ├── chat/                # Chat IA
│   │   └── dashboard/           # Dashboard widgets
│   ├── hooks/                   # Custom hooks
│   └── lib/                     # Utilities
│
├── mini-services/               # Microservices
│   └── api-service/            # FastAPI Backend
│       ├── app/
│       │   ├── routers/        # API Routes
│       │   ├── services/       # Business Logic
│       │   ├── models/         # SQLAlchemy Models
│       │   └── schemas.py      # Pydantic Schemas
│       ├── tests/              # Pytest Tests
│       ├── migrations/         # DB Migrations
│       ├── Dockerfile          # Production
│       └── Dockerfile.dev      # Development
│
├── docker/                      # Docker configs
│   ├── nginx/
│   ├── prometheus/
│   └── grafana/
│
├── prisma/                      # Database schema
├── .github/workflows/           # CI/CD
├── docker-compose.yml           # Docker orchestration
├── Makefile                     # Commands
├── DOCKER.md                    # Docker docs
└── README.md                    # This file
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/ci.yml
- Lint & Format Check
- Type Check (TypeScript)
- Unit Tests (102 tests)
- Integration Tests
- Security Scan
- Docker Build
- Deploy (main branch)
```

### Environments

| Branch | Environment | URL |
|--------|-------------|-----|
| `develop` | Staging | staging.bizgen.ai |
| `main` | Production | bizgen.ai |

---

## 📈 Roadmap

### ✅ Phase 1 - Fondations (Complété)
- [x] Authentification JWT
- [x] CRUD Projets
- [x] Génération BMC basique

### ✅ Phase 2 - Améliorations (Complété)
- [x] WebSocket temps réel
- [x] Redis Cache
- [x] Templates sectoriels

### ✅ Phase 3 - Qualité (Complété)
- [x] Tests automatisés (102 tests)
- [x] Monitoring Prometheus
- [x] Export PDF/DOCX

### ✅ Phase 4 - Infrastructure (Complété)
- [x] Docker multi-services
- [x] CI/CD GitHub Actions
- [x] Sentry Error Tracking
- [x] PostgreSQL Migration

### 🚧 Phase 5 - Prévue
- [ ] Mobile App (React Native)
- [ ] Multi-langue (FR, EN, SW)
- [ ] Collaboration temps réel
- [ ] API publique

---

## 🤝 Contribution

### Développement Local

```bash
# Fork et clone
git clone https://github.com/votre-username/BizIGen.git

# Créer une branche
git checkout -b feature/ma-feature

# Installer les dépendances
bun install
cd mini-services/api-service && pip install -r requirements.txt

# Lancer les tests
pytest

# Commit et push
git commit -m "feat: ma nouvelle feature"
git push origin feature/ma-feature
```

### Conventions

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
- **Branches**: `feature/`, `fix/`, `docs/`, `chore/`
- **Code Style**: ESLint + Prettier (Frontend), Ruff (Backend)

---

## 📄 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Auteurs

- **Gaetan** - *Initial work* - [GitHub](https://github.com/Gaetan5)

---

## 🙏 Remerciements

- [OpenAI](https://openai.com) pour GPT-4
- [Stripe](https://stripe.com) pour les paiements
- [Flutterwave](https://flutterwave.com) pour les paiements Africa
- [shadcn/ui](https://ui.shadcn.com) pour les composants
- [Z.ai](https://chat.z.ai) pour l'assistance IA

---

<p align="center">
  <strong>Built with ❤️ for African Entrepreneurs</strong>
</p>

<p align="center">
  <a href="https://bizgen.ai">🌐 Website</a> •
  <a href="https://docs.bizgen.ai">📚 Documentation</a> •
  <a href="https://github.com/Gaetan5/BizIGen/issues">🐛 Issues</a>
</p>
