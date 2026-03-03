const express= require("express");
const router= express.Router();
const Listing= require("../models/listings.js");
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError= require("../utils/ExpressError.js");
const {listingSchema}= require("../schema.js");

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

// Index Route
router.get("/", wrapAsync(async (req, res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index", {allListings});
}));

// New Route
router.get("/new", (req, res)=>{
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in to create a listing");
        return res.redirect("/login");
    }
    res.render("listings/new");
});

// Show Route
router.get("/:id", wrapAsync(async (req, res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", "Listing Not Found!");
        return res.redirect("/listings");
    }
    res.render("listings/show", {listing});
}));

// Create Route
router.post("/", validateListing, wrapAsync(async (req, res, next)=>{
        
        const newListing= new Listing(req.body.listing);
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
}));

// Edit Route
router.get("/:id/edit", wrapAsync(async (req, res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing Not Found!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", {listing});
}));

// Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    }
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", wrapAsync(async (req, res)=>{
    let {id}= req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports= router;