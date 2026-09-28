const Queue = require('../models/Queue');
const QueueSession = require('../models/QueueSession');
const QueueEntry = require('../models/QueueEntry');
const { generateTokenForCustomer } = require('../services/tokenGenerator');
const { transitionTicketState } = require('../services/queueEngine');

// @desc    Get queues
// @route   GET /api/queues
// @access  Public
const getQueues = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.organizationId) {
      query.organizationId = req.query.organizationId;
    }

    const queues = await Queue.find(query)
      .populate('organizationId', 'name')
      .populate('serviceId', 'name averageServiceTime priorityEnabled');

    res.json({ success: true, count: queues.length, data: queues });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single queue with current active tickets summary
// @route   GET /api/queues/:id
// @access  Public
const getQueueById = async (req, res, next) => {
  try {
    const queue = await Queue.findById(req.params.id)
      .populate('organizationId', 'name address')
      .populate('serviceId', 'name averageServiceTime priorityEnabled');

    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const session = await QueueSession.findOne({ queueId: queue._id, date: todayStr });

    let waitingCount = 0;
    let currentlyServing = null;

    if (session) {
      waitingCount = await QueueEntry.countDocuments({
        sessionId: session._id,
        status: 'waiting',
      });
      currentlyServing = await QueueEntry.findOne({
        sessionId: session._id,
        status: { $in: ['called', 'serving'] },
      }).sort({ calledAt: -1 }).populate('counterId', 'name counterNumber');
    }

    res.json({
      success: true,
      data: {
        queue,
        waitingCount,
        currentlyServing,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new queue
// @route   POST /api/queues
// @access  Private (Admin)
const createQueue = async (req, res, next) => {
  try {
    const queue = await Queue.create(req.body);
    res.status(201).json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer joins queue & gets token
// @route   POST /api/queues/:id/join
// @access  Private (Customer, Admin)
const joinQueue = async (req, res, next) => {
  try {
    const queueId = req.params.id;
    const customerId = req.user._id;
    const priority = req.body.priority || 0;

    const result = await generateTokenForCustomer({
      queueId,
      customerId,
      priority,
    });

    // Emit Socket.IO event if io attached
    if (req.app.get('io')) {
      req.app.get('io').to(`queue:${queueId}`).emit('queue:updated', {
        type: 'CUSTOMER_JOINED',
        entry: result.entry,
      });
    }

    res.status(result.isDuplicate ? 200 : 201).json({
      success: true,
      isDuplicate: result.isDuplicate,
      data: result.entry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Staff calls NEXT waiting ticket in queue
// @route   POST /api/queues/:id/next
// @access  Private (Staff, Admin)
const callNextInQueue = async (req, res, next) => {
  try {
    const queueId = req.params.id;
    const counterId = req.body.counterId || req.user.counterId;

    const todayStr = new Date().toISOString().split('T')[0];
    const session = await QueueSession.findOne({ queueId, date: todayStr, status: 'active' });

    if (!session) {
      return res.status(404).json({ success: false, message: 'No active queue session for today' });
    }

    // Find next ticket ordered by priority DESC, joinedAt ASC
    const nextWaitingTicket = await QueueEntry.findOne({
      sessionId: session._id,
      status: 'waiting',
    }).sort({ priority: -1, joinedAt: 1 });

    if (!nextWaitingTicket) {
      return res.status(200).json({
        success: true,
        message: 'No waiting customers in queue',
        data: null,
      });
    }

    // Atomic transition to 'called'
    const result = await transitionTicketState({
      ticketId: nextWaitingTicket._id,
      expectedCurrentState: 'waiting',
      targetState: 'called',
      staffUserId: req.user._id,
      counterId,
    });

    if (result.conflict) {
      return res.status(409).json({ success: false, message: result.message });
    }

    // Emit Socket.IO event to queue room & org room
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`queue:${queueId}`).emit('ticket:called', {
        ticket: result.ticket,
      });
      io.to(`org:${result.ticket.queueId?.organizationId}`).emit('public:display_update', {
        tokenLabel: result.ticket.tokenLabel,
        counterName: result.ticket.counterId?.name,
        counterNumber: result.ticket.counterId?.counterNumber,
      });
    }

    res.json({ success: true, data: result.ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Pause queue
// @route   POST /api/queues/:id/pause
// @access  Private (Admin, Staff)
const pauseQueue = async (req, res, next) => {
  try {
    const queue = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: 'paused' },
      { new: true }
    );
    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
};

// @desc    Resume queue
// @route   POST /api/queues/:id/resume
// @access  Private (Admin, Staff)
const resumeQueue = async (req, res, next) => {
  try {
    const queue = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: 'open' },
      { new: true }
    );
    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQueues,
  getQueueById,
  createQueue,
  joinQueue,
  callNextInQueue,
  pauseQueue,
  resumeQueue,
};
