const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("..//middleware.js");

const Listing = require("../models/listings.js");

// Index Route
router.get(
    "/", 
    wrapAsync( async (req,res,next) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", {allListings});
    })
);

// new route
router.get(
    "/new", 
    isLoggedIn,
    (req,res)=>{
        res.render("listings/new.ejs");
    }
);

// Create Route
router.post(
    "/",
    isLoggedIn,
    validateListing,
    wrapAsync(async (req,res,next) => {
        const newListing = new Listing (req.body.listing);

        console.log(req.user)
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "newListing Created!");
        res.redirect("/listings");
    })
);

// Show Route
router.get(
    "/:id", 
    wrapAsync( async (req,res,next) => {
        let { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: {
                    path: "author",
                },
            })
            .populate("owner");
            console.log(listing);

        if(!listing){
            console.log(listing)
            req.flash("error", "Listing doesn't exists!");
            res.redirect("/listings");
        }
        res.render("listings/show.ejs", { listing });
    })
);

// Edit route
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req,res,next) => {
        let { id } = req.params;
        const listing = await Listing.findById(id)

        if(!listing){
            req.flash("error", "Listing doesn't exists!");
            res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing })
    })
);

// Update Route
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(async (req,res,next) => {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, {...req.body.listing});
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    }),
);

// Delete Route
router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    wrapAsync( async (req,res,next) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    })
);

module.exports = router;