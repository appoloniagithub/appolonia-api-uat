const express = require("express");
const authCheck = require("../Middleware/authCheck");

const fileController = require("../controllers/file-controllers");

const router = express.Router();

router.post(
  "/getfilefamilymembers",
  authCheck,
  fileController.getFileFamilyMembers
);
router.post("/connectmembertofile", fileController.connectMemberToFile);
router.post("/addtofamily", authCheck, fileController.addFamilyMember);
router.post("/clinicverify", authCheck, fileController.clinicVerify);
router.post(
  "/updateclinicdetails",
  authCheck,
  fileController.updateClinicDetails
);

module.exports = router;
