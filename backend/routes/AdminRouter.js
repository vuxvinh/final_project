// const express = require("express");
// const User = require("../db/userModel");

// const router = express.Router();

// /**
//  * POST /admin/login
//  * body: { login_name, password }
//  * returns: { _id, first_name } (tối thiểu)
//  */
// router.post("/login", async (req, res) => {
//   const { login_name, password } = req.body;

//   if (!login_name || typeof login_name !== "string") {
//     res.status(400).send("login_name required");
//     return;
//   }
//   if (!password || typeof password !== "string") {
//     res.status(400).send("password required");
//     return;
//   }

//   try {
//     const user = await User.findOne({ login_name }).lean();
//     if (!user || user.password !== password) {
//       res.status(400).send("Invalid login");
//       return;
//     }

//     req.session.user = { _id: user._id, first_name: user.first_name };
//     res.json({ _id: user._id, first_name: user.first_name });
//   } catch (err) {
//     res.status(500).send("Internal server error");
//   }
// });

// /**
//  * POST /admin/logout
//  */
// router.post("/logout", (req, res) => {
//   if (!req.session.user) {
//     res.status(400).send("Not logged in");
//     return;
//   }
//   req.session.destroy(() => {
//     res.sendStatus(200);
//   });
// });

// /**
//  * GET /admin/session
//  * helper for frontend refresh (optional but handy)
//  */
// router.get("/session", (req, res) => {
//   if (!req.session.user) {
//     res.sendStatus(401);
//     return;
//   }
//   res.json(req.session.user);
// });

// module.exports = router;

const express = require("express");
const User = require("../db/userModel");

const router = express.Router();

/**
 * POST /admin/login
 * body: { login_name, password }
 * returns: { _id, first_name } (tối thiểu)
 */
router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name || typeof login_name !== "string") {
    res.status(400).send("login_name required");
    return;
  }
  if (!password || typeof password !== "string") {
    res.status(400).send("password required");
    return;
  }

  try {
    const user = await User.findOne({ login_name }).lean();
    if (!user || user.password !== password) {
      res.status(400).send("Invalid login");
      return;
    }

    req.session.user = { _id: user._id, first_name: user.first_name };
    res.json({ _id: user._id, first_name: user.first_name });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

/**
 * POST /admin/logout
 */
router.post("/logout", (req, res) => {
  if (!req.session.user) {
    res.status(400).send("Not logged in");
    return;
  }
  req.session.destroy(() => {
    res.sendStatus(200);
  });
});

/**
 * GET /admin/session
 * helper for frontend refresh (optional but handy)
 */
router.get("/session", (req, res) => {
  if (!req.session.user) {
    res.sendStatus(401);
    return;
  }
  res.json(req.session.user);
});

module.exports = router;
