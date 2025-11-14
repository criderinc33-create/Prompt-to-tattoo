const express = require('express');
const router = express.Router();
const axios = require('axios');
const { optionalAuth } = require('../middleware/auth');

// Check if database is available
const mongoose = require('mongoose');
const isDatabaseAvailable = () => mongoose.connection.readyState === 1;

// Lazy load models only if database is available
const getModels = () => {
  if (!isDatabaseAvailable()) return { User: null, Generation: null };
  return {
    User: require('../models/User'),
    Generation: require('../models/Generation')
  };
};

// Rate limiting setup (simple in-memory counter)
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // requests per hour for free tier
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Filter out requests older than the rate window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

// Generate tattoo design endpoint
router.post('/generate', optionalAuth, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const user = req.user;
    
    // Check authentication and credits
    if (user) {
      // Logged in user
      if (!user.hasCredits()) {
        return res.status(403).json({ 
          error: 'No credits remaining. Please upgrade your plan or purchase more credits.',
          requiresUpgrade: true
        });
      }
    } else {
      // Anonymous user - check rate limit
      const clientIp = req.ip || req.connection.remoteAddress;
      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please sign up for unlimited generations.',
          requiresAuth: true
        });
      }
    }
    
    // Enhanced prompt based on subscription level
    let enhancedPrompt;
    const subscription = user ? user.subscription : 'free';
    
    if (subscription === 'pro' || subscription === 'premium') {
      enhancedPrompt = `${prompt}, ultra detailed tattoo design, professional artist quality, black and white line art, intricate details, masterpiece tattoo stencil, clean precise lines, high resolution, artistic excellence`;
    } else if (subscription === 'basic') {
      enhancedPrompt = `${prompt}, detailed tattoo design, black and white line art, professional tattoo stencil, clean lines, artistic`;
    } else {
      enhancedPrompt = `${prompt}, tattoo design, black and white line art, detailed, professional tattoo stencil, clean lines, artistic`;
    }
    
    // Check if API key is configured
    if (!process.env.HUGGING_FACE_API_KEY) {
      // Demo response
      return res.json({
        success: true,
        imageUrl: null,
        message: 'Demo mode: API key not configured. Add HUGGING_FACE_API_KEY to .env file to generate real images.',
        prompt: enhancedPrompt,
        subscription: subscription,
        creditsRemaining: user ? user.credits : null
      });
    }
    
    // Call Hugging Face API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      { inputs: enhancedPrompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 60000,
      }
    );
    
    // Convert image to base64
    const imageBase64 = Buffer.from(response.data).toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;
    
    // Deduct credit if user is logged in
    if (user && isDatabaseAvailable()) {
      const { Generation } = getModels();
      await user.useCredit();
      
      // Save generation to history
      if (Generation) {
        const generation = new Generation({
          userId: user._id,
          prompt: prompt,
          enhancedPrompt: enhancedPrompt,
          imageUrl: imageUrl,
          subscription: subscription
        });
        await generation.save();
      }
    }
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: enhancedPrompt,
      subscription: subscription,
      creditsRemaining: user ? user.credits : null,
      isPremium: subscription !== 'free'
    });
    
  } catch (error) {
    console.error('Error generating tattoo:', error.message);
    
    if (error.response?.status === 503) {
      return res.status(503).json({
        error: 'AI model is loading. Please try again in a few moments.',
        retryAfter: '20 seconds'
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Request timeout. The AI model is taking too long to respond. Please try again.'
      });
    }
    
    res.status(500).json({
      error: 'Failed to generate tattoo design. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's generation history
router.get('/history', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!isDatabaseAvailable()) {
      return res.status(503).json({ 
        error: 'Generation history requires database connection.',
        requiresSetup: true
      });
    }
    
    const { Generation } = getModels();
    if (!Generation) {
      return res.status(503).json({ error: 'Service unavailable' });
    }
    
    const generations = await Generation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      generations: generations.map(g => ({
        id: g._id,
        prompt: g.prompt,
        createdAt: g.createdAt,
        subscription: g.subscription
      }))
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch generation history' });
  }
});

module.exports = router;
