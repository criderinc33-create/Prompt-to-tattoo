// Simple in-memory rate limiting
const rateLimitStore = new Map();

function createRateLimiter(options = {}) {
  const limit = options.limit || 100; // requests
  const window = options.window || 15 * 60 * 1000; // 15 minutes
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Get or create user's request history
    let requests = rateLimitStore.get(key) || [];
    
    // Filter out old requests outside the window
    requests = requests.filter(timestamp => now - timestamp < window);
    
    // Check if limit exceeded
    if (requests.length >= limit) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((requests[0] + window - now) / 1000)
      });
    }
    
    // Add current request
    requests.push(now);
    rateLimitStore.set(key, requests);
    
    next();
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour
  
  for (const [key, requests] of rateLimitStore.entries()) {
    const recent = requests.filter(timestamp => now - timestamp < maxAge);
    if (recent.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, recent);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = { createRateLimiter };
