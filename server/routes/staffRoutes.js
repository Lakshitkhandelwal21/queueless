const express = require('express');
const router = express.Router();
const {
  getStaffList,
  createStaff,
  updateStaff,
  deleteStaff,
} = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, authorize('admin', 'staff'), getStaffList)
  .post(protect, authorize('admin'), createStaff);

router
  .route('/:id')
  .put(protect, authorize('admin', 'staff'), updateStaff)
  .delete(protect, authorize('admin'), deleteStaff);

module.exports = router;
