const express = require("express");

const storeRouter = express.Router();

const storeController = require("../controllers/storeController");
const bookingController = require("../controllers/bookingController");

storeRouter.get('/' , storeController.getIndex);
storeRouter.get('/homes' , storeController.getHomes);
storeRouter.get('/bookings' , bookingController.getGuestBookings);
storeRouter.get('/favourites' , storeController.getFavouriteList);

storeRouter.get('/homes/:homeId' , storeController.getHomeDetails);
storeRouter.post('/favourites' , storeController.postAddToFavourite);
storeRouter.post('/favourites/delete/:homeId' , storeController.postRemoveFavourite);


storeRouter.post('/bookings' , bookingController.postCreateBooking);
storeRouter.post('/bookings/cancel/:bookingId' , bookingController.postCancelBooking);

module.exports = storeRouter;
