const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// ✅ GET /api/users - Admin only - Get all users
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Hide password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

// ✅ POST /api/users/:id/ban - Admin only - Ban or unban user
router.post('/:id/ban', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { banned } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { banned },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update ban status' });
  }
});

// ✅ PATCH /api/users/:id/role - Admin only - Change user role
router.patch('/:id/role', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update role' });
  }
});

module.exports = router;
