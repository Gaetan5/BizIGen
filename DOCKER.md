# BizGen AI - Docker Configuration

Ce guide explique comment exécuter tout le backend BizGen AI sous Docker.

## 🚀 Démarrage Rapide

```bash
# 1. Copier le fichier d'environnement
cp .env.docker.example .env

# 2. Éditer .env avec vos clés API
nano .env

# 3. Démarrer les services
docker-compose up -d

# 4. Vérifier que tout fonctionne
curl http://localhost:3001/health
```

## 📦 Services Disponibles

| Service | Port | Description |
|---------|------|-------------|
| **API** | 3001 | FastAPI Backend |
| **PostgreSQL** | 5432 | Base de données |
| **Redis** | 6379 | Cache & Sessions |
| **Nginx** | 80/443 | Reverse Proxy (production) |
| **Prometheus** | 9090 | Monitoring (optionnel) |
| **Grafana** | 3002 | Dashboards (optionnel) |
| **Adminer** | 8080 | DB Admin (développement) |
| **Redis Commander** | 8081 | Redis GUI (développement) |

## 🛠️ Commandes Make

```bash
make help          # Afficher l'aide
make build         # Construire les images
make up            # Démarrer (développement)
make up-d          # Démarrer en arrière-plan
make up-prod       # Démarrer en mode production
make up-monitor    # Démarrer avec monitoring
make down          # Arrêter les services
make logs          # Voir les logs
make logs-api      # Voir les logs API
make shell         # Shell dans le container API
make test          # Exécuter les tests
make db-reset      # Réinitialiser la DB
make clean         # Nettoyer tout
```

## 🏗️ Architecture Docker

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Port 80/443)                  │
│                    Reverse Proxy                        │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   API Backend   │
│   Next.js       │     │   FastAPI       │
│   (Port 3000)   │     │   (Port 3001)   │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
          ┌─────────────────┐       ┌─────────────────┐
          │   PostgreSQL    │       │     Redis       │
          │   (Port 5432)   │       │   (Port 6379)   │
          └─────────────────┘       └─────────────────┘
```

## 📁 Structure des Fichiers

```
bizgen-ai/
├── docker-compose.yml          # Configuration principale
├── docker-compose.override.yml # Overrides développement
├── .env.docker.example         # Variables d'environnement
├── Makefile                    # Commandes simplifiées
├── docker-start.sh             # Script de démarrage
├── docker-stop.sh              # Script d'arrêt
├── mini-services/api-service/
│   ├── Dockerfile              # Image production
│   ├── Dockerfile.dev          # Image développement
│   └── .dockerignore           # Fichiers ignorés
└── docker/
    ├── nginx/
    │   └── nginx.conf          # Configuration Nginx
    ├── prometheus/
    │   └── prometheus.yml      # Configuration Prometheus
    └── grafana/
        ├── dashboards/         # Dashboards Grafana
        └── datasources/        # Sources de données
```

## 🔧 Configuration

### Variables d'Environnement Obligatoires

```bash
# Sécurité
SECRET_KEY=your-super-secret-key-min-32-characters

# Base de données
POSTGRES_PASSWORD=secure_password

# IA
OPENAI_API_KEY=sk-your-key
```

### Variables Optionnelles

```bash
# Paiement
STRIPE_SECRET_KEY=sk_live_xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🐛 Dépannage

### L'API ne démarre pas

```bash
# Vérifier les logs
docker-compose logs api

# Vérifier la connexion à la DB
docker-compose exec postgres pg_isready
```

### Problème de connexion PostgreSQL

```bash
# Redémarrer PostgreSQL
docker-compose restart postgres

# Vérifier les credentials
docker-compose exec postgres psql -U bizgen -d bizgen
```

### Reset complet

```bash
# Arrêter et supprimer les volumes
docker-compose down -v

# Reconstruire
docker-compose up --build
```

## 📊 Monitoring (Optionnel)

```bash
# Démarrer avec monitoring
make up-monitor

# Accéder aux interfaces
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3002 (admin/admin123)
```

## 🔐 Production

Pour la production:

1. Utilisez le profile production:
```bash
docker-compose --profile production up -d
```

2. Configurez HTTPS dans `docker/nginx/nginx.conf`

3. Utilisez des secrets Docker ou un vault

4. Activez Sentry pour le tracking d'erreurs

## 🧪 Tests

```bash
# Exécuter les tests dans Docker
docker-compose exec api pytest -v

# Avec coverage
docker-compose exec api pytest --cov=app --cov-report=html
```

## 📝 Logs

```bash
# Tous les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
```
