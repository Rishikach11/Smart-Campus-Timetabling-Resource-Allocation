const cors = require("cors");
require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT;

app.use(cors());

app.use(express.json());

const healthRoutes = require("./routes/health.routes");
app.use("/api", healthRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const userRoutes = require("./routes/user.routes");
app.use("/api", userRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api", authRoutes);

const protectedRoutes = require("./routes/protected.routes");
app.use("/api", protectedRoutes);

const departmentRoutes = require("./routes/department.routes");
app.use("/api", departmentRoutes);

const courseRoutes = require("./routes/course.routes");
app.use("/api", courseRoutes);

const facultyRoutes = require("./routes/faculty.routes");
app.use("/api", facultyRoutes);

const batchRoutes = require("./routes/batch.routes");
app.use("/api", batchRoutes);

const roomRoutes = require("./routes/room.routes");
app.use("/api", roomRoutes);

const timetableRoutes = require("./routes/timetable.routes");
app.use("/api", timetableRoutes);

const generateRoutes = require("./routes/generate.routes");
app.use("/api", generateRoutes);

const timetableViewRoutes = require("./routes/timetable.view.routes");
app.use("/api", timetableViewRoutes);
