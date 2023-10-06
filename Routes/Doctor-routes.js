const express = require("express");
const doctorsController = require("../controllers/doctor-controllers");
const authCheck = require("../Middleware/authCheck");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "dbff6tzuo",
  api_key: "376437619835514",
  api_secret: "Jz-U91pJTdFnbWN4X6Lx3fj6pC4",
});

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "PROFILE",
//   },
// });
const storage = multer.diskStorage({
  destination: "uploads/doctors/",

  filename: (req, file, callback) => {
    callback(null, Date.now() + ".png");
  },
});
//const path = "uploads/doctors/" + Date.now() + ".png";
//const upload = multer({ dest: path });
const upload = multer({ storage: storage });
const router = express.Router();

router.get("/getalldoctors", doctorsController.getAllDoctors);
router.post(
  "/createdoctor",
  [upload.array("image")],
  doctorsController.addDoctor
);
router.post("/getDoctorById", doctorsController.getDoctorById);
router.put(
  "/updatedoctor",
  [upload.array("image")],
  doctorsController.updateDoctor
);
router.post("/deletedoctor", doctorsController.deleteDoctor);
router.post("/doctorlogin", doctorsController.doctorLogin);
router.post("/forgotpwd", doctorsController.forgotPassword);
router.get("/getdoctorscans", doctorsController.doctorScans);
router.post("/event", doctorsController.monthlySchedule);
router.get("/getallevents", doctorsController.getAllEvents);
router.post("/deleteevent", doctorsController.deleteEvent);
router.post("/editevent", doctorsController.editEvent);
router.post("/getevent", doctorsController.getEventById);
router.post("/gettime", doctorsController.getDoctorsByTime);
module.exports = router;
