# HotelPro – Hotel Management System

A lean, minimal MERN application for hotel operations, guest booking, inventory management, and payment tracking.

## Architecture
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs.
- **Frontend**: React (Vite), Bootstrap 5, Bootstrap Icons, Axios, React Router.

## Project Structure
```text
HotelM/
├── backend/
│   ├── middleware/auth.js      # JWT verification & role authorization
│   ├── models/                 # User, Room, Booking, Guest, Payment, Task
│   ├── routes/                 # auth, rooms, bookings, guests, payments, staff
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/Navbar.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/              # Login, Register, Dashboard, Rooms, Bookings, Guests, Payments
│   │   ├── api.js              # Axios with JWT interceptor
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Getting Started

### 1. Prerequisites
- Node.js (v16+) & npm
- MongoDB running locally or a MongoDB Atlas connection URI

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm run dev
# Server will run on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# Frontend will run on http://localhost:3000
```

### 4. Roles & Access
- **Admin**: Full access (Rooms CRUD, Staff tasks, Guests, Payments, Bookings).
- **Staff**: Manage check-ins/check-outs, mark room cleaning/status, update assigned tasks.
- **Guest**: Browse rooms, check availability, book reservations, and view own booking history.

## Git Repository Integration
To push this codebase to your remote repository:
```bash
git init
git remote add origin https://github.com/Chahak777/HotelM.git
git add .
git commit -m "feat: complete minimal MERN HotelPro management system"
git branch -M main
git push -u origin main
```
