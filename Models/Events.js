const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: { type: String },
  date: { type: String },
  start: { type: Date },
  end: { type: Date },
  doctorId: { type: String },
  doctorName: { type: String },
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Event", eventSchema);
