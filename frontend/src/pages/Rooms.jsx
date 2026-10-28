import React, { useEffect, useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    type: 'Single',
    price: '',
    capacity: 1,
    status: 'Available'
  });

  useEffect(() => {
    fetchRooms();
  }, [filterType, filterStatus]);

  const fetchRooms = async () => {
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const res = await API.get('/rooms', { params });
      setRooms(res.data.rooms || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await API.post('/rooms', newRoom);
      setShowAddModal(false);
      setNewRoom({ roomNumber: '', type: 'Single', price: '', capacity: 1, status: 'Available' });
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating room');
    }
  };

  const handleUpdateStatus = async (roomId, status) => {
    try {
      await API.put(`/rooms/${roomId}`, { status });
      fetchRooms();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await API.delete(`/rooms/${roomId}`);
      fetchRooms();
    } catch (err) {
      alert('Error deleting room');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Room Inventory</h3>
        {user?.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> Add Room
          </button>
        )}
      </div>

      <div className="card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small text-muted">Filter by Type</label>
            <select
              className="form-select form-select-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
              <option value="Deluxe">Deluxe</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Filter by Status</label>
            <select
              className="form-select form-select-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {rooms.map((room) => (
          <div className="col-md-4" key={room._id}>
            <div className="card h-100 p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0">Room {room.roomNumber}</h5>
                <span className={`badge badge-status-${room.status}`}>{room.status}</span>
              </div>
              <p className="text-muted mb-1">Type: <strong>{room.type}</strong></p>
              <p className="text-muted mb-1">Capacity: <strong>{room.capacity} Guests</strong></p>
              <p className="text-primary fw-bold fs-5 mb-3">${room.price} <small className="text-muted fs-6">/ night</small></p>

              <div className="mt-auto d-flex gap-2">
                {room.status === 'Available' && (
                  <button
                    onClick={() => navigate(`/bookings?roomId=${room._id}`)}
                    className="btn btn-sm btn-outline-primary w-100"
                  >
                    Reserve
                  </button>
                )}
                {user?.role === 'Admin' && (
                  <>
                    <select
                      className="form-select form-select-sm w-auto"
                      value={room.status}
                      onChange={(e) => handleUpdateStatus(room._id, e.target.value)}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="col-12 text-center text-muted py-5">No rooms found.</div>
        )}
      </div>

      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Room</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleCreateRoom}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Room Number</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={newRoom.roomNumber}
                      onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={newRoom.type}
                      onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Suite">Suite</option>
                      <option value="Deluxe">Deluxe</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price / Night ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={newRoom.price}
                      onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Capacity (Persons)</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Save Room</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
