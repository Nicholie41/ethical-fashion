// Import Mongoose for MongoDB schema definition and modeling
const mongoose = require('mongoose');

// Brand schema definition for ethical fashion brand management
const brandSchema = new mongoose.Schema({
  // Core brand information
  name: { type: String, required: true },
  description: String,
  website: String,
  imageUrl: String, // Store image URL or path if you handle uploads
  
  // Approval workflow for brand verification
  approved: { type: Boolean, default: false },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Export the Brand model for use in routes and controllers
module.exports = mongoose.model('Brand', brandSchema);