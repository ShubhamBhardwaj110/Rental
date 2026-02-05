const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn,isReviewAuthor  } = require("../middleware.js");
const review = require("../models/review.js");
const reviewControllers = require("../controllers/review.js");

//Reviews for listing
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewControllers.createReview));

//Edit review route - PUT must come before DELETE to avoid conflicts
router.put("/:reviewId",isLoggedIn,isReviewAuthor,validateReview,wrapAsync(reviewControllers.updateReview));

//delete Review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewControllers.destroyReview));

module.exports = router;