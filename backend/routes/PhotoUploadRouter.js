const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Photo = require("../db/photoModel");

const router = express.Router();

// ensure images folder exists
const imagesDir = path.join(__dirname, "..", "images");
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

/**
 * POST /photos/new
 * field name must be "photo" (frontend: form.append("photo", file))
 */
router.post("/new", upload.single("photo"), async (req, res) => {
  try {
    const me = req.session.user?._id;
    if (!me) return res.sendStatus(401);

    if (!req.file) return res.status(400).send("No file uploaded");

    const created = await Photo.create({
      file_name: req.file.filename,
      user_id: me,
      date_time: new Date(),
      comments: [],
      likes: [],
    });

    return res.json(created);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal server error");
  }
});

/**
 * DELETE /photos/:photoId
 * only owner can delete
 */
router.delete("/:photoId", async (req, res) => {
  try {
    const me = req.session.user?._id;
    if (!me) return res.sendStatus(401);

    const { photoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).send("Invalid photo id");
    }

    const p = await Photo.findById(photoId);
    if (!p) return res.status(400).send("Photo not found");

    if (String(p.user_id) !== String(me)) return res.sendStatus(403);

    // delete file on disk (best effort)
    const filePath = path.join(imagesDir, p.file_name);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}

    await Photo.deleteOne({ _id: photoId });

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
