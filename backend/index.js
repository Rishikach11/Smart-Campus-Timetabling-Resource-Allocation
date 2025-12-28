require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT;

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
