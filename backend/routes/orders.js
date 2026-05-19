// Import required dependencies for order management API
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Create a new order with gamification tracking
router.post('/', async (req, res) => {
  try {
    const { userId, items, total } = req.body;
    // Validate required fields for order creation
    if (!userId || !items || !Array.isArray(items) || items.length === 0 || !total) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    
    // Create and save the new order
    const order = new Order({ user: userId, items, total });
    await order.save();

    // Track purchase activity for gamification system
    try {
      const response = await fetch(`${req.protocol}://${req.get('host')}/api/gamification/track-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.headers.authorization}`
        },
        body: JSON.stringify({
          activity: 'purchase',
          data: {
            amount: total,
            carbonSaved: items.reduce((sum, item) => {
              // Calculate carbon savings based on sustainability score
              const sustainabilityScore = item.sustainabilityScore || 5;
              return sum + (sustainabilityScore * 0.5); // 0.5kg CO2 per sustainability point
            }, 0)
          }
        })
      });
    } catch (error) {
      console.log('Failed to track purchase activity:', error.message);
    }

    res.status(201).json({ message: 'Order created', order });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all orders for the authenticated user
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 