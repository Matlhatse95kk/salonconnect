const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Salon = require('../models/Salon');
const twilio = require('twilio');
const auth = require('../middleware/auth');

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Book appointment
router.post('/', async (req, res) => {
  const { salonId, service, date, clientPhone, clientName, language = 'en' } = req.body;
  
  try {
    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ msg: 'Salon not found' });
    
    const newAppointment = new Appointment({
      salon: salonId,
      service,
      date,
      clientPhone,
      clientName,
      status: 'confirmed'
    });
    
    await newAppointment.save();

    // Send SMS confirmation
    const messages = {
      en: `Hi ${clientName}, your appointment for ${service} on ${new Date(date).toLocaleString()} is confirmed!`,
      zu: `Sawubona ${clientName}, ukuqokelwa kwakho kwe-${service} ngo-${new Date(date).toLocaleString()} kuvunyelwe!`,
      af: `Hallo ${clientName}, jou afspraak vir ${service} op ${new Date(date).toLocaleString()} is bevestig!`
    };
    
    await twilioClient.messages.create({
      body: messages[language] || messages.en,
      from: process.env.TWILIO_PHONE,
      to: clientPhone
    });

    res.status(201).json(newAppointment);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get available time slots
router.get('/slots', async (req, res) => {
  const { salon, technician, date } = req.query;
  if (!salon || !technician || !date) {
    return res.status(400).json({ msg: 'Missing parameters' });
  }

  try {
    const startDate = new Date(date);
    startDate.setHours(0,0,0,0);
    const endDate = new Date(date);
    endDate.setHours(23,59,59,999);

    const appointments = await Appointment.find({
      salon,
      technician,
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['confirmed', 'pending'] }
    });

    // Generate slots (every 30 minutes from 9am to 6pm)
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(startDate);
        slotTime.setHours(hour, minute, 0, 0);
        slots.push(slotTime.toISOString());
      }
    }

    // Filter out booked slots
    const bookedSlots = appointments.map(app => app.date.toISOString());
    const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

    res.json(availableSlots);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;