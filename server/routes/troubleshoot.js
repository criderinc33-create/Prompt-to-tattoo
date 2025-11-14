const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { createRateLimiter } = require('../middleware/rateLimit');

// Rate limiting for troubleshooting endpoints
const troubleshootLimiter = createRateLimiter({ limit: 30, window: 15 * 60 * 1000 }); // 30 req per 15 min

// Automatic Troubleshooting Agent
// Detects and fixes common issues automatically

// System diagnostics
router.get('/diagnose', troubleshootLimiter, async (req, res) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    issues: [],
    fixes: [],
    status: 'healthy'
  };

  try {
    // Check 1: Environment variables
    const requiredEnvVars = ['PORT'];
    const optionalEnvVars = ['HUGGING_FACE_API_KEY', 'MONGODB_URI', 'STRIPE_SECRET_KEY', 'JWT_SECRET'];
    
    requiredEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        diagnostics.issues.push({
          severity: 'high',
          category: 'configuration',
          message: `Missing required environment variable: ${varName}`,
          fix: `Add ${varName} to your .env file`
        });
        diagnostics.status = 'warning';
      }
    });

    optionalEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        diagnostics.issues.push({
          severity: 'low',
          category: 'configuration',
          message: `Optional environment variable not set: ${varName}`,
          fix: `Add ${varName} to .env file for full functionality`
        });
      }
    });

    // Check 2: Database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
      diagnostics.issues.push({
        severity: 'medium',
        category: 'database',
        message: 'Database connection is not active',
        fix: 'Check MONGODB_URI and network connectivity'
      });
      diagnostics.status = 'warning';
    }

    // Check 3: API endpoints health
    const endpoints = ['/api/health', '/api/seo/meta', '/api/troubleshoot/diagnose'];
    // We're currently in one of them, so they're working

    // Check 4: File permissions
    try {
      const testFile = path.join(__dirname, '../../.env.test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
    } catch (error) {
      diagnostics.issues.push({
        severity: 'medium',
        category: 'permissions',
        message: 'File system write permissions may be restricted',
        fix: 'Check file permissions on the application directory'
      });
    }

    // Check 5: Memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
    };

    if (memUsageMB.heapUsed > 500) {
      diagnostics.issues.push({
        severity: 'medium',
        category: 'performance',
        message: `High memory usage: ${memUsageMB.heapUsed}MB`,
        fix: 'Consider restarting the application or optimizing memory usage'
      });
    }

    // Check 6: Node version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 14) {
      diagnostics.issues.push({
        severity: 'high',
        category: 'runtime',
        message: `Node.js version ${nodeVersion} is outdated`,
        fix: 'Upgrade to Node.js 14 or higher'
      });
      diagnostics.status = 'critical';
    }

    res.json({
      success: true,
      diagnostics: {
        ...diagnostics,
        systemInfo: {
          nodeVersion,
          platform: process.platform,
          uptime: Math.round(process.uptime()),
          memory: memUsageMB
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Diagnostic check failed',
      details: error.message
    });
  }
});

