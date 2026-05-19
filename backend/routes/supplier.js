const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get brands uploaded by the current supplier
router.get('/brands/mine', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  try {
    const brands = await Brand.find({ uploader: req.user.id }); // <- FIXED
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get products uploaded by the current supplier
router.get('/products/mine', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  try {
    const products = await Product.find({ uploader: req.user.id }); // <- FIXED
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
