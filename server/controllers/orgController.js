const Organization = require('../models/Organization');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Public
const getOrganizations = async (req, res, next) => {
  try {
    const orgs = await Organization.find({ status: 'active' });
    res.json({ success: true, count: orgs.length, data: orgs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single organization by ID
// @route   GET /api/organizations/:id
// @access  Public
const getOrganizationById = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    res.json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Private (Admin)
const createOrganization = async (req, res, next) => {
  try {
    const org = await Organization.create(req.body);
    res.status(201).json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (Admin)
const updateOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    res.json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Soft delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (Admin)
const deleteOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    res.json({ success: true, message: 'Organization deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
};
