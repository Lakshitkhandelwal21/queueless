const Staff = require('../models/Staff');
const User = require('../models/User');

// @desc    Get all staff assignments
// @route   GET /api/staff
// @access  Private (Admin, Staff)
const getStaffList = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.organizationId) {
      query.organizationId = req.query.organizationId;
    }

    const staffMembers = await Staff.find(query)
      .populate('userId', 'name email phone role status')
      .populate('organizationId', 'name')
      .populate('counterId', 'name counterNumber status');

    res.json({ success: true, count: staffMembers.length, data: staffMembers });
  } catch (error) {
    next(error);
  }
};

// @desc    Create staff assignment / assign user to staff role
// @route   POST /api/staff
// @access  Private (Admin)
const createStaff = async (req, res, next) => {
  try {
    const { userId, organizationId, counterId } = req.body;

    // Update user role to staff if not already
    await User.findByIdAndUpdate(userId, { role: 'staff' });

    const staff = await Staff.create({
      userId,
      organizationId,
      counterId: counterId || null,
    });

    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff counter assignment / status
// @route   PUT /api/staff/:id
// @access  Private (Admin, Staff)
const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'name email')
      .populate('counterId', 'name counterNumber');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff assignment not found' });
    }

    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove staff assignment
// @route   DELETE /api/staff/:id
// @access  Private (Admin)
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff assignment not found' });
    }
    res.json({ success: true, message: 'Staff assignment removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffList,
  createStaff,
  updateStaff,
  deleteStaff,
};
