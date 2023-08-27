const express = require("express");
const { 
    fetchAndUpdate,
    getNewSeason,
} = require("../Controller/newSeasonController")

const router = express.Router();

router.get("/", fetchAndUpdate);
router.post("/new-season", getNewSeason);

module.exports = router;