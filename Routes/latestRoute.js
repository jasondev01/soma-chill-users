const express = require("express");
const { 
    fetchAndUpdate,
    getLatest,
} = require("../Controller/latestController")

const router = express.Router();

router.get("/", fetchAndUpdate);
router.get("/latest", getLatest);

module.exports = router;