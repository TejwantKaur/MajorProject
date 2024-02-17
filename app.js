const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
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

const sessionOptions = {
    secret: "mySuperSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

app.get("/", (req,res) => {
    res.send("Hi i am root");
}); 

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews)

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