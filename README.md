# MediCare — Hospital Appointment System (MERN)

A fullstack hospital appointment booking system built with MongoDB, Express, React, and Node.js.

## Features

- **JWT authentication** with three roles: `patient`, `doctor`, `admin`
- **Doctor search** by name/department/specialty
- **Recurring weekly availability** — doctors set working hours once (e.g. "Mon-Fri 9am-1pm, 30 min slots") and the system generates live open slots from it
- **Conflict-safe booking** — a MongoDB unique partial index on `(doctor, slotStart)` for `status: 'booked'` guarantees two patients can never book the same slot, even under concurrent requests (this is enforced at the database level, not just app logic)
- **Patient dashboard** — upcoming/past appointments, cancel a booking
- **Doctor dashboard** — today's/upcoming schedule, mark visits complete with notes, manage weekly availability
- Centralized error handling that turns duplicate-key/validation errors into clean API responses

## Tech stack

- **Frontend**: React 18 (Vite), React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Auth**: JSON Web Tokens + bcrypt password hashing

## Project structure

```
hospital-appointment-system/
├── backend/
│   ├── config/db.js
│   ├── models/         # User, Doctor, Appointment
│   ├── controllers/     # auth, doctor, appointment logic
│   ├── routes/
│   ├── middleware/      # JWT auth, role guard, error handler
│   ├── seed/seed.js      # demo data
│   └── server.js
└── frontend/
    └── src/
        ├── context/AuthContext.jsx
        ├── services/api.js
        ├── components/  # Navbar, ProtectedRoute
        └── pages/        # Home, Login, Register, DoctorList,
                           # DoctorDetail (booking), PatientDashboard,
                           # DoctorDashboard
```

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set MONGO_URI / JWT_SECRET
npm run seed     # optional: creates demo doctors + patient + admin
npm run dev      # starts on http://localhost:5000
```

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no extra config is needed for local development.

### Demo accounts (after running `npm run seed`)

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Patient | patient@example.com       | password123 |
| Doctor  | rahul.mehta@example.com   | password123 |
| Doctor  | sara.khan@example.com     | password123 |
| Admin   | admin@example.com         | password123 |

## How slot booking works

1. A doctor defines recurring rules like `{ dayOfWeek: 1 (Monday), startTime: "09:00", endTime: "13:00", slotDurationMinutes: 30 }`.
2. When a patient picks a date, `GET /api/doctors/:id/slots?date=YYYY-MM-DD` finds the matching weekday rule(s), generates every candidate slot, then subtracts any slot already booked in the `Appointment` collection for that doctor/date, and any slot in the past.
3. When a patient books, `POST /api/appointments` inserts an `Appointment` document. The database itself rejects a second booking for the same `(doctor, slotStart)` — the API just translates that into a friendly "someone just booked this" message. This is what makes the system safe against two people booking the same slot at the same instant, not just a client-side check.

## Possible next steps (left out to keep this intermediate-scoped)

- Email/SMS reminders (Resend/Twilio)
- Waitlist for fully booked days
- Admin panel for managing doctors/departments
- Pagination on doctor search
- Refresh tokens / logout-everywhere
