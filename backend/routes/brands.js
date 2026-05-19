const express = require('express');
const router = express.Router();
const Brand = require("../models/Brand");
const { authenticateToken } = require("../middleware/auth");

// GET all approved brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({ approved: true });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET brands uploaded by the currently logged-in user (supplier dashboard)
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const brands = await Brand.find({ uploader: req.user.id });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new brand (requires login, admin auto-approves, suppliers require approval)
router.post('/', authenticateToken, async (req, res) => {
  const { name, description, website, imageUrl } = req.body;
  const uploader = req.user.id;
  const role = req.user.role;

  if (!name) return res.status(400).json({ error: "Brand name required" });

  try {
    const brand = new Brand({
      name,
      description,
      website,
      imageUrl,
      approved: role === "admin", // only admins can auto-approve
      uploader
    });
    await brand.save();

    res.status(201).json({
      message: role === "admin" ? "Brand created and approved" : "Brand submitted for approval",
      brand
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;