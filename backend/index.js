require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Global middleware
// CORS — in production set CORS_ORIGIN to the frontend URL (e.g. https://your-app.vercel.app)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// ================= ROUTE IMPORTS =================
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");

const departmentRoutes = require("./routes/department.routes");
const courseRoutes = require("./routes/course.routes");
const facultyRoutes = require("./routes/faculty.routes");
const batchRoutes = require("./routes/batch.routes");
const roomRoutes = require("./routes/room.routes");

const timetableRoutes = require("./routes/timetable.routes");
const timetableViewRoutes = require("./routes/timetable.view.routes");
const generateRoutes = require("./routes/generate.routes");

// ================= ROUTE MOUNTING =================
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api", departmentRoutes);
app.use("/api", courseRoutes);
app.use("/api", facultyRoutes);
app.use("/api", batchRoutes);
app.use("/api", roomRoutes);

app.use("/api/timetable", timetableRoutes);
app.use("/api", timetableViewRoutes);
app.use("/api", generateRoutes);

// ================= SERVER START =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
