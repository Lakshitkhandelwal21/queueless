const express = require('express');
const router = express.Router();
const {
  getQueues,
  getQueueById,
  createQueue,
  joinQueue,
  callNextInQueue,
  pauseQueue,
  resumeQueue,
} = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(getQueues)
  .post(protect, authorize('admin'), createQueue);

router.get('/:id', getQueueById);
router.post('/:id/join', protect, joinQueue);
router.post('/:id/next', protect, authorize('admin', 'staff'), callNextInQueue);
router.post('/:id/pause', protect, authorize('admin', 'staff'), pauseQueue);
router.post('/:id/resume', protect, authorize('admin', 'staff'), resumeQueue);

module.exports = router;
