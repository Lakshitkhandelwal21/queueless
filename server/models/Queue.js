const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a queue name'],
      trim: true,
    },
    prefix: {
      type: String,
      required: true,
      uppercase: true,
      default: 'A',
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'paused'],
      default: 'open',
    },
    settings: {
      capacity: {
        type: Number,
        default: 100,
      },
      allowPriority: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Queue', queueSchema);
