const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  regNo: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number },
  fuelType: { type: String, enum: ["Petrol", "Diesel", "CNG", "Electric"], default: "Petrol" },
}, { timestamps: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);