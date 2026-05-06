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
