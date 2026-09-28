const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QueueSession',
      required: true,
    },
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    tokenLabel: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'called', 'serving', 'served', 'skipped', 'cancelled', 'no_show'],
      default: 'waiting',
    },
    priority: {
      type: Number,
      default: 0, // 0 = Normal, 1+ = Higher Priority
    },
    counterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counter',
      default: null,
    },
    calledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    servedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index for fast lookup of active tickets per session & ordering
queueEntrySchema.index({ sessionId: 1, status: 1, priority: -1, joinedAt: 1 });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
