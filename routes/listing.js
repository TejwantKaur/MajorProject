const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("..//middleware.js");

const Listing = require("../models/listings.js");
const lisitngController = require("../controllers/listing.js");

const multer = require("multer");

const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })

router
    .route("/")
    .get(wrapAsync(lisitngController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(lisitngController.createListing)
    );
    // .post(upload.single('listing[image]'),(req,res)=>{
    //     res.send(req.file);
    // });

// new route
router.get("/new", 
    isLoggedIn,
    lisitngController.renderNewForm
);

router
    .route("/:id")
    .get(wrapAsync(lisitngController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        validateListing,
        wrapAsync(lisitngController.editListing),
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(lisitngController.destroyListing)
    );

router
    .get("/:id/edit",
        isLoggedIn,
        isOwner,
        wrapAsync(lisitngController.renderEditForm)
    );

module.exports = router;