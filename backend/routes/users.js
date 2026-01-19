const express = require('express');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all staff users (Admin only)
router.get('/staff', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' })
      .select('name email _id')
      .sort({ name: 1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
