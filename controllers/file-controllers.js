const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Scans = require("../Models/Scans");
const Settings = require("../Models/Settings");
const Doctor = require("../Models/Doctor");
const Conversation = require("../Models/Conversations");
const Message = require("../Models/Messages");
const moment = require("moment");
var CryptoJS = require("crypto-js");
const sendPushNotification = require("../sendPushNotification");

function createMsg(token, title, body) {
  return {
    token: token,
    notification: {
      title: title,
      body: body,
    },
  };
}

const getFileFamilyMembers = async (req, res) => {
  console.log(req.headers);
  console.log(req.body);
  const { fileId } = req.body;

  let foundFile = await File.findOne({ _id: fileId }, "familyMembers");
  let { familyMembers } = foundFile;
  // let decryptedFamilyMembers = [];
  // for (member of familyMembers) {
  //   console.log("i am member", member);
  //   if (member?.connected === true) {
  //     let yoo = member;
  //     console.log(yoo, "i am yoo");
  //     let decryptedemiratesId;
  //     decryptedemiratesId = CryptoJS.AES.decrypt(yoo.memberEmiratesId, "love");
  //     decryptedemiratesId = decryptedemiratesId.toString(CryptoJS.enc.Utf8);
  //     console.log(decryptedemiratesId, "i am decrypted");
  //     yoo = {
  //       ...yoo,
  //       memberEmiratesId: decryptedemiratesId,
  //     };
  //     console.log(yoo, "i am yoo");
  //     // return yoo;
  //     decryptedFamilyMembers = [...decryptedFamilyMembers, decryptedemiratesId];
  //   }
  // }

  // console.log(decryptedFamilyMembers, "i am family");
  console.log(familyMembers, "i am family");

  let usersId = [];

  for (member of familyMembers) {
    if (member.connected === true) {
      usersId.push(member.userId);
    }
  }

  console.log(usersId, "i am ids");

  let connectedFamily = await User.find({
    _id: { $in: usersId },
  });
  console.log(connectedFamily, "i am connectedfamily");

  let yoo = [];
  yoo = connectedFamily.map(async (member) => {
    let userScans = await Scans.find({ userId: member._id }).limit(5);

    let adminFound = Doctor.findOne({ role: "Clinic Admin" }, [
      "firstName",
      "lastName",
      "role",
    ]);
    let [adminFoundResolved, userScansResolved] = await Promise.all([
      adminFound,
      userScans,
    ]);
    console.log(userScansResolved.length, "i am scans");
    userScansResolved = userScansResolved.reverse();
    return {
      firstName: member.firstName,
      lastName: member.lastName,
      fileNumber: member.uniqueId1,
      emiratesId: member.uniqueId2,
      userId: member._id,
      phoneNumber: member?.phoneNumber,
      email: member?.email,
      gender: member?.gender,
      city: member?.city,
      assignedDoctorId: userScansResolved[0]?.doctorId
        ? userScansResolved[0]?.doctorId
        : adminFoundResolved?._id,
      assignedDoctorName: userScansResolved[0]?.doctorName
        ? userScansResolved[0]?.doctorName
        : `${adminFoundResolved?.firstName} ${adminFoundResolved.lastName}`,
      role: member?.role,
      image: member?.image ? member?.image : ["uploads/contact/login.jpeg"],
      scans: [],
    };
  });
  let resolvedFamilyData = await Promise.all(yoo);
  console.log(resolvedFamilyData);

  if (foundFile) {
    res.json({
      serverError: 0,
      message: "File Found",
      data: {
        success: 1,
        foundFamily: resolvedFamilyData,
      },
    });
  } else {
    res.json({
      serverError: 0,
      message: "File not found. File id may be incorrect",
      data: {
        success: 0,
      },
    });
  }
};
const createUserAndAdminChat = async (
  senderId,
  receiverId,
  message,
  scanId,
  format,
  name,
  image
) => {
  let conversations = await Conversation.find({
    members: { $in: [senderId] },
  });

  let foundConversation = false;
  let foundConversationId;
  let i = 0;
  while (i < conversations?.length && foundConversation === false) {
    foundConversation = conversations[i].members.some(
      (member) => member === receiverId
    );
    if (foundConversation === true) {
      foundConversationId = conversations[i]._id;
    }
    i++;
  }

  if (foundConversation === true) {
    console.log("conversation already exist");
    return;
  }
  // let membersData = await User.find({ _id: { $in: [senderId, receiverId] } }, [
  //   "firstName",
  //   "lastName",
  //   "image",
  // ]);
  let membersData = [];
  let userData = await User.find({ _id: { $in: [receiverId] } }, [
    "firstName",
    "lastName",
    "image",
  ]);
  membersData.push(userData[0]);
  let doctorData = await Doctor.find({ _id: { $in: [senderId] } }, [
    "firstName",
    "lastName",
    "image",
  ]);
  membersData.push(doctorData[0]);

  membersData = membersData.map((member) => {
    return {
      name: `${member.firstName} ${member.lastName}`,
      id: member._id,
      image: member.image,
    };
  });
  console.log(membersData, "members data");

  let createdConversation = new Conversation({
    members: [senderId, receiverId],
    membersData: membersData,
  });
  try {
    createdConversation.save((err, doc) => {
      if (err) {
        throw new Error("Error Creating the Chat");
      } else {
        console.log(doc, "doc there");

        let createdMessage = new Message({
          conversationId: doc._id,
          senderId: senderId,
          receiverId: receiverId,
          name: name,
          message: message,
          format: format,
          scanId: "",
          image: image,
          createdAt: moment(Date.now()).format("DD-MM-YY HH:mm"),
        });

        createdMessage.save((err) => {
          if (err) {
            throw new Error("Error Creating the message");
          } else {
            // res.json({
            //   serverError: 0,
            //   message: "Message Sent",
            //   data: {
            //     success: 1,
            //   },
            // });
            console.log("msg sent");
            return;
          }
        });
      }
    });
  } catch (err) {
    // res.json({
    //   serverError: 1,
    //   message: err.message,
    //   data: {
    //     success: 0,
    //   },
    // });
    console.log(err.message);
    return;
  }
};
const connectMemberToFile = async (req, res, next) => {
  console.log(req.body);
  const { fileId, memberEmiratesId } = req.body;

  //   let foundFile = await File.

  File.findOneAndUpdate(
    { _id: fileId, "familyMembers.uniqueId": memberEmiratesId },
    { $set: { "familyMembers.$.connected": true } },
    { new: true },
    (err, doc) => {
      console.log(doc, "i am doc");
      if (err) {
        console.log(err);
        res.json({
          success: true,
          message: "Somthing Went Wrong",
        });
      } else {
        if (doc === null) {
          res.json({ success: false, message: "Member not found" });
          return;
        }
        res.json({
          success: true,
          message: "Member joined the family account",
        });
      }
    }
  );
};

