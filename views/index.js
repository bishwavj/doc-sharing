const express = require("express");
const router = express.Router();
const Users = require("../models/user");

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/", (req, res) => {
  res.render("register");
});

router.get("/upload", (req, res) => {
  res.render("fileUpload");
});

router.get("/sharing", (req, res) => {
  res.render("sharing");
});

router.get("/download", (req, res) => {
  res.render("download");
});


module.exports = router;
