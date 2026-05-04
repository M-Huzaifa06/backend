const Barber = require('../models/Barber');

// @desc    Get all barbers
// @route   GET /api/barbers
// @access  Public
exports.getBarbers = async (req, res) => {
  try {
    let query = {};
    if (req.query.branchId) {
      query.legacyBranchId = req.query.branchId;
    }
    
    const barbers = await Barber.find(query).populate('branchId', 'name city');
    res.status(200).json({ success: true, data: barbers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
