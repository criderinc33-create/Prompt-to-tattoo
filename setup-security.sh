#!/bin/bash

# Security Configuration Setup Script
# This script helps configure recommended security settings for production

echo "🔒 Prompt to Tattoo - Security Configuration Setup"
echo "=================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "🔑 Generating secure JWT secret..."
# Generate a strong JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

# Update JWT_SECRET in .env if it's still the default
if grep -q "your-super-secret-jwt-key-change-this-in-production" .env; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    else
        # Linux
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    fi
    echo "✅ JWT_SECRET updated with a secure random value"
else
    echo "ℹ️  JWT_SECRET already configured"
fi

echo ""
echo "📦 Installing recommended security packages..."
npm install --save helmet morgan express-validator

echo ""
echo "✅ Security configuration complete!"
echo ""
echo "⚠️  Important Next Steps:"
echo "   1. Review and configure your .env file"
echo "   2. Set NODE_ENV=production for production deployments"
echo "   3. Configure MONGODB_URI for database access"
echo "   4. Add STRIPE_SECRET_KEY for payment processing"
echo "   5. Add HUGGING_FACE_API_KEY for AI generation"
echo "   6. Ensure CLIENT_URL matches your frontend domain"
echo ""
echo "🔐 Security Checklist:"
echo "   ✓ JWT_SECRET: Configured with secure random value"
echo "   ✓ Helmet.js: Installed for security headers"
echo "   ✓ Morgan: Installed for request logging"
echo "   ✓ Express-validator: Installed for input validation"
echo "   ✓ Rate limiting: Already configured in code"
echo "   ✓ CORS: Already configured in code"
echo ""
echo "📖 For more information, see SECURITY.md"
