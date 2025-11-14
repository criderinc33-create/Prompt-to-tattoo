const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Initialize Stripe only if API key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Check if database is available
const mongoose = require('mongoose');
const isDatabaseAvailable = () => mongoose.connection.readyState === 1;

const getUser = () => {
  if (!isDatabaseAvailable()) return null;
  return require('../models/User');
};

// Pricing plans
const PLANS = {
  basic: {
    name: 'Basic',
    price: 9.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
    features: ['Unlimited generations', 'Standard quality', 'Email support']
  },
  premium: {
    name: 'Premium',
    price: 19.99,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    features: ['Unlimited generations', 'High quality', 'Priority support', 'No watermark', 'Commercial license']
  },
  pro: {
    name: 'Pro',
    price: 49.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    features: ['Unlimited generations', 'Highest quality', '24/7 support', 'No watermark', 'Commercial license', 'API access']
  }
};

// Get pricing plans
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

// Create checkout session
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment processing is not configured. Contact admin to set up STRIPE_SECRET_KEY.',
        requiresSetup: true
      });
    }

    const User = getUser();
    if (!User) {
      return res.status(503).json({ error: 'Database connection required' });
    }

    const { plan } = req.body;
    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Create or get Stripe customer
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: { userId: req.user._id.toString() }
      });
      customerId = customer.id;
      req.user.stripeCustomerId = customerId;
      await req.user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${PLANS[plan].name} Plan`,
            description: PLANS[plan].features.join(', ')
          },
          unit_amount: Math.round(PLANS[plan].price * 100),
          recurring: { interval: 'month' }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/pricing`,
      metadata: {
        userId: req.user._id.toString(),
        plan: plan
      }
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment not configured' });
  }

  try {
    const User = getUser();
    if (!User) return res.status(503).json({ error: 'Database required' });

    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const user = await User.findById(session.metadata.userId);
      if (user) {
        user.subscription = session.metadata.plan;
        user.stripeSubscriptionId = session.subscription;
        user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const user = await User.findOne({ stripeSubscriptionId: subscription.id });
      if (user) {
        user.subscription = 'free';
        user.credits = 3;
        user.stripeSubscriptionId = null;
        user.subscriptionEndDate = null;
        await user.save();
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;
