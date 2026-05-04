const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    let query = {};
    if (req.query.gender) {
      query.gender = req.query.gender;
    }

    const services = await Service.find(query);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};