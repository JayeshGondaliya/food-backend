const express = require('express');
const {
  createOrder,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  getMyOrders
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// All order routes require authentication
router.route('/')
  .post(protect, createOrder)
  .get(protect, adminOnly, getAllOrders);

router.get('/myorders', protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrder);

router.route('/:id/status')
  .put(protect, adminOnly, updateOrderStatus);

module.exports = router;