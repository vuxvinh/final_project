const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const AdminRouter = require("./routes/AdminRouter");
const UserRouter = require("./routes/UserRouter");
const CommentRouter = require("./routes/CommentRouter");
const PhotoRouter = require("./routes/PhotoRouter");             
const PhotoUploadRouter = require("./routes/PhotoUploadRouter");  
const UserCommentsRouter = require("./routes/UserCommentsRouter");
const FriendRouter = require("./routes/FriendRouter");

require("dotenv").config();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "photo-app-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/images", express.static(path.join(__dirname, "images")));

const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URL || process.env.DB_URL;
mongoose
  .connect(mongoUrl)
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch((e) => console.error("MongoDB connection error:", e));

app.use((req, res, next) => {
  const isLogin = req.path === "/admin/login";
  const isLogout = req.path === "/admin/logout";
  const isSession = req.path === "/admin/session";
  const isRegister = req.path === "/user" && req.method === "POST";

  if (isLogin || isLogout || isSession || isRegister) return next();

  if (!req.session.user) return res.sendStatus(401);
  next();
});

app.use("/admin", AdminRouter);
app.use("/user", UserRouter);

app.use("/photosOfUser", PhotoRouter);
app.use("/photos", PhotoRouter);

app.use("/commentsOfPhoto", CommentRouter);

app.use("/photos", PhotoUploadRouter);

app.use("/commentsOfUser", UserCommentsRouter);
app.use("/friend", FriendRouter);

app.listen(8081, () => console.log("Server listening on port 8081"));
