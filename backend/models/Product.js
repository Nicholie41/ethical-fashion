// Import Mongoose for MongoDB schema definition and modeling
const mongoose = require('mongoose');

// Product schema definition with sustainability scoring and e-commerce features
const productSchema = new mongoose.Schema({
  // Core product information and relationships
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  name: { type: String, required: true },
  description: String,
  price: Number,
  
  // Sustainability and ethical fashion attributes
  material: String,
  materials: [String], // Add materials array for multi-material products
  category: String,    // Add category field for filtering
  laborPractices: String,
  certifications: String,
  sustainabilityScore: Number,
  
  // Media and visual content
  imageUrls: [String], // <-- Multiple images
  
  // Approval workflow and moderation
  approved: { type: Boolean, default: false },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Product variants and options
  sizes: [String],     // <-- Sizes array
  colors: [String],    // <-- Colors array
  
  // Analytics and performance tracking
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }, // Add rating field for sorting
  lastViewedAt: { type: Date },
  
  // Admin approval history and feedback system
  approvalHistory: [
    {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], required: true },
      date: { type: Date, default: Date.now },
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      feedback: String
    }
  ],
  adminFeedback: { type: String },
}, { timestamps: true });

// Text index for optimized search functionality across multiple fields
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  material: 'text',
  materials: 'text'
});

// Export the Product model for use in routes and controllers
module.exports = mongoose.model('Product', productSchema);