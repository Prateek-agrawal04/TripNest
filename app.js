const express= require("express");
const app= express();
const mongoose= require("mongoose");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError= require("./utils/ExpressError.js");
const flash= require("connect-flash");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user.js"); 

const listingRouter= require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter= require("./routes/user.js");
const session = require("express-session");

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

const sessionOptions= {
    secret: "Mysecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7* 24* 60* 60* 1000,
        maxAge: 7* 24* 60* 60* 1000,
        httpOnly: true,
    }
};

app.get('/', (req, res)=>{
    res.send("Hi I am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success= req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.currUser= req.user;
    next();
});

// app.get("/demouser", async (req, res)=> {
//     let fakeUser= new User({
//         email: "student@gmail.com",
//         username: "prat_agrawal",
//     });
//     let registeredUser= await User.register(fakeUser, "1234");
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);

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