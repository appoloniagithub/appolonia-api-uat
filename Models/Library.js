const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const librarySchema = new Schema({
  title: { type: String },
  content: { type: String },
  image: { type: Array },
  author: { type: Object },
  date: { type: String },
  created: {
    type: Date,
    default: Date.now,
  },
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Library", librarySchema);
