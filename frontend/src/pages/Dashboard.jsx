import React, { useEffect, useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Add hotel modal
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [newHotelForm, setNewHotelForm] = useState({
    name: '',
    city: '',
    address: '',
    rating: 4.8,
    totalRooms: 30,
    contact: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const hotelsRes = await API.get('/hotels');
      const hotelList = hotelsRes.data || [];
      setHotels(hotelList);
      if (hotelList.length > 0) {
        const savedHotelId = localStorage.getItem('hotelpro_selected_hotel_id');
        const current = hotelList.find((h) => h._id === savedHotelId) || hotelList[0];
        setSelectedHotel(current);
      }

      if (user?.role !== 'Guest') {
        const statsRes = await API.get('/rooms/stats/overview');
        setStats(statsRes.data);
        const tasksRes = await API.get('/staff/tasks');
        setTasks(tasksRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    localStorage.setItem('hotelpro_selected_hotel_id', hotel._id);
  };

  const handleAddHotel = async (e) => {
    e.preventDefault();
    if (!newHotelForm.name.trim()) return;
    try {
      const res = await API.post('/hotels', newHotelForm);
      setShowAddHotelModal(false);
      setNewHotelForm({ name: '', city: '', address: '', rating: 4.8, totalRooms: 30, contact: '' });
      fetchDashboardData();
      if (res.data) handleSelectHotel(res.data);
    } catch (err) {
      alert('Error adding hotel property');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await API.post('/staff/tasks', { title: newTaskTitle });
      setNewTaskTitle('');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to add task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await API.patch(`/staff/tasks/${taskId}`, { status });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  if (loading) return <div className="container py-5 text-center">Loading dashboard...</div>;

  return (
    <div className="container py-4">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0">Welcome, {user?.name}</h2>
          <p className="text-muted mb-0">Role: <span className="badge bg-dark">{user?.role}</span></p>
        </div>
        <div className="d-flex gap-2">
          {user?.role === 'Admin' && (
            <button className="btn btn-outline-primary btn-sm" onClick={() => setShowAddHotelModal(true)}>
              <i className="bi bi-building-add me-1"></i> Add Hotel
            </button>
          )}
          <Link to="/rooms" className="btn btn-outline-secondary btn-sm">Browse Rooms</Link>
          <Link to="/bookings" className="btn btn-primary btn-sm">Reservations</Link>
        </div>
      </div>

      {/* Active Hotel Property Banner */}
      {selectedHotel && (
        <div className="card mb-4 overflow-hidden border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
          <div className="row g-0 align-items-center">
            <div className="col-md-4">
              <img
                src={selectedHotel.image}
                alt={selectedHotel.name}
                className="img-fluid h-100 w-100 object-fit-cover"
                style={{ maxHeight: '220px', minHeight: '180px', objectFit: 'cover' }}
              />
            </div>
            <div className="col-md-8 p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="badge bg-warning text-dark mb-2">
                    <i className="bi bi-star-fill me-1"></i>{selectedHotel.rating} Star Property
                  </span>
                  <h3 className="fw-bold mb-1">{selectedHotel.name}</h3>
                  <p className="text-light text-opacity-75 mb-2">
                    <i className="bi bi-geo-alt me-1"></i>{selectedHotel.address || selectedHotel.city}
                  </p>
                </div>
                <span className="badge bg-success px-3 py-2">
                  <i className="bi bi-check-circle me-1"></i>Active Property
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {selectedHotel.amenities?.map((amenity, idx) => (
                  <span key={idx} className="badge bg-secondary bg-opacity-50 text-light fw-normal">
                    {amenity}
                  </span>
                ))}
              </div>
              <div className="mt-3 text-light text-opacity-75 small">
                <i className="bi bi-telephone me-1"></i>Reception: {selectedHotel.contact} | <i className="bi bi-door-closed me-1"></i>Capacity: {selectedHotel.totalRooms} Rooms
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Chain Options & Properties */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-buildings me-2 text-primary"></i>Hotel Chain Properties ({hotels.length})
        </h4>
        <small className="text-muted">Click any hotel to switch active property</small>
      </div>

      <div className="row g-3 mb-4">
        {hotels.map((hotel) => {
          const isSelected = selectedHotel?._id === hotel._id;
          return (
            <div className="col-md-6 col-lg-3" key={hotel._id}>
              <div
                className={`card h-100 cursor-pointer transition p-3 ${
                  isSelected ? 'border-primary border-2 shadow' : 'border'
                }`}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                onClick={() => handleSelectHotel(hotel)}
              >
                <div className="position-relative mb-2">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="rounded w-100"
                    style={{ height: '130px', objectFit: 'cover' }}
                  />
                  <span className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75">
                    ★ {hotel.rating}
                  </span>
                </div>
                <h6 className="fw-bold mb-1 text-truncate" title={hotel.name}>{hotel.name}</h6>
                <p className="text-muted small mb-2">
                  <i className="bi bi-geo-alt me-1"></i>{hotel.city}
                </p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="small text-muted">{hotel.totalRooms} Rooms</span>
                  <button
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectHotel(hotel);
                    }}
                  >
                    {isSelected ? 'Active' : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Overview */}
      {user?.role !== 'Guest' && stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card p-3 border-start border-4 border-primary">
              <span className="text-muted small">Total Rooms</span>
              <h3 className="fw-bold mt-1 mb-0">{stats.total}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 border-start border-4 border-success">
              <span className="text-muted small">Available Rooms</span>
              <h3 className="fw-bold mt-1 mb-0">{stats.available}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 border-start border-4 border-danger">
              <span className="text-muted small">Occupied</span>
              <h3 className="fw-bold mt-1 mb-0">{stats.occupied}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 border-start border-4 border-warning">
              <span className="text-muted small">Occupancy Rate</span>
              <h3 className="fw-bold mt-1 mb-0">{stats.occupancyRate}%</h3>
            </div>
          </div>
        </div>
      )}

      {/* Staff and Tasks */}
      {user?.role !== 'Guest' && (
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Staff Workflow & Tasks</h5>
                {user?.role === 'Admin' && (
                  <form onSubmit={handleAddTask} className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="New task..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-sm">Add</button>
                  </form>
                )}
              </div>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr><td colSpan="4" className="text-center text-muted">No pending tasks</td></tr>
                    ) : (
                      tasks.map((t) => (
                        <tr key={t._id}>
                          <td>{t.title}</td>
                          <td>
                            <span className={`badge ${t.status === 'Completed' ? 'bg-success' : 'bg-secondary'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td>{t.priority}</td>
                          <td>
                            {t.status !== 'Completed' && (
                              <button
                                onClick={() => handleUpdateTaskStatus(t._id, 'Completed')}
                                className="btn btn-sm btn-outline-success"
                              >
                                Mark Done
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4 mb-4">
            <div className="card p-4">
              <h5 className="fw-bold mb-3">Quick Navigation</h5>
              <div className="list-group">
                <Link to="/rooms" className="list-group-item list-group-item-action">
                  <i className="bi bi-door-open me-2"></i> Manage Room Inventory
                </Link>
                <Link to="/bookings" className="list-group-item list-group-item-action">
                  <i className="bi bi-calendar-check me-2"></i> Check-in & Reservations
                </Link>
                <Link to="/guests" className="list-group-item list-group-item-action">
                  <i className="bi bi-people me-2"></i> Guest Directory
                </Link>
                <Link to="/payments" className="list-group-item list-group-item-action">
                  <i className="bi bi-cash-coin me-2"></i> Payment Records
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'Guest' && (
        <div className="card p-4">
          <h4 className="fw-bold">Guest Portal</h4>
          <p className="text-muted">
            You are browsing <strong>{selectedHotel?.name}</strong> in {selectedHotel?.city}. Check out the rooms and book your stay effortlessly.
          </p>
          <div className="d-flex gap-2">
            <Link to="/rooms" className="btn btn-primary">Find a Room</Link>
            <Link to="/bookings" className="btn btn-outline-secondary">My Bookings</Link>
          </div>
        </div>
      )}

      {/* Modal: Add New Hotel Property */}
      {showAddHotelModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Hotel Property</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddHotelModal(false)}></button>
              </div>
              <form onSubmit={handleAddHotel}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Hotel Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Sea Breeze Resort"
                      value={newHotelForm.name}
                      onChange={(e) => setNewHotelForm({ ...newHotelForm, name: e.target.value })}
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Goa"
                        value={newHotelForm.city}
                        onChange={(e) => setNewHotelForm({ ...newHotelForm, city: e.target.value })}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Star Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        className="form-control"
                        required
                        value={newHotelForm.rating}
                        onChange={(e) => setNewHotelForm({ ...newHotelForm, rating: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Street / Area / Landmark"
                      value={newHotelForm.address}
                      onChange={(e) => setNewHotelForm({ ...newHotelForm, address: e.target.value })}
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Total Rooms</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={newHotelForm.totalRooms}
                        onChange={(e) => setNewHotelForm({ ...newHotelForm, totalRooms: e.target.value })}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Contact Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+91..."
                        value={newHotelForm.contact}
                        onChange={(e) => setNewHotelForm({ ...newHotelForm, contact: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddHotelModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Save Hotel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
