# Smart Campus Timetabling & Resource Allocation System

A constraint-based academic timetabling system that automatically generates **conflict-free weekly schedules** for university batches. Admins trigger schedule generation; students and faculty only view their own schedule.

The core engine enforces hard scheduling constraints (faculty availability, room-type matching, no double-booking, consecutive lab slots) and soft constraints (day-spread, room consistency) — all within a single atomic Prisma transaction.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Vite |
| Backend | Node.js, Express 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL ≥ 14 |
| Auth | JWT (jsonwebtoken) |
| Password | bcrypt |

---

## Demo Credentials

After running `npx prisma db seed`, the following accounts are available. All share the same password:

**Password for all accounts: `password123`**

| Role | Email | Notes |
|------|-------|-------|
| Admin | `admin@uni.com` | Full access — manage resources, generate timetables |
| Faculty | `sharma@uni.com` | Views own teaching schedule |
| Faculty | `mehta@uni.com` | Views own teaching schedule |
| Student | `cse3a1@uni.com` | CSE Semester 3 batch |
| Student | `cse5a1@uni.com` | CSE Semester 5 batch |
| Student | `ece3a1@uni.com` | ECE Semester 3 batch |

---

## Project Structure

```
├── backend/
│   ├── index.js                   # Entry point, CORS, route mounting
│   ├── middlewares/
│   │   └── auth.middleware.js     # JWT authenticate + authorizeAdmin
│   ├── prisma/
│   │   ├── schema.prisma          # Data models
│   │   └── migrations/            # SQL migration history
│   ├── routes/
│   │   ├── auth.routes.js         # POST /api/login
│   │   ├── user.routes.js         # POST /api/users (admin), GET /api/me
│   │   ├── admin.routes.js        # CRUD: faculty, courses, rooms
│   │   ├── batch.routes.js        # GET /api/batch
│   │   ├── department.routes.js   # GET /api/departments
│   │   ├── generate.routes.js     # Scheduling engine
│   │   ├── timetable.routes.js    # Reset + timeslots
│   │   ├── timetable.view.routes.js  # Batch timetable view
│   │   └── faculty.routes.js      # Faculty schedule (JWT identity)
│   └── seed/
│       ├── masterSeed.js          # Primary seed script
│       └── data/                  # Departments, courses, faculty, users, etc.
└── frontend/
    └── src/
        ├── pages/
        │   ├── admin/             # Dashboard, Timetable management
        │   ├── faculty/           # Dashboard, Schedule view
        │   └── student/           # Dashboard, Timetable view
        └── components/
            ├── navbar.jsx
            ├── ProtectedRoute.jsx
            └── admin/             # FacultyForm, CourseForm, RoomForm
```

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14

### 1. Create the database

```bash
createdb smart_campus
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — fill in DATABASE_URL and JWT_SECRET
npx prisma migrate deploy
npx prisma db seed
npm run dev       # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:5000
npm run dev       # http://localhost:5173
```

### Environment Variables

**`backend/.env`**
```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/smart_campus"
JWT_SECRET=replace_with_a_long_random_secret
CORS_ORIGIN=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000
```

---

## Quick Demo Flow

1. Log in as **admin@uni.com** / `password123`
2. Go to **Admin Dashboard** — faculty, courses, and rooms are pre-seeded
3. Go to **Timetable Management** → select a batch → click **Generate Timetable**
4. Log out and log in as a student (`cse3a1@uni.com`) — see their generated schedule
5. Log in as a faculty (`sharma@uni.com`) — see their teaching schedule

---

## Scheduling Engine

The engine lives in `backend/routes/generate.routes.js` and runs as a single **Prisma transaction** — if anything fails, the entire generation rolls back with no partial state written.

### How It Works

1. Clears existing entries for the selected batch (within the transaction)
2. Iterates every course assigned to the batch's department
3. For each course, scans time slots and checks all of:
   - Faculty availability window exists for that slot
   - Batch is not already booked at that slot
   - Faculty is not already booked at that slot
   - Room is not already booked at that slot
   - Room type matches course type (LAB course → LAB room only)
   - Faculty `maxWeeklyLoad` not exceeded
4. Lab courses require **two consecutive free slots on the same day**
5. Scoring applies soft constraints to prefer better slot arrangements

### Hard Constraints (never violated)

- No batch/faculty/room double-booking — enforced by both engine logic and DB unique constraints
- Faculty availability windows (`FacultyAvailability` table) must be respected
- Room type must match course type: LAB ↔ LAB room, THEORY ↔ CLASSROOM
- Faculty weekly load cap (`maxWeeklyLoad`) cannot be exceeded
- Lab sessions require two consecutive same-day slots

### Soft Constraints (scoring-based optimisation)

- Spread course hours across different days of the week
- Prefer room consistency (same room for the same course)
- Avoid stacking too many classes on one day

### Generation Response

```json
{
  "batchId": 1,
  "entriesCreated": 24,
  "report": {
    "Data Structures": { "required": 4, "scheduled": 4, "reason": null },
    "OS Lab":          { "required": 4, "scheduled": 4, "reason": null }
  }
}
```

---

## API Reference

### Auth

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/login` | Public | Login with email + password, returns JWT |
| GET | `/api/me` | Any auth | Authenticated user profile (password excluded) |

### Admin — Resource Management

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/admin/faculty` | Admin | List all faculty |
| POST | `/api/admin/faculty` | Admin | Add faculty member |
| GET | `/api/admin/course` | Admin | List all courses |
| POST | `/api/admin/course` | Admin | Add course |
| GET | `/api/admin/room` | Admin | List all rooms |
| POST | `/api/admin/room` | Admin | Add room |
| POST | `/api/users` | Admin | Create a user account |

### Reference Data

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/batch` | Auth | List all batches with department info |
| GET | `/api/departments` | Auth | List all departments |
| GET | `/api/timetable/timeslots` | Auth | List all time slots |

### Timetable

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/generate/batch/:batchId` | Admin | Run scheduling engine for a batch |
| DELETE | `/api/timetable/batch/:batchId` | Admin | Reset all entries for a batch |
| GET | `/api/timetable/batch/:batchId` | Auth | View timetable grouped by day |
| GET | `/api/timetable/faculty` | Faculty | View own schedule (identity from JWT) |

---

## Deployment

### Backend (Render / Railway)

- **Root directory:** `backend`
- **Build command:** `npm install && npx prisma migrate deploy`
- **Start command:** `npm start`

> `prisma generate` runs automatically via the `postinstall` npm script.

**Environment variables:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=<openssl rand -base64 48>
CORS_ORIGIN=https://your-frontend.vercel.app
PORT=5000
```

### Frontend (Vercel / Netlify)

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`

**Environment variable:**
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## License

MIT
