const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection (optional - will work without it)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error (running without database):', err.message));
} else {
  console.log('Running without database - some features will be limited');
}

// Security Middleware
// Helmet - Sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Request logging
if (process.env.NODE_ENV === 'production') {
  // Log only errors in production
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400
  }));
} else {
  // Log all requests in development
  app.use(morgan('dev'));
}

// CORS configuration - restrict in production
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('client/build'));

// Routes
app.use('/api', require('./routes/generate'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/seo', require('./routes/seo'));
app.use('/api/troubleshoot', require('./routes/troubleshoot'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Prompt-to-Tattoo API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    features: {
      auth: !!process.env.MONGODB_URI,
      payment: !!process.env.STRIPE_SECRET_KEY,
      aiGeneration: !!process.env.HUGGING_FACE_API_KEY
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Features enabled:`, {
    database: !!process.env.MONGODB_URI,
    payment: !!process.env.STRIPE_SECRET_KEY,
    aiGeneration: !!process.env.HUGGING_FACE_API_KEY
  });
});

