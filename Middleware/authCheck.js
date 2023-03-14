const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
//const User = mongoose.model("User");
const User = require("../Models/User");
const { JWTKEY, REFRESHKEY } = require("../Config/config");
const Doctor = require("../Models/Doctor");

module.exports = (req, res, next) => {
  // const { authorization } = req.headers;
  // console.log(authorization, "I am headers data");

  // if (!authorization) {
  //   return res.json({
  //     serverError: 0,
  //     authError: "1",
  //     data: { success: 0 },
  //     message: "You must be login",
  //   });
  // }

  // const token = authorization.replace("Bearer ", "");
  // jwt.verify(token, JWTKEY, async (err, payload) => {
  //   if (err) {
  //     console.log(err);
  //     return res.json({
  //       serverError: 0,
  //       authError: "1",
  //       data: { success: 0 },
  //       message: "Token Expired. Login again",
  //     });
  //   }
  //   const { userId } = payload;
  //   console.log(userId, "i am userId");

  //   const user = await Doctor.findById({ _id: userId });
  //   req.user = user;
  //   next();
  // });
  // next();

  try {
    let token = req.get("authorization");
    console.log(token, "i am access token");
    if (!token) {
      return res.status(404).json({
        serverError: 0,
        authError: "1",
        data: { success: 0 },
        message: "Token not found",
      });
    }
    token = token.split(" ")[1];
    jwt.verify(token, JWTKEY, async (err, payload) => {
      if (err) {
        console.log(err);
        return res.json({
          serverError: 0,
          authError: "1",
          data: { success: 0 },
          message: "Token Expired. Login again",
        });
      }
      const { userId } = payload;
      console.log(userId, "i am userId");

      const user = await User.findById({ _id: userId });
      if (!user) {
        const user = await Doctor.findById({ _id: userId });
        req.user = user;
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(401).json({ success: false, msg: error.message });
    // console.error(error);
  }
};

// const verifyRefresh = (userId, token) => {
//   try {
//     const decoded = jwt.verify(token, REFRESHKEY);
//     return decoded.userId === userId;
//   } catch (error) {
//     // console.error(error);
//     return false;
//   }
// };
