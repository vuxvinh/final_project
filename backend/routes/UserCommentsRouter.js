const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");

const router = express.Router();

/**
 * GET /commentsOfUser/:userId
 * Lab3 extra credit: all comments written by user + thumbnail + jump to photo view
 */
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).send("Invalid user id");
    return;
  }

  try {
    const photos = await Photo.find(
      { "comments.user_id": userId },
      { file_name: 1, user_id: 1, comments: 1 }
    ).lean();

    const out = [];
    for (const p of photos) {
      const ownerId = p.user_id;
      for (const c of p.comments || []) {
        if (String(c.user_id) === String(userId)) {
          out.push({
            photo_id: p._id,
            photo_owner_id: ownerId,
            photo_file_name: p.file_name,
            comment_id: c._id,
            comment: c.comment,
            date_time: c.date_time,
          });
        }
      }
    }

    // sort newest first
    out.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

    res.json(out);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;