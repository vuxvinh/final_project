// // const express = require("express");
// // const Photo = require("../db/photoModel");
// // const router = express.Router();

// // router.post("/", async (request, response) => {
  
// // });

// // router.get("/", async (request, response) => {
  
// // });

// // module.exports = router;

// const express = require("express");
// const mongoose = require("mongoose");
// const Photo = require("../db/photoModel");
// const User = require("../db/userModel");
// const router = express.Router();

// // GET /photosOfUser/:id
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     res.status(400).send("Invalid user id");
//     return;
//   }

//   try {
//     // check user exists
//     const userExists = await User.exists({ _id: id });
//     if (!userExists) {
//       res.status(400).send("User not found");
//       return;
//     }

//     const photos = await Photo.find(
//       { user_id: id },
//       "_id user_id file_name date_time comments"
//     ).lean();

//     // collect all commenter user_ids
//     const commenterIds = [];
//     for (const p of photos) {
//       for (const c of (p.comments || [])) {
//         if (c.user_id) commenterIds.push(String(c.user_id));
//       }
//     }
//     const uniqueIds = [...new Set(commenterIds)];

//     const users = await User.find(
//       { _id: { $in: uniqueIds } },
//       "_id first_name last_name"
//     ).lean();

//     const userMap = new Map(users.map(u => [String(u._id), u]));

//     const apiPhotos = photos.map(p => ({
//       _id: p._id,
//       user_id: p.user_id,
//       file_name: p.file_name,
//       date_time: p.date_time,
//       comments: (p.comments || []).map(c => ({
//         _id: c._id,
//         comment: c.comment,
//         date_time: c.date_time,
//         user: userMap.get(String(c.user_id)) || { _id: c.user_id }
//       }))
//     }));

//     res.json(apiPhotos);
//   } catch (err) {
//     res.status(500).send("Server error while fetching photos");
//   }
// });

// module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");

const router = express.Router();

/**
 * GET /photosOfUser/:id
 */
router.get("/:id", async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).send("Invalid user id");
    return;
  }

  try {
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      res.status(400).send("User not found");
      return;
    }

    const photos = await Photo.find({ user_id: userId }).lean();

    const commenterIds = [];
    photos.forEach((p) =>
      (p.comments || []).forEach((c) => {
        if (c.user_id) commenterIds.push(String(c.user_id));
      })
    );

    const uniq = [...new Set(commenterIds)];
    const users = await User.find(
      { _id: { $in: uniq } },
      "_id first_name last_name"
    ).lean();

    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const result = photos.map((p) => ({
      _id: p._id,
      user_id: p.user_id,
      file_name: p.file_name,
      date_time: p.date_time,
      comments: (p.comments || []).map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: userMap.get(String(c.user_id)) || { _id: c.user_id },
      })),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
