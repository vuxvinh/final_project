const express = require("express");
const mongoose = require("mongoose");
const Friend = require("../db/friendModel");

const router = express.Router();

function normalizePair(a, b) {
  const sa = String(a);
  const sb = String(b);
  return sa < sb ? [a, b] : [b, a];
}

// GET /friend/:otherUserId -> { isFriend: true/false }
router.get("/:otherUserId", async (req, res) => {
  const me = req.session.user?._id;
  const other = req.params.otherUserId;

  if (!me) return res.sendStatus(401);
  if (!mongoose.Types.ObjectId.isValid(other)) return res.status(400).send("Invalid user id");
  if (String(me) === String(other)) return res.json({ isFriend: false });

  const [u1, u2] = normalizePair(me, other);

  const f = await Friend.findOne({ user1: u1, user2: u2 }).lean();
  return res.json({ isFriend: !!f });
});

// POST /friend/:otherUserId  (add friend)
router.post("/:otherUserId", async (req, res) => {
  const me = req.session.user?._id;
  const other = req.params.otherUserId;

  if (!me) return res.sendStatus(401);
  if (!mongoose.Types.ObjectId.isValid(other)) return res.status(400).send("Invalid user id");
  if (String(me) === String(other)) return res.status(400).send("Cannot friend self");

  const [u1, u2] = normalizePair(me, other);

  try {
    const doc = await Friend.create({ user1: u1, user2: u2 });
    return res.json({ ok: true, friend: doc });
  } catch (e) {
    // nếu đã tồn tại thì coi như ok
    if (String(e).includes("E11000")) return res.json({ ok: true });
    console.error(e);
    return res.status(500).send("Internal server error");
  }
});

// DELETE /friend/:otherUserId (unfriend)
router.delete("/:otherUserId", async (req, res) => {
  const me = req.session.user?._id;
  const other = req.params.otherUserId;

  if (!me) return res.sendStatus(401);
  if (!mongoose.Types.ObjectId.isValid(other)) return res.status(400).send("Invalid user id");
  if (String(me) === String(other)) return res.json({ ok: true });

  const [u1, u2] = normalizePair(me, other);

  await Friend.deleteOne({ user1: u1, user2: u2 });
  return res.json({ ok: true });
});

module.exports = router;