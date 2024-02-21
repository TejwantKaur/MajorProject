const express = require("express");
const router = express.Router({ mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Listing = require("../models/listings.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// Post
// Review Route
router.post("/",
    isLoggedIn,
    validateReview,

    wrapAsync(async(req,res)=>{
        console.log(req.body)
        
        let listing = await Listing.findById(req.params.id);
        
        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        console.log(newReview);
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();
        console.log("new Review Saved");
        req.flash("success", "newReview Posted!");
        // console.log(listing.reviews)
        // res.send("Saved!!")
        res.redirect(`/listings/${ listing._id }`);
    }),
); 


// Delete Review Route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(async(req,res)=>{
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id,{ 
            $pull: {
                reviews: reviewId
            }});
        
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Listing Deleted!");
        res.redirect(`/listings/${id}`);
    }),
);

module.exports = router;