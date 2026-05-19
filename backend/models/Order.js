// Import Mongoose for MongoDB schema definition and modeling
const mongoose = require('mongoose');

// Order schema definition for e-commerce transaction management
const OrderSchema = new mongoose.Schema({
  // User relationship and order ownership
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Order items with product details and variants
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      size: String,
      color: String,
      quantity: { type: Number, default: 1 },
    }
  ],
  
  // Order financial information
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Export the Order model for use in routes and controllers
module.exports = mongoose.model('Order', OrderSchema); 