let mongoose = require("mongoose");

let schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String }, 
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String }
  },
  { timestamps: true }
);

let userModel = mongoose.model("users", schema);
module.exports = userModel;
