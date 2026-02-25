const express = require('express');
const {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route: everyone can view menu
router.route('/')
  .get(getMenu)
  .post(protect, adminOnly, createMenuItem); // admin only

// Admin-only operations on individual items
router.route('/:id')
  .put(protect, adminOnly, updateMenuItem)
  .delete(protect, adminOnly, deleteMenuItem);

module.exports = router; 