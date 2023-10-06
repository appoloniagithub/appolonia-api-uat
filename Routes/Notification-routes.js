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

router.post("/send-notification", notificationController.sendNotification);
module.exports = router;
