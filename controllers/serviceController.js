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

// @desc    Create a new service
// @route   POST /api/services
// @access  Public
exports.createService = async (req, res) => {
  try {
    const { name, price, duration, gender, isActive } = req.body;
    if (!name || price == null || duration == null || !gender) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const service = await Service.create({
      name,
      price,
      duration,
      gender,
      isActive: isActive !== false,
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Public
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    res.status(200).json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};
