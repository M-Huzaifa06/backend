const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }],
  gender: { type: String, enum: ['male', 'female'], required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  totalDuration: { type: Number },
  totalPrice: { type: Number },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// require minimum 1 service
BookingSchema.path('services').validate(function(value) {
  return value && value.length > 0;
}, 'At least one service is required');

module.exports = mongoose.model('Booking', BookingSchema);
