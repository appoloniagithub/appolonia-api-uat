const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Settings = require("../Models/Settings");
const Library = require("../Models/Library");
const librarySchema = require("../Models/Library");
const Notification = require("../Models/Notification");
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

const getArticles = async (req, res) => {
  try {
    let foundArticles = await Library.find({});
    if (foundArticles) {
      res.json({
        serverError: 0,
        message: "Articles found",
        data: {
          success: 1,
          articles: foundArticles,
        },
      });
      return;
    } else {
      res.json({
        serverError: 0,
        message: "No articles found",
        data: {
          success: 0,
        },
      });
      return;
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
    return;
  }
};

const getSingleArticle = async (req, res) => {
  console.log(req.body);
  const { articleId } = req.body;

  try {
    if (articleId) {
      let foundArticle = await Library.findById({ _id: articleId });
      if (foundArticle) {
        res.json({
          serverError: 0,
          message: "Article found",
          data: {
            success: 1,
            article: foundArticle,
          },
        });
        return;
      } else {
        res.json({
          serverError: 0,
          message: "No article found",
          data: {
            success: 0,
          },
        });
        return;
      }
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
    return;
  }
};

const addArticle = async (req, res) => {
  let imageFiles = [];
  if (req?.files?.length > 0) {
    console.log(req.files, "here are the files");
    imageFiles = req.files.map((file) => file.path);
  }
  console.log(req.body);
  const {
    title,
    description,
    image,

    authorName,
    //authorImage
    date,
  } = req.body;
  try {
    let newArticle = new Library({
      title,
      description,
      image: imageFiles.toString().replace(/\\/g, "/"),
      author: {
        authorName,
        //authorImage,
      },
      date,
    });
    let usersFound = await User.find({});
    console.log(usersFound, "found");

    for (let i = 0; i < usersFound.length; i++) {
      if (usersFound[i]?.device_token) {
        let message = createMsg(
          usersFound[i]?.device_token,
          "Appolonia",
          "New Article Added"
        );
        console.log(usersFound[i]?.device_token);
        sendPushNotification(message);
      }
    }
    //let usersFound = await User.find({});
    //console.log(usersFound, "found");

    for (let i = 0; i < usersFound.length; i++) {
      if (usersFound[i]?._id) {
        let inAppNoti = new Notification({
          title: "Appolonia",
          body: "New Article Added",
          actionId: "1",
          actionName: "Library",
          userId: usersFound[i]?._id,
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
    newArticle.save(async (err, data) => {
      if (err) {
        console.log(err);
        throw new Error("Error saving the article");
      } else {
        console.log(data);

        res.json({
          serverError: 0,
          message: "New Article added.",
          data: {
            success: 1,
            article: data,
          },
        });
        return;
      }
    });
  } catch (err) {
    console.log(err);
  }
};

// const updateArticle = async (req, res) => {
//   console.log(req.body);
//   let imageFiles = [];
//   if (req?.files?.length > 0) {
//     console.log(req.files, "here are the files");
//     imageFiles = req.files.map((file) => file.path);
//   }
//   const {
//     articleId,
//     title,
//     description,
//     image,
//     author,
//     authorName,
//     //authorImage,
//     date,
//   } = req.body;

//   try {
//     Library.updateOne(
//       { _id: articleId },
//       {
//         $set: { ...req.body, image: imageFiles },
//       },
//       (error, data) => {
//         if (error) {
//           return console.log(error);
//         } else {
//           console.log(data, "data");
//           if (!data) {
//             res.json({
//               serverError: 0,
//               message: "Not updated",
//               success: 0,
//             });
//           } else {
//             res.json({
//               serverError: 0,
//               message: "Article updated",
//               success: 1,
//             });
//           }
//         }
//       }
//     );
//   } catch (err) {
//     console.log(err);
//   }
// };

const updateArticle = async (req, res) => {
  console.log(req.body);
  let imageFiles = [];
  if (req?.files?.length > 0) {
    console.log(req.files, "here are the files");
    imageFiles = req.files.map((file) => file.path);
  }

  const {
    _id,
    title,
    description,
    image,
    authorName,
    //authorImage,
    date,
  } = req.body;
  let updateImage =
    imageFiles.length > 0 ? imageFiles.toString().replace(/\\/g, "/") : image;

  try {
    librarySchema.findByIdAndUpdate(
      _id,
      {
        $set: { ...req.body, image: updateImage },
      },
      (error, data) => {
        if (error) {
          return console.log(error);
        } else {
          console.log(data, "data");
          if (!data) {
            res.json({
              serverError: 0,
              message: "Not updated",
              success: 0,
            });
          } else {
            res.json({
              serverError: 0,
              message: "Article updated",
              success: 1,
            });
          }
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const deleteArticle = async (req, res) => {
  console.log(req.body);
  const { articleId } = req.body;

  try {
    if (articleId) {
      let articleFound = await Library.findByIdAndRemove({ _id: articleId });
      console.log(articleFound);
      if (articleFound) {
        res.json({
          serverError: 0,
          message: "Article deleted successfully.",
          data: {
            success: 1,
            //article: articleFound,
          },
        });
        return;
      } else {
        res.json({
          serverError: 0,
          message: "Error in deleting Article",
          data: {
            success: 0,
          },
        });
        return;
      }
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  getArticles,
  getSingleArticle,
  addArticle,
  updateArticle,
  deleteArticle,
};
