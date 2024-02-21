mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listings.js");

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

const initDb = async()=>{
    await listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
        ...obj,
        owner:"65d19fa954f7e775c51a41f4",
    }));
    await listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDb();