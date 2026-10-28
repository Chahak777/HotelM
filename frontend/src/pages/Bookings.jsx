import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const prefillRoomId = searchParams.get('roomId');

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // New reservation state
  const [selectedRoom, setSelectedRoom] = useState(prefillRoomId || '');
  const [selectedGuest, setSelectedGuest] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchRooms();
    if (user?.role !== 'Guest') {
      fetchGuests();
    }
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await API.get('/rooms');
      setRooms(res.data.rooms || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGuests = async () => {
    try {
      const res = await API.get('/guests');
      setGuests(res.data.guests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/bookings', {
        roomId: selectedRoom,
        guestId: selectedGuest || undefined,
        checkInDate,
        checkOutDate
      });
      setShowModal(false);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating booking');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Reservations & Bookings</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-calendar-plus me-1"></i> New Booking
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="7" className="text-center text-muted py-4">No reservations found</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.guest?.name || 'Guest'}</strong>
                      <div className="small text-muted">{b.guest?.email}</div>
                    </td>
                    <td>Room {b.room?.roomNumber} ({b.room?.type})</td>
                    <td>{new Date(b.checkInDate).toLocaleDateString()}</td>
                    <td>{new Date(b.checkOutDate).toLocaleDateString()}</td>
                    <td className="fw-bold">${b.totalPrice}</td>
                    <td>
                      <span className={`badge ${
                        b.status === 'CheckedIn' ? 'bg-success' :
                        b.status === 'Booked' ? 'bg-primary' :
                        b.status === 'CheckedOut' ? 'bg-secondary' : 'bg-danger'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {user?.role !== 'Guest' && b.status === 'Booked' && (
                          <button
                            onClick={() => handleStatusChange(b._id, 'CheckedIn')}
                            className="btn btn-outline-success"
                          >
                            Check-In
                          </button>
                        )}
                        {user?.role !== 'Guest' && b.status === 'CheckedIn' && (
                          <button
                            onClick={() => handleStatusChange(b._id, 'CheckedOut')}
                            className="btn btn-outline-secondary"
                          >
                            Check-Out
                          </button>
                        )}
                        {['Booked', 'CheckedIn'].includes(b.status) && (
                          <button
                            onClick={() => handleStatusChange(b._id, 'Cancelled')}
                            className="btn btn-outline-danger"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Reservation</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateBooking}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label">Select Room</label>
                    <select
                      className="form-select"
                      required
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                    >
                      <option value="">-- Choose Room --</option>
                      {rooms.map((r) => (
                        <option key={r._id} value={r._id}>
                          Room {r.roomNumber} - {r.type} (${r.price}/night)
                        </option>
                      ))}
                    </select>
                  </div>

                  {user?.role !== 'Guest' && (
                    <div className="mb-3">
                      <label className="form-label">Select Guest (Optional if registered)</label>
                      <select
                        className="form-select"
                        value={selectedGuest}
                        onChange={(e) => setSelectedGuest(e.target.value)}
                      >
                        <option value="">-- Guest on File --</option>
                        {guests.map((g) => (
                          <option key={g._id} value={g._id}>
                            {g.name} ({g.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Check-In</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Check-Out</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Reserve Now</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
