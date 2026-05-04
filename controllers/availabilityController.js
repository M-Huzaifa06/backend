const Service = require('../models/Service');
const { generateAvailableSlots, checkSlotAvailability } = require('../src/utils/timeCalculator');

// @desc    Get available slots for a barber on a specific date
// @route   POST /api/availability/slots
// @access  Public
exports.getSlots = async (req, res) => {
  try {
    const { barberId, date, serviceIds } = req.body;
    
    if (!barberId || !date || !serviceIds || !serviceIds.length) {
      return res.status(400).json({ success: false, error: 'Please provide barberId, date, and serviceIds' });
    }

    const services = await Service.find({ _id: { $in: serviceIds } });
    if (!services.length) {
      return res.status(404).json({ success: false, error: 'Services not found' });
    }

    const totalDuration = services.reduce((total, service) => total + (service.duration || 0), 0);
    const slots = await generateAvailableSlots(date, barberId, totalDuration);

    res.status(200).json({ 
      success: true, 
      data: { 
        totalDuration, 
        slots, 
        date, 
        barberId 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};

// @desc    Check if a specific slot is available
// @route   POST /api/availability/check
// @access  Public
exports.checkSlot = async (req, res) => {
  try {
    const { barberId, date, startTime, serviceIds } = req.body;

    if (!barberId || !date || !startTime || !serviceIds || !serviceIds.length) {
      return res.status(400).json({ success: false, error: 'Please provide barberId, date, startTime, and serviceIds' });
    }

    const services = await Service.find({ _id: { $in: serviceIds } });
    if (!services.length) {
      return res.status(404).json({ success: false, error: 'Services not found' });
    }

    const totalDuration = services.reduce((total, service) => total + (service.duration || 0), 0);
    
    // We can use calculateEndTime from timeCalculator
    const { calculateEndTime } = require('../src/utils/timeCalculator');
    const endTime = calculateEndTime(startTime, totalDuration);

    const { available } = await checkSlotAvailability(barberId, date, startTime, endTime);

    res.status(200).json({ 
      success: true, 
      data: { 
        available, 
        startTime, 
        endTime, 
        totalDuration 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};
