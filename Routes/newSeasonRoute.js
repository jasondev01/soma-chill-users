const express = require("express");
const { 
    fetchSeasonAndUpdate,
    getNewSeason,
    updateOneItem,
} = require("../Controller/newSeasonController")

const router = express.Router();

router.get("/update-newseason", fetchSeasonAndUpdate);
router.post("/update-newseason-one", updateOneItem);
router.post("/new-season", getNewSeason);

module.exports = router;