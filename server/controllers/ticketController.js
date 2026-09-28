const QueueEntry = require('../models/QueueEntry');
const { calculatePositionAndETA, transitionTicketState } = require('../services/queueEngine');

// @desc    Get ticket status & live ETA
// @route   GET /api/tickets/:id
// @access  Public / Private
const getTicketById = async (req, res, next) => {
  try {
    const ticketData = await calculatePositionAndETA(req.params.id);
    res.json({
      success: true,
      data: ticketData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel active ticket
// @route   POST /api/tickets/:id/cancel
// @access  Private (Customer owner, Admin, Staff)
const cancelTicket = async (req, res, next) => {
  try {
    const ticket = await QueueEntry.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const result = await transitionTicketState({
      ticketId: ticket._id,
      expectedCurrentState: ticket.status,
      targetState: 'cancelled',
    });

    if (req.app.get('io')) {
      req.app.get('io').to(`queue:${ticket.queueId}`).emit('queue:updated', {
        type: 'TICKET_CANCELLED',
        ticketId: ticket._id,
      });
    }

    res.json({ success: true, data: result.ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark ticket as serving / served
// @route   POST /api/tickets/:id/serve
// @access  Private (Staff, Admin)
const serveTicket = async (req, res, next) => {
  try {
    const ticket = await QueueEntry.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const targetState = ticket.status === 'called' ? 'serving' : 'served';

    const result = await transitionTicketState({
      ticketId: ticket._id,
      expectedCurrentState: ticket.status,
      targetState,
      staffUserId: req.user._id,
    });

    if (result.conflict) {
      return res.status(409).json({ success: false, message: result.message });
    }

    if (req.app.get('io')) {
      req.app.get('io').to(`queue:${ticket.queueId}`).emit('ticket:status_changed', {
        ticket: result.ticket,
      });
    }

    res.json({ success: true, data: result.ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Skip customer ticket
// @route   POST /api/tickets/:id/skip
// @access  Private (Staff, Admin)
const skipTicket = async (req, res, next) => {
  try {
    const ticket = await QueueEntry.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const result = await transitionTicketState({
      ticketId: ticket._id,
      expectedCurrentState: ticket.status,
      targetState: 'skipped',
      staffUserId: req.user._id,
    });

    res.json({ success: true, data: result.ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Recall ticket to counter
// @route   POST /api/tickets/:id/recall
// @access  Private (Staff, Admin)
const recallTicket = async (req, res, next) => {
  try {
    const ticket = await QueueEntry.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const result = await transitionTicketState({
      ticketId: ticket._id,
      expectedCurrentState: null, // Allow recall override
      targetState: 'called',
      staffUserId: req.user._id,
      counterId: req.body.counterId || ticket.counterId,
    });

    if (req.app.get('io')) {
      req.app.get('io').to(`queue:${ticket.queueId}`).emit('ticket:recalled', {
        ticket: result.ticket,
      });
    }

    res.json({ success: true, data: result.ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark ticket as no-show
// @route   POST /api/tickets/:id/no-show
// @access  Private (Staff, Admin)
const noShowTicket = async (req, res, next) => {
  try {
    const ticket = await QueueEntry.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const result = await transitionTicketState({
      ticketId: ticket._id,
      expectedCurrentState: ticket.status,
      targetState: 'no_show',
      staffUserId: req.user._id,
    });

    res.json({ success: true, data: result.ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTicketById,
  cancelTicket,
  serveTicket,
  skipTicket,
  recallTicket,
  noShowTicket,
};
