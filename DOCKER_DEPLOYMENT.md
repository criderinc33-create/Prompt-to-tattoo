# Docker Deployment Guide

Complete guide for deploying Prompt to Tattoo using Docker containers.

## Table of Contents
- [Quick Start](#quick-start)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Docker 20.10 or higher
- Docker Compose 2.0 or higher
- 2GB RAM minimum, 4GB recommended

### 1. Clone and Configure

```bash
git clone https://github.com/criderinc33-create/Prompt-to-tattoo.git
cd Prompt-to-tattoo

# Copy environment template
cp .env.docker .env

# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Add the output to .env as JWT_SECRET
```

### 2. Build and Run

**Production (recommended):**
```bash
docker-compose up -d
```

**Development:**
```bash
docker-compose -f docker-compose.dev.yml up
```

### 3. Access the Application

- **Application**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health
- **MongoDB**: localhost:27017 (if running)

---

## Development

### Development Mode with Hot Reload

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# With database
docker-compose -f docker-compose.dev.yml --profile with-db up

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop
docker-compose -f docker-compose.dev.yml down
```

### Development Features
- ✅ Hot reload for both frontend and backend
- ✅ Source code mounted as volumes
- ✅ All logs visible in console
- ✅ React dev server on port 3000
- ✅ Express API on port 5000

### Accessing Development Containers

```bash
# Shell into app container
docker exec -it tattoo-app-dev sh

# View app logs
docker logs -f tattoo-app-dev

# View MongoDB logs
docker logs -f tattoo-mongodb-dev
```

---

## Production Deployment

### Build Production Image

```bash
# Build the image
docker-compose build

# Or build manually
docker build -t prompt-to-tattoo:latest .
```

### Deploy with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Deploy with Nginx (Recommended)

```bash
# Start with nginx reverse proxy
docker-compose --profile production up -d

# This starts:
# - MongoDB
# - Application
# - Nginx (ports 80/443)
```

### Individual Container Commands

```bash
# Start only app
docker-compose up -d app

# Start only database
docker-compose up -d mongodb

# Restart app
docker-compose restart app

# View app logs
docker-compose logs -f app

# Execute command in app
docker-compose exec app node -v
```

---

## Configuration

### Environment Variables

Edit `.env` file:

```bash
# Required
JWT_SECRET=<generated-secret>
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=<strong-password>

# Optional but recommended
CLIENT_URL=https://yourdomain.com
HUGGING_FACE_API_KEY=<your-key>

# For premium features
MONGODB_URI=mongodb://admin:password@mongodb:27017/tattoo?authSource=admin
STRIPE_SECRET_KEY=<your-key>
STRIPE_PUBLISHABLE_KEY=<your-key>
STRIPE_WEBHOOK_SECRET=<your-key>
```

### Docker Compose Configuration

**docker-compose.yml** - Production setup
- Multi-container orchestration
- MongoDB with persistence
- Application with health checks
- Optional Nginx reverse proxy

**docker-compose.dev.yml** - Development setup
- Hot reload enabled
- Source code mounting
- Development optimizations

### Nginx Configuration

Edit `nginx.conf` for:
- SSL/TLS certificates
- Custom domain names
- Rate limiting adjustments
- Security headers

```nginx
# SSL Configuration (uncomment in nginx.conf)
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

---

## Monitoring

### Health Checks

The application includes built-in health checks:

```bash
# Check application health
curl http://localhost:5000/api/health

# Docker health status
docker-compose ps
docker inspect tattoo-app | grep -A 10 Health
```

### Container Stats

```bash
# Real-time stats
docker stats tattoo-app tattoo-mongodb

# Resource usage
docker-compose top

# Disk usage
docker system df
```

### Logs

```bash
# All service logs
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs mongodb

# Follow logs (live)
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100 app

# With timestamps
docker-compose logs -t app
```

---

## Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check if port is in use
lsof -i :5000

# Rebuild image
docker-compose build --no-cache app
docker-compose up -d
```

#### MongoDB Connection Error

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check connection string in .env
# Should be: mongodb://username:password@mongodb:27017/tattoo?authSource=admin
```

#### Out of Memory

```bash
# Check memory usage
docker stats tattoo-app

# Increase Docker memory limit
# Docker Desktop: Settings → Resources → Memory

# Or limit app memory in docker-compose.yml:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
```

#### Build Failures

```bash
# Clear cache and rebuild
docker-compose build --no-cache

# Remove old images
docker image prune -a

# Check disk space
docker system df
df -h
```

### Debugging

```bash
# Shell into running container
docker-compose exec app sh

# Run diagnostics
docker-compose exec app node -e "console.log(process.env)"

# Check file permissions
docker-compose exec app ls -la /app

# Test network connectivity
docker-compose exec app ping mongodb
docker-compose exec app nc -zv mongodb 27017
```

### Reset Everything

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove images
docker rmi prompt-to-tattoo:latest

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

---

## Production Best Practices

### Security

1. **Use Secrets Management**
   ```bash
   # Use Docker secrets instead of .env
   docker secret create jwt_secret jwt_secret.txt
   ```

2. **Run as Non-Root**
   - ✅ Already configured in Dockerfile
   - App runs as user `nodejs` (UID 1001)

3. **Keep Images Updated**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

4. **Enable HTTPS**
   - Use Let's Encrypt for SSL certificates
   - Configure nginx.conf for HTTPS
   - Redirect HTTP to HTTPS

### Performance

1. **Resource Limits**
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '1.0'
             memory: 1G
           reservations:
             memory: 512M
   ```

2. **Database Optimization**
   ```yaml
   mongodb:
     command: --wiredTigerCacheSizeGB 0.5
   ```

### Backup

1. **Database Backup**
   ```bash
   # Backup MongoDB
   docker-compose exec mongodb mongodump --out /data/backup
   
   # Copy backup from container
   docker cp tattoo-mongodb:/data/backup ./backup
   ```

2. **Automated Backups**
   ```bash
   # Add to crontab
   0 2 * * * cd /path/to/app && docker-compose exec -T mongodb mongodump --out /data/backup
   ```

### Scaling

1. **Horizontal Scaling**
   ```bash
   # Scale app instances
   docker-compose up -d --scale app=3
   ```

2. **Load Balancing**
   - Use nginx upstream for multiple app instances
   - Configure health checks
   - Sticky sessions for websockets

---

## Deployment Platforms

### Deploy to Cloud

**AWS ECS:**
```bash
# Push to ECR
docker tag prompt-to-tattoo:latest <account>.dkr.ecr.<region>.amazonaws.com/prompt-to-tattoo
docker push <account>.dkr.ecr.<region>.amazonaws.com/prompt-to-tattoo
```

**Google Cloud Run:**
```bash
# Push to GCR
docker tag prompt-to-tattoo:latest gcr.io/<project>/prompt-to-tattoo
docker push gcr.io/<project>/prompt-to-tattoo
```

**DigitalOcean:**
```bash
# Push to DO Container Registry
docker tag prompt-to-tattoo:latest registry.digitalocean.com/<registry>/prompt-to-tattoo
docker push registry.digitalocean.com/<registry>/prompt-to-tattoo
```

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml tattoo

# Check services
docker service ls
docker service logs tattoo_app
```

### Kubernetes

```bash
# Generate k8s manifests from docker-compose
kompose convert -f docker-compose.yml

# Deploy to k8s
kubectl apply -f .
```

---

## Maintenance

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Check updated services
docker-compose ps
```

### Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything (careful!)
docker system prune -a --volumes
```

---

## Support

For issues with Docker deployment:

1. Check logs: `docker-compose logs -f`
2. Run diagnostics: `docker-compose exec app node -v`
3. Review [Troubleshooting](#troubleshooting) section
4. Check Docker documentation: https://docs.docker.com

---

## Quick Reference

```bash
# Common Commands
docker-compose up -d              # Start in background
docker-compose down               # Stop containers
docker-compose ps                 # List containers
docker-compose logs -f app        # View logs
docker-compose exec app sh        # Shell access
docker-compose restart app        # Restart service
docker-compose build --no-cache   # Rebuild images

# Environment
cp .env.docker .env               # Setup environment
docker-compose config             # Validate compose file

# Maintenance  
docker-compose pull               # Update images
docker system prune               # Cleanup
docker stats                      # Resource usage
```

---

Made with ❤️ for containerized deployments
