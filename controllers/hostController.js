const fs = require("fs");
const path = require("path");
const Home = require("../models/home");
const rootDir = require("../utils/pathUtil");

const deleteLocalPhoto = (photoPath) => {
  if (!photoPath || typeof photoPath !== "string") return;
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://") || photoPath.startsWith("//")) {
    return;
  }
  const filename = path.basename(photoPath.replace(/\\/g, "/"));
  const fullPath = path.join(rootDir, "uploads", filename);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.log("Could not delete old photo file:", err.message);
    }
  });
};

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to Zovira",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.user || req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findOne({ _id: homeId, host: req.user._id })
    .then((home) => {
      if (!home) {
        console.log("Home not found or does not belong to this host.");
        return res.redirect("/host/host-home-list");
      }

      res.render("host/edit-home", {
        home: home,
        pageTitle: "Edit your Home",
        currentPage: "host-homes",
        editing: editing,
        isLoggedIn: req.isLoggedIn,
        user: req.user || req.session.user,
      });
    })
    .catch((err) => next(err));
};

exports.getHostHomes = (req, res, next) => {
  Home.find({ host: req.user._id })
    .then((registeredHomes) => {
      res.render("host/host-home-list", {
        registeredHomes: registeredHomes,
        pageTitle: "Host Homes List",
        currentPage: "host-homes",
        isLoggedIn: req.isLoggedIn,
        user: req.user || req.session.user,
      });
    })
    .catch((err) => next(err));
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, maxGuests, location, rating, description } = req.body;

  if (!req.file) {
    return res.status(422).send("Please upload an image.");
  }

  const photoUrl = req.file.path || req.file.filename;

  const home = new Home({
    host: req.user._id,
    houseName,
    price,
    maxGuests: maxGuests || 20,
    location,
    rating,
    photo: photoUrl,
    description,
  });

  home
    .save()
    .then((savedHome) => {
      console.log("Home saved with Cloudinary photo:", savedHome.photo);
      res.redirect("/host/host-home-list");
    })
    .catch((err) => next(err));
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, maxGuests, location, rating, description } = req.body;

  Home.findOne({ _id: id, host: req.user._id })
    .then((home) => {
      if (!home) {
        return res.redirect("/host/host-home-list");
      }

      home.houseName = houseName;
      home.price = price;
      home.maxGuests = maxGuests || 20;
      home.location = location;
      home.rating = rating;
      home.description = description;

      if (req.file) {
        const oldPhoto = home.photo;
        home.photo = req.file.path || req.file.filename;
        if (oldPhoto) {
          deleteLocalPhoto(oldPhoto);
        }
      }

      return home.save();
    })
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((err) => next(err));
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("Came to delete", homeId);

  Home.findOneAndDelete({ _id: homeId, host: req.user._id })
    .then((home) => {
      if (home && home.photo) {
        deleteLocalPhoto(home.photo);
      }
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("Error while deleting", error);
      next(error);
    });
};
