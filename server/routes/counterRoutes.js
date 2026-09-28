const express = require('express');
const router = express.Router();
const {
  getCounters,
  createCounter,
  updateCounter,
  deleteCounter,
} = require('../controllers/counterController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(getCounters)
  .post(protect, authorize('admin'), createCounter);

router
  .route('/:id')
  .put(protect, authorize('admin', 'staff'), updateCounter)
  .delete(protect, authorize('admin'), deleteCounter);

module.exports = router;
