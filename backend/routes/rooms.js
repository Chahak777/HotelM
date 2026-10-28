const express = require('express');
const Room = require('../models/Room');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all rooms (with pagination & filter)
router.get('/', async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const rooms = await Room.find(filter).skip(skip).limit(Number(limit)).sort({ roomNumber: 1 });
    const total = await Room.countDocuments(filter);

    res.json({ rooms, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET room stats (occupancy overview)
router.get('/stats/overview', authenticate, authorize('Admin', 'Staff'), async (req, res) => {
  try {
    const total = await Room.countDocuments();
    const available = await Room.countDocuments({ status: 'Available' });
    const occupied = await Room.countDocuments({ status: 'Occupied' });
    const maintenance = await Room.countDocuments({ status: 'Maintenance' });
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;

    res.json({ total, available, occupied, maintenance, occupancyRate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE room (Admin only)
router.post('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { roomNumber, type, price, capacity, status } = req.body;
    const exists = await Room.findOne({ roomNumber });
    if (exists) return res.status(400).json({ message: 'Room number already exists' });

    const room = new Room({ roomNumber, type, price, capacity, status });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE room (Admin or Staff for status)
router.put('/:id', authenticate, authorize('Admin', 'Staff'), async (req, res) => {
  try {
    const updates = req.user.role === 'Admin' ? req.body : { status: req.body.status };
    const room = await Room.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE room (Admin only)
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
