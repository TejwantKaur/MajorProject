const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("..//middleware.js");

const Listing = require("../models/listings.js");
const lisitngController = require("../controllers/listing.js")

// Index Route
router.get("/", wrapAsync(lisitngController.index));

// new route
router.get("/new", 
    isLoggedIn,
    lisitngController.renderNewForm
);

// Show Route
router.get("/:id", wrapAsync(lisitngController.showListing));

// Create Route
router.post("/",
    isLoggedIn,
    validateListing,
    wrapAsync(lisitngController.createListing)
);

// Edit route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(lisitngController.renderEditForm)
);

// Update Route
router.put("/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(lisitngController.editListing),
);

// Delete Route
router.delete("/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(lisitngController.destroyListing)
);

module.exports = router;