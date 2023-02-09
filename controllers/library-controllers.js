const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Settings = require("../Models/Settings");
const Library = require("../Models/Library");

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
    let foundArticle = await Library.findOne({ _id: articleId });
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
  console.log(req.body);
  const { name, description, image, author, authorName, authorImage } =
    req.body;
  try {
    let newArticle = new Library({
      name,
      description,
      image,
      author: {
        authorName,
        authorImage,
      },
    });
    newArticle.save((err, data) => {
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

const updateArticle = async (req, res) => {
  console.log(req.body);
  const {
    articleId,
    name,
    description,
    image,
    author,
    authorName,
    authorImage,
  } = req.body;

  try {
    Library.updateOne(
      { _id: articleId },
      {
        $set: { ...req.body },
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
