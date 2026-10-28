import React, { useEffect, useState } from 'react';
import API from '../api';

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', idNumber: '', address: '' });

  useEffect(() => {
    fetchGuests();
  }, [search]);

  const fetchGuests = async () => {
    try {
      const res = await API.get('/guests', { params: { search } });
      setGuests(res.data.guests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGuest = async (e) => {
    e.preventDefault();
    try {
      await API.post('/guests', form);
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', idNumber: '', address: '' });
      fetchGuests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save guest');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete guest profile?')) return;
    try {
      await API.delete(`/guests/${id}`);
      fetchGuests();
    } catch (err) {
      alert('Error deleting guest');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Guest Directory</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-person-plus me-1"></i> Add Guest
        </button>
      </div>

      <div className="card p-3 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search guests by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>ID Number</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-muted py-4">No guests found</td></tr>
              ) : (
                guests.map((g) => (
                  <tr key={g._id}>
                    <td className="fw-bold">{g.name}</td>
                    <td>
                      <div>{g.email}</div>
                      <small className="text-muted">{g.phone}</small>
                    </td>
                    <td>{g.idNumber}</td>
                    <td>{g.address || 'N/A'}</td>
                    <td>
                      <button onClick={() => handleDelete(g._id)} className="btn btn-sm btn-outline-danger">
                        <i className="bi bi-trash"></i>
                      </button>
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
                <h5 className="modal-title">New Guest Registration</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateGuest}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Govt / Passport ID Number</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={form.idNumber}
                      onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Save Guest</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;
