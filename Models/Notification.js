const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  title: { type: String },
  body: { type: String },
  userId: { type: String },
  actionId: { type: String },
  actionName: { type: String },
  isRead: { type: String },
  sendTo: { type: Array },
  conversationId: { type: String },
  doctorName: { type: String },
  image: { type: String },
  patientId: { type: String },
  created: {
    type: Date,
    default: Date.now,
  },
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Notification", notificationSchema);
