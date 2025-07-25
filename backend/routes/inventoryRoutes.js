const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Salon = require('../models/Salon');
const auth = require('../middleware/auth');

// Get salon inventory
router.get('/:salonId', auth, async (req, res) => {
  try {
    const inventory = await Inventory.find({ salon: req.params.salonId });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add new product to inventory
router.post('/:salonId', auth, async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.salonId);
    if (!salon) return res.status(404).json({ msg: 'Salon not found' });

    // Check if user owns the salon
    if (salon.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const newProduct = new Inventory({
      ...req.body,
      salon: req.params.salonId
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update product quantity
router.put('/:salonId/:productId', auth, async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.salonId);
    if (!salon) return res.status(404).json({ msg: 'Salon not found' });

    // Check if user owns the salon
    if (salon.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const updatedProduct = await Inventory.findByIdAndUpdate(
      req.params.productId,
      { quantity: req.body.quantity },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;