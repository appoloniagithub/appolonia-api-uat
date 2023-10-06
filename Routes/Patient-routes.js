const express = require("express");
const authCheck = require("../Middleware/authCheck");

const patientController = require("../controllers/patient-controllers");

const router = express.Router();

router.get("/getallpatients", patientController.getAllPatients);
router.post("/getpatient", patientController.getPatientById);
router.post("/addpatientnotes", patientController.addPatientNotes);
router.post("/getnotes", patientController.getNotes);

module.exports = router;
