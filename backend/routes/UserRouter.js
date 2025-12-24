const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");

const router = express.Router();

/**
 * POST /user
 * Register new user
 * Required: login_name, password, first_name, last_name
 */
router.post("/", async (req, res) => {
  try {
    const {
      login_name,
      password,
      first_name,
      last_name,
      location = "",
      description = "",
      occupation = "",
    } = req.body || {};

    // required fields
    if (
      !String(login_name || "").trim() ||
      !String(password || "").trim() ||
      !String(first_name || "").trim() ||
      !String(last_name || "").trim()
    ) {
      return res.status(400).send("login_name, password, first_name, last_name are required");
    }

    // unique login_name
    const existed = await User.findOne({ login_name: String(login_name).trim() }).lean();
    if (existed) {
      return res.status(400).send("login_name already exists");
    }

    const created = await User.create({
      login_name: String(login_name).trim(),
      password: String(password), // giữ nguyên theo hệ thống hiện tại
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      location: String(location || "").trim(),
      description: String(description || "").trim(),
      occupation: String(occupation || "").trim(),
    });

    const obj = created.toObject();
    delete obj.password; // không trả password về client
    return res.json(obj);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// GET /user/list?search=...
router.get("/list", async (req, res) => {
  const search = String(req.query.search || "").trim();

  const filter =
    search.length > 0
      ? {
          $or: [
            { first_name: { $regex: search, $options: "i" } },
            { last_name: { $regex: search, $options: "i" } },
            { login_name: { $regex: search, $options: "i" } },
          ],
        }
      : {};

  const users = await User.find(filter, { first_name: 1, last_name: 1, login_name: 1 }).lean();

  // photo_count
  const photoAgg = await Photo.aggregate([
    { $group: { _id: "$user_id", count: { $sum: 1 } } },
  ]);

  const photoMap = new Map(photoAgg.map((x) => [String(x._id), x.count]));

  // comment_count (đếm comment mà user viết trên mọi ảnh)
  const commentAgg = await Photo.aggregate([
    { $unwind: "$comments" },
    { $group: { _id: "$comments.user_id", count: { $sum: 1 } } },
  ]);

  const commentMap = new Map(commentAgg.map((x) => [String(x._id), x.count]));

  const result = users.map((u) => ({
    _id: u._id,
    first_name: u.first_name,
    last_name: u.last_name,
    login_name: u.login_name,
    photo_count: photoMap.get(String(u._id)) || 0,
    comment_count: commentMap.get(String(u._id)) || 0,
  }));

  res.json(result);
});

// GET /user/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send("Invalid user id");

  const u = await User.findById(id, {
    first_name: 1,
    last_name: 1,
    location: 1,
    description: 1,
    occupation: 1,
    login_name: 1,
  }).lean();

  if (!u) return res.status(400).send("User not found");
  res.json(u);
});

// PUT /user/:id  (edit profile) - chỉ sửa được chính mình
router.put("/:id", async (req, res) => {
  const me = req.session.user?._id;
  const { id } = req.params;

  if (!me) return res.sendStatus(401);
  if (String(me) !== String(id)) return res.sendStatus(403);

  const { first_name, last_name, location, description, occupation } = req.body;

  // required fields
  if (!String(first_name || "").trim() || !String(last_name || "").trim()) {
    return res.status(400).send("first_name and last_name are required");
  }

  const updated = await User.findByIdAndUpdate(
    id,
    {
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      location: String(location || "").trim(),
      description: String(description || "").trim(),
      occupation: String(occupation || "").trim(),
    },
    { new: true }
  ).lean();

  return res.json(updated);
});

module.exports = router;