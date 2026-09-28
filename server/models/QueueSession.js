const mongoose = require('mongoose');

const queueSessionSchema = new mongoose.Schema(
  {
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: true,
    },
    date: {
      type: String,
      required: true, // Format: YYYY-MM-DD
    },
    sequenceNumber: {
      type: Number,
      default: 100, // Starts at 100 (e.g. A-101, A-102...)
    },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QueueSession', queueSessionSchema);
