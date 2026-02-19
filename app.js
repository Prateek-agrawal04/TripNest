const express= require("express");
const app= express();
const mongoose= require("mongoose");
const Listing= require("./models/listings.js")
const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const {listingSchema, reviewSchema}= require("./schema.js");
const Review= require("./models/review.js");

const MONGO_URL= 'mongodb://127.0.0.1:27017/wanderlust';

async function main(){
    await mongoose.connect(MONGO_URL);
}

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
});

const validateListing= (req, res, next)=>{
    const {error}= listingSchema.validate(req.body);
    console.log(error);
        if(error){
            let errMsg= error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400, errMsg);
        }
        else{
            next();
        }
}

const validateReview= (req, res, next)=>{
    const {error}= reviewSchema.validate(req.body);
    console.log(error);
        if(error){
            let errMsg= error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400, errMsg);
        }
        else{
            next();
        }
}

app.get('/', (req, res)=>{
    res.send("Hi I am root");
});

// Index Route
app.get("/listings", wrapAsync(async (req, res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index", {allListings});
}));

// Show Route
app.get("/listings/:id", wrapAsync(async (req, res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id).populate("reviews");
    res.render("listings/show", {listing});
}));

// New Route
app.get("/listing/new", (req, res)=>{
    res.render("listings/new");
})

// Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res, next)=>{
        
        const newListing= new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    res.render("listings/edit", {listing});
}));

// Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    }
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listing/:id", wrapAsync(async (req, res)=>{
    let {id}= req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// Reviews Post Route
app.post("/listings/:id/reviews",validateReview, wrapAsync(async(req, res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("New review Saved");
    res.redirect(`/listings/${listing._id}`);
}));

// Review Delete Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res)=>{
    let {id, reviewId}= req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

// Page not found
app.all(/.*/, (req, res, next)=>{
    next(new ExpressError(404, "Page not found!"));
});

// Error Handling Middleware
app.use((err, req, res, next)=>{
    let {status= 500, message= "Something went wrong!"}= err;
    res.status(status).render("listings/error", {message});
    // res.status(status).send(message);
});

// app.get("/testListing", async (req, res)=>{
//     const sampleListing= new Listing({
//         title: "My New Villa",
//         description: "By the Beach",
//         price: 1200,
//         location: "Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Testing Done");
// })