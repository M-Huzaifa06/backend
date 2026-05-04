const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  legacyId: { type: Number, required: true },
  image: { type: String },
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  hours: { type: String },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Branch', BranchSchema);