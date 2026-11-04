const Favourite = require("../models/favourite");
const Home = require("../models/home");
const Booking = require("../models/booking");
const { db } = require("../utils/database");
const Review = require("../models/review");

const getSearchValue = (value) => typeof value === "string" ? value.trim() : "";
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getIndex = (req, res, next) => {
  const search = {
    where: getSearchValue(req.query.where),
    checkIn: getSearchValue(req.query.checkIn),
    checkOut: getSearchValue(req.query.checkOut),
    guests: getSearchValue(req.query.guests),
  };
  const filters = {};
  const searchFields = ["where", "checkIn", "checkOut", "guests"];
  let searchError = searchFields.some((field) => req.query[field] !== undefined && typeof req.query[field] !== "string")
    ? "Enter only one value for each search field."
    : null;
  const setSearchError = (message) => {
    if (!searchError) {
      searchError = message;
    }
  };

  if (search.where) {
    filters.location = { $regex: escapeRegex(search.where), $options: "i" };
  }

  let checkInDate;
  let checkOutDate;
  if (search.checkIn || search.checkOut) {
    const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)
      && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime())
      && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

    if (!validDate(search.checkIn) || !validDate(search.checkOut)) {
      setSearchError("Enter both a valid check-in and check-out date.");
    } else {
      checkInDate = new Date(`${search.checkIn}T00:00:00.000Z`);
      checkOutDate = new Date(`${search.checkOut}T00:00:00.000Z`);
      if (checkInDate >= checkOutDate) {
        setSearchError("Check-out must be after check-in.");
        checkInDate = null;
        checkOutDate = null;
      } else if (checkInDate < new Date(new Date().toISOString().slice(0, 10))) {
        setSearchError("Check-in cannot be in the past.");
        checkInDate = null;
        checkOutDate = null;
      }
    }
  }

  if (search.guests) {
    const guestCount = Number(search.guests);
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
      setSearchError("Guest count must be between 1 and 20.");
    } else {
      filters.$or = [
        { maxGuests: { $gte: guestCount } },
        { maxGuests: { $exists: false } },
      ];
    }
  }

  const findBookingsPromise = (checkInDate && checkOutDate)
    ? Booking.find({
        status: { $ne: "cancelled" },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      }).select("home")
    : Promise.resolve([]);

  findBookingsPromise
    .then((conflictingBookings) => {
      const unavailableHomeIds = conflictingBookings.map((b) => b.home);
      if (unavailableHomeIds.length > 0) {
        filters._id = { $nin: unavailableHomeIds };
      }
      return Home.find(filters);
    })
    .then((registeredHomes) => {
      res.render("store/index", {
        registeredHomes,
        pageTitle: "Zovira",
        currentPage: "index",
        isLoggedIn: req.isLoggedIn,
        user: req.user || req.session.user,
        search,
        searchError,
        hasSearch: Boolean(search.where || search.checkIn || search.checkOut || search.guests),
      });
    })
    .catch(next);
};

exports.getHomes = (req, res, next) => {
  Home.find()
    .then((rows) => {
      res.render("store/home-list", {
        registeredHomes: rows,
        pageTitle: "Home List",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        user: req.user || req.session.user,
      });
    })
    .catch((err) => {
      console.log("Error Fetching Homes", err);
      next(err);
    });
};

exports.getFavouriteList = (req, res, next) => {
  Favourite.find()
    .populate("houseId")
    .then((favourites) => {
      const favouriteHomes = favourites.map((fav) => fav.houseId);
      res.render("store/favourite-list", {
        favouriteHomes: favouriteHomes,
        pageTitle: "My Favourites",
        currentPage: "favourites",
        isLoggedIn: req.isLoggedIn,
        user: req.user || req.session.user,
      });
    })
    .catch(next);
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        console.log("Home not found");
        return res.redirect("/homes");
      }

      return Review.find({ homeId: homeId })
        .populate("userId", "firstName lastName")
        .sort({ createdAt: -1 })
        .then((reviews) => {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : (home.rating || 5);

          const user = req.user || req.session.user;

          const alreadyReviewed = user
            ? reviews.some(
                (review) =>
                  review.userId &&
                  review.userId._id &&
                  review.userId._id.toString() === user._id.toString()
              )
            : false;

          const flashError = req.session.flashError || null;
          delete req.session.flashError;
          const flashSuccess = req.session.flashSuccess || null;
          delete req.session.flashSuccess;

          res.render("store/home-detail", {
            home: home,
            pageTitle: home.houseName || "Home Detail",
            currentPage: "Home",
            isLoggedIn: req.isLoggedIn,
            user,
            flashError,
            flashSuccess,
            reviews,
            averageRating,
            reviewCount: reviews.length,
            alreadyReviewed,
          });
        });
    })
    .catch(next);
};

exports.postAddToFavourite = (req, res, next) => {
  const homeId = req.body.id;

  Favourite.findOne({ houseId: homeId })
    .then((fav) => {
      if (!fav) {
        const newFav = new Favourite({ houseId: homeId });
        return newFav.save().then(() => {
          console.log("Fav added successfully");
        });
      } else {
        console.log("Already marked as favourite");
      }
    })
    .then(() => {
      res.redirect("/favourites");
    })
    .catch((err) => {
      console.log("Error while marking favourite : ", err);
      res.redirect("/favourites");
    });
};

exports.postRemoveFavourite = (req, res, next) => {
  const homeId = req.params.homeId;

  Favourite.findOneAndDelete({ houseId: homeId })
    .then(() => {
      console.log("Fav removed successfully");
      res.redirect("/favourites");
    })
    .catch((err) => {
      console.log("Error while removing favourite : ", err);
      res.redirect("/favourites");
    });
};