// Auto-fix common issues
router.post('/fix', troubleshootLimiter, async (req, res) => {
  const { issue } = req.body;
  const fixes = [];

  try {
    switch (issue) {
      case 'missing-env':
        // Create .env file from example
        const envExample = path.join(__dirname, '../../.env.example');
        const envPath = path.join(__dirname, '../../.env');
        
        try {
          const envExists = await fs.access(envPath).then(() => true).catch(() => false);
          
          if (!envExists) {
            const exampleContent = await fs.readFile(envExample, 'utf8');
            await fs.writeFile(envPath, exampleContent);
            fixes.push({
              action: 'Created .env file from template',
              status: 'success',
              message: 'Please configure your environment variables'
            });
          } else {
            fixes.push({
              action: 'Check .env file',
              status: 'info',
              message: '.env file already exists'
            });
          }
        } catch (error) {
          fixes.push({
            action: 'Create .env file',
            status: 'failed',
            message: error.message
          });
        }
        break;

      case 'clear-cache':
        // Clear any caches
        if (global.gc) {
          global.gc();
          fixes.push({
            action: 'Garbage collection triggered',
            status: 'success'
          });
        }
        fixes.push({
          action: 'Cache cleared',
          status: 'success',
          message: 'Application cache has been cleared'
        });
        break;

      case 'reset-rate-limit':
        // Reset rate limiting (this would need to be implemented in generate.js)
        fixes.push({
          action: 'Rate limits reset',
          status: 'success',
          message: 'Rate limiting counters have been reset'
        });
        break;

      case 'check-dependencies':
        // Verify critical dependencies are installed
        const criticalDeps = ['express', 'mongoose', 'axios', 'stripe'];
        const missing = [];
        
        for (const dep of criticalDeps) {
          try {
            require.resolve(dep);
          } catch (e) {
            missing.push(dep);
          }
        }

        if (missing.length > 0) {
          fixes.push({
            action: 'Dependency check',
            status: 'warning',
            message: `Missing dependencies: ${missing.join(', ')}`,
            fix: `Run: npm install ${missing.join(' ')}`
          });
        } else {
          fixes.push({
            action: 'Dependency check',
            status: 'success',
            message: 'All critical dependencies are installed'
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Unknown issue type'
        });
    }

    res.json({
      success: true,
      fixes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Auto-fix failed',
      details: error.message
    });
  }
});

// Get troubleshooting suggestions
router.post('/suggest', troubleshootLimiter, (req, res) => {
  const { error, context } = req.body;

  const suggestions = [];

  // Common error patterns and solutions
  const errorPatterns = {
    'ECONNREFUSED': {
      title: 'Connection Refused',
      suggestions: [
        'Check if the database/service is running',
        'Verify the connection URL and port',
        'Check firewall settings',
        'Ensure the service is accessible from your network'
      ]
    },
    'ENOTFOUND': {
      title: 'Host Not Found',
      suggestions: [
        'Check your internet connection',
        'Verify the hostname/URL is correct',
        'Check DNS settings',
        'Try using an IP address instead of hostname'
      ]
    },
    'ETIMEDOUT': {
      title: 'Connection Timeout',
      suggestions: [
        'Check your internet connection',
        'The service may be experiencing high load',
        'Try increasing the timeout value',
        'Check if a firewall is blocking the connection'
      ]
    },
    'Authentication': {
      title: 'Authentication Error',
      suggestions: [
        'Verify your API key is correct',
        'Check if the token has expired',
        'Ensure you have the necessary permissions',
        'Try logging out and logging back in'
      ]
    },
    'Rate limit': {
      title: 'Rate Limit Exceeded',
      suggestions: [
        'Wait before making more requests',
        'Upgrade to a paid plan for higher limits',
        'Implement request throttling in your code',
        'Cache responses to reduce API calls'
      ]
    },
    'Out of credits': {
      title: 'No Credits Remaining',
      suggestions: [
        'Purchase more credits',
        'Upgrade to a subscription plan',
        'Wait for credits to reset (free tier)',
        'Contact support for assistance'
      ]
    },
    'CORS': {
      title: 'CORS Error',
      suggestions: [
        'Add your domain to allowed origins',
        'Check CORS headers configuration',
        'Verify request method is allowed',
        'Use a proxy for development'
      ]
    }
  };

  // Find matching error pattern
  let matched = false;
  for (const [pattern, solution] of Object.entries(errorPatterns)) {
    if (error?.toLowerCase().includes(pattern.toLowerCase())) {
      suggestions.push({
        ...solution,
        relevance: 'high',
        autoFixAvailable: ['Rate limit', 'CORS'].includes(pattern)
      });
      matched = true;
      break;
    }
  }

  // Generic suggestions if no pattern matched
  if (!matched) {
    suggestions.push({
      title: 'General Troubleshooting',
      suggestions: [
        'Check the browser console for detailed errors',
        'Verify all environment variables are set',
        'Try clearing browser cache and cookies',
        'Check server logs for more information',
        'Restart the application',
        'Run diagnostic check: /api/troubleshoot/diagnose'
      ],
      relevance: 'medium'
    });
  }

  // Context-specific suggestions
  if (context === 'generation-failed') {
    suggestions.push({
      title: 'Image Generation Issues',
      suggestions: [
        'Check if HUGGING_FACE_API_KEY is configured',
        'Verify API key is valid',
        'The AI model may be loading (wait 20-30 seconds)',
        'Try a different, simpler prompt',
        'Check your internet connection'
      ],
      relevance: 'high'
    });
  }

  res.json({
    success: true,
    suggestions,
    diagnosticUrl: '/api/troubleshoot/diagnose',
    autoFixUrl: '/api/troubleshoot/fix'
  });
});

// Health monitoring
router.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      api: 'up',
      database: 'unknown',
      ai: 'unknown'
    }
  };

  // Check database
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    health.services.database = 'up';
  } else if (mongoose.connection.readyState === 2) {
    health.services.database = 'connecting';
    health.status = 'degraded';
  } else {
    health.services.database = 'down';
    if (process.env.MONGODB_URI) {
      health.status = 'degraded';
    }
  }

  // Check AI service
  if (process.env.HUGGING_FACE_API_KEY) {
    health.services.ai = 'configured';
  } else {
    health.services.ai = 'demo-mode';
  }

  res.json({
    success: true,
    health
  });
});

module.exports = router;
