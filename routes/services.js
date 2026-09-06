const express = require("express");
const ServiceRecord = require("../models/ServiceRecord");
const auth = require("../middleware/auth");
const router = express.Router();

router.use(auth);

router.get("/", async (req, res) => {
  const Vehicle = require("../models/Vehicle");
  const myVehicles = await Vehicle.find({ owner: req.user.id }).select("_id");
  const vehicleIds = myVehicles.map(v => v._id);
  const records = await ServiceRecord.find({ vehicle: { $in: vehicleIds } })
    .populate("vehicle").sort({ serviceDate: -1 });
  res.json(records);
});

router.get("/:vehicleId", async (req, res) => {
  const records = await ServiceRecord.find({ vehicle: req.params.vehicleId }).sort({ serviceDate: -1 });
  res.json(records);
});

router.post("/", async (req, res) => {
  const record = await ServiceRecord.create(req.body);
  res.status(201).json(record);
});

module.exports = router;