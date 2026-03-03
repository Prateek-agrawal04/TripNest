const express= require("express");
const router= express.Router();

// Users
// Index Users
router.get("/", (req, res)=>{
    res.send("INDEX GET User Route");
});

// Show User
router.get("/:id", (req, res)=>{
    res.send("GET for show user id");
});

// Post Users
router.post("/", (req, res)=>{
    res.send("POST for users");
});

// Delete User
router.delete("/:id", (req, res)=>{
    res.send("DELETE for user id");
});

module.exports= router;