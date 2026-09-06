const express = require("express");
const Vehicle = require("../models/Vehicle");
const auth = require("../middleware/auth");
const router = express.Router();

router.use(auth);

// Get all vehicles for logged-in user
router.get("/", async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user.id });
  res.json(vehicles);
});

// Add vehicle
router.post("/", async (req, res) => {
  const vehicle = await Vehicle.create({ ...req.body, owner: req.user.id });
  res.status(201).json(vehicle);
});

// Update vehicle
router.put("/:id", async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id }, req.body, { new: true }
  );
  res.json(vehicle);
});

// Delete vehicle
router.delete("/:id", async (req, res) => {
  await Vehicle.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  res.json({ message: "Vehicle deleted" });
});

module.exports = router;