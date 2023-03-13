const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
//const User = mongoose.model("User");
const User = require("../Models/User");
const File = require("../Models/File");
const { JWTKEY, REFRESHKEY } = require("../Config/config");
const Doctor = require("../Models/Doctor");

const verifyRefresh = (fileId, token) => {
  try {
    console.log(fileId, "file id");
    const decoded = jwt.verify(token, REFRESHKEY);
    console.log(decoded, "decoded");

    return decoded.userId === fileId;

    // const user = User.findById({ _id: userId });
    // console.log(user, "user");
    // return decoded.userId == user;
  } catch (error) {
    // console.error(error);
    return false;
  }
};

module.exports = { verifyRefresh };
