const express = require("express");
const User = require("../db/userModel");

const router = express.Router();

/**
 * POST /admin/login
 * body: { login_name, password }
 */
router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (
    !login_name ||
    typeof login_name !== "string" ||
    login_name.trim() === "" ||
    !password ||
    typeof password !== "string" ||
    password.trim() === ""
  ) {
    res.status(400).send("login_name and password are required");
    return;
  }

  try {
    const user = await User.findOne({
      login_name: login_name.trim(),
      password,
    }).lean();

    if (!user) {
      res.status(400).send("Invalid login_name or password");
      return;
    }

    req.session.user = { _id: user._id, first_name: user.first_name };
    res.json({ _id: user._id, first_name: user.first_name, last_name: user.last_name });
  } catch (e) {
    res.status(500).send("Internal server error");
  }
});

/**
 * POST /admin/logout
 */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.sendStatus(200);
  });
});

/**
 * GET /admin/session
 */
router.get("/session", async (req, res) => {
  if (!req.session.user) {
    res.sendStatus(401);
    return;
  }
  res.json(req.session.user);
});

module.exports = router;
