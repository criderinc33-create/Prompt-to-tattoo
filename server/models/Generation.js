const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  enhancedPrompt: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  subscription: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Generation', generationSchema);
