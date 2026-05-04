const mongoose = require('mongoose');

const BarberSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  legacyBranchId: { type: Number },
  name: { type: String, required: true },
  role: { type: String },
  image: { type: String },
  experience: { type: String },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Barber', BarberSchema);
