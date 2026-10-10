const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db"); // ✅ import

const app = express();

// ✅ CONNECT DATABASE
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/profiles", require("./routes/user.routes"));
app.use("/api/events", require("./routes/event.routes"));
app.use("/api/teams", require("./routes/team.routes"));
app.use("/api/connections", require("./routes/connection.routes"));
app.use("/api/ai", require("./routes/ai.routes"));

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;