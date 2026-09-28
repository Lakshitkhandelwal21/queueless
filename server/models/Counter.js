const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a counter name'],
      trim: true,
    },
    counterNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'paused'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Counter', counterSchema);
