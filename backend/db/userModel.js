// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   first_name: { type: String },
//   last_name: { type: String },
//   location: { type: String },
//   description: { type: String },
//   occupation: { type: String },
//   login_name: String,
//   password: String
// });

// module.exports = mongoose.model.Users || mongoose.model("Users", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  location: String,
  description: String,
  occupation: String,

  // Final project additions:
  login_name: { type: String, unique: true, sparse: true },
  password: String,
});

module.exports = mongoose.model("User", userSchema);
