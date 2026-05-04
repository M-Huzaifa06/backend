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