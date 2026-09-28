const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a service name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    averageServiceTime: {
      type: Number,
      default: 10, // Minutes
    },
    priorityEnabled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Service', serviceSchema);
