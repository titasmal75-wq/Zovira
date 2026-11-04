require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const multer = require('multer');

const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const reviewRouter = require("./routes/reviewRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const session = require('express-session');
const MongoDBStore = require("connect-mongodb-session")(session);
const User = require("./models/user");

const app = express();

const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: 'sessions'
});

const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const uploadsDir = path.join(rootDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, randomString(10) + "-" + safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  cb(null, allowedTypes.includes(file.mimetype));
};

const multerOperation = {
  storage,
  fileFilter
};

app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOperation).single('photo'));

// Serve static public assets (styles.css, output.css, images, etc.)
app.use(express.static(path.join(rootDir, 'public')));
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

// Serve user uploaded images
app.use("/uploads", express.static(uploadsDir));
app.use("/host/uploads", express.static(uploadsDir));
app.use("/homes/uploads", express.static(uploadsDir));

// Helper available to all EJS views to resolve photo paths
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

app.use(session({
  secret: "Hello Sir",
  resave: false,
  saveUninitialized: true,
  store: store
}));

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
    .then(user => {
      req.user = user || null;
      res.locals.user = req.user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (!req.isLoggedIn) {
    return res.redirect("/login");
  }
  if (!req.user || req.user.userType !== 'host') {
    return res.redirect("/");
  }
  return next();
});
app.use("/host", hostRouter);

app.use("/reviews", reviewRouter);
app.use(authRouter);

app.use(errorsController.pageNotFound);

const PORT = 3001;

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB ✅");

    app.listen(PORT,"0.0.0.0" , () => {
      console.log(`Server running at: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error while connecting to MongoDB:", err);
  });
  
