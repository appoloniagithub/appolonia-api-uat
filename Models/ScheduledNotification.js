const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  time: {
    type: String,
  },
  days: {
    type: [],
  },
  userId: {
    type: String,
  },
  notification: {},
  isRead: { type: String },
  isSent: {
    type: Boolean,
    default: false,
  },
});
const ScheduledNotification = mongoose.model("scheduledNotification", schema);
module.exports = ScheduledNotification;
