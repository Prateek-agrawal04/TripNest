const mongoose= require("mongoose");
const initdata= require("./data.js");
const Listing= require("../models/listings.js");

const MONGO_URL= 'mongodb://127.0.0.1:27017/wanderlust';

async function main(){
    await mongoose.connect(MONGO_URL);
}

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
})

const initDB= async ()=>{
    await Listing.deleteMany({});
    initdata.data= initdata.data.map((obj)=> {
        return {...obj, owner: '69a5de486f004b16ea1cc302'}
    });
    await Listing.insertMany(initdata.data);
    console.log("Data was Initialized");
};

initDB();