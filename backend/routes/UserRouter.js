// // const express = require("express");
// // const User = require("../db/userModel");
// // const router = express.Router();

// // router.post("/", async (request, response) => {
  
// // });

// // router.get("/", async (request, response) => {
  
// // });

// // module.exports = router;

// const express = require("express");
// const mongoose = require("mongoose");
// const User = require("../db/userModel");
// const router = express.Router();

// // GET /user/list
// router.get("/list", async (req, res) => {
//   try {
//     const users = await User.find({}, "_id first_name last_name");
//     res.json(users);
//   } catch (err) {
//     res.status(500).send("Server error while fetching user list");
//   }
// });

// // GET /user/:id
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     res.status(400).send("Invalid user id");
//     return;
//   }

//   try {
//     const user = await User.findById(
//       id,
//       "_id first_name last_name location description occupation"
//     );
//     if (!user) {
//       res.status(400).send("User not found");
//       return;
//     }
//     res.json(user);
//   } catch (err) {
//     res.status(500).send("Server error while fetching user");
//   }
// });

// module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");

const router = express.Router();

/**
 * GET /user/list
 */
router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name").lean();
    res.json(users);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

/**
 * GET /user/:id
 */
router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).send("Invalid user id");
    return;
  }

  try {
    const user = await User.findById(
      userId,
      "_id first_name last_name location description occupation"
    ).lean();

    if (!user) {
      res.status(400).send("User not found");
      return;
    }

    res.json(user);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.post("/", async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location = "",
    description = "",
    occupation = "",
  } = req.body;

  const bad = (v) => !v || typeof v !== "string" || v.trim() === "";

  if (bad(login_name) || bad(password) || bad(first_name) || bad(last_name)) {
    res.status(400).send("Missing required fields");
    return;
  }

  try {
    const exists = await User.findOne({ login_name: login_name.trim() }).lean();
    if (exists) {
      res.status(400).send("login_name already exists");
      return;
    }

    const user = new User({
      login_name: login_name.trim(),
      password,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      location,
      description,
      occupation,
    });

    await user.save();
    res.json({ login_name: user.login_name });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});


module.exports = router;
