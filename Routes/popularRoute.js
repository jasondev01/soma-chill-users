const express = require("express");
const { 
    fetchAndUpdate,
    getPopular,
} = require("../Controller/popularController")

const router = express.Router();

router.post("/update-popular", fetchAndUpdate);
router.post("/popular", getPopular);

module.exports = router;