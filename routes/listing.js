const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn,isOwner,validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('listing[image]'),  wrapAsync(listingController.createListing));



//New route 
router.get("/new", isLoggedIn,listingController.renderNewForm); //This must stay above the show route, otherwise it will think "new" is an id
//index route 
router.route("/:id")
//Update Route
.put(isLoggedIn, isOwner,upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
//show route
.get(wrapAsync(listingController.showListing))
//Delete route
.delete(isLoggedIn,  isOwner, wrapAsync(listingController.destroyListing));

//edit Route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.editForm));


module.exports =router;