const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: { type: String },
  // date: { type: String },
  start: { type: Date },
  end: { type: Date },

  // Id: { type: Number },
  // Subject: { type: String },
  // StartTime: { type: Date },
  // EndTime: { type: Date },
  // IsAllDay: { type: Boolean },
  doctorId: { type: String },
  firstName: { type: String },
  image: { type: String },
  speciality: { type: String },
  lastName: { type: String },
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Event", eventSchema);
