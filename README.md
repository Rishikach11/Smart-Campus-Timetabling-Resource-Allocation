# Smart Campus Timetabling & Resource Allocation System

A constraint-based academic timetabling system that automatically generates conflict-free schedules for university batches. Admins generate timetables; students and faculty only view their own schedules.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Vite |
| Backend | Node.js, Express 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Password | bcrypt |

---

## Project Structure

```
├── backend/          # Express API + Prisma ORM
│   ├── routes/       # All route handlers
│   ├── middlewares/  # JWT auth middleware
│   ├── prisma/       # Schema and migrations
│   └── seed/         # Database seed scripts
└── frontend/         # React SPA
    └── src/
        ├── pages/    # Admin, Student, Faculty views
        └── components/
```

---

## Setup Instructions

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14

### 1. Database Setup

```bash
createdb smart_campus
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET
npx prisma migrate deploy
npx prisma db seed
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend URL
```

---

## Running the Project

```bash
# Terminal 1 — Backend
cd backend && npm run dev      # http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev     # http://localhost:5173
```

---

## API Overview

### Auth

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/me` | Authenticated user profile (with batch/faculty) |

### Timetable

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/api/generate/batch/:batchId` | ADMIN | Run scheduling engine for a batch |
| DELETE | `/api/timetable/batch/:batchId` | ADMIN | Reset all entries for a batch |
| GET | `/api/timetable/batch/:batchId` | ANY | View timetable grouped by day |
| GET | `/api/timetable/faculty` | FACULTY | View own schedule (from JWT identity) |

### Resources

| Method | Route |
|--------|-------|
| GET | `/api/batch` |
| GET | `/api/departments` |
| GET | `/api/courses` |
| GET | `/api/faculties` |
| GET | `/api/rooms` |
| GET | `/api/timeslots` |

---

## Scheduling Engine — Constraints

The engine in `routes/generate.routes.js` enforces these constraints:

**Hard Constraints (never violated)**
- No batch, faculty, or room double-booking at the same time slot
- Faculty availability windows must be respected
- Room type must match course type (LAB→LAB room, THEORY→CLASSROOM)
- Faculty weekly load cap (`maxWeeklyLoad`) cannot be exceeded
- Lab sessions require two consecutive slots on the same day

**Soft Constraints (scoring-based optimisation)**
- Spread a course's hours across different days
- Prefer room consistency (same room for same course)
- Avoid stacking too many classes in one day

---

## Deployment

### Backend (Render / Railway)

- Root directory: `backend`
- Build: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start: `npm start`
- Env vars: `DATABASE_URL`, `JWT_SECRET`

### Frontend (Vercel / Netlify)

- Root directory: `frontend`
- Build: `npm run build`
- Output: `dist`
- Env vars: `VITE_API_URL=https://your-backend.onrender.com`

---

## License

MIT
