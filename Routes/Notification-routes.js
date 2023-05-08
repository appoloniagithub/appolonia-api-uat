const express = require("express");
const authCheck = require("../Middleware/authCheck");

const notificationController = require("../controllers/notification-controllers");

const router = express.Router();

router.post(
  "/getallnotifications",
  //authCheck,
  notificationController.getAllNotifications
);

router.post(
  "/createnotification",
  //authCheck,
  notificationController.createNotification
);
router.post("/notification", notificationController.schNotification);
router.get("/getschnotification", notificationController.getSchNotification);
router.delete(
  "/deleteschnotification",
  notificationController.deleteSchNotification
);
router.post("/send-notification", notificationController.sendNotification);
module.exports = router;
