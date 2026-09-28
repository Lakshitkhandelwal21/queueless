const Counter = require('../models/Counter');

// @desc    Get counters
// @route   GET /api/counters
// @access  Public
const getCounters = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.organizationId) {
      query.organizationId = req.query.organizationId;
    }

    const counters = await Counter.find(query).sort({ counterNumber: 1 });
    res.json({ success: true, count: counters.length, data: counters });
  } catch (error) {
    next(error);
  }
};

// @desc    Create counter
// @route   POST /api/counters
// @access  Private (Admin)
const createCounter = async (req, res, next) => {
  try {
    const counter = await Counter.create(req.body);
    res.status(201).json({ success: true, data: counter });
  } catch (error) {
    next(error);
  }
};

// @desc    Update counter status/details
// @route   PUT /api/counters/:id
// @access  Private (Admin, Staff)
const updateCounter = async (req, res, next) => {
  try {
    const counter = await Counter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!counter) {
      return res.status(404).json({ success: false, message: 'Counter not found' });
    }
    res.json({ success: true, data: counter });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete counter
// @route   DELETE /api/counters/:id
// @access  Private (Admin)
const deleteCounter = async (req, res, next) => {
  try {
    const counter = await Counter.findByIdAndDelete(req.params.id);
    if (!counter) {
      return res.status(404).json({ success: false, message: 'Counter not found' });
    }
    res.json({ success: true, message: 'Counter deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCounters,
  createCounter,
  updateCounter,
  deleteCounter,
};
