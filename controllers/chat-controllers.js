const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Conversation = require("../Models/Conversations");
const Message = require("../Models/Messages");
const moment = require("moment");
const Doctor = require("../Models/Doctor");

const newChat = async (req, res) => {
  console.log(req.body, "i am bopdy");
  const { senderId, receiverId, message, scanId, format } = req.body;
  if ((senderId, receiverId, message)) {
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

    console.log(foundConversation, "Found conversations");

    if (foundConversation === true) {
      res.json({
        serverError: 0,
        message: "You already have a conversation on going",
        data: {
          success: 0,
          chatExist: 1,
          conversationId: foundConversationId,
        },
      });
      return;
    }

    let membersData = await User.find(
      { _id: { $in: [senderId, receiverId] } },
      ["firstName", "lastName", "image"]
    );

    membersData = membersData.map((member) => {
      return {
        name: `${member.firstName} ${member.lastName}`,
        id: member._id.toString(),
        image: member.image,
      };
    });
    console.log(membersData);

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
          if (format === "scanImage") {
            for (let i = 0; i < 2; i++) {
              if (i === 0) {
                let createdMessage = new Message({
                  conversationId: doc._id,
                  senderId: senderId,
                  message:
                    "Hi Doctor, please review my scans and let me know your feedback.",
                  format: "text",
                  scanId: scanId ? scanId : "",
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
                    return;
                  }
                });
              } else {
                let createdMessage = new Message({
                  conversationId: doc._id,
                  senderId: senderId,
                  message: message,
                  format: "scanImage",
                  scanId: scanId ? scanId : "",
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
                    return;
                  }
                });
              }
            }
            res.json({
              serverError: 0,
              message: "Message Sent",
              data: {
                success: 1,
              },
            });
          } else {
            let createdMessage = new Message({
              conversationId: doc._id.toString(),
              senderId: senderId,
              message: message,
              format: format,
              scanId: scanId ? scanId : "",
            });

            createdMessage.save((err) => {
              if (err) {
                throw new Error("Error Creating the message");
              } else {
                res.json({
                  serverError: 0,
                  message: "Message Sent",
                  data: {
                    success: 1,
                  },
                });
                return;
              }
            });
          }
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
  } else {
    res.json({
      message: "somthing is missing",
    });
  }
};

const getLastMessage = async (conversationId) => {
  console.log(conversationId, "get last msg");
  let foundMessages = await Message.find({ conversationId: conversationId })
    .sort({ _id: -1 })
    .skip(0)
    .limit(10);
  foundMessages = foundMessages.reverse();
  let lastMessage = foundMessages[foundMessages.length - 1];
  return lastMessage.message;
};
const getLastName = async (conversationId) => {
  console.log(conversationId, "get last name");
  let foundNames = await Message.find({ conversationId: conversationId })
    .sort({ _id: -1 })
    .skip(0)
    .limit(10);

  console.log(foundNames);
  foundNames = foundNames.reverse();

  let lastName = foundNames[foundNames.length - 1];
  console.log(lastName, "last name");
  return lastName.name;
};

const getLastImage = async (conversationId) => {
  console.log(conversationId, "get last name");
  let foundImage = await Message.find({ conversationId: conversationId })
    .sort({ _id: -1 })
    .skip(0)
    .limit(10);

  console.log(foundImage);
  foundImage = foundImage.reverse();

  let lastImage = foundImage[foundImage.length - 1];
  console.log(lastImage, "last image");
  return lastImage.image[0];
};

