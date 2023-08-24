const express = require("express");
const { 
    fetchAndUpdate,
    getPopular,
} = require("../Controller/popularController")

const router = express.Router();

router.get("/", fetchAndUpdate);
router.get("/popular", getPopular);

module.exports = router;