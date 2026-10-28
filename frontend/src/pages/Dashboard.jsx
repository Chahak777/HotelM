import React, { useEffect, useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Welcome, {user?.name}</h2>
          <p className="text-muted">Role: {user?.role}</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/rooms" className="btn btn-outline-primary btn-sm">Browse Rooms</Link>
          <Link to="/bookings" className="btn btn-primary btn-sm">Reservations</Link>
        </div>
      </div>

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
          <p className="text-muted">Welcome to HotelPro! Search available rooms and book your stay seamlessly.</p>
          <div className="d-flex gap-2">
            <Link to="/rooms" className="btn btn-primary">Find a Room</Link>
            <Link to="/bookings" className="btn btn-outline-secondary">My Bookings</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
