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

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "PROFILE",
  },
});
const upload = multer({ storage: storage });
const router = express.Router();

router.get("/getalldoctors", authCheck, doctorsController.getAllDoctors);
router.post(
  "/createdoctor",
  [authCheck, upload.array("image")],
  doctorsController.addDoctor
);
router.post("/getDoctorById", authCheck, doctorsController.getDoctorById);
router.put(
  "/updatedoctor",
  [authCheck, upload.array("image")],
  doctorsController.updateDoctor
);
router.post("/deletedoctor", authCheck, doctorsController.deleteDoctor);
router.post("/doctorlogin", doctorsController.doctorLogin);
router.post("/forgotpwd", doctorsController.forgotPassword);
router.post("/doctorscans", doctorsController.doctorScans);

module.exports = router;
