const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));

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

// Index Route
app.get("/listing", async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
})

app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
});

// show route
app.get("/listings/:id", async(req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id); 
    console.log(listing)
    res.render("listings/show.ejs", {listing});
});

// Create Route
app.post("/listings",async(req,res)=>{
    // let listing = req.body.listing;
    // console.log(listing);
    // res.send(req.body)
    const newListing = new Listing (req.body.listing);
    await newListing.save();
    res.redirect("/listing");
});
















// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         dexcription: "By the Beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         Country: "India",
//     });

//     await sampleListing.save();
//     console.log("Sample Saved");
//     res.send("Successful");

// });

app.listen(8080, ()=>{
    console.log("Server running on Port 8080");
});