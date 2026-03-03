const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const session = require('express-session');
const path= require("path");
const flash= require("connect-flash");

// const cookieParser = require('cookie-parser');

// app.use(cookieParser("secretcode"));

app.listen(3000, () => {
    console.log("Server is listening to port 3000");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOptions= {
    secret: "mysecretkey", 
    resave: false, 
    saveUninitialized: true 
}

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next)=>{
    res.locals.successMsg= req.flash("success");
    res.locals.errorMsg= req.flash("error");
    next();
})

app.get("/", (req, res) => {
    res.send("Hi! I am root");
    console.log(req.cookies);
});

app.get("/register", (req, res)=>{
    let {name= "anonymous"}= req.query;
    req.session.name= name;
    if(name === "anonymous"){
        req.flash("error", "User not registered!");
    } else{
        req.flash("success", "User registered successfully!");
    }
    res.redirect('/hello');
});

app.get("/hello", (req, res) => {
    res.render("page.ejs", {name: req.session.name});
});

app.get("/test", (req, res) => {
    res.send("Test successful");
});

app.get("/reqcount", (req, res)=>{
    if(req.session.count){
        req.session.count++;
    } else{
        req.session.count=  1;
    }
    res.send(`You sent request ${req.session.count} times`);
});

// app.get("/getsignedcookie", (req, res)=>{
//     res.cookie("made-in", "India", {signed: true});
//     res.cookie("made-by", "America", {signed: true});
//     res.send("Cookie sent");
// });

// app.get("/verify", (req, res)=>{
//     console.log(req.signedCookies);
//     res.send("verified");
// });

// app.get("/getcookie", (req, res)=>{
//     res.cookie("greet", "hello");
//     res.cookie("MadeIn", "India");
//     res.send("Sent you some cookie!")
// });

// app.get("/greet", (req, res)=>{
//     let {name= "anonymous"}= req.cookies;
//     res.send(`Hi, ${name}`);
// })

// app.use("/users", users);

// app.use("/posts", posts);