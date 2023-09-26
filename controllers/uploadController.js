const AWS = require("aws-sdk");
require("dotenv").config();
const File = require("../models/file");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

async function uploadFile(req, res) {
  const params = {
    Bucket: "doc-sharing",
    Key: req.file.originalname,
    Body: req.file.buffer,
  };

  s3.upload(params, async (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const uploadedFile = new File({
        filename: req.file.originalname,
        url: data.Location,
        etag: data.ETag,
        owner: req.user._id
      });
      try {
        let fileInfo = await uploadedFile.save();
        res.json(fileInfo);
      } catch (error) {
        res.status(500).send(error);
      }
    }
  });
}

module.exports = {
  uploadFile,
};
