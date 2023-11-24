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
const Notification = require("../Models/Notification");
const nodemailer = require("nodemailer");
const { JWTKEY, SMTPPASS, accountSid, authToken } = require("../Config/config");
//const sendPushNotification = require("../services/sendPush");
const { sendPushNotification } = require("../services/sendPush");

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
      image:
        (member?.image).length > 0
          ? member?.image
          : ["uploads/contact/login.jpeg"],
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
    let userFound = await File.find({ phoneNumber: phoneNumber });
    console.log(userFound[0].familyMembers[0].userId, "user");
    const user = userFound[0].familyMembers[0].userId;
    let userFound1 = await User.find({ _id: user });
    console.log(userFound1, "user1");

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
      image: "uploads/contact/login.jpeg",
      isHead: 0,
      device_token: userFound1[0]?.device_token,
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
              let adminFound = await Doctor.findOne({ role: "Admin" });
              console.log(adminFound, "admin");
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

              if (
                userFound1.length > 0
                //&& userFound1[0]?.isHead === "1"
              ) {
                let message = createMsg(
                  userFound1[0]?.device_token,
                  "New Family Member",
                  "Family Member Added"
                );
                sendPushNotification(message);
                if (user) {
                  // let inAppNoti = new Notification({
                  //   title: "New Family Member",
                  //   body: "Family Member Added",
                  //   actionId: "2",
                  //   actionName: "Family",
                  //   //userId: userDoc._id.toString(),
                  //   userId: user,
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
                }
              }
              if (adminFound && userFound1.length > 0) {
                for (let i = 0; i < adminFound.length; i++) {
                  let inAppNoti = new Notification({
                    title: "Family Member",
                    body: `Family Member Added by ${userFound1[0].firstName} ${userFound1[0].lastName}`,
                    actionId: "2",
                    actionName: "Family",
                    //userId: userDoc._id.toString(),
                    userId: adminFound[i]?._id,
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
                }
              }
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

const sendEmail = (email) => {
  console.log(email, "hello gggggg");
  if (email) {
    console.log("Things going good");
    const output = `
            <p>Dear Customer,</p>
            <p>Your account is active now. Please try logging in.</p>
           
            `;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.google.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      service: "gmail",
      auth: {
        user: "appoloniaapp@gmail.com", // generated ethereal user
        pass: SMTPPASS, // generated ethereal password
      },
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Appolonia" <appoloniaapp@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Account Information", // Subject line
      // text: details, // plain text body
      html: output, // html body
    };

    return transporter.sendMail(mailOptions);
  }
};

const updateClinicDetails = async (req, res) => {
  const { fileId, clinicVerified, active, connected } = req.body;
  const foundFile = await File.findOne({ _id: fileId });
  console.log(foundFile);
  const userFound = await User.findOne({
    _id: foundFile?.familyMembers[0]?.userId,
  });
  console.log(userFound);
  if (foundFile) {
    File.updateOne(
      { _id: foundFile._id },
      {
        $set: { clinicVerified: true, ...req.body },
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
    if (userFound && userFound?.isHead === "1") {
      sendEmail(userFound?.email);
    }
    // if (userFound) {
    //   let message = createMsg(
    //     userFound?.device_token,
    //     "Appolonia",
    //     "Family Member Approved"
    //   );
    //   sendPushNotification(message);
    // }
    if (userFound && userFound?.isHead === "1") {
      let inAppNoti = new Notification({
        title: "New Family Member",
        body: "Your family member has been activated. Please check here.",
        actionId: "2",
        actionName: "Family",
        //userId: userDoc._id.toString(),
        userId: userFound?._id,
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
    }
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
