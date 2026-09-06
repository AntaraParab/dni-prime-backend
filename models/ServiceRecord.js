const mongoose = require("mongoose");

const serviceRecordSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  serviceDate: { type: Date, required: true },
  serviceType: { type: String, required: true },
  cost: { type: Number },
  garage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("ServiceRecord", serviceRecordSchema);