const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['Single', 'Double', 'Suite', 'Deluxe'], default: 'Single' },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true, default: 1 },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
