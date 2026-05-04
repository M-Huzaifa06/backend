const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { calculateEndTime, checkSlotAvailability } = require('../src/utils/timeCalculator');





// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    const { branchId, barberId, serviceIds, gender, date, startTime, customer, notes } = req.body;

    // 1. Validate required fields
    if (!branchId || !barberId || !serviceIds || !serviceIds.length || !gender || !date || !startTime || !customer) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // 2. Fetch services, calc total duration and price
    const services = await Service.find({ _id: { $in: serviceIds } });
    if (!services.length) {
      return res.status(404).json({ success: false, error: 'Services not found' });
    }

    const totalDuration = services.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalPrice = services.reduce((acc, s) => acc + (s.price || 0), 0);

    // 3. End time
    const endTime = calculateEndTime(startTime, totalDuration);

    // 4. Re-verify slot availability
    const { available } = await checkSlotAvailability(barberId, date, startTime, endTime);
    if (!available) {
      return res.status(409).json({ success: false, message: 'This slot is no longer available' });
    }

    // 5. Create
    const booking = await Booking.create({
      branch: branchId,
      barber: barberId,
      services: serviceIds,
      gender,
      date,
      startTime,
      endTime,
      totalDuration,
      totalPrice,
      customer,
      notes
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('branch', 'name city')
      .populate('barber', 'name experience')
      .populate('services', 'name price duration');

    // 6. Emit Socket event
    if (req.io) {
      req.io.to(`barber-${barberId}-${date}`).emit('slot-booked', {
        startTime,
        endTime,
        barberId,
        date
      });
    }

    // 7. Return
    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};

// @desc    Get all bookings (with query filters)
// @route   GET /api/bookings
// @access  Public
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.query.email) {
      query['customer.email'] = req.query.email;
    }
    if (req.query.date) {
      query.date = req.query.date;
    }
    if (req.query.barberId) {
      query.barber = req.query.barberId;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate('branch', 'name city')
      .populate('barber', 'name experience')
      .populate('services', 'name price duration');

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Public
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('branch', 'name city')
      .populate('barber', 'name experience')
      .populate('services', 'name price duration');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Public
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Emit Socket event if cancelled
    if (status === 'cancelled' && req.io) {
      req.io.to(`barber-${booking.barber.toString()}-${booking.date}`).emit('slot-freed', {
        barberId: booking.barber.toString(),
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};
