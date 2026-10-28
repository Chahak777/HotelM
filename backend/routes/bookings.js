const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper: Check room availability for date range
const checkConflict = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const query = {
    room: roomId,
    status: { $in: ['Booked', 'CheckedIn'] },
    $or: [
      { checkInDate: { $lt: new Date(checkOut) }, checkOutDate: { $gt: new Date(checkIn) } }
    ]
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  return await Booking.findOne(query);
};

// SEARCH available rooms for given dates
router.get('/check-availability', async (req, res) => {
  try {
    const { checkIn, checkOut, type } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'checkIn and checkOut dates are required' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (start >= end) {
      return res.status(400).json({ message: 'checkOut must be after checkIn' });
    }

    // Find conflicting room IDs
    const bookedRooms = await Booking.distinct('room', {
      status: { $in: ['Booked', 'CheckedIn'] },
      checkInDate: { $lt: end },
      checkOutDate: { $gt: start }
    });

    const filter = {
      _id: { $nin: bookedRooms },
      status: { $ne: 'Maintenance' }
    };
    if (type) filter.type = type;

    const availableRooms = await Room.find(filter);
    res.json(availableRooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET bookings (Admin/Staff view all, Guest view own)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    let filter = {};

    if (req.user.role === 'Guest') {
      const guest = await Guest.findOne({ userId: req.user.id });
      if (!guest) return res.json({ bookings: [], total: 0, page: 1, pages: 0 });
      filter.guest = guest._id;
    }

    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const bookings = await Booking.find(filter)
      .populate('guest', 'name email phone')
      .populate('room', 'roomNumber type price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);
    res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE reservation (no double booking)
router.post('/', authenticate, async (req, res) => {
  try {
    const { roomId, guestId, checkInDate, checkOutDate } = req.body;
    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Room and dates are required' });
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (start >= end) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    let targetGuestId = guestId;
    if (req.user.role === 'Guest') {
      let guest = await Guest.findOne({ userId: req.user.id });
      if (!guest) {
        guest = new Guest({
          name: req.user.name,
          email: req.user.email || 'guest@example.com',
          phone: 'N/A',
          idNumber: 'G-' + req.user.id.slice(-6),
          userId: req.user.id
        });
        await guest.save();
      }
      targetGuestId = guest._id;
    }

    const room = await Room.findById(roomId);
    if (!room || room.status === 'Maintenance') {
      return res.status(400).json({ message: 'Selected room is unavailable' });
    }

    // Double-booking check
    const conflict = await checkConflict(roomId, start, end);
    if (conflict) {
      return res.status(400).json({ message: 'Room is already booked for selected dates' });
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = diffDays * room.price;

    const booking = new Booking({
      guest: targetGuestId,
      room: roomId,
      checkInDate: start,
      checkOutDate: end,
      totalPrice,
      status: 'Booked'
    });
    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE booking status (CheckedIn, CheckedOut, Cancelled)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Guests can only cancel their own bookings
    if (req.user.role === 'Guest') {
      if (status !== 'Cancelled') {
        return res.status(403).json({ message: 'Guests can only cancel bookings' });
      }
      const guest = await Guest.findOne({ userId: req.user.id });
      if (!guest || booking.guest.toString() !== guest._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    booking.status = status;
    await booking.save();

    // Auto-update room status if checked in / out
    if (status === 'CheckedIn') {
      await Room.findByIdAndUpdate(booking.room, { status: 'Occupied' });
    } else if (status === 'CheckedOut' || status === 'Cancelled') {
      await Room.findByIdAndUpdate(booking.room, { status: 'Available' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
