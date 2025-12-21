const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Photo = require("../db/photoModel");

const router = express.Router();

const imagesDir = path.join(__dirname, "..", "images");
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "");
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

/**
 * POST /photos/new
 * form-data field name: "photo"
 */
router.post("/new", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    res.status(400).send("No file");
    return;
  }

  try {
    const photo = new Photo({
      file_name: req.file.filename,
      user_id: req.session.user._id,
      date_time: new Date(),
      comments: [],
    });

    await photo.save();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
