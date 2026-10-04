const express = require("express");
const PucCertificate = require("../models/PucCertificate");
const auth = require("../middleware/auth");
const router = express.Router();

router.use(auth);

router.get("/", async (req, res) => {
  const Vehicle = require("../models/Vehicle");
  const myVehicles = await Vehicle.find({ owner: req.user.id }).select("_id");
  const vehicleIds = myVehicles.map(v => v._id);
  const certs = await PucCertificate.find({ vehicle: { $in: vehicleIds } })
    .populate("vehicle").sort({ expiryDate: 1 });
  res.json(certs);
});

router.get("/:vehicleId", async (req, res) => {
  const certs = await PucCertificate.find({ vehicle: req.params.vehicleId }).sort({ expiryDate: -1 });
  res.json(certs);
});

router.post("/", async (req, res) => {
  const cert = await PucCertificate.create(req.body);
  res.status(201).json(cert);
});

router.put("/:id", async (req, res) => {
  const cert = await PucCertificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(cert);
});

module.exports = router;

