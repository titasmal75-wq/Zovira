const Booking = require("../models/booking");
const Home = require("../models/home");


exports.postCreateBooking = (req, res, next) => {
  if (!req.isLoggedIn || !req.user) {
    return res.redirect("/login");
  }

  const { homeId, checkIn, checkOut, guests } = req.body;

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        return res.redirect("/homes");
      }

      const checkInDate  = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const guestCount = Number(guests);

      if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
        req.session.flashError = "Enter valid check-in and check-out dates.";
        return res.redirect("/homes/" + homeId);
      }

      if (checkInDate >= checkOutDate) {
        req.session.flashError = "Check-out date must be after check-in date.";
        return res.redirect("/homes/" + homeId);
      }

      const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
      if (checkInDate < today) {
        req.session.flashError = "Check-in date cannot be in the past.";
        return res.redirect("/homes/" + homeId);
      }

      if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > (home.maxGuests || 20)) {
        req.session.flashError = `This home accepts 1 to ${home.maxGuests || 20} guests.`;
        return res.redirect("/homes/" + homeId);
      }

      const nights     = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * home.price;

      const booking = new Booking({
        home: homeId,
        guest: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guestCount,
        pricePerNight: home.price,
        totalPrice,
        status: "confirmed",
      });

      return Booking.findOne({
        home: homeId,
        status: { $ne: "cancelled" },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      }).then((conflictingBooking) => {
        if (conflictingBooking) {
          req.session.flashError = "This home is already booked for some of those dates.";
          return res.redirect("/homes/" + homeId);
        }

        return booking.save().then(() => {
          req.session.flashSuccess = `Booking confirmed! ${nights} night(s) at ₹${totalPrice.toLocaleString("en-IN")}.`;
          res.redirect("/bookings");
        });
      });
    })
    .catch(next);
};

exports.getGuestBookings = (req, res, next) => {
  if (!req.isLoggedIn || !req.user) {
    return res.redirect("/login");
  }

  Booking.find({ guest: req.user._id })
    .populate("home")
    .sort({ createdAt: -1 })
    .then((bookings) => {
      const flashSuccess = req.session.flashSuccess || null;
      const flashError   = req.session.flashError   || null;
      delete req.session.flashSuccess;
      delete req.session.flashError;

      res.render("store/bookings", {
        bookings,
        pageTitle: "My Bookings",
        currentPage: "bookings",
        isLoggedIn: req.isLoggedIn,
        user: req.user,
        flashSuccess,
        flashError,
      });
    })
    .catch(next);
};

exports.postCancelBooking = (req, res, next) => {
  if (!req.isLoggedIn || !req.user) {
    return res.redirect("/login");
  }

  const bookingId = req.params.bookingId;

  Booking.findOne({ _id: bookingId, guest: req.user._id })
    .then((booking) => {
      if (!booking) {
        req.session.flashError = "Booking not found.";
        return res.redirect("/bookings");
      }

      if (booking.status === "cancelled") {
        req.session.flashError = "Booking is already cancelled.";
        return res.redirect("/bookings");
      }

      booking.status = "cancelled";
      return booking.save().then(() => {
        req.session.flashSuccess = "Booking cancelled successfully.";
        res.redirect("/bookings");
      });
    })
    .catch(next);
};

exports.getHostBookings = (req, res, next) => {
  Home.find({ host: req.user._id })
    .then((hostHomes) => {
      const hostHomeIds = hostHomes.map((h) => h._id);

      if (hostHomeIds.length === 0) {
        return res.render("host/host-bookings", {
          bookings: [],
          pageTitle: "Guest Bookings",
          currentPage: "host-bookings",
          isLoggedIn: req.isLoggedIn,
          user: req.user,
        });
      }

      return Booking.find({ home: { $in: hostHomeIds } })
        .populate("home")
        .populate("guest", "firstName lastName email")
        .sort({ createdAt: -1 })
        .then((bookings) => {
          res.render("host/host-bookings", {
            bookings,
            pageTitle: "Guest Bookings",
            currentPage: "host-bookings",
            isLoggedIn: req.isLoggedIn,
            user: req.user,
          });
        });
    })
    .catch(next);
};


exports.postUpdateBookingStatus = (req, res, next) => {
  const { bookingId, status } = req.body;
  const allowed = ["confirmed", "cancelled"];

  if (!allowed.includes(status)) {
    return res.redirect("/host/bookings");
  }

  Booking.findByIdAndUpdate(bookingId, { status })
    .then(() => res.redirect("/host/bookings"))
    .catch(next);
};
