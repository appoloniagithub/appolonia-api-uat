const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Settings = require("../Models/Settings");
const Scans = require("../Models/Scans");
const fs = require("fs");
//require("dotenv").config();
const chatController = require("./chat-controllers");
const AWS = require("aws-sdk");
const S3 = require("aws-sdk/clients/s3");
AWS.config.loadFromPath("./s3_config.json");
const s3Bucket = new S3({
  params: {
    Bucket: "appoloniaapps3",
  },
});

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
      const { userId, doctorId, doctorName, faceScanImages, teethScanImages } =
        body;
      try {
        if ((userId, doctorId, faceScanImages, teethScanImages)) {
          if (
            (faceScanImages && faceScanImages.length > 0) ||
            (teethScanImages && teethScanImages.length > 0)
          ) {
            let updatedFaceScanImages = [];
            for (i = 0; i < faceScanImages.length; i++) {
              const base64Data = new Buffer.from(
                faceScanImages[i].replace(/^data:image\/\w+;base64,/, ""),
                "base64"
              );

              const path = Date.now() + ".png";
              // let getPath = await updatedFilePaths(path, base64Data);
              // console.log("get path files", getPath);
              // updatedFaceScanImages.push(getPath);
              //const buf = Buffer.from(req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ""),'base64')
              const data = {
                Key: path,
                Body: base64Data,
                ContentEncoding: "base64",
                ContentType: "image/png",
              };
              s3Bucket.putObject(data, function (err, data) {
                if (err) {
                  console.log(err);
                  console.log("Error uploading data: ");
                } else {
                  console.log("successfully uploaded the image!", data);
                }
              });
              updatedFaceScanImages.push(path);
            }
            let updatedTeethScanImages = [];
            for (i = 0; i < teethScanImages.length; i++) {
              const base64Data = new Buffer.from(
                teethScanImages[i].replace(/^data:image\/\w+;base64,/, ""),
                "base64"
              );
              const path = Date.now() + ".png";
              // let getPath = await updatedFilePaths(path, base64Data);
              // console.log("get path files", getPath);
              // updatedTeethScanImages.push(getPath);

              const data = {
                Key: path,
                Body: base64Data,
                ContentEncoding: "base64",
                ContentType: "image/png",
              };
              s3Bucket.putObject(data, function (err, data) {
                if (err) {
                  console.log(err);
                  console.log("Error uploading data: ", data);
                } else {
                  console.log("successfully uploaded the image!");
                }
              });
              updatedTeethScanImages.push(path);
            }
            console.log(
              "updated",
              updatedFaceScanImages,
              updatedTeethScanImages
            );
            const updatedScan = new Scans({
              userId: userId,
              doctorId: doctorId,
              doctorName: doctorName,
              faceScanImages: updatedFaceScanImages,
              teethScanImages: updatedTeethScanImages,
              created: Date.now(),
            });
            await updatedScan.save(async (err, doc) => {
              console.log(doc);

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

                let msgObjImg = {
                  senderId: userId,
                  receiverId: doctorId,
                  message: `https://appoloniaapps3.s3.amazonaws.com/${updatedTeethScanImages[0]}`,
                  scanId: doc?._id,
                  format: "image",
                };
                let updateMessage = await chatController.scanChatMessage(
                  msgObjImg
                );
                let msgObjText = {
                  senderId: userId,
                  receiverId: doctorId,
                  message:
                    "Hi Doctor, please review my scans and let me know your feedback.",
                  format: "text",
                  scanId: doc?._id,
                };
                let updateText = await chatController.scanChatMessage(
                  msgObjText
                );

                console.log(
                  updateMessage,
                  updateText,
                  "update message in submit scan"
                );
                resolve({
                  serverError: 0,
                  message: "Successfully saved scans",
                  data: {
                    success: 1,
                    scanId: doc?._id,
                    faceScanImages: updatedFaceScanImages,
                    teethScanImages: updatedTeethScanImages,
                    scanFirstImage: updatedTeethScanImages[0],
                  },
                });
              }
              // if (data?.success == 1) {
              // }
            });
          }
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

module.exports = {
  submitScans,
  getMyScans,
  getAllScans,
};
