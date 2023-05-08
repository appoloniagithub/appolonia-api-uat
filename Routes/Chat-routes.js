const express = require("express");
const authCheck = require("../Middleware/authCheck");

const chatController = require("../controllers/chat-controllers");

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
//     folder: "CHAT",
//   },
// });
//const path = "uploads/chat/";
const storage = multer.diskStorage({
  destination: "uploads/chat/",

  filename: (req, file, callback) => {
    callback(null, Date.now() + ".png");
  },
});
//const path = "uploads/chat/" + Date.now() + ".png";
//const upload = multer({ dest: path });
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/newchat", chatController.newChat);
router.post("/getconversations", authCheck, chatController.getConversations);
router.post(
  "/getconversationmessages",
  authCheck,
  chatController.getConversationMessages
);
router.post("/newmessage", authCheck, chatController.newMessage);

router.post(
  "/newmessageimage",
  [upload.array("message")],
  chatController.newMessage
);
router.post("/getdoctorinfo", authCheck, chatController.getDoctorInfo);
router.post("/getcon", authCheck, chatController.getCon);
router.get("/unseen", chatController.unSeenMessages);

module.exports = router;
