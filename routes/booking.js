const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getBooking, updateBookingStatus } = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
