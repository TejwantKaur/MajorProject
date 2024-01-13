mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");

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
    await listing.insertMany(initData.data);
}

initDb();