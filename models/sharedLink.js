const mongoose = require("mongoose");

const sharedLinkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  expirationTime: {
    type: Date,
    required: true,
  },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
  fileOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sharedWith: [
    {
      type: String,
      required: true,
    },
  ],
  userToken: {
    type: String,
    required: true,
  },
  otp: {type: Number, required: true}
});

const SharedLink = mongoose.model("SharedLink", sharedLinkSchema);

module.exports = SharedLink;
