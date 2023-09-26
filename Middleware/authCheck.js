const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
//const User = mongoose.model("User");
const User = require("../Models/User");
const File = require("../Models/File");
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
      return res.json({
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
      } else {
        const { userId } = payload;
        console.log(userId, "i am userId");

        const user = await File.find({ _id: userId });
        console.log(user, "foundUser");
        if (!user.length > 0) {
          const user = await Doctor.find({ _id: userId });
          console.log(user, "doctor");
          req.user = user;
          next();
        } else if (user.length > 0) {
          console.log(token, "token");
          console.log(user[0]?.access_token, "user[0]");
          //req.user = user;
          if (user[0]?.access_token !== token) {
            return res.json({
              serverError: 0,
              authError: "1",
              data: { success: 0 },
              message: "Token is invalid",
            });
          } else {
            req.user = user;
            next();
          }
        } else {
          return res.json({
            serverError: 0,
            authError: "1",
            data: { success: 0 },
            message: "Token is invalid.User deleted",
          });
        }
      }
    });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
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
