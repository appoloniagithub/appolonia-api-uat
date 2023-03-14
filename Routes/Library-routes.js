const express = require("express");
const authCheck = require("../Middleware/authCheck");

const libraryController = require("../controllers/library-controllers");
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
  destination: "uploads/library/",

  filename: (req, file, callback) => {
    callback(null, Date.now() + ".png");
  },
});
//const path = "uploads/library/";

//const upload = multer({ dest: path + Date.now() + ".png" });
const upload = multer({ storage: storage });
const router = express.Router();

router.get("/getarticles", authCheck, libraryController.getArticles);
router.post("/getsinglearticle", authCheck, libraryController.getSingleArticle);
router.post(
  "/addarticle",
  //authCheck,
  upload.array("image"),
  libraryController.addArticle
);
router.put(
  "/updatearticle",
  // authCheck,
  upload.array("image"),
  libraryController.updateArticle
);
router.post(
  "/deletearticle",
  // authCheck,
  libraryController.deleteArticle
);

module.exports = router;
