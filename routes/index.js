const express = require("express");
const router = express.Router();
const verifyToken = require("../controllers/verifyToken");
const userController = require("../controllers/userController");
const uploadController = require("../controllers/uploadController");
const shareController = require("../controllers/shareController");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  uploadController.uploadFile
);
router.post("/share/:fileId", verifyToken, shareController.share);
router.post("/download/:linkId", verifyToken, shareController.download);
router.get("/registeredUsers", shareController.registeredUsers);

module.exports = router;
