const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Service', ServiceSchema);