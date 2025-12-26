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
