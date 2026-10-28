const express = require('express');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all payments (Admin / Staff)
router.get('/', authenticate, authorize('Admin', 'Staff'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find()
      .populate({
        path: 'booking',
        populate: [
          { path: 'guest', select: 'name email' },
          { path: 'room', select: 'roomNumber' }
        ]
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments();
    res.json({ payments, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET payments for a specific booking
router.get('/booking/:bookingId', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ booking: req.params.bookingId });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// RECORD payment
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;
    if (!bookingId || !amount) {
      return res.status(400).json({ message: 'Booking ID and amount are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const payment = new Payment({
      booking: bookingId,
      amount,
      paymentMethod: paymentMethod || 'Card',
      paymentStatus: 'Paid',
      transactionId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    });
    await payment.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
