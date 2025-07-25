const mongoose = require('mongoose');

const SalonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [{
    name: String,
    price: Number
  }],
  technicians: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Salon', SalonSchema);