const File = require("../models/file");
const User = require("../models/user");
const AWS = require("aws-sdk");
require("dotenv").config();
const crypto = require("crypto");
const sharedLink = require("../models/sharedLink");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

module.exports.share = async (req, res) => {
  const fileId = req.params.fileId;
  const email = req.body.email;
  const validity = req.body.validity;

  try {
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).send("File not found");
    }
    if (!email) {
      return res.status(404).send("Please provide vaild emailid for sharing the file");
    }

    if (!file.owner.equals(req.user._id)) {
      return res.status(403).send("Access denied. You do not own this file.");
    }

    const userToShareWith = await User.findOne({ email});

    if (!userToShareWith) {
      return res.status(404).send("User not found");
    }

    if (file.sharedWith.includes(email)) {
      return res
        .status(400)
        .json({error: "Email is already in the list of shared emails"});
    }

    file.sharedWith.push(email);
    await file.save();

    const params = {
      Bucket: "doc-sharing",
      Key: file.filename,
      Expires: validity * 3600,
    };
    const userToken = generateUserToken(email);
    const preSignedUrl = s3.getSignedUrl("getObject", params);

    const currentTime = new Date();
    const expirationTime = new Date(currentTime.getTime() + validity * 60 * 60 * 1000);
    const sixDigitOTP = generateOTP();

    const sharedLinkInfo = {
      url: preSignedUrl,
      expirationTime: expirationTime,
      sharedWith: email,
      userToken: userToken,
      fileId: file._id,
      fileOwner: file.owner,
      otp: sixDigitOTP
    };
    let linkId = new sharedLink(sharedLinkInfo);
    await linkId.save();
    res.json({
      message: "File shared successfully",
      linkId: linkId._id,
      token: userToken,
      otp: sixDigitOTP
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.download = async (req, res) => {
  const linkId = req.params.linkId;
  const userToken = req.body.fileToken;
  const otp = req.body.otp;

  console.log("tokennnn", userToken, otp);

  try {
    const link = await sharedLink.findById(linkId);

    if (!link) {
      return res.status(404).send("File not found");
    }

    const currentTime = new Date();
    if (currentTime > link.expirationTime) {
      return res.status(403).send("Shared link has expired");
    }

    const isUserAuthorized =(
      link.sharedWith.includes(req.user.email) ||
      link.fileOwner.equals(req.user._id)
      );

    if (!isUserAuthorized || userToken !== link.userToken) {
      return res.status(403).send("Access denied");
    }

    if (parseInt(otp) !== parseInt(link.otp)) {
      return res.status(403).send("Invalid OTP");
    }
    const fileLink = link.url;
    res.json({fileLink});
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.registeredUsers = async (req, res) => {
  try {
    const users = await User.find({}, "email");
    return res.send(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

function generateUserToken(userEmail) {
  const token = crypto.createHash("sha256").update(userEmail).digest("hex");
  return token.substring(0, 10);
}

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000); 
  return otp;
}


