const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Settings = require("../Models/Settings");
const Scans = require("../Models/Scans");
const fs = require("fs");
var cron = require("node-cron");
const moment = require("moment");
const Notification = require("../Models/Notification");
const ScheduledNotification = require("../Models/ScheduledNotification");
// const Upscaler = require("upscaler/node");
// const upscaler = new Upscaler();
//require("dotenv").config();
const chatController = require("./chat-controllers");
const AWS = require("aws-sdk");
const S3 = require("aws-sdk/clients/s3");
const Doctor = require("../Models/Doctor");
const { sendPushNotification } = require("../services/sendPush");
AWS.config.loadFromPath("./s3_config.json");
const s3Bucket = new S3({
  params: {
    Bucket: "appoloniaapps3",
  },
});

function createMsg(token, title, body) {
  return {
    token: token,
    notification: {
      title: title,
      body: body,
    },
  };
}
// setTimeout(createMsg, 120000);

const updatedFilePaths = async (path, base64Data) => {
  try {
    return await new Promise(async function (resolve, reject) {
      try {
        await fs.writeFile(path, base64Data, "base64", function (err, data) {
          if (err) {
            reject(err);
          }
          console.log("path", path);
          resolve(path);
        });
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
};
const submitScans = async function (body) {
  try {
    return await new Promise(async function (resolve, reject) {
      const {
        userId,
        doctorId,
        doctorName,
        faceScanImages,
        teethScanImages,
        logo,
      } = body;
      try {
        if ((userId, doctorId)) {
          const userFound = await User.find({ _id: userId });
          console.log(userFound);
          let doctorFound = await Doctor.find({ _id: doctorId });
          console.log(doctorFound, "doctor");
          let logo =
            "https://res.cloudinary.com/dbff6tzuo/image/upload/v1676012493/PROFILE/wyoxrmycegebtztv05zr.jpg";
          let updatedFaceScanImages = [];
          if (faceScanImages && faceScanImages.length > 0) {
            for (i = 0; i < faceScanImages.length; i++) {
              const base64Data = new Buffer.from(
                faceScanImages[i].replace(/^data:image\/\w+;base64,/, ""),
                "base64"
              );
              //upscaler.upscale(base64Data);
              const path = "uploads/images/" + Date.now() + ".png";
              //const path = Date.now() + ".png";
              //const path = `${userId}/${Date.now()}.png`;
              let getPath = await updatedFilePaths(path, base64Data);
              console.log("get path files", getPath);
              updatedFaceScanImages.push(getPath);
              //const buf = Buffer.from(req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ""),'base64')
              // const data = {
              //   Key: path,
              //   Body: base64Data,
              //   ContentEncoding: "base64",
              //   ContentType: "image/png",
              // };
              // s3Bucket.putObject(data, function (err, data) {
              //   if (err) {
              //     console.log(err);
              //     console.log("Error uploading data: ");
              //   } else {
              //     console.log("successfully uploaded the image!", data);
              //   }
              // });
              //updatedFaceScanImages.push(path);
            }
          }
          let updatedTeethScanImages = [];
          if (teethScanImages && teethScanImages.length > 0) {
            for (i = 0; i < teethScanImages.length; i++) {
              const base64Data = new Buffer.from(
                teethScanImages[i].replace(/^data:image\/\w+;base64,/, ""),
                "base64"
              );
              //upscaler.upscale(base64Data);
              //const path = Date.now() + ".png";
              //const path = `${userId}/${Date.now()}.png`;
              const path = "uploads/images/" + Date.now() + ".png";
              let getPath = await updatedFilePaths(path, base64Data);
              console.log("get path files", getPath);
              updatedTeethScanImages.push(getPath);

              // const data = {
              //   Key: path,
              //   Body: base64Data,
              //   ContentEncoding: "base64",
              //   ContentType: "image/png",
              // };
              // s3Bucket.putObject(data, function (err, data) {
              //   if (err) {
              //     console.log(err);
              //     console.log("Error uploading data: ", data);
              //   } else {
              //     console.log("successfully uploaded the image!");
              //   }
              // });
              //updatedTeethScanImages.push(path);
            }
          }
          console.log("updated", updatedFaceScanImages, updatedTeethScanImages);
          const updatedScan = new Scans({
            userId: userId,
            patientName: `${userFound[0]?.firstName} ${userFound[0].lastName}`,
            doctorId: doctorId,
            doctorName: doctorName,
            Department: doctorFound[0]?.speciality,
            faceScanImages: updatedFaceScanImages,
            teethScanImages: updatedTeethScanImages,
            logo: logo,
            isOpen: 0,
            created: Date.now(),
            updated: moment(Date.now()).format("MMM d,yy HH:mm"),
          });

          await updatedScan.save(async (err, doc) => {
            console.log(doc, "doc");

            if (err) {
              throw new Error("Error saving scans");
            } else {
              User.updateOne(
                { _id: userId },
                { $set: { lastScan: new Date() } },
                (err) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("user updated");
                  }
                }
              );

              let scanFirstImage = updatedTeethScanImages[0]
                ? updatedTeethScanImages[0]
                : updatedFaceScanImages[0];

              let msgObjImg = {
                senderId: userId,
                receiverId: doctorId,
                name: doctorName,
                image: doctorFound[0]?.image[0],
                message: scanFirstImage,
                scanId: doc?._id,
                format: "scanImage",
                //createdAt: moment(Date.now()).format("DD-MM-YY hh:mm"),
              };

              let msgObjText = {
                senderId: userId,
                receiverId: doctorId,
                name: doctorName,
                image: doctorFound[0]?.image[0],
                message:
                  "Hi Doctor, please review my scans and let me know your feedback.",
                format: "text",
                //scanId: doc?._id,
                //createdAt: moment(Date.now()).format("DD-MM-YY hh:mm"),
              };
              let updateText = await chatController.scanChatMessage(
                msgObjImg,
                msgObjText
              );
              // const userFound = await User.find({ _id: userId });
              // console.log(userFound, "user");
              // if (userFound) {
              //   let message = createMsg(
              //     userFound[0]?.device_token,
              //     "Appolonia",
              //     "Your Scan is due"
              //   );
              //   sendPushNotification(message);
              //   setTimeout(createMsg, 120000);
              // }
              const userFound = await User.find({ _id: userId });
              console.log(userFound, "user");
              // let inAppNoti = new Notification({
              //   title: "Appolonia",
              //   body: "Your Scan is Due",
              //   actionId: "3",
              //   actionName: "Scan",
              //   userId: userFound[0]?._id,
              //   isRead: "0",
              // });
              // inAppNoti.save(async (err, data) => {
              //   if (err) {
              //     console.log(err);
              //     throw new Error("Error saving the notification");
              //   } else {
              //     console.log(data);
              //   }
              // });

              // let scheduledNoti = new ScheduledNotification({
              //   notification: {
              //     title: "Appolonia",
              //     body: "Your Scan is Due",
              //   },
              //   time: "16:00",
              //   days: [15],
              //   userId: userFound[0]?._id,
              //   isRead: "0",
              //   isSent: false,
              // });
              // scheduledNoti.save(async (err, data) => {
              //   if (err) {
              //     console.log(err);
              //     throw new Error("Error saving the scheduled notification");
              //   } else {
              //     console.log(data);
              //   }
              // });
              console.log(updateText, "update message in submit scan");
              resolve({
                serverError: 0,
                message: "Successfully saved scans",
                data: {
                  success: 1,
                  scanId: doc?._id,
                  faceScanImages: updatedFaceScanImages,
                  teethScanImages: updatedTeethScanImages,
                  scanFirstImage: scanFirstImage,
                  conversationId: updateText,
                  logo: logo,
                  isOpen: "0",
                },
              });

              //     let msgObjImg = {
              //       senderId: userId,
              //       receiverId: doctorId,
              //       message: `https://appoloniaapps3.s3.amazonaws.com/${scanFirstImage}`,
              //       scanId: doc?._id,
              //       format: "image",
              //     };

              //     let msgObjText = {
              //       senderId: userId,
              //       receiverId: doctorId,
              //       message:
              //         "Hi Doctor, please review my scans and let me know your feedback.",
              //       format: "text",
              //       //scanId: doc?._id,
              //     };
              //     let updateText = await chatController.scanChatMessage(
              //       msgObjImg,
              //       msgObjText
              //     );

              //     console.log(updateText, "update message in submit scan");
            }
          });
        } else {
          // throw new Error("Provide all the details");
          resolve({
            serverError: 0,
            message: "Send all the data please",
            data: {
              success: 0,
            },
          });
          //return;
        }
      } catch (err) {
        reject({
          serverError: 1,
          message: err.message,
          data: {
            success: 0,
          },
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

const getMyScans = async function (body) {
  try {
    return await new Promise(async function (resolve, reject) {
      const { userId } = body;
      try {
        if (userId) {
          let foundScans = await Scans.find({ userId: userId });
          console.log(foundScans);
          if (foundScans.length > 0) {
            resolve({
              serverError: 0,
              message: "found scans",
              data: {
                success: 1,
                scans: foundScans.reverse(),
                userId: userId,
                // patientName: userId?.firstName,
              },
            });
            //return;
          } else {
            resolve({
              serverError: 0,
              message: "No Scans found",
              data: {
                success: 0,
                scans: foundScans,
              },
            });
            //return;
          }
        } else {
          // throw new Error("User id is missing");
          resolve({
            serverError: 0,
            message: "User id is missing",
            data: {
              success: 0,
            },
          });
          //return;
        }
      } catch (err) {
        // res.json({ success: false, message: err.message });
        reject({
          serverError: 1,
          message: err.message,
          data: {
            success: 0,
          },
        });
        //return;
      }
    });
  } catch (err) {
    console.log(err);
  }
};

const getAllScans = async function (body) {
  try {
    return await new Promise(async function (resolve, reject) {
      const { userId } = body;
      try {
        let foundScans = await Scans.find({});
        console.log(foundScans, "i am found");
        resolve({
          serverError: 0,
          message: "found scans",
          data: {
            success: 1,
            scans: foundScans[foundScans?.length - 1].scanImages[0],
          },
        });
        //return;
      } catch (err) {
        // res.json({ success: false, message: err.message });
        reject({
          serverError: 1,
          message: err.message,
          data: {
            success: 0,
          },
        });
        //return;
      }
    });
  } catch (err) {
    console.log(err);
  }
};

const getScanId = async (req, res) => {
  const { userId, scanId } = req.body;

  try {
    if ((userId, scanId)) {
      const foundScans = await Scans.find({ _id: scanId });
      console.log(foundScans, "by scan ID");
      if (foundScans) {
        Scans.updateOne(
          { _id: scanId },
          { $set: { isOpen: "1" } },
          async (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("data updated", foundScans[0]);
              const temp = await Scans.find({ _id: scanId });

              const userFound = await User.find({ _id: userId });
              console.log(userFound, "user");
              if (userFound) {
                let message = createMsg(
                  userFound[0]?.device_token,
                  "Appolonia",
                  "Your Scans are reviewed by Doctor"
                );
                sendPushNotification(message);
              }
              res.json({
                serverError: 0,
                message: "Scans found",
                data: {
                  scans: temp,
                  success: 1,
                },
              });
            }
          }
        );
      } else {
        res.json({
          serverError: 1,
          message: " No Scans found",
          data: {
            success: 0,
          },
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const scanFrequency = async (req, res) => {
  const { days, scanType, userId } = req.body;
  console.log(req.body);
  try {
    const userFound = await User.find({ _id: userId });
    console.log(userFound);
    // if (req.days === "Everyday") {
    //   days = 1;
    // }
    // if (req.days === "7 days") {
    //   days = 7;
    // }
    // if (req.days === "15 days") {
    //   days = 15;
    // }
    // if (req.days === "Monthly") {
    //   days = 30;
    // }
    // if (req.days === "Quarterly") {
    //   days = 90;
    // }
    // if (req.days === "Half Yearly") {
    //   days = 182;
    // }
    // if (req.days === "Yearly") {
    //   days = 365;
    // }
    if ((userFound, days, scanType)) {
      let lastScanDate = userFound[0]?.lastScan;
      console.log(lastScanDate);
      let date = new Date(lastScanDate);
      console.log(typeof date);
      let d2 = date.setDate(date.getDate() + days);

      //let d3 = new Date(d2);
      let d3 = moment(d2).format("DD-MM-YYYY");
      console.log(d3, "d3");
      let date1 = new Date();
      let myDate = moment(date1).format("DD-MM-YYYY");
      console.log(myDate, "mydate");
      console.log(d3 == myDate);

      Scans.updateOne(
        { userId: userId },
        { $set: { days: days, scanType: scanType } },
        (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("user updated");
          }
        }
      );
      if (d3 == myDate) {
        let inAppNoti = new Notification({
          title: "Scan Due Today",
          body: "Your Scan is Due Today,please send Face & Teeth Scan to Doctor",
          actionId: "3",
          actionName: "Scan",
          userId: userFound[0]?._id,
          isRead: "0",
        });
        inAppNoti.save(async (err, data) => {
          if (err) {
            console.log(err);
            throw new Error("Error saving the notification");
          } else {
            console.log(data);
          }
        });
        let message = createMsg(
          userFound[0]?.device_token,
          "Scan Due Today",
          "Your Scan is Due Today, please send Face & Teeth Scan to Doctor"
        );
        sendPushNotification(message);
      }
      res.json({
        serverError: 0,
        message: `Scan alert is set on ${d3}`,
        data: {
          success: 1,
        },
      });
    } else {
      res.json({
        serverError: 0,
        message: "user not found",
        data: {
          success: 0,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};
function addDays(date, days) {
  date.setDate(date.getDate() + days);
  return date;
}

const cronSchedule = async (req, res) => {
  const { days, scanType, userId } = req.body;
  console.log(req.body);

  const task = cron.schedule("*/1 * * * *", async () => {
    console.log("enter in get data");
    try {
      const userFound = await User.find({ _id: userId });
      console.log(userFound);

      if ((userFound, days, scanType)) {
        let lastScanDate = userFound[0]?.lastScan;
        console.log(lastScanDate);
        let date = new Date(lastScanDate);
        console.log(typeof date);
        console.log(typeof parseInt(days));
        let d2 = date.setDate(date.getDate() + parseInt(days));

        //let d3 = new Date(d2);
        let d3 = moment(d2).format("DD-MM-YYYY");
        console.log(d3, "d3");
        let date1 = new Date();
        let myDate = moment(date1).format("DD-MM-YYYY");
        console.log(myDate);
        console.log(d3 == myDate);

        Scans.updateOne(
          { userId: userId },
          { $set: { days: days, scanType: scanType, scanDue: "0" } },
          (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("user updated");
            }
          }
        );
        if (d3 == myDate) {
          let inAppNoti = new Notification({
            title: "Scan Due Today",
            body: "Your Scan is Due Today,please send Face & Teeth Scan to Doctor",
            actionId: "3",
            actionName: "Scan",
            userId: userFound[0]?._id,
            isRead: "0",
          });
          inAppNoti.save(async (err, data) => {
            if (err) {
              console.log(err);
              throw new Error("Error saving the notification");
            } else {
              console.log(data);
            }
          });
          Scans.updateOne(
            { userId: userId },
            { $set: { scanDue: "1" } },
            (err) => {
              if (err) {
                console.log(err);
              } else {
                console.log("user updated");
              }
            }
          );
          let message = createMsg(
            userFound[0]?.device_token,
            "Scan Due Today",
            "Your Scan is Due Today, please send Face & Teeth Scan to Doctor"
          );
          sendPushNotification(message);
        }
        task.stop();
        // res.json({
        //   serverError: 0,
        //   message: `Scan alert is set on ${d3}`,
        //   data: {
        //     success: 1,
        //   },
        // });
      } else {
        // res.json({
        //   serverError: 0,
        //   message: "user not found",
        //   data: {
        //     success: 0,
        //   },
        // });
      }
    } catch (err) {
      console.log(err);
      res.json({
        serverError: 1,
        message: err.message,
        data: {
          success: 0,
        },
      });
    }
  });
};
module.exports = {
  submitScans,
  getMyScans,
  getAllScans,
  getScanId,
  scanFrequency,
  cronSchedule,
};
