const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

const Listing = require("../models/listings.js");

const validateListing = (req,res,next) => {
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
};

// Index Route
router.get(
    "/", 
    wrapAsync( async (req,res,next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

router.get(
    "/new", 
    (req,res)=>{
    res.render("listings/new.ejs");
});

// Create Route
router.post(
    "/",
    validateListing,
    wrapAsync( async (req,res,next) => {
        const newListing = new Listing (req.body.listing);
        await newListing.save();
        req.flash("success")
        res.redirect("/listings");
    })
);

// Show Route
router.get(
    "/:id", 
    wrapAsync( async (req,res,next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews"); 
    // console.log(listing)
    res.render("listings/show.ejs", { listing });
}));

router.get(
    "/:id/edit",
    wrapAsync( async (req,res,next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    res.render("listings/edit.ejs", { listing })
}));

// Update Route
router.put(
    "/:id",
    validateListing,
    wrapAsync( async (req,res,next) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete(
    "/:id",
    wrapAsync( async (req,res,next) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;