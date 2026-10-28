const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkInDate: { type: Date, required: true, index: true },
  checkOutDate: { type: Date, required: true, index: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Booked', 'CheckedIn', 'CheckedOut', 'Cancelled'],
    default: 'Booked',
    index: true
  }
}, { timestamps: true });

bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
