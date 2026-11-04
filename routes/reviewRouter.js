
const express = require("express");
const reviewController = require("../controllers/reviewController");

const reviewRouter = express.Router();


reviewRouter.post("/:homeId",reviewController.postAddReview);
reviewRouter.post("/delete/:reviewId",reviewController.postDeleteReview);

module.exports = reviewRouter;
