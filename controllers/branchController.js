const Branch = require('../models/Branch');

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public
exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};

// @desc    Create a new branch
// @route   POST /api/branches
// @access  Public
exports.createBranch = async (req, res) => {
  try {
    const { legacyId, name, city, address, phone, hours, image, isActive } = req.body;
    if (legacyId == null || !name || !city) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const branch = await Branch.create({
      legacyId,
      name,
      city,
      address,
      phone,
      hours,
      image,
      isActive: isActive !== false,
    });

    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Public
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, error: 'Branch not found' });
    }

    res.status(200).json({ success: true, message: 'Branch deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};
