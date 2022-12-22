const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notesSchema = new Schema({
  doctorId: { type: String },
  userId: { type: String },
  points: { type: Array },
  created: {
    type: Date,
    default: Date.now,
  },
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Notes", notesSchema);
