const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings.js");
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

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
    const listing = await Listing.findById(id); 
    console.log(listing)
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