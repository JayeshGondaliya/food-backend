// routes/analyticsRoutes.js
const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/daily', protect, adminOnly, async (req, res, next) => {
  try {
    const { getDailyAnalytics } = await import('../controllers/analyticsController.js');
    return getDailyAnalytics(req, res, next);
  } catch (error) {
    next(error);
  }
});

module.exports = router;