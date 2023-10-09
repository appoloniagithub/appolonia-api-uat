const express = require("express");
const usersController = require("../controllers/user-controllers");
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
//     folder: "CONTACT",
//   },
// });
//const path = "uploads/contact/";
const storage = multer.diskStorage({
  destination: "uploads/contact/",

  filename: (req, file, callback) => {
    callback(null, Date.now() + ".png");
  },
});

const upload = multer({ storage: storage });
// .fields([
//   {
//     name: "image",
//     maxCount: 1,
//   },
//   {
//     name: "files",
//     maxCount: 1,
//   },
//   {
//     name: "emiratesIdFront",
//     maxCount: 1,
//   },
//   {
//     name: "emiratesIdBack",
//     maxCount: 1,
//   },
// ]);
// const upload = multer({ dest: "uploads/" });

const router = express.Router();

// router.get("/", usersController.getUsers);

router.post("/signup", usersController.signup);
router.post("/checkpatient", usersController.checkPatient);
router.post("/phoneverify", usersController.emailVerify);
router.post("/fileverify", usersController.fileVerify);
// router.post("/newotp", usersController.requestNewEmailOtp);
router.post("/newotp", usersController.requestNewOtp);

router.post("/login", usersController.login);
router.post("/logout", usersController.logout);
router.post("/forgotpassword", usersController.requestForgotOtp);

router.post("/verifyforgototp", usersController.verifyForgotOtp);
router.post("/newpasswordforgot", usersController.newPassword);

router.post("/contact", upload.array("files"), usersController.contact);
router.post("/profileget", usersController.getUserdata);
router.post("/changepassword", usersController.changePassword);
router.post(
  "/updateprofile",
  upload.array("image"),
  usersController.updateUserProfile
);
// router.post(
//   "/updateprofile",
//   upload.array("emiratesIdFront"),
//   usersController.updateUserProfile
// );
// router.post(
//   "/updateprofile",
//   upload.array("emiratesIdBack"),
//   usersController.updateUserProfile
// );
router.post("/deleteaccount", usersController.deleteAccount);
router.post("/deletepatient", usersController.deletePatient);
router.get("/getallusers", usersController.getUsers);
router.get("/getalldoctors", usersController.getAllDoctors);
router.post("/refreshToken", usersController.refreshToken);
router.post("/createbooking", usersController.createBooking);
router.post("/newbooking", usersController.newBooking);
router.post("/reqbooking", usersController.sendBookingReq);
router.get("/getallappointments", usersController.getAllAppointments);
router.post("/updatebooking", usersController.updateBooking);
router.post("/deletebooking", usersController.deleteBooking);
router.post("/cancelbooking", usersController.cancelBooking);
router.post("/check-booking-availability", usersController.checkAvailability);
router.get("/getbookingdata", usersController.getBookingData);
router.post("/confirmbooking", usersController.confirmBooking);
router.post("/getallbookings", usersController.getAllBookings);
router.post("/showbookingdetails", usersController.showBookingDetails);
router.post("/searchuser", usersController.searchUser);
router.post("/getappointmentbyid", usersController.getAppointmentById);
router.post("/reschedule", usersController.rescheduleBookingReq);
router.get("/activepatients", usersController.activePatients);
router.get("/newpatientreq", usersController.newPatientReq);
router.get("/pending", usersController.pendingAppointments);
router.get("/getcontacts", usersController.getContacts);
router.post("/complete", usersController.completeBooking);
module.exports = router;
