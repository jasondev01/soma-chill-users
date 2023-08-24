const express = require("express");
const { 
    fetchAndUpdate,
    getHero,
} = require("../Controller/heroController")

const router = express.Router();

router.get("/", fetchAndUpdate);
router.get("/hero", getHero);

module.exports = router;