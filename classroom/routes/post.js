const express= require("express");
const router= express.Router();

// Posts
// Index Posts
router.get("/", (req, res)=>{
    res.send("INDEX GET Post Route");
});

// Show Post
router.get("/:id", (req, res)=>{
    res.send("GET for show post id");
});

// Post Posts
router.post("/", (req, res)=>{
    res.send("POST for posts");
});

// Delete Post
router.delete("/:id", (req, res)=>{
    res.send("DELETE for post id");
});

module.exports= router;