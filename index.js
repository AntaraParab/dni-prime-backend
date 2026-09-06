const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const serviceRoutes = require("./routes/services");
const pucRoutes = require("./routes/puc");
const startReminderJob = require("./jobs/reminderJob");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB connection error ❌", err));

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/puc", pucRoutes);

app.get("/", (req, res) => {
    res.send("DNI-PRIME Backend is Running 🚀");
});

startReminderJob();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});