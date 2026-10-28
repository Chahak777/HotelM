import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Initial mock data for standalone live demo
const initMockDB = () => {
  if (!localStorage.getItem('hotelpro_hotels')) {
    const hotels = [
      {
        _id: 'h1',
        name: 'Grand Palace Resort & Spa',
        city: 'Mumbai',
        address: 'Juhu Tara Road, Marine Drive',
        rating: 4.8,
        totalRooms: 45,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60',
        amenities: ['Free WiFi', 'Infinity Pool', 'Spa', 'Fine Dining', 'Valet'],
        contact: '+91 22 5550 1234',
        status: 'Active'
      },
      {
        _id: 'h2',
        name: 'Skyline Luxury Towers',
        city: 'New Delhi',
        address: 'Connaught Place, Central Wing',
        rating: 4.7,
        totalRooms: 60,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop&q=60',
        amenities: ['High Speed WiFi', 'Business Center', 'Rooftop Lounge', 'Gym'],
        contact: '+91 11 4440 5678',
        status: 'Active'
      },
      {
        _id: 'h3',
        name: 'Royal Heritage Haveli',
        city: 'Jaipur',
        address: 'Amer Road, Palace Enclave',
        rating: 4.9,
        totalRooms: 30,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=60',
        amenities: ['Heritage Courtyard', 'Cultural Shows', 'Fine Dining', 'Pool'],
        contact: '+91 141 333 9876',
        status: 'Active'
      },
      {
        _id: 'h4',
        name: 'Mountain Mist Pines Lodge',
        city: 'Manali',
        address: 'Old Manali Ridge Road',
        rating: 4.6,
        totalRooms: 25,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&auto=format&fit=crop&q=60',
        amenities: ['Mountain View', 'Fireplace', 'Heated Rooms', 'Trekking Desk'],
        contact: '+91 1902 222 345',
        status: 'Active'
      }
    ];
    localStorage.setItem('hotelpro_hotels', JSON.stringify(hotels));
  }
  if (!localStorage.getItem('hotelpro_rooms')) {
    const rooms = [
      { _id: 'r1', hotelId: 'h1', roomNumber: '101', type: 'Single', price: 99, capacity: 1, status: 'Available' },
      { _id: 'r2', hotelId: 'h1', roomNumber: '102', type: 'Double', price: 149, capacity: 2, status: 'Occupied' },
      { _id: 'r3', hotelId: 'h2', roomNumber: '201', type: 'Suite', price: 249, capacity: 4, status: 'Available' },
      { _id: 'r4', hotelId: 'h3', roomNumber: '301', type: 'Deluxe', price: 399, capacity: 4, status: 'Maintenance' }
    ];
    localStorage.setItem('hotelpro_rooms', JSON.stringify(rooms));
  }
  if (!localStorage.getItem('hotelpro_guests')) {
    const guests = [
      { _id: 'g1', name: 'John Doe', email: 'john@example.com', phone: '+1 555-0199', idNumber: 'ID-88231', address: 'New York, USA' },
      { _id: 'g2', name: 'Sarah Connor', email: 'sarah@example.com', phone: '+1 555-0144', idNumber: 'ID-99212', address: 'Los Angeles, USA' }
    ];
    localStorage.setItem('hotelpro_guests', JSON.stringify(guests));
  }
  if (!localStorage.getItem('hotelpro_bookings')) {
    const bookings = [
      {
        _id: 'b1',
        hotelName: 'Grand Palace Resort & Spa',
        guest: { _id: 'g1', name: 'John Doe', email: 'john@example.com', phone: '+1 555-0199' },
        room: { _id: 'r2', roomNumber: '102', type: 'Double', price: 149 },
        checkInDate: new Date().toISOString(),
        checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        totalPrice: 447,
        status: 'CheckedIn'
      }
    ];
    localStorage.setItem('hotelpro_bookings', JSON.stringify(bookings));
  }
  if (!localStorage.getItem('hotelpro_payments')) {
    const payments = [
      {
        _id: 'p1',
        transactionId: 'TXN-902148',
        booking: {
          _id: 'b1',
          guest: { name: 'John Doe' },
          room: { roomNumber: '102' }
        },
        amount: 447,
        paymentMethod: 'Card',
        paymentStatus: 'Paid',
        date: new Date().toISOString()
      }
    ];
    localStorage.setItem('hotelpro_payments', JSON.stringify(payments));
  }
  if (!localStorage.getItem('hotelpro_tasks')) {
    const tasks = [
      { _id: 't1', title: 'Sanitize and restock Room 101', status: 'Pending', priority: 'High' },
      { _id: 't2', title: 'Inspect HVAC in Deluxe Suite 301', status: 'In Progress', priority: 'Medium' }
    ];
    localStorage.setItem('hotelpro_tasks', JSON.stringify(tasks));
  }
};

