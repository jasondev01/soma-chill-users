const express = require("express");
const { 
    fetchAndUpdateAndGet,
} = require("../Controller/infoController")

const router = express.Router();

router.post("/info", fetchAndUpdateAndGet);

module.exports = router;