#!/bin/bash

# Quick Start Script for Docker Deployment
# This script helps you get started with Docker deployment quickly

set -e

echo "🎨 Prompt to Tattoo - Docker Quick Start"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker detected: $(docker --version)"
echo "✅ Docker Compose detected: $(docker compose version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.docker .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and configure:"
    echo "   1. JWT_SECRET (generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\")"
    echo "   2. MONGO_ROOT_PASSWORD (use a strong password)"
    echo "   3. CLIENT_URL (your domain, e.g., https://yourdomain.com)"
    echo "   4. HUGGING_FACE_API_KEY (optional, for AI generation)"
    echo "   5. STRIPE_* keys (optional, for payments)"
    echo ""
    read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
else
    echo "ℹ️  Using existing .env file"
fi

echo ""
echo "🔧 Configuration Check..."

# Check if JWT_SECRET is set
if ! grep -q "JWT_SECRET=.\+" .env; then
    echo "⚠️  Warning: JWT_SECRET is not set in .env"
    echo "   Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
fi

# Check if MongoDB password is the default
if grep -q "MONGO_ROOT_PASSWORD=changeme" .env; then
    echo "⚠️  Warning: Using default MongoDB password. Please change it!"
fi

echo ""
echo "🚀 Starting Docker deployment..."
echo ""

# Ask for deployment mode
echo "Select deployment mode:"
echo "1) Production (app + database)"
echo "2) Production with Nginx (app + database + nginx)"
echo "3) Development (hot reload)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "🏭 Starting production deployment..."
        docker compose up -d
        ;;
    2)
        echo ""
        echo "🏭 Starting production deployment with Nginx..."
        docker compose --profile production up -d
        ;;
    3)
        echo ""
        echo "💻 Starting development deployment..."
        docker compose -f docker-compose.dev.yml up -d
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if containers are running
if docker compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📍 Access points:"
    
    if [ "$choice" = "2" ]; then
        echo "   🌐 Application: http://localhost"
        echo "   🌐 Application (HTTPS): https://localhost (if SSL configured)"
    else
        echo "   🌐 Application: http://localhost:5000"
    fi
    
    echo "   🔍 Health Check: http://localhost:5000/api/health"
    echo "   📊 API Docs: http://localhost:5000/api"
    echo ""
    echo "📝 Useful commands:"
    echo "   View logs:        docker compose logs -f"
    echo "   Stop services:    docker compose down"
    echo "   Restart:          docker compose restart"
    echo "   Shell access:     docker compose exec app sh"
    echo ""
    echo "📚 Full documentation: DOCKER_DEPLOYMENT.md"
    echo ""
    echo "🎉 Happy tattoo designing!"
else
    echo ""
    echo "❌ Deployment failed. Check logs with: docker compose logs"
    exit 1
fi
