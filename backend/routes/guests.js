const express = require('express');
const Guest = require('../models/Guest');
const Booking = require('../models/Booking');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all guests (Admin, Staff)
router.get('/', authenticate, authorize('Admin', 'Staff'), async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const guests = await Guest.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Guest.countDocuments(filter);

    res.json({ guests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE guest profile
router.post('/', authenticate, authorize('Admin', 'Staff'), async (req, res) => {
  try {
    const { name, email, phone, idNumber, address } = req.body;
    if (!name || !email || !phone || !idNumber) {
      return res.status(400).json({ message: 'Missing required guest information' });
    }

    const guest = new Guest({ name, email, phone, idNumber, address });
    await guest.save();
    res.status(201).json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE guest profile
router.put('/:id', authenticate, authorize('Admin', 'Staff'), async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE guest profile (Admin only)
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
