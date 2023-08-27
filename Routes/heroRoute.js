const express = require("express");
const { 
    fetchAndUpdate,
    getHero,
} = require("../Controller/heroController")

const router = express.Router();

router.get("/", fetchAndUpdate);
router.post("/hero", getHero);

module.exports = router;