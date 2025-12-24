const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");

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
    res.status(400).send("Comment required");
    return;
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      res.status(400).send("Photo not found");
      return;
    }

    photo.comments.push({
      comment: comment.trim(),
      user_id: req.session.user._id,
      date_time: new Date(),
    });

    await photo.save();
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send("Internal server error");
  }
});

/**
 * PUT /commentsOfPhoto/:photoId/:commentId
 * body: { comment }
 * only comment owner can edit
 */
router.put("/:photoId/:commentId", async (req, res) => {
  const { photoId, commentId } = req.params;
  const { comment } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(photoId) ||
    !mongoose.Types.ObjectId.isValid(commentId)
  ) {
    res.status(400).send("Invalid id");
    return;
  }
  if (!comment || typeof comment !== "string" || comment.trim() === "") {
    res.status(400).send("Comment required");
    return;
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(400).send("Photo not found");

    const c = photo.comments.id(commentId);
    if (!c) return res.status(400).send("Comment not found");

    if (String(c.user_id) !== String(req.session.user._id)) {
      res.sendStatus(403);
      return;
    }

    c.comment = comment.trim();
    c.date_time = new Date();
    await photo.save();
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send("Internal server error");
  }
});

/**
 * DELETE /commentsOfPhoto/:photoId/:commentId
 * only comment owner can delete
 */
router.delete("/:photoId/:commentId", async (req, res) => {
  const { photoId, commentId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(photoId) ||
    !mongoose.Types.ObjectId.isValid(commentId)
  ) {
    res.status(400).send("Invalid id");
    return;
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(400).send("Photo not found");

    const c = photo.comments.id(commentId);
    if (!c) return res.status(400).send("Comment not found");

    if (String(c.user_id) !== String(req.session.user._id)) {
      res.sendStatus(403);
      return;
    }

    c.deleteOne();
    await photo.save();
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;