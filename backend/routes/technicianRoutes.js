const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');
const Salon = require('../models/Salon');
const auth = require('../middleware/auth');

// Verify technician certification
router.put('/:techId/verify', auth, async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.techId);
    if (!technician) return res.status(404).json({ msg: 'Technician not found' });

    const salon = await Salon.findById(technician.salon);
    if (!salon) return res.status(404).json({ msg: 'Salon not found' });

    // Check if user owns the salon or is admin
    if (salon.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    technician.certified = true;
    technician.certifiedBy = req.user.id;
    technician.certificationDate = new Date();

    await technician.save();
    res.json(technician);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get technicians by salon
router.get('/salon/:salonId', async (req, res) => {
  try {
    const technicians = await Technician.find({ salon: req.params.salonId });
    res.json(technicians);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;