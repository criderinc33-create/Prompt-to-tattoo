# Makefile for Docker operations
# Use 'make help' to see all available commands

.PHONY: help build up down restart logs shell clean dev prod health backup

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Prompt to Tattoo - Docker Commands"
	@echo "===================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Development
dev: ## Start development environment with hot reload
	docker compose -f docker-compose.dev.yml up

dev-build: ## Build and start development environment
	docker compose -f docker-compose.dev.yml up --build

dev-down: ## Stop development environment
	docker compose -f docker-compose.dev.yml down

# Production
build: ## Build production Docker images
	docker compose build

up: ## Start production services in background
	docker compose up -d

down: ## Stop all services
	docker compose down

prod: ## Build and start production services
	docker compose up --build -d

prod-nginx: ## Start production with Nginx reverse proxy
	docker compose --profile production up -d

# Monitoring
logs: ## View logs (use SERVICE=app for specific service)
	docker compose logs -f $(SERVICE)

ps: ## List running containers
	docker compose ps

health: ## Check health status
	@echo "Checking health..."
	@curl -s http://localhost:5000/api/health | json_pp || echo "Service not reachable"

stats: ## Show resource usage statistics
	docker stats --no-stream

# Container operations
restart: ## Restart services (use SERVICE=app for specific service)
	docker compose restart $(SERVICE)

shell: ## Open shell in app container
	docker compose exec app sh

shell-db: ## Open shell in MongoDB container
	docker compose exec mongodb mongosh

# Maintenance
clean: ## Remove stopped containers and unused images
	docker compose down -v
	docker system prune -f

clean-all: ## Remove all containers, images, and volumes (destructive!)
	docker compose down -v
	docker system prune -af
	docker volume prune -f

rebuild: ## Rebuild from scratch
	docker compose build --no-cache
	docker compose up -d

# Database
backup-db: ## Backup MongoDB database
	@echo "Creating database backup..."
	docker compose exec -T mongodb mongodump --archive > backup-$(shell date +%Y%m%d-%H%M%S).archive
	@echo "Backup created: backup-$(shell date +%Y%m%d-%H%M%S).archive"

restore-db: ## Restore MongoDB database (use BACKUP=filename)
	@if [ -z "$(BACKUP)" ]; then echo "Error: Specify BACKUP=filename"; exit 1; fi
	docker compose exec -T mongodb mongorestore --archive < $(BACKUP)

# Testing
test: ## Run tests in container
	docker compose exec app npm test

validate: ## Validate Docker configuration
	docker compose config --quiet && echo "✓ Configuration is valid"

# Security
security-scan: ## Scan image for vulnerabilities (requires trivy)
	trivy image prompt-to-tattoo:latest

# Shortcuts
start: up ## Alias for 'up'
stop: down ## Alias for 'down'
log: logs ## Alias for 'logs'

# Advanced
scale: ## Scale app service (use REPLICAS=3)
	@if [ -z "$(REPLICAS)" ]; then echo "Error: Specify REPLICAS=number"; exit 1; fi
	docker compose up -d --scale app=$(REPLICAS)

update: ## Pull latest images and restart
	docker compose pull
	docker compose up -d
