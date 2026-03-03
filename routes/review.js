const express= require("express");
const router= express.Router({mergeParams: true});
const Listing= require("../models/listings.js");
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError= require("../utils/ExpressError.js");
const {reviewSchema}= require("../schema.js");
const Review= require("../models/review.js");

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

// Reviews Post Route
router.post("/",validateReview, wrapAsync(async(req, res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("New review Saved");
    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${listing._id}`);
}));

// Review Delete Route
router.delete("/:reviewId", wrapAsync(async(req, res)=>{
    let {id, reviewId}= req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports= router;