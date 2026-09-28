const express = require('express');
const router = express.Router();
const {
  getTicketById,
  cancelTicket,
  serveTicket,
  skipTicket,
  recallTicket,
  noShowTicket,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/:id', getTicketById);
router.post('/:id/cancel', protect, cancelTicket);
router.post('/:id/serve', protect, authorize('admin', 'staff'), serveTicket);
router.post('/:id/skip', protect, authorize('admin', 'staff'), skipTicket);
router.post('/:id/recall', protect, authorize('admin', 'staff'), recallTicket);
router.post('/:id/no-show', protect, authorize('admin', 'staff'), noShowTicket);

module.exports = router;
