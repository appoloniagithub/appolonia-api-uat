const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const scansSchema = new Schema({
  userId: { type: String },
  patientName: { type: String },
  doctorId: { type: String },
  doctorName: { type: String },
  Department: { type: String },
  faceScanImages: { type: Array },
  teethScanImages: { type: Array },
  logo: { type: String },
  isOpen: { type: String },
  created: {
    type: Date,
  },
});

// roleSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Scans", scansSchema);
