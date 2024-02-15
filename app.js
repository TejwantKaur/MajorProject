const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings.js");
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const mongoURL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(()=>{
        console.log("Connected To Db");
    })
    .catch(err=>{
        console.log(err)
    });

async function main(){
    await mongoose.connect(mongoURL);
}

app.get("/", (req,res)=>{
    res.send("Hi i am root");
})   

const validateListing = (req,res,next) => {
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
};
const validateReview = (req,res,next)=>{
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
}

// Index Route
app.get(
    "/listings", 
    wrapAsync(async(req,res,next)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
});

// Create Route
app.post(
    "/listings",
    validateListing,
    wrapAsync(async(req,res,next) => {
        const newListing = new Listing (req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

// Show Route
app.get(
    "/listings/:id", 
    wrapAsync(async(req,res,next)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews"); 
    // console.log(listing)
    res.render("listings/show.ejs", { listing });
}));

app.get(
    "/listings/:id/edit",
    wrapAsync(async (req,res,next)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id)
    res.render("listings/edit.ejs", { listing })
}));

// Update Route
app.put(
    "/listings/:id",
    validateListing,
    wrapAsync(async(req,res,next)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete(
    "/listings/:id",
    wrapAsync(async(req,res,next)=>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// Reviews
// Post Route
app.post("/listings/:id/reviews", 
    validateReview,
    wrapAsync(async(req,res)=>{
        console.log(req.body)
    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.reviews);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log("new Review Saved");
    console.log(listing.reviews)
    // res.send("Saved!!")
    res.redirect(`/listings/${ listing._id }`);
})); 

// for Rest_all
app.all("*", (req,res,next)=>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=>{
    // res.send("Something Wrong!!")
    let { statusCode = 500, message = "Something Wrong!" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{ message });
});

app.listen(8080,()=>{
    console.log("Server running on Port 8080");
});