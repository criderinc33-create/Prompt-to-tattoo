const express = require('express');
const router = express.Router();
const axios = require('axios');

// Rate limiting setup (simple in-memory counter)
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // requests per hour
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
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Check rate limit
    const clientIp = req.ip || req.connection.remoteAddress;
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: '1 hour'
      });
    }
    
    // Enhanced prompt for tattoo-style images
    const enhancedPrompt = `${prompt}, tattoo design, black and white line art, detailed, professional tattoo stencil, clean lines, artistic`;
    
    // Check if API key is configured
    if (!process.env.HUGGING_FACE_API_KEY) {
      // Return a placeholder response for demo purposes
      return res.json({
        success: true,
        imageUrl: null,
        message: 'Demo mode: API key not configured. Add HUGGING_FACE_API_KEY to .env file to generate real images.',
        prompt: enhancedPrompt
      });
    }
    
    // Call Hugging Face API (free tier available)
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      { inputs: enhancedPrompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 60000, // 60 second timeout
      }
    );
    
    // Convert image to base64
    const imageBase64 = Buffer.from(response.data).toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: enhancedPrompt
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

module.exports = router;
