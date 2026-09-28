const express = require('express');
const router = express.Router();
const {
  getTodayAnalytics,
  getWeeklyAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/today', protect, authorize('admin', 'staff'), getTodayAnalytics);
router.get('/weekly', protect, authorize('admin'), getWeeklyAnalytics);

module.exports = router;
