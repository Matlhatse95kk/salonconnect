const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Salon = require('../models/Salon');
const Inventory = require('../models/Inventory');
const Technician = require('../models/Technician');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Get salon dashboard data
router.get('/:salonId', auth, async (req, res) => {
  try {
    const salonId = req.params.salonId;
    
    // Get salon info
    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ msg: 'Salon not found' });
    
    // Authorization check
    if (salon.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAppointments = await Appointment.find({
      salon: salonId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    }).populate('client', 'name phone');
    
    // Get weekly revenue (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyRevenueData = await Appointment.aggregate([
      {
        $match: {
          salon: mongoose.Types.ObjectId(salonId),
          date: { $gte: oneWeekAgo },
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceData'
        }
      },
      {
        $unwind: '$serviceData'
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$serviceData.price' }
        }
      }
    ]);
    
    const weeklyRevenue = weeklyRevenueData.length > 0 ? weeklyRevenueData[0].total : 0;
    
    // Get low stock count
    const lowStockItems = await Inventory.find({
      salon: salonId,
      $expr: { $lte: ['$quantity', '$minStock'] }
    });
    
    // Get technicians
    const technicians = await Technician.find({ salon: salonId });
    
    // Appointment trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const appointmentTrends = await Appointment.aggregate([
      {
        $match: {
          salon: mongoose.Types.ObjectId(salonId),
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Service popularity
    const servicePopularity = await Appointment.aggregate([
      {
        $match: {
          salon: mongoose.Types.ObjectId(salonId),
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    res.json({
      salon,
      todayAppointments,
      weeklyRevenue,
      lowStockCount: lowStockItems.length,
      technicians,
      appointmentTrends: appointmentTrends.map(item => ({
        date: item._id,
        count: item.count
      })),
      servicePopularity
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;