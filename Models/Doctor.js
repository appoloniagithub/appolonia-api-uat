const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const doctorSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String },
  speciality: { type: String },
  email: { type: String },
  emiratesId: { type: String },
  phoneNumber: { type: String },
  image: { type: Array },
  password: { type: String },
  gender: { type: String },
  nationality: { type: String },
  totalExperience: { type: String },
  profile: { type: String },
  certifications: { type: String },
  education: { type: String },
});

module.exports = mongoose.model("Doctor", doctorSchema);
