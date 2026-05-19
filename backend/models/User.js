// Import Mongoose for MongoDB schema definition and modeling
const mongoose = require('mongoose');

// User schema definition with comprehensive user management and gamification features
const userSchema = new mongoose.Schema({
  // Core user authentication and profile fields
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  email: { type: String }, // Optional: add unique: true if needed
  role: { 
    type: String, 
    enum: ['customer', 'supplier', 'admin'], 
    default: 'customer' 
  },
  
  // Security and activity tracking
  loginActivity: [
    {
      date: { type: Date, default: Date.now },
      ip: String,
      device: String
    }
  ],
  
  // Real-time notification system
  notifications: [
    {
      type: { type: String, required: true },
      message: { type: String, required: true },
      date: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
      data: mongoose.Schema.Types.Mixed
    }
  ],
  
  // Gamification system for user engagement
  points: { type: Number, default: 0 },
  level: { type: String, default: 'New' },
  badges: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      icon: { type: String, required: true },
      earnedAt: { type: Date, default: Date.now },
      description: String
    }
  ],
  achievements: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      icon: { type: String, required: true },
      unlockedAt: { type: Date, default: Date.now },
      description: String,
      points: { type: Number, default: 0 }
    }
  ],
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastVisit: { type: Date }
  },
  
  // Personalization system for tailored user experience
  preferences: {
    style: { type: String, default: 'Casual & Comfortable' },
    budget: { type: String, default: 'Mid-range ($50-150)' },
    sustainability: { type: String, default: 'Somewhat Important' },
    colors: [{ type: String }],
    materials: [{ type: String }],
    quizCompleted: { type: Boolean, default: false }
  },
  
  // Analytics and activity tracking for insights
  activity: {
    productsViewed: { type: Number, default: 0 },
    productsPurchased: { type: Number, default: 0 },
    reviewsPosted: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastPurchase: { type: Date },
    carbonSaved: { type: Number, default: 0 } // in kg
  },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save middleware to normalize role field to lowercase
userSchema.pre('save', function(next) {
  if (this.role) {
    this.role = this.role.toLowerCase();
  }
  next();
});

// Export the User model for use in routes and controllers
module.exports = mongoose.model('User', userSchema);