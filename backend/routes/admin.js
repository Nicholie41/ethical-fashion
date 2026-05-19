console.log("Admin routes loaded");

// Import required dependencies for admin management API
const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Debug middleware to log user information before authorization checks
function logReqUser(req, res, next) {
  console.log('DEBUG req.user:', req.user);
  next();
}

// Admin API: Get all pending brands awaiting approval
router.get(
  '/brands/pending',
  authenticateToken,
  logReqUser, // <--- log user info
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const brands = await Brand.find({ approved: false }).populate('uploader', 'username email');
      res.json(brands);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Admin API: Approve or reject a brand by ID with feedback
router.put(
  '/brands/:id/approve',
  authenticateToken,
  logReqUser,
  authorizeRole('admin'),
  async (req, res) => {
    const { approve } = req.body;
    if (typeof approve === "undefined") {
      return res.status(400).json({ error: 'Missing approve field in request body' });
    }
    try {
      const brand = await Brand.findByIdAndUpdate(
        req.params.id,
        { approved: !!approve },
        { new: true }
      ).populate('uploader', 'username email');
      if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
      }
      res.json({ message: approve ? 'Brand approved' : 'Brand rejected', brand });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Admin API: Get all pending products awaiting approval
router.get(
  '/products/pending',
  authenticateToken,
  logReqUser,
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const products = await Product.find({ approved: false })
        .populate('brand', 'name')
        .populate('uploader', 'username email');
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Admin API: Approve or reject a product by ID with feedback and history
router.put(
  '/products/:id/approve',
  authenticateToken,
  logReqUser,
  authorizeRole('admin'),
  async (req, res) => {
    const { approve, feedback } = req.body;
    if (typeof approve === "undefined") {
      return res.status(400).json({ error: 'Missing approve field in request body' });
    }
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      product.approved = !!approve;
      product.adminFeedback = feedback || '';
      product.approvalHistory = product.approvalHistory || [];
      product.approvalHistory.push({
        status: approve ? 'approved' : 'rejected',
        date: new Date(),
        admin: req.user.id,
        feedback: feedback || ''
      });
      await product.save();
      await product.populate('brand', 'name');
      await product.populate('uploader', 'username email');
      // --- Push notification to supplier ---
      if (product.uploader) {
        const supplier = await User.findById(product.uploader);
        if (supplier) {
          supplier.notifications = supplier.notifications || [];
          supplier.notifications.push({
            type: approve ? 'product_approved' : 'product_rejected',
            message: approve
              ? `Your product "${product.name}" was approved.`
              : `Your product "${product.name}" was rejected.`,
            date: new Date(),
            read: false,
            data: {
              productId: product._id,
              feedback: feedback || ''
            }
          });
          await supplier.save();
        }
      }
      res.json({ message: approve ? 'Product approved' : 'Product rejected', product });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// --- ADD THIS BLOCK FOR DASHBOARD STATS ---
router.get(
  '/stats',
  authenticateToken,
  authorizeRole('admin'),
  async (req, res) => {
    try {
      const [
        brands,
        products,
        pendingBrands,
        pendingProducts
      ] = await Promise.all([
        Brand.countDocuments(),
        Product.countDocuments(),
        Brand.countDocuments({ approved: false }),
        Product.countDocuments({ approved: false })
      ]);
      res.json({ brands, products, pendingBrands, pendingProducts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);
// --- END BLOCK ---

module.exports = router;