const getConversations = async (req, res) => {
  console.log(req.body, "i am body");

  try {
    let conversations = await Conversation.find({
      members: { $in: [req.body.userId] },
    });
    //console.log("convo in getconversations", conversations);
    let conversationsFiltered = [];
    for (let i = 0; i < conversations.length; i++) {
      console.log(conversations[i], "in for loop");
      let convoObj = {
        conversationId: conversations[i]._id,
        otherMemberId: conversations[i]?.members?.find(
          (memberId) => memberId !== req.body.userId
        ),
        otherMemberData: conversations[i].membersData.find((memberData) => {
          console.log(memberData, "i am memberdata");
          return memberData.id.toString() !== req.body.userId;
        }),
        lastMessage: await getLastMessage(conversations[i]._id),
        lastName: await getLastName(conversations[i]._id),
        lastImage: await getLastImage(conversations[i]._id),
        //receiverId: conversations[i].receiverId,
        //name: conversations[i].name,
        createdAt: conversations[i].createdAt,
        updatedAt: conversations[i].updatedAt,
      };
      conversationsFiltered.push(convoObj);
    }

    if (conversations?.length > 0) {
      res.json({
        serverError: 0,
        message: "Found conversations",
        data: {
          success: 1,
          conversations: conversationsFiltered,
        },
      });
    } else {
      res.json({
        serverError: 0,
        message: "Found no conversations",
        data: {
          success: 0,
          //conversations: conversations,
        },
      });
    }
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

// const getConversations = async (req, res) => {
//   console.log(req.body, "i am body");
//   try {
//     let conversations = await Conversation.find({
//       members: { $in: [req.body.userId] },
//     });

//     let conversationsFiltered = conversations.map((convo) => {
//       console.log(convo, "i am cnvo");
//       return {
//         conversationId: convo._id,
//         otherMemberId: convo?.members?.find(
//           (memberId) => memberId !== req.body.userId
//         ),
//         otherMemberData: convo.membersData.find((memberData) => {
//           console.log(memberData, "i am memberdata");
//           return memberData.id.toString() !== req.body.userId;
//         }),
//         createdAt: convo.createdAt,
//         updatedAt: convo.updatedAt,
//       };
//     });

//     // console.log(conversationsFiltered);

//     if (conversations?.length > 0) {
//       res.json({
//         serverError: 0,
//         message: "Found conversations",
//         data: {
//           success: 1,
//           conversations: conversationsFiltered,
//         },
//       });
//     } else {
//       res.json({
//         serverError: 0,
//         message: "Found no conversations",
//         data: {
//           success: 0,
//           conversations: conversations,
//         },
//       });
//     }
//   } catch (err) {
//     res.json({
//       serverError: 1,
//       message: err.message,
//       data: {
//         success: 0,
//       },
//     });
//   }
// };

const getConversationMessages = async (req, res) => {
  console.log(req.body);
  const { conversationId, bottomHit, userId } = req.body;
  try {
    console.log("sea");
    let foundMessages = await Message.find({ conversationId: conversationId });
    // .sort({ _id: -1 })
    // .skip(bottomHit > 0 ? (bottomHit - 1) * 10 : 0)
    // .limit(10);
    console.log(foundMessages, "foundMessages");
    foundMessages = foundMessages.map((msg) => {
      console.log(msg);
      return {
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        message: msg.message,
        name: msg.name,
        image: msg.image,
        receiverId: msg.receiverId,
        format: msg.format,
        scanId: msg.scanId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        isSender: msg.senderId === userId ? "1" : "0",
      };
    });
    //foundMessages = foundMessages.reverse();

    if (foundMessages.length > 0) {
      res.json({
        serverError: 0,
        message: "Messages Found",
        data: {
          success: 1,
          messages: foundMessages,
          //lastMessage: foundMessages[foundMessages.length - 1],
          //lastName: foundMessages[foundMessages.length - 1],
        },
      });
    } else {
      res.json({
        serverError: 0,
        message: "No messages Found",
        data: {
          success: 0,
          messages: foundMessages,
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

const newMessage = async (req, res) => {
  console.log(req.body, "i am body");
  console.log(req.files, "i am files");
  const { conversationId, senderId, message, scanId, format, type } = req.body;
  let receiverId = "";
  let name = "";
  let image = "";
  if (type && type === "Doctor") {
    let doctorInfo = await Doctor.find({ _id: senderId });
    console.log(doctorInfo, "doctor info");
    receiverId = senderId;
    name = `${doctorInfo[0]?.firstName} ${doctorInfo[0]?.lastName}`;
    image = doctorInfo[0]?.image[0];
  } else {
    let foundMessages = await Message.find({ conversationId: conversationId });
    //foundMessages = foundMessages.filter((item) => item.senderId != senderId);
    //console.log(foundMessages, "after filter");
    if (foundMessages && foundMessages.length > 0) {
      //console.log(receiverId, "rec");
      if (!foundMessages[foundMessages.length - 1].receiverId) {
        let conversation = await Conversation.find({ _id: conversationId });
        console.log(conversation, "conversation");
        if (conversation && conversation[0].members[0]) {
          receiverId = conversation[0].members[0];
          console.log(receiverId, "receiverid");
        }
      } else {
        receiverId = foundMessages[foundMessages.length - 1].receiverId;
        console.log(receiverId, "rec");
      }
      if (!foundMessages[foundMessages.length - 1].name) {
        let doctor = await Doctor.find({ _id: receiverId });
        console.log(doctor, "doctor");
        name = `${doctor[0]?.firstName} ${doctor[0]?.lastName}`;
        //image = doctor[0]?.image[0];
      } else {
        name = foundMessages[foundMessages.length - 1].name;

        console.log(name, image, "name", "image");
      }
      if (!foundMessages[foundMessages.length - 1].image[0]) {
        let doctor = await Doctor.find({ _id: receiverId });
        console.log(doctor, "doctor");
        image = doctor[0]?.image[0];
      } else {
        image = foundMessages[foundMessages.length - 1].image;
        console.log(image, "image");
      }
    }
  }

  try {
    // if ((conversationId, senderId, message)) {
    if (format === "scanImage") {
      for (let i = 0; i < 2; i++) {
        if (i === 0) {
          let createdMessage = new Message({
            conversationId: conversationId,
            senderId: senderId,
            receiverId: receiverId,
            name: name,
            image: image,
            message:
              "Hi Doctor, please review my scans and let me know your feedback.",
            format: "text",
            scanId: scanId ? scanId : "",
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
              return;
            }
          });
        } else {
          let createdMessage = new Message({
            conversationId: conversationId,
            senderId: senderId,
            receiverId: receiverId,
            name: name,
            image: image,
            message: message,
            format: "scanImage",
            scanId: scanId ? scanId : "",
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
              return;
            }
          });
        }
      }
      res.json({
        serverError: 0,
        message: "Message Sent",
        data: {
          success: 1,
        },
      });
    } else {
      if (format === "image") {
        let filesName = [];
        if (req?.files?.length > 0) {
          console.log(req.files, "here are the files");
          filesName = req.files.map((file) => file.path);
        }
        let resolvedMessages = filesName.map((fileLink) => {
          console.log(fileLink, "i nam file link");

          let createdMessage = new Message({
            conversationId: conversationId,
            senderId: senderId,
            receiverId: receiverId,
            message: fileLink,
            name: name,
            image: image,
            format: format,
            scanId: scanId?.length > 0 ? scanId : "",
            createdAt: moment(Date.now()).format("DD-MM-YY HH:mm"),
            updatedAt: moment(Date.now()).format("DD-MM-YY HH:mm"),
          });
          try {
            let resolvedMessage = createdMessage.save();
            return resolvedMessage;
          } catch (err) {
            throw new Error("Something went wrong while saving message");
          }
        });
        try {
          let doneSaving = await Promise.all(resolvedMessages);
          console.log(doneSaving);
          res.json({
            serverError: 0,
            message: "Message Sent",

            success: 1,
            data: {
              conversationId: conversationId,
              senderId: senderId,
              message: filesName[0],
              receiverId: receiverId,
              name: name,
              image: image,
              format: format,
              scanId: scanId?.length > 0 ? scanId : "",
              createdAt: moment(Date.now()).format("DD-MM-YY HH:mm"),
              updatedAt: moment(Date.now()).format("DD-MM-YY HH:mm"),
            },
          });
          return;
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong while resolving messages");
        }
      } else {
        let msgObj = {
          conversationId: conversationId,
          senderId: senderId,
          receiverId: receiverId,
          name: name,
          message: message,
          image: image,
          format: format,
          scanId: scanId?.length > 0 ? scanId : "",
          createdAt: moment(Date.now()).format("DD-MM-YY HH:mm"),
          updatedAt: moment(Date.now()).format("DD-MM-YY HH:mm"),
        };
        let createdMessage = new Message(
          msgObj
          //{
          //   conversationId: conversationId,
          //   senderId: senderId,
          //   message: message,
          //   format: format,
          //   scanId: scanId?.length > 0 ? scanId : "",
          //   createdAt: moment(Date.now()).format("DD-MM-YY hh:mm"),
          //   updatedAt: moment(Date.now()).format("DD-MM-YY hh:mm"),
          // }
        );
        createdMessage.save((err) => {
          if (err) {
            throw new Error("Error Creating the message");
          } else {
            res.json({
              serverError: 0,
              message: "Message Sent",
              data: {
                success: 1,
                data: { ...msgObj },
              },
            });
            return;
          }
        });
      }
      return;
    }
    // } else {
    //   throw new Error("Somthing is missing");
    // }
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
const createMessage = async (data) => {
  console.log(data, "data in create msg");
  let {
    conversationId,
    senderId,
    receiverId,
    message,
    name,
    image,
    scanId,
    format,
  } = data;
  let createdMessage = new Message({
    conversationId: conversationId,
    senderId: senderId,
    receiverId: receiverId,
    message: message,
    image: image,
    name: name,
    format: format,
    scanId: scanId ? scanId : "",
    createdAt: moment(Date.now()).format("DD-MM-YY HH:mm"),
  });

  return await createdMessage.save((err) => {
    if (err) {
      throw new Error("Error Creating the message");
    } else {
      return {
        success: true,
        message: "message saved successfully",
      };
    }
  });
};

let myPromise = (data, textData) =>
  new Promise(async function (myResolve, myReject) {
    // "Producing Code" (May take some time)
    let newConvoId = null;
    let { senderId, receiverId } = data;
    // let membersData = await User.find({ _id: { $in: [senderId, receiverId] } }, [
    //   "firstName",
    //   "lastName",
    //   "image",
    // ]);
    let membersData = [];

    let doctorData = await Doctor.find({ _id: { $in: [receiverId] } }, [
      "firstName",
      "lastName",
      "image",
    ]);
    console.log(doctorData, "doctor data");
    membersData.push(doctorData[0]);
    let userData = await User.find({ _id: { $in: [senderId] } }, [
      "firstName",
      "lastName",
      "image",
    ]);
    console.log(userData, "user data");
    membersData.push(userData[0]);
    membersData = membersData.map((member) => {
      return {
        name: `${member.firstName} ${member.lastName}`,
        id: member._id.toString(),
        image: member.image,
      };
    });
    console.log(membersData, "member data");

    let createdConversation = new Conversation({
      members: [receiverId, senderId],
      membersData: membersData,
    });
    newConvoId = await createdConversation.save(async (err, doc) => {
      if (err) {
        throw new Error("Error Creating the Chat");
      } else {
        await createMessage({
          ...data,
          conversationId: doc._id,
          //scanId: doc._id,
        });
        //newConvoId = doc._id;
        await createMessage({ ...textData, conversationId: doc._id });
        console.log(doc._id, "in new chat");
        myResolve(doc._id);
      }
    });
    console.log(newConvoId, "in new chat return");
    return newConvoId;
    // myResolve(); // when successful
    // myReject();  // when error
  });

const createNewChat = async (data, textData) => {
  let newConvoId = null;
  let { senderId, receiverId } = data;
  // let membersData = await User.find({ _id: { $in: [senderId, receiverId] } }, [
  //   "firstName",
  //   "lastName",
  //   "image",
  // ]);
  let membersData = [];

  let doctorData = await Doctor.find({ _id: { $in: [receiverId] } }, [
    "firstName",
    "lastName",
    "image",
  ]);
  membersData.push(doctorData[0]);
  let userData = await User.find({ _id: { $in: [senderId] } }, [
    "firstName",
    "lastName",
    "image",
  ]);
  membersData.push(userData[0]);
  membersData = membersData.map((member) => {
    return {
      name: `${member.firstName} ${member.lastName}`,
      id: member._id.toString(),
      image: member.image,
    };
  });
  console.log(membersData, "member data");

  let createdConversation = new Conversation({
    members: [senderId, receiverId],
    membersData: membersData,
  });
  newConvoId = await createdConversation.save(async (err, doc) => {
    if (err) {
      throw new Error("Error Creating the Chat");
    } else {
      await createMessage({
        ...data,
        conversationId: doc._id,
        //scanId: doc._id,
      });
      //newConvoId = doc._id;
      await createMessage({ ...textData, conversationId: doc._id });
      console.log(doc._id, "in new chat");
      return doc._id;
    }
  });
  console.log(newConvoId, "in new chat return");
  return newConvoId;
};

const checkChatExist = async (conversations, senderId, receiverId) => {
  console.log(conversations, "in check chat exist");
  let adminFound = await Doctor.findOne({ role: "Admin" }, "_id");
  console.log(adminFound, "admin found");
  for (i = 0; i < conversations.length; i++) {
    // for (j = 0; j < conversations[i].members.length; j++) {
    console.log(conversations[i].members[0], "senderId in j loop", senderId);
    if (conversations[i].members[0] != adminFound._id) {
      return conversations[i]._id;
    }
    // }
  }
  return false;
};

const scanChatMessage = async (data, textData) => {
  console.log(data, "in scan chat message");
  console.log(textData, "textData");
  let { senderId, receiverId, message, scanId, format } = data;
  if ((senderId, receiverId, message)) {
    let conversations = await Conversation.find({
      members: { $in: [senderId] },
    });
    console.log(conversations, "conversations in scan chat message");

    let getConvoId = await checkChatExist(conversations, senderId, receiverId);
    console.log(getConvoId, "chat exist");
    if (getConvoId) {
      let isSaved = await createMessage({
        ...data,
        conversationId: getConvoId,
      });
      let isSavedText = await createMessage({
        ...textData,
        conversationId: getConvoId,
      });
      console.log(isSaved, "is saved");
      return getConvoId;
    } else {
      //console.log(receiverId, "receiverId");
      let newConvoId = await myPromise(data, textData).then((res) => {
        console.log(res);
        return res;
      });
      //await createNewChat(data, textData);
      console.log(newConvoId, "in scan");
      return newConvoId;
    }
  } else {
    console.log("missing required details");
  }
};

const getDoctorInfo = async (req, res) => {
  console.log(req.body, "i am body");

  let { doctorId, patientId } = req.body;

  let membersData = [];
  let userData = await User.find({ _id: { $in: [patientId] } }, [
    "firstName",
    "lastName",
    "image",
  ]);
  membersData.push(userData[0]);
  let doctorData = await Doctor.find({ _id: { $in: [doctorId] } }, [
    "firstName",
    "lastName",
    "image",
    "speciality",
  ]);
  membersData.push(doctorData[0]);
  console.log(membersData, "member data");

  let conversation = await Conversation.find({
    members: { $in: [patientId, doctorId] },
  });
  console.log("conversation", conversation);
  let con = [];
  let conversationsFiltered = conversation.map((convo) => {
    console.log(convo, "i am cnvo");
    if (
      convo.members[0] === req.body.patientId &&
      convo.members[1] === req.body.doctorId
    ) {
      let convoObj = {
        conversationId: convo._id,
        //patientId: convo.members[0] === req.body.patientId,
        //doctorId: convo.members[1] === req.body.doctorId,
        doctorId: convo?.members?.find(
          (memberId) => memberId === req.body.doctorId
        ),
        doctorData: convo.membersData.find((memberData) => {
          console.log(memberData, "i am memberdata");
          return memberData.id.toString() === req.body.doctorId;
        }),
        createdAt: convo.createdAt,
        updatedAt: convo.updatedAt,
      };
      con.push(convoObj);
    }
  });
  console.log(conversationsFiltered, "filtered");
  if (conversation.length > 0) {
    res.json({
      serverError: 0,
      message: "Found conversations",
      data: {
        success: 1,
        conversations: con,
      },
    });
  } else {
    res.json({
      serverError: 0,
      message: "Found no conversations",
      data: {
        success: 0,
        //conversations: conversations,
      },
    });
  }
};

const getCon = async (req, res) => {
  const { patId, doctorId } = req.body;
  console.log(req.body);
  let membersData = [];

  let doctorData = await Doctor.find({ _id: { $in: [doctorId] } }, [
    "firstName",
    "lastName",
    "image",
    "speciality",
  ]);
  membersData.push(doctorData[0]);
  let userData = await User.find({ _id: { $in: [patId] } }, [
    "firstName",
    "lastName",
    "image",
  ]);
  membersData.push(userData[0]);
  const foundCon = await Conversation.find({
    members: { $in: [doctorId, patId] },
  });
  console.log(foundCon, "found con");
  let con = [];
  let conversationsFiltered = foundCon.map((convo) => {
    console.log(convo, "i am cnvo");
    if (
      convo.members[0] === req.body.doctorId &&
      convo.members[1] === req.body.patId
    ) {
      let convoObj = {
        conversationId: convo._id,
        members: [doctorId, patId],
        membersData: membersData,
        //patientId: convo.members[0] === req.body.patientId,
        //doctorId: convo.members[1] === req.body.doctorId,
        // doctorId: convo?.members?.find(
        //   (memberId) => memberId === req.body.doctorId
        // ),
        // doctorData: convo.membersData.find((memberData) => {
        //   console.log(memberData, "i am memberdata");
        //   return memberData.id.toString() === req.body.doctorId;
        // }),
        createdAt: convo.createdAt,
        updatedAt: convo.updatedAt,
      };
      con.push(convoObj);
    }
  });
  console.log(conversationsFiltered, "filtered");
  if (foundCon) {
    res.json({
      serverError: 0,
      message: "Found conversations",
      data: {
        success: 1,
        conversations: con,
      },
    });
  } else {
    res.json({
      serverError: 0,
      message: "Found no conversations",
      data: {
        success: 0,
      },
    });
  }
};

module.exports = {
  newChat,
  getConversations,
  getConversationMessages,
  newMessage,
  scanChatMessage,
  createNewChat,
  createMessage,
  getDoctorInfo,
  getCon,
};
