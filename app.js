require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const reviewRouter = require("./routes/reviewRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const User = require("./models/user");
const { upload } = require("./utils/cloudinary");

const app = express();
const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;

if (!mongoUri) {
  throw new Error("Missing MongoDB connection string. Set MONGODB_URI in your .env file.");
}

const store = new MongoDBStore({
  uri: mongoUri,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));

app.use(express.urlencoded({ extended: true }));


app.use(upload.single("photo"));


app.use(express.static(path.join(rootDir, "public")));

const uploadsDir = path.join(rootDir, "uploads");
if (fs.existsSync(uploadsDir)) {
  app.use("/uploads", express.static(uploadsDir));
  app.use("/host/uploads", express.static(uploadsDir));
  app.use("/homes/uploads", express.static(uploadsDir));
}


app.use((req, res, next) => {
  res.locals.getPhotoUrl = (photo) => {
    if (!photo || typeof photo !== "string" || photo.trim() === "") {
      return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80";
    }
    const trimmed = photo.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//")) {
      return trimmed;
    }
    let normalized = trimmed.replace(/\\/g, "/");
    normalized = normalized.replace(/^\/?uploads\//, "");
    normalized = normalized.replace(/^\/+/, "");
    return "/uploads/" + normalized;
  };
  next();
});

app.use(
  session({
    secret: "Hello Sir",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.isLoggedIn = req.isLoggedIn;

  const userId = req.session.userId || (req.session.user ? req.session.user._id : null);
  if (!userId) {
    req.user = null;
    res.locals.user = null;
    return next();
  }
  User.findById(userId)
    .then((user) => {
      req.user = user || null;
      res.locals.user = req.user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (!req.isLoggedIn) {
    return res.redirect("/login");
  }
  if (!req.user || req.user.userType !== "host") {
    return res.redirect("/");
  }
  return next();
});
app.use("/host", hostRouter);

app.use("/reviews", reviewRouter);
app.use(authRouter);

app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3001;

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB ✅");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error while connecting to MongoDB:", err);
  });
