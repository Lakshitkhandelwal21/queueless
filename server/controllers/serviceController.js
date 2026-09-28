const Service = require('../models/Service');

// @desc    Get services (filter by organizationId if provided)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const query = { status: 'active' };
    if (req.query.organizationId) {
      query.organizationId = req.query.organizationId;
    }

    const services = await Service.find(query).populate('organizationId', 'name');
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin)
const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin)
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Soft delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};
