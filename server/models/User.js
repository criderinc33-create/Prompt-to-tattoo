const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subscription: {
    type: String,
    enum: ['free', 'basic', 'premium', 'pro'],
    default: 'free'
  },
  credits: {
    type: Number,
    default: 3 // Free users get 3 credits
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user has credits
userSchema.methods.hasCredits = function() {
  if (this.subscription !== 'free') {
    // Paid users have unlimited credits
    return true;
  }
  return this.credits > 0;
};

// Deduct credit
userSchema.methods.useCredit = async function() {
  if (this.subscription === 'free') {
    if (this.credits > 0) {
      this.credits -= 1;
      await this.save();
      return true;
    }
    return false;
  }
  return true; // Paid users don't lose credits
};

module.exports = mongoose.model('User', userSchema);
