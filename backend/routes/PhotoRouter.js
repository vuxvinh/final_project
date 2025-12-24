const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");

const router = express.Router();

/**
 * GET /photosOfUser/:userId
 * (router này đang mount ở /photosOfUser)
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send("Invalid user id");
  }

  try {
    const u = await User.findById(userId).lean();
    if (!u) return res.status(400).send("User not found");

    const photos = await Photo.find({ user_id: userId }).lean();

    // populate comment user info
    const userIds = new Set();
    photos.forEach((p) => {
      (p.comments || []).forEach((c) => userIds.add(String(c.user_id)));
    });

    const users = await User.find(
      { _id: { $in: Array.from(userIds) } },
      { first_name: 1, last_name: 1 }
    ).lean();

    const userMap = new Map(users.map((x) => [String(x._id), x]));

    const result = photos.map((p) => ({
      ...p,
      comments: (p.comments || []).map((c) => ({
        ...c,
        user: userMap.get(String(c.user_id)) || null,
      })),
      likes: p.likes || [],
    }));

    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal server error");
  }
});

/**
 * POST /photos/:photoId/like
 * (router này đang mount ở /photos)
 */
router.post("/:photoId/like", async (req, res) => {
  const me = req.session.user?._id;
  const { photoId } = req.params;

  if (!me) return res.sendStatus(401);
  if (!mongoose.Types.ObjectId.isValid(photoId)) return res.status(400).send("Invalid photo id");

  const p = await Photo.findById(photoId);
  if (!p) return res.status(400).send("Photo not found");

  const already = (p.likes || []).some((id) => String(id) === String(me));
  if (!already) p.likes.push(me);

  await p.save();
  return res.json({ ok: true, like_count: p.likes.length });
});

/**
 * DELETE /photos/:photoId/like
 */
router.delete("/:photoId/like", async (req, res) => {
  const me = req.session.user?._id;
  const { photoId } = req.params;

  if (!me) return res.sendStatus(401);
  if (!mongoose.Types.ObjectId.isValid(photoId)) return res.status(400).send("Invalid photo id");

  const p = await Photo.findById(photoId);
  if (!p) return res.status(400).send("Photo not found");

  p.likes = (p.likes || []).filter((id) => String(id) !== String(me));
  await p.save();

  return res.json({ ok: true, like_count: p.likes.length });
});

module.exports = router;
