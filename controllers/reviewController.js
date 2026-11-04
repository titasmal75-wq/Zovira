const Review = require("../models/review");
const Home = require("../models/home");

exports.postAddReview = (req, res, next) => {
  const user = req.user || req.session.user;
  const homeId = req.params.homeId;

  if (!user) {
    return res.redirect("/login");
  }

  const { rating, comment } = req.body;
  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    req.session.flashError = "Please select a valid rating between 1 and 5 stars.";
    return res.redirect("/homes/" + homeId);
  }

  if (!comment || !comment.trim()) {
    req.session.flashError = "Review comment cannot be empty.";
    return res.redirect("/homes/" + homeId);
  }

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        req.session.flashError = "Home not found.";
        return res.redirect("/homes");
      }


      return Review.findOne({ homeId, userId: user._id })
        .then((existingReview) => {
          if (existingReview) {
            req.session.flashError = "You have already submitted a review for this property.";
            return res.redirect("/homes/" + homeId);
          }

          const newReview = new Review({
            homeId,
            userId: user._id,
            rating: numericRating,
            comment: comment.trim(),
          });

          return newReview.save()
            .then(() => {
              
              return Review.find({ homeId }).then((allReviews) => {
                const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
                const avgRating = allReviews.length > 0 ? parseFloat((totalRating / allReviews.length).toFixed(1)) : 5;
                home.rating = avgRating;
                return home.save();
              });
            })
            .then(() => {
              req.session.flashSuccess = "Thank you! Your review has been posted.";
              res.redirect("/homes/" + homeId);
            });
        });
    })
    .catch((err) => {
      console.error("Error adding review:", err);
      req.session.flashError = "Something went wrong while posting your review.";
      res.redirect("/homes/" + homeId);
    });
};

exports.postDeleteReview = (req, res, next) => {
  const user = req.user || req.session.user;
  const reviewId = req.params.reviewId;

  if (!user) {
    return res.redirect("/login");
  }

  Review.findOne({ _id: reviewId, userId: user._id })
    .then((review) => {
      if (!review) {
        req.session.flashError = "Review not found or you are not authorized to delete it.";
        return res.redirect("/homes");
      }

      const homeId = review.homeId;

      return Review.findByIdAndDelete(reviewId)
        .then(() => {
          
          return Review.find({ homeId }).then((remainingReviews) => {
            const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = remainingReviews.length > 0 ? parseFloat((totalRating / remainingReviews.length).toFixed(1)) : 5;
            return Home.findByIdAndUpdate(homeId, { rating: avgRating });
          });
        })
        .then(() => {
          req.session.flashSuccess = "Your review was successfully removed.";
          res.redirect("/homes/" + homeId);
        });
    })
    .catch((err) => {
      console.error("Error deleting review:", err);
      next(err);
    });
};
