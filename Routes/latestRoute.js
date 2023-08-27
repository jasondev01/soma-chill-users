const express = require("express");
const { 
    fetchAndUpdate,
    getLatest,
} = require("../Controller/latestController")

const router = express.Router();

router.get("/", fetchAndUpdate);
router.post("/latest", getLatest);

module.exports = router;