const addFamilyMember = async (req, res) => {
  console.log(req.body);
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    emiratesId,
    role,
    countryCode,
    city,
    gender,
    dob,
    fileNumber,
  } = req.body;

  try {
    let existingUser;
    existingUser = await User.findOne({ uniqueId1: fileNumber });
    console.log(existingUser, "i am existing");

    if (existingUser && fileNumber.length > 0) {
      res.json({
        serverError: 0,
        message: "User file number already exist",
        data: {
          success: 0,
        },
      });
      return;
    }

    existingUser = await User.findOne({ uniqueId2: emiratesId });

    if (existingUser) {
      res.json({
        serverError: 0,
        message: "Emirates Id already exist",
        data: {
          success: 0,
        },
      });
      return;
    }

    let hashedemiratesId;
    let hashedfileNumber;

    try {
      hashedemiratesId = CryptoJS.AES.encrypt(emiratesId, "love").toString();
      if (fileNumber.length > 0) {
        hashedfileNumber = CryptoJS.AES.encrypt(fileNumber, "love").toString();
      }
      console.log(hashedemiratesId, "i am emirates");
    } catch (err) {
      console.log("Something went wrong while Encrypting Data", err);

      throw new Error("Something went wrong while Encrypting Data");
    }

    // let existingFile = File.findOne({phoneNumber : phoneNumber , "familyMembers.emiratesId" : emiratesId })

    let newMember = new User({
      firstName,
      lastName,
      email: email,
      phoneNumber: phoneNumber,
      emiratesId: hashedemiratesId,
      role,
      countryCode,
      city,
      gender,
      dob,
      fileNumber: hashedfileNumber,
      uniqueId1: fileNumber,
      uniqueId2: emiratesId,
      image:
        "https://www.clipartmax.com/png/middle/344-3442642_clip-art-freeuse-library-profile-man-user-people-icon-icono-de-login.png",
      isHead: 0,
    });

    newMember.save((err, userDoc) => {
      if (err) {
        console.log(err);
        throw new Error("Error saving the user");
      } else {
        File.updateOne(
          { phoneNumber: phoneNumber },
          {
            $push: {
              familyMembers: {
                memberEmiratesId: hashedemiratesId,
                uniqueId: emiratesId,
                connected: false,
                userId: userDoc._id.toString(),
                isFamilyMember: 1,
              },
            },
          },
          async (err) => {
            if (err) {
              throw new Error("Error creating the User");
            } else {
              let adminFound = Doctor.findOne({ role: "Admin" });
              let clinic = Settings.find({}, "clinicName");
              let [adminFoundResolved, clinicResolved] = await Promise.all([
                adminFound,
                clinic,
              ]);
              console.log(
                adminFoundResolved,
                clinicResolved,
                "adminfound and clinic resolved"
              );
              createUserAndAdminChat(
                adminFoundResolved?._id?.toString(),
                userDoc._id?.toString(),
                `Welcome to ${clinicResolved[0]?.clinicName}. Ask us anything`,
                "",
                "text",
                clinicResolved[0]?.clinicName,
                adminFoundResolved?.image[0]
              );
              // let userFound = await User.find({ phoneNumber: phoneNumber });
              // console.log(userFound, "user");
              // if (userFound) {
              //   let message = createMsg(
              //     userFound[0]?.device_token,
              //     "Appolonia",
              //     "Family Member Added"
              //   );
              //   sendPushNotification(message);
              // }
              res.json({
                serverError: 0,
                message:
                  "Family Member added. You would be notified from the clinic soon",
                data: {
                  success: 1,
                },
              });
              return;
            }
          }
        );
      }
    });
  } catch (err) {
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

const clinicVerify = async (req, res) => {
  const { phoneNumber } = req.body;
  console.log(req.body);
  let foundFile = await File.findOne({ phoneNumber: phoneNumber });
  if (foundFile) {
    res.json({
      serverError: 0,
      data: {
        foundFile: foundFile,
        success: 1,
      },
    });
  }
};

const updateClinicDetails = async (req, res) => {
  const { fileId, clinicVerified, active, connected } = req.body;
  const foundFile = await File.findOne({ _id: fileId });
  if (foundFile) {
    File.updateOne(
      { _id: foundFile._id },
      {
        $set: { ...req.body },
      },
      (error, data) => {
        if (error) {
          return console.log(error);
        } else {
          //console.log(data, "data");
          if (!data) {
            res.json({
              serverError: 0,
              message: "Not updated",
              success: 0,
            });
          } else {
            res.json({
              serverError: 0,
              message: "File details updated",
              success: 1,
              //data: data,
            });
          }
        }
      }
    );
  } else {
    res.json({
      serverError: 1,
      message: "File not found",
      success: 0,
    });
  }
};

module.exports = {
  getFileFamilyMembers,
  connectMemberToFile,
  addFamilyMember,
  clinicVerify,
  updateClinicDetails,
};
