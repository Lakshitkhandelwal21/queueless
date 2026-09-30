const QueueEntry = require('../models/QueueEntry');
const QueueSession = require('../models/QueueSession');
const Service = require('../models/Service');
const Queue = require('../models/Queue');

/**
 * Valid Queue State Machine transitions table
 */
const ALLOWED_TRANSITIONS = {
  waiting: ['called', 'cancelled', 'skipped'],
  called: ['serving', 'no_show', 'called', 'skipped'],
  serving: ['served'],
  skipped: ['waiting', 'cancelled'],
  no_show: ['waiting', 'cancelled'],
  served: [],
  cancelled: [],
};

/**
 * Calculates current position in queue (people ahead) and estimated wait time (ETA)
 */
const calculatePositionAndETA = async (entryId) => {
  const entry = await QueueEntry.findById(entryId).populate({
    path: 'queueId',
    populate: { path: 'serviceId' },
  });

  if (!entry) {
    throw new Error('Queue entry not found');
  }

  if (entry.status !== 'waiting') {
    return {
      peopleAhead: 0,
      estimatedWaitTimeMinutes: 0,
      status: entry.status,
      entry,
    };
  }

  const safePriority = typeof entry.priority === 'number' ? entry.priority : 0;

  // Count active entries ahead in the same session with higher priority or earlier join time
  const peopleAhead = await QueueEntry.countDocuments({
    sessionId: entry.sessionId,
    status: 'waiting',
    _id: { $ne: entry._id },
    $or: [
      { priority: { $gt: safePriority } },
      { priority: safePriority, joinedAt: { $lt: entry.joinedAt || new Date() } },
    ],
  });

  const avgServiceTime = entry.queueId?.serviceId?.averageServiceTime || 10;
  const estimatedWaitTimeMinutes = peopleAhead * avgServiceTime;

  return {
    peopleAhead,
    estimatedWaitTimeMinutes,
    status: entry.status,
    entry,
  };
};

/**
 * Performs database-safe atomic state transitions with race condition protection
 */
const transitionTicketState = async ({ ticketId, expectedCurrentState, targetState, staffUserId, counterId }) => {
  if (expectedCurrentState && ALLOWED_TRANSITIONS[expectedCurrentState]) {
    if (!ALLOWED_TRANSITIONS[expectedCurrentState].includes(targetState)) {
      throw new Error(`Invalid state transition from '${expectedCurrentState}' to '${targetState}'`);
    }
  }

  const query = { _id: ticketId };
  if (expectedCurrentState) {
    query.status = expectedCurrentState;
  }

  const updateFields = {
    status: targetState,
  };

  if (targetState === 'called') {
    updateFields.calledAt = new Date();
    if (staffUserId) updateFields.calledBy = staffUserId;
    if (counterId) updateFields.counterId = counterId;
  } else if (targetState === 'serving') {
    updateFields.servedAt = new Date();
  } else if (targetState === 'served' || targetState === 'cancelled') {
    updateFields.completedAt = new Date();
  }

  // Conditional update for atomicity
  const updatedTicket = await QueueEntry.findOneAndUpdate(query, updateFields, { new: true })
    .populate('customerId', 'name email phone')
    .populate('counterId', 'name counterNumber')
    .populate({ path: 'queueId', populate: { path: 'serviceId' } });

  if (!updatedTicket) {
    // Matched 0 documents -> race condition or ticket missing
    return {
      success: false,
      conflict: true,
      message: 'Ticket state was changed by another action or ticket not found.',
    };
  }

  return {
    success: true,
    ticket: updatedTicket,
  };
};

module.exports = {
  calculatePositionAndETA,
  transitionTicketState,
  ALLOWED_TRANSITIONS,
};