initMockDB();

// Intercept errors (like 404/Network Error) to serve mock demo responses seamlessly
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const method = error.config?.method?.toLowerCase();
    const data = error.config?.data ? JSON.parse(error.config.data) : {};

    // Mock Hotels CRUD
    if (url.includes('/hotels')) {
      let hotels = JSON.parse(localStorage.getItem('hotelpro_hotels') || '[]');
      if (method === 'get') {
        return Promise.resolve({ data: hotels });
      }
      if (method === 'post') {
        const newHotel = {
          _id: 'h' + Date.now(),
          name: data.name,
          city: data.city || 'Custom Location',
          address: data.address || '',
          rating: data.rating || 5.0,
          totalRooms: Number(data.totalRooms) || 20,
          image: data.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60',
          amenities: data.amenities || ['WiFi', 'Pool', 'Restaurant'],
          contact: data.contact || '+91 99999 00000',
          status: 'Active'
        };
        hotels.push(newHotel);
        localStorage.setItem('hotelpro_hotels', JSON.stringify(hotels));
        return Promise.resolve({ data: newHotel });
      }
      if (method === 'delete') {
        const id = url.split('/').pop();
        hotels = hotels.filter((h) => h._id !== id);
        localStorage.setItem('hotelpro_hotels', JSON.stringify(hotels));
        return Promise.resolve({ data: { message: 'Deleted' } });
      }
    }

    // Mock Auth
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      const role = data.role || (data.email?.includes('admin') ? 'Admin' : data.email?.includes('staff') ? 'Staff' : 'Guest');
      const user = { id: 'u1', name: data.name || data.email?.split('@')[0] || 'Demo User', email: data.email, role };
      return Promise.resolve({ data: { token: 'demo-jwt-token', user } });
    }

    // Mock Rooms Overview Stats
    if (url.includes('/rooms/stats/overview')) {
      const rooms = JSON.parse(localStorage.getItem('hotelpro_rooms') || '[]');
      const total = rooms.length;
      const available = rooms.filter((r) => r.status === 'Available').length;
      const occupied = rooms.filter((r) => r.status === 'Occupied').length;
      const maintenance = rooms.filter((r) => r.status === 'Maintenance').length;
      const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;
      return Promise.resolve({ data: { total, available, occupied, maintenance, occupancyRate } });
    }

    // Mock Rooms CRUD
    if (url.includes('/rooms')) {
      let rooms = JSON.parse(localStorage.getItem('hotelpro_rooms') || '[]');
      if (method === 'get') {
        return Promise.resolve({ data: { rooms, total: rooms.length, page: 1, pages: 1 } });
      }
      if (method === 'post') {
        const newRoom = { _id: 'r' + Date.now(), ...data };
        rooms.push(newRoom);
        localStorage.setItem('hotelpro_rooms', JSON.stringify(rooms));
        return Promise.resolve({ data: newRoom });
      }
      if (method === 'put') {
        const id = url.split('/').pop();
        rooms = rooms.map((r) => (r._id === id ? { ...r, ...data } : r));
        localStorage.setItem('hotelpro_rooms', JSON.stringify(rooms));
        return Promise.resolve({ data: { message: 'Updated' } });
      }
      if (method === 'delete') {
        const id = url.split('/').pop();
        rooms = rooms.filter((r) => r._id !== id);
        localStorage.setItem('hotelpro_rooms', JSON.stringify(rooms));
        return Promise.resolve({ data: { message: 'Deleted' } });
      }
    }

    // Mock Bookings
    if (url.includes('/bookings')) {
      let bookings = JSON.parse(localStorage.getItem('hotelpro_bookings') || '[]');
      let rooms = JSON.parse(localStorage.getItem('hotelpro_rooms') || '[]');
      if (method === 'get') {
        return Promise.resolve({ data: { bookings, total: bookings.length, page: 1, pages: 1 } });
      }
      if (method === 'post') {
        const targetRoom = rooms.find((r) => r._id === data.roomId) || { roomNumber: '101', type: 'Single', price: 100 };
        const newBooking = {
          _id: 'b' + Date.now(),
          hotelName: data.hotelName || 'Grand Palace Resort & Spa',
          guest: { name: 'Current User', email: 'guest@hotelpro.com' },
          room: targetRoom,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          totalPrice: (targetRoom.price || 100) * 2,
          status: 'Booked'
        };
        bookings.unshift(newBooking);
        localStorage.setItem('hotelpro_bookings', JSON.stringify(bookings));
        return Promise.resolve({ data: newBooking });
      }
      if (method === 'patch') {
        const id = url.split('/')[2];
        bookings = bookings.map((b) => (b._id === id ? { ...b, status: data.status } : b));
        localStorage.setItem('hotelpro_bookings', JSON.stringify(bookings));
        return Promise.resolve({ data: { message: 'Updated' } });
      }
    }

    // Mock Guests
    if (url.includes('/guests')) {
      let guests = JSON.parse(localStorage.getItem('hotelpro_guests') || '[]');
      if (method === 'get') {
        return Promise.resolve({ data: { guests, total: guests.length, page: 1, pages: 1 } });
      }
      if (method === 'post') {
        const newGuest = { _id: 'g' + Date.now(), ...data };
        guests.push(newGuest);
        localStorage.setItem('hotelpro_guests', JSON.stringify(guests));
        return Promise.resolve({ data: newGuest });
      }
      if (method === 'delete') {
        const id = url.split('/').pop();
        guests = guests.filter((g) => g._id !== id);
        localStorage.setItem('hotelpro_guests', JSON.stringify(guests));
        return Promise.resolve({ data: { message: 'Deleted' } });
      }
    }

    // Mock Payments
    if (url.includes('/payments')) {
      let payments = JSON.parse(localStorage.getItem('hotelpro_payments') || '[]');
      let bookings = JSON.parse(localStorage.getItem('hotelpro_bookings') || '[]');
      if (method === 'get') {
        return Promise.resolve({ data: { payments, total: payments.length, page: 1, pages: 1 } });
      }
      if (method === 'post') {
        const booking = bookings.find((b) => b._id === data.bookingId) || { room: { roomNumber: '101' }, guest: { name: 'Guest' } };
        const newPayment = {
          _id: 'p' + Date.now(),
          transactionId: 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          booking,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          paymentStatus: 'Paid',
          date: new Date().toISOString()
        };
        payments.unshift(newPayment);
        localStorage.setItem('hotelpro_payments', JSON.stringify(payments));
        return Promise.resolve({ data: newPayment });
      }
    }

    // Mock Staff Tasks
    if (url.includes('/staff/tasks')) {
      let tasks = JSON.parse(localStorage.getItem('hotelpro_tasks') || '[]');
      if (method === 'get') {
        return Promise.resolve({ data: tasks });
      }
      if (method === 'post') {
        const newTask = { _id: 't' + Date.now(), title: data.title, status: 'Pending', priority: 'Medium' };
        tasks.unshift(newTask);
        localStorage.setItem('hotelpro_tasks', JSON.stringify(tasks));
        return Promise.resolve({ data: newTask });
      }
      if (method === 'patch') {
        const id = url.split('/').pop();
        tasks = tasks.map((t) => (t._id === id ? { ...t, status: data.status } : t));
        localStorage.setItem('hotelpro_tasks', JSON.stringify(tasks));
        return Promise.resolve({ data: { message: 'Updated' } });
      }
    }

    return Promise.reject(error);
  }
);

export default API;
