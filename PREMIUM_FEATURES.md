# Prompt to Tattoo - Premium Features Documentation

## Overview

This document covers the premium features including paid subscriptions, built-in SEO agent, and automatic troubleshooting.

## Table of Contents
1. [Paid Version & Subscriptions](#paid-version--subscriptions)
2. [Built-in SEO Agent](#built-in-seo-agent)
3. [Automatic Troubleshooting](#automatic-troubleshooting)
4. [API Reference](#api-reference)

---

## Paid Version & Subscriptions

### Features by Plan

#### Free Plan
- **Price**: $0
- **Credits**: 3 generations
- **Quality**: Standard
- **Features**:
  - Basic tattoo generation
  - Standard quality images
  - Rate-limited (10/hour for anonymous users)

#### Basic Plan ($9.99/month)
- **Credits**: Unlimited
- **Quality**: Standard
- **Features**:
  - Unlimited generations
  - Standard quality
  - Email support
  - No ads
  - Save generation history

#### Premium Plan ($19.99/month)
- **Credits**: Unlimited
- **Quality**: High
- **Features**:
  - Unlimited generations
  - High-quality images
  - Priority support
  - No watermark
  - Commercial license
  - Advanced customization options
  - Save and organize designs

#### Pro Plan ($49.99/month)
- **Credits**: Unlimited
- **Quality**: Highest
- **Features**:
  - Everything in Premium
  - Highest quality images
  - 24/7 priority support
  - API access
  - Bulk generation
  - Custom model training (coming soon)
  - White-label option

### Setting Up Payment Processing

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up and complete verification

2. **Get API Keys**
   - Navigate to Developers → API keys
   - Copy your Secret and Publishable keys
   - Add to `.env` file:
     ```
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```

3. **Create Products and Prices**
   - Go to Products in Stripe Dashboard
   - Create three products: Basic, Premium, Pro
   - Set up recurring monthly prices
   - Copy the Price IDs to `.env`:
     ```
     STRIPE_BASIC_PRICE_ID=price_...
     STRIPE_PREMIUM_PRICE_ID=price_...
     STRIPE_PRO_PRICE_ID=price_...
     ```

4. **Set Up Webhooks**
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/payment/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
   - Copy webhook secret to `.env`:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

5. **Configure Database**
   - Set up MongoDB Atlas (free tier available)
   - Add connection string to `.env`:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tattoo
     ```

### User Authentication

The app now includes JWT-based authentication:

```javascript
// Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Get current user
GET /api/auth/me
Headers: { "Authorization": "Bearer <token>" }
```

---

## Built-in SEO Agent

### Features

The SEO agent automatically optimizes your application for search engines:

1. **Dynamic Meta Tags** - Per-page optimized meta tags
2. **Structured Data** - Schema.org JSON-LD markup
3. **Sitemap Generation** - Auto-generated sitemap.xml
4. **Robots.txt** - Search engine crawling rules
5. **SEO Auditing** - Real-time SEO health checks

### API Endpoints

#### Get SEO Meta Tags
```javascript
GET /api/seo/meta/:page

// Example: GET /api/seo/meta/home
Response:
{
  "success": true,
  "seo": {
    "title": "Prompt to Tattoo - AI Tattoo Design Generator",
    "description": "Generate unique tattoo designs with AI...",
    "keywords": "tattoo generator, AI tattoo design...",
    "schema": { /* Schema.org structured data */ }
  }
}
```

#### Generate Sitemap
```javascript
GET /api/seo/sitemap

Returns XML sitemap for search engines
```

#### Generate Robots.txt
```javascript
GET /api/seo/robots

Returns robots.txt file
```

#### SEO Audit
```javascript
POST /api/seo/audit
{
  "url": "/",
  "content": {
    "title": "Page title",
    "description": "Meta description",
    "keywords": "keywords",
    "ogTitle": "OG title",
    "ogDescription": "OG description"
  }
}

Response:
{
  "success": true,
  "audit": {
    "score": 85,
    "grade": "B",
    "checks": [...],
    "recommendations": [...]
  }
}
```

### Implementation in Frontend

Add this to your React component to use SEO data:

```javascript
useEffect(() => {
  fetch('/api/seo/meta/home')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.title = data.seo.title;
        // Update other meta tags
      }
    });
}, []);
```

---

## Automatic Troubleshooting

### Features

The troubleshooting agent automatically detects and fixes common issues:

1. **System Diagnostics** - Check environment, dependencies, and configuration
2. **Auto-Fix** - Automatically resolve common problems
3. **Smart Suggestions** - Context-aware troubleshooting recommendations
4. **Health Monitoring** - Real-time system health checks

### API Endpoints

#### Run Diagnostics
```javascript
GET /api/troubleshoot/diagnose

Response:
{
  "success": true,
  "diagnostics": {
    "status": "healthy" | "warning" | "critical",
    "issues": [
      {
        "severity": "high" | "medium" | "low",
        "category": "configuration" | "database" | "performance",
        "message": "Description of issue",
        "fix": "How to fix it"
      }
    ],
    "systemInfo": {
      "nodeVersion": "v18.0.0",
      "platform": "linux",
      "uptime": 3600,
      "memory": { "heapUsed": 45, "heapTotal": 60 }
    }
  }
}
```

#### Auto-Fix Issues
```javascript
POST /api/troubleshoot/fix
{
  "issue": "missing-env" | "clear-cache" | "reset-rate-limit" | "check-dependencies"
}

Response:
{
  "success": true,
  "fixes": [
    {
      "action": "Created .env file from template",
      "status": "success",
      "message": "Please configure your environment variables"
    }
  ]
}
```

#### Get Troubleshooting Suggestions
```javascript
POST /api/troubleshoot/suggest
{
  "error": "Connection refused",
  "context": "generation-failed"
}

Response:
{
  "success": true,
  "suggestions": [
    {
      "title": "Connection Refused",
      "suggestions": [
        "Check if the database/service is running",
        "Verify the connection URL and port",
        ...
      ],
      "relevance": "high",
      "autoFixAvailable": true
    }
  ]
}
```

#### Health Check
```javascript
GET /api/troubleshoot/health

Response:
{
  "success": true,
  "health": {
    "status": "healthy",
    "uptime": 3600,
    "services": {
      "api": "up",
      "database": "up",
      "ai": "configured"
    }
  }
}
```

### Common Issues and Auto-Fixes

#### Missing Environment File
```bash
# Automatically creates .env from .env.example
POST /api/troubleshoot/fix
{ "issue": "missing-env" }
```

#### High Memory Usage
```bash
# Triggers garbage collection
POST /api/troubleshoot/fix
{ "issue": "clear-cache" }
```

#### Rate Limit Exceeded
```bash
# Resets rate limiting counters
POST /api/troubleshoot/fix
{ "issue": "reset-rate-limit" }
```

#### Missing Dependencies
```bash
# Checks and reports missing packages
POST /api/troubleshoot/fix
{ "issue": "check-dependencies" }
```

---

## API Reference

### Complete API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

#### Payment
- `GET /api/payment/plans` - Get pricing plans
- `POST /api/payment/create-checkout-session` - Create Stripe checkout
- `POST /api/payment/webhook` - Stripe webhook handler
- `POST /api/payment/buy-credits` - Purchase one-time credits

#### Generation
- `POST /api/generate` - Generate tattoo design
- `GET /api/history` - Get user's generation history

#### SEO
- `GET /api/seo/meta/:page` - Get page meta tags
- `GET /api/seo/sitemap` - Get sitemap.xml
- `GET /api/seo/robots` - Get robots.txt
- `POST /api/seo/audit` - Run SEO audit

#### Troubleshooting
- `GET /api/troubleshoot/diagnose` - Run diagnostics
- `POST /api/troubleshoot/fix` - Auto-fix issues
- `POST /api/troubleshoot/suggest` - Get suggestions
- `GET /api/troubleshoot/health` - Health check

#### System
- `GET /api/health` - API health check

---

## Best Practices

### Security
1. Never commit `.env` file to version control
2. Use strong, unique JWT_SECRET in production
3. Enable Stripe webhook signature verification
4. Implement rate limiting on all endpoints
5. Use HTTPS in production

### Performance
1. Implement caching for frequently accessed data
2. Use CDN for static assets
3. Optimize database queries with indexes
4. Monitor memory usage regularly
5. Use connection pooling for database

### Monitoring
1. Set up automatic diagnostics cron job
2. Monitor system health dashboard
3. Track error rates and response times
4. Set up alerts for critical issues
5. Regular SEO audits

---

## Troubleshooting

### Common Setup Issues

**Issue**: "MongoDB connection failed"
- **Solution**: Check MONGODB_URI in .env
- **Auto-fix**: `POST /api/troubleshoot/fix { "issue": "check-dependencies" }`

**Issue**: "Stripe checkout not working"
- **Solution**: Verify STRIPE_SECRET_KEY and price IDs
- **Check**: Run `GET /api/troubleshoot/diagnose`

**Issue**: "JWT token invalid"
- **Solution**: Ensure JWT_SECRET is set and consistent
- **Fix**: Set a strong JWT_SECRET in .env

**Issue**: "SEO meta tags not showing"
- **Solution**: Check /api/seo/meta endpoint
- **Audit**: `POST /api/seo/audit` to check SEO health

---

## Support

For issues with premium features:
1. Run diagnostics: `GET /api/troubleshoot/diagnose`
2. Check suggestions: `POST /api/troubleshoot/suggest`
3. Try auto-fix: `POST /api/troubleshoot/fix`
4. Contact support with diagnostic report

---

## Roadmap

### Upcoming Features
- [ ] Advanced customization UI
- [ ] Custom model fine-tuning
- [ ] Gallery of generated designs
- [ ] Social sharing integration
- [ ] Mobile app (iOS/Android)
- [ ] Collaboration features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Tattoo artist marketplace integration
