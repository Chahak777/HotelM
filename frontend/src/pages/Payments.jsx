import React, { useEffect, useState } from 'react';
import API from '../api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ bookingId: '', amount: '', paymentMethod: 'Card' });

  useEffect(() => {
    fetchPayments();
    fetchBookings();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await API.get('/payments');
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    try {
      await API.post('/payments', form);
      setShowModal(false);
      setForm({ bookingId: '', amount: '', paymentMethod: 'Card' });
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Payment Processing</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-credit-card me-1"></i> Record Payment
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Txn ID</th>
                <th>Booking Ref</th>
                <th>Guest</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan="7" className="text-center text-muted py-4">No payments recorded</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td><code>{p.transactionId}</code></td>
                    <td>Room {p.booking?.room?.roomNumber || 'N/A'}</td>
                    <td>{p.booking?.guest?.name || 'Guest'}</td>
                    <td className="fw-bold text-success">${p.amount}</td>
                    <td><span className="badge bg-light text-dark border">{p.paymentMethod}</span></td>
                    <td><span className="badge bg-success">{p.paymentStatus}</span></td>
                    <td>{new Date(p.date || p.createdAt).toLocaleString()}</td>
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
                <h5 className="modal-title">Record Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleProcessPayment}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Booking</label>
                    <select
                      className="form-select"
                      required
                      value={form.bookingId}
                      onChange={(e) => {
                        const b = bookings.find((x) => x._id === e.target.value);
                        setForm({
                          ...form,
                          bookingId: e.target.value,
                          amount: b ? b.totalPrice : form.amount
                        });
                      }}
                    >
                      <option value="">-- Select Reservation --</option>
                      {bookings.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.guest?.name} - Room {b.room?.roomNumber} (${b.totalPrice})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    >
                      <option value="Card">Credit/Debit Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Submit Payment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
