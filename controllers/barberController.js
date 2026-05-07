const Barber = require('../models/Barber');
const Branch = require('../models/Branch');

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

// @desc    Create a new barber
// @route   POST /api/barbers
// @access  Public
exports.createBarber = async (req, res) => {
  try {
    const { branchId, name, role, experience, image, isActive } = req.body;
    if (!branchId || !name) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(400).json({ success: false, error: 'Branch not found' });
    }

    const barber = await Barber.create({
      branchId,
      legacyBranchId: branch.legacyId,
      name,
      role,
      experience,
      image,
      isActive: isActive !== false,
    });

    const created = await Barber.findById(barber._id).populate('branchId', 'name city');
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};

// @desc    Update a barber
// @route   PUT /api/barbers/:id
// @access  Public
exports.updateBarber = async (req, res) => {
  try {
    const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('branchId', 'name city');
    if (!barber) {
      return res.status(404).json({ success: false, error: 'Barber not found' });
    }
    res.status(200).json({ success: true, data: barber });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};

// @desc    Delete a barber
// @route   DELETE /api/barbers/:id
// @access  Public
exports.deleteBarber = async (req, res) => {
  try {
    const barber = await Barber.findByIdAndDelete(req.params.id);
    if (!barber) {
      return res.status(404).json({ success: false, error: 'Barber not found' });
    }
    res.status(200).json({ success: true, message: 'Barber deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};
