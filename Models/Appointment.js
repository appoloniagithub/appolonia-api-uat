const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    doctorId: {
      type: String,
    },
    doctorName: {
      type: String,
    },
    patientName: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    clinicName: {
      type: String,
    },
    serviceName: {
      type: String,
    },
    consultationType: {
      type: String,
    },
    emiratesId: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    pdate: {
      type: String,
    },
    ptime: {
      type: String,
    },
    status: {
      type: String,

      default: "Pending",
    },
    roomId: {
      type: String,
    },
    image: {
      type: String,
    },
    pdoctorId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
