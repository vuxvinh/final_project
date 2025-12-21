const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");

const router = express.Router();

/**
 * POST /commentsOfPhoto/:photo_id
 * body: { comment }
 */
router.post("/:photo_id", async (req, res) => {
  const photoId = req.params.photo_id;
  const { comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    res.status(400).send("Invalid photo id");
    return;
  }

  if (!comment || typeof comment !== "string" || comment.trim() === "") {
    res.status(400).send("Empty comment");
    return;
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      res.status(400).send("Photo not found");
      return;
    }

    // req.session.user set by /admin/login
    photo.comments.push({
      comment: comment.trim(),
      user_id: req.session.user._id,
      date_time: new Date(),
    });

    await photo.save();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
