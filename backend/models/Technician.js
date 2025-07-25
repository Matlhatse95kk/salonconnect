const mongoose = require('mongoose');

const TechnicianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salon',
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  certificationFiles: [String],
  certified: {
    type: Boolean,
    default: false
  },
  certifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  certificationDate: Date,
  services: [String],
  rating: {
    type: Number,
    default: 0
  },
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Technician', TechnicianSchema);