# ============================================
# BizGen AI - Makefile for Docker Operations
# ============================================

.PHONY: help build up down logs clean restart shell test db-migrate db-reset

# Default target
help:
	@echo "BizGen AI - Docker Commands"
	@echo "==========================="
	@echo ""
	@echo "  make build       Build all Docker images"
	@echo "  make up          Start all services (development)"
	@echo "  make up-prod     Start all services (production)"
	@echo "  make up-monitor  Start with monitoring (Prometheus + Grafana)"
	@echo "  make down        Stop all services"
	@echo "  make logs        Show logs from all services"
	@echo "  make logs-api    Show API logs"
	@echo "  make restart     Restart all services"
	@echo "  make clean       Remove containers, volumes, and images"
	@echo "  make shell       Open bash in API container"
	@echo "  make test        Run tests in Docker"
	@echo "  make db-migrate  Run database migrations"
	@echo "  make db-reset    Reset database (WARNING: destroys data)"
	@echo ""

# Build images
build:
	docker-compose build

# Start services (development)
up:
	docker-compose up --build

# Start services (detached)
up-d:
	docker-compose up --build -d

# Start with production profile
up-prod:
	docker-compose --profile production up --build -d

# Start with monitoring
up-monitor:
	docker-compose --profile monitoring up --build -d

# Start everything
up-all:
	docker-compose --profile production --profile monitoring up --build -d

# Stop services
down:
	docker-compose down

# Stop and remove volumes
down-v:
	docker-compose down -v

# View logs
logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-postgres:
	docker-compose logs -f postgres

logs-redis:
	docker-compose logs -f redis

# Restart services
restart:
	docker-compose restart

# Clean up
clean:
	docker-compose down -v --rmi all --remove-orphans

# Open shell in API container
shell:
	docker-compose exec api /bin/bash

# Run tests
test:
	docker-compose exec api pytest -v

# Database migrations
db-migrate:
	docker-compose exec api python -m migrations.migrate_to_postgres

# Reset database
db-reset:
	docker-compose down -v
	docker-compose up -d postgres
	sleep 5
	docker-compose up -d api

# Health check
health:
	curl -f http://localhost:3001/health || echo "API not healthy"

# Show status
status:
	docker-compose ps
