const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const deviceRoutes = require("./routes/deviceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/health", healthRoutes);
// Routes
app.get("/", (req, res) => {
    res.json({
        message: "Network Device Management API is running"
    });
});

app.use("/api/devices", deviceRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});