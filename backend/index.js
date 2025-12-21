// const express = require("express");
// const app = express();
// const cors = require("cors");
// const dbConnect = require("./db/dbConnect");
// const UserRouter = require("./routes/UserRouter");
// const PhotoRouter = require("./routes/PhotoRouter");

// dbConnect();

// app.use(cors());
// app.use(express.json());
// app.use("/user", UserRouter);
// app.use("/photosOfUser", PhotoRouter);

// app.get("/", (request, response) => {
//   response.send({ message: "Hello from photo-sharing app API!" });
// });

// app.listen(8081, () => {
//   console.log("server listening on port 8081");
// });

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter");
const PhotoUploadRouter = require("./routes/PhotoUploadRouter");
const CommentRouter = require("./routes/CommentRouter");

const app = express();
dbConnect();

// allow cookies (session) from frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: "photo-app-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Serve uploaded images from backend: /images/<filename>
app.use("/images", express.static(path.join(__dirname, "images")));

// Auth guard: everything except /admin/login must be logged in
app.use((req, res, next) => {
  const isLogin = req.path === "/admin/login";
  const isLogout = req.path === "/admin/logout";
  const isSession = req.path === "/admin/session";

  // allow register without login
  const isRegister = req.path === "/user" && req.method === "POST";

  if (isLogin || isLogout || isSession || isRegister) {
    next();
    return;
  }

  if (!req.session.user) {
    res.sendStatus(401);
    return;
  }

  next();
});

app.use("/admin", AdminRouter);
app.use("/user", UserRouter);
app.use("/photosOfUser", PhotoRouter);
app.use("/commentsOfPhoto", CommentRouter);
app.use("/photos", PhotoUploadRouter);

app.get("/", (req, res) => res.send("Final project backend running"));

app.listen(8081, () => console.log("Server listening on port 8081"));
