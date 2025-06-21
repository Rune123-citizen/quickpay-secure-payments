
.PHONY: dev build test clean

# Development commands
dev:
	docker-compose up -d postgres redis mongodb kafka vault
	sleep 10
	docker-compose up auth-service user-service txn-service notif-service balance-service

dev-full:
	docker-compose up --build

dev-services:
	docker-compose up -d postgres redis mongodb kafka vault

# Build commands
build:
	docker-compose build

# Database commands
db-migrate:
	docker-compose exec user-service npm run migration:run

db-seed:
	docker-compose exec user-service npm run seed

# Testing
test:
	docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit

test-unit:
	cd services/auth-svc && npm test
	cd services/user-svc && npm test

# Cleanup
clean:
	docker-compose down -v
	docker system prune -f

# Monitoring
logs:
	docker-compose logs -f

logs-auth:
	docker-compose logs -f auth-service

# Production deployment
deploy-staging:
	kubectl apply -f infra/helm/staging/

deploy-prod:
	kubectl apply -f infra/helm/production/

# Security scans
security-scan:
	docker run --rm -v $(PWD):/app securecodewarrior/docker-security-scan /app

# Generate API docs
docs:
	cd services/auth-svc && npm run build && npm run docs:generate
