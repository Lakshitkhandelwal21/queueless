const express = require('express');
const router = express.Router();
const {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} = require('../controllers/orgController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(getOrganizations)
  .post(protect, authorize('admin'), createOrganization);

router
  .route('/:id')
  .get(getOrganizationById)
  .put(protect, authorize('admin'), updateOrganization)
  .delete(protect, authorize('admin'), deleteOrganization);

module.exports = router;
