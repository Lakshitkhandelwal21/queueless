const Queue = require('../models/Queue');
const QueueSession = require('../models/QueueSession');
const QueueEntry = require('../models/QueueEntry');

/**
 * Safely generates the next sequential token for a given queue
 * and creates a QueueEntry for the customer atomically.
 */
const generateTokenForCustomer = async ({ queueId, customerId, priority = 0 }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Verify queue exists and is open
  const queue = await Queue.findById(queueId);
  if (!queue) {
    throw new Error('Queue not found');
  }
  if (queue.status === 'closed') {
    throw new Error('Queue is currently closed');
  }
  if (queue.status === 'paused') {
    throw new Error('Queue is currently paused');
  }

  // 2. Find or create today's active session for this queue
  let session = await QueueSession.findOne({
    queueId,
    date: todayStr,
    status: 'active',
  });

  if (!session) {
    session = await QueueSession.create({
      queueId,
      date: todayStr,
      sequenceNumber: 100,
      status: 'active',
    });
  }

  // 3. Check for existing active ticket for this customer in this queue session
  const existingActiveEntry = await QueueEntry.findOne({
    sessionId: session._id,
    customerId,
    status: { $in: ['waiting', 'called', 'serving'] },
  });

  if (existingActiveEntry) {
    return {
      isDuplicate: true,
      entry: existingActiveEntry,
      queue,
    };
  }

  // 4. Atomically increment the session sequence number
  const updatedSession = await QueueSession.findByIdAndUpdate(
    session._id,
    { $inc: { sequenceNumber: 1 } },
    { new: true }
  );

  const tokenNumber = updatedSession.sequenceNumber;
  const tokenLabel = `${queue.prefix}-${tokenNumber}`;

  // 5. Create new QueueEntry
  const entry = await QueueEntry.create({
    sessionId: session._id,
    queueId,
    customerId,
    tokenNumber,
    tokenLabel,
    status: 'waiting',
    priority: queue.settings?.allowPriority ? priority : 0,
    joinedAt: new Date(),
  });

  return {
    isDuplicate: false,
    entry,
    queue,
  };
};

module.exports = { generateTokenForCustomer };
