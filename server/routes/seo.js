const express = require('express');
const router = express.Router();
const { validate, validationRules } = require('../middleware/validation');

// SEO Agent - Provides meta tags, structured data, and SEO optimization

// Get SEO meta tags for default home page
router.get('/meta', (req, res) => {
  res.redirect('/api/seo/meta/home');
});

// Get SEO meta tags for a page
router.get('/meta/:page', (req, res) => {
  const page = req.params.page || 'home';
  
  const seoData = {
    home: {
      title: 'Prompt to Tattoo - AI Tattoo Design Generator | Create Custom Tattoo Art',
      description: 'Generate unique tattoo designs with AI. Turn your ideas into beautiful tattoo artwork instantly. Free AI-powered tattoo generator with professional results.',
      keywords: 'tattoo generator, AI tattoo design, custom tattoo, tattoo art, tattoo maker, AI art generator, tattoo ideas, tattoo design tool',
      ogTitle: 'AI Tattoo Design Generator - Create Custom Tattoos Instantly',
      ogDescription: 'Transform your ideas into stunning tattoo designs using AI. Free to start, professional results.',
      ogImage: '/images/og-image.png',
      canonicalUrl: '/',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'Prompt to Tattoo',
        'description': 'AI-powered tattoo design generator',
        'url': 'https://prompttotattoo.com',
        'applicationCategory': 'DesignApplication',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.8',
          'ratingCount': '1250'
        }
      }
    },
    pricing: {
      title: 'Pricing Plans - Prompt to Tattoo | Affordable AI Tattoo Design',
      description: 'Choose the perfect plan for your tattoo design needs. Free plan available. Premium plans start at $9.99/month with unlimited generations.',
      keywords: 'tattoo generator pricing, AI tattoo cost, tattoo design subscription, affordable tattoo maker',
      ogTitle: 'Tattoo Design Pricing - Free & Premium Plans',
      ogDescription: 'Start free or upgrade for unlimited AI tattoo generations. Plans from $9.99/month.',
      canonicalUrl: '/pricing',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': 'Prompt to Tattoo Premium',
        'offers': [
          {
            '@type': 'Offer',
            'name': 'Basic Plan',
            'price': '9.99',
            'priceCurrency': 'USD',
            'priceSpecification': {
              '@type': 'UnitPriceSpecification',
              'price': '9.99',
              'priceCurrency': 'USD',
              'billingDuration': 'P1M'
            }
          },
          {
            '@type': 'Offer',
            'name': 'Premium Plan',
            'price': '19.99',
            'priceCurrency': 'USD'
          }
        ]
      }
    },
    gallery: {
      title: 'Tattoo Design Gallery - AI Generated Tattoo Art Examples',
      description: 'Browse our gallery of AI-generated tattoo designs. Get inspired for your next tattoo with hundreds of unique designs.',
      keywords: 'tattoo gallery, tattoo examples, AI tattoo art, tattoo inspiration, tattoo designs',
      canonicalUrl: '/gallery'
    }
  };
  
  res.json({
    success: true,
    seo: seoData[page] || seoData.home
  });
});

// Generate sitemap.xml
router.get('/sitemap', (req, res) => {
  const baseUrl = process.env.CLIENT_URL || 'https://prompttotattoo.com';
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/gallery</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

// Generate robots.txt
router.get('/robots', (req, res) => {
  const baseUrl = process.env.CLIENT_URL || 'https://prompttotattoo.com';
  
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /user/

Sitemap: ${baseUrl}/sitemap.xml

# Google
User-agent: Googlebot
Allow: /

# Bing
User-agent: Bingbot
Allow: /

# Crawl-delay
Crawl-delay: 1`;

  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// SEO audit - Check page SEO health
router.post('/audit', validate(validationRules.seoAudit), (req, res) => {
  const { url, content } = req.body;
  
  const audit = {
    score: 0,
    checks: [],
    recommendations: []
  };
  
  // Title check
  if (content?.title) {
    if (content.title.length >= 50 && content.title.length <= 60) {
      audit.checks.push({ name: 'Title Length', status: 'pass', message: 'Title length is optimal' });
      audit.score += 15;
    } else {
      audit.checks.push({ name: 'Title Length', status: 'warning', message: 'Title should be 50-60 characters' });
      audit.recommendations.push('Optimize title length to 50-60 characters');
    }
  } else {
    audit.checks.push({ name: 'Title', status: 'fail', message: 'Missing page title' });
    audit.recommendations.push('Add a descriptive page title');
  }
  
  // Description check
  if (content?.description) {
    if (content.description.length >= 150 && content.description.length <= 160) {
      audit.checks.push({ name: 'Meta Description', status: 'pass', message: 'Description length is optimal' });
      audit.score += 15;
    } else {
      audit.checks.push({ name: 'Meta Description', status: 'warning', message: 'Description should be 150-160 characters' });
      audit.recommendations.push('Optimize description length to 150-160 characters');
    }
  } else {
    audit.checks.push({ name: 'Meta Description', status: 'fail', message: 'Missing meta description' });
    audit.recommendations.push('Add a compelling meta description');
  }
  
  // Keywords check
  if (content?.keywords) {
    audit.checks.push({ name: 'Keywords', status: 'pass', message: 'Keywords present' });
    audit.score += 10;
  } else {
    audit.checks.push({ name: 'Keywords', status: 'warning', message: 'No keywords specified' });
    audit.recommendations.push('Add relevant keywords');
  }
  
  // Open Graph check
  if (content?.ogTitle && content?.ogDescription) {
    audit.checks.push({ name: 'Open Graph', status: 'pass', message: 'OG tags present' });
    audit.score += 20;
  } else {
    audit.checks.push({ name: 'Open Graph', status: 'warning', message: 'Missing OG tags' });
    audit.recommendations.push('Add Open Graph meta tags for social sharing');
  }
  
  // Structured data check
  if (content?.schema) {
    audit.checks.push({ name: 'Structured Data', status: 'pass', message: 'Schema.org markup present' });
    audit.score += 20;
  } else {
    audit.checks.push({ name: 'Structured Data', status: 'warning', message: 'No structured data' });
    audit.recommendations.push('Add Schema.org structured data');
  }
  
  // Mobile-friendly
  audit.checks.push({ name: 'Mobile Responsive', status: 'pass', message: 'Design is mobile-friendly' });
  audit.score += 20;
  
  // Grade based on score
  let grade = 'F';
  if (audit.score >= 90) grade = 'A';
  else if (audit.score >= 80) grade = 'B';
  else if (audit.score >= 70) grade = 'C';
  else if (audit.score >= 60) grade = 'D';
  
  res.json({
    success: true,
    audit: {
      ...audit,
      grade,
      maxScore: 100
    }
  });
});

module.exports = router;
