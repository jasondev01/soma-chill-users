const express = require("express");
const { 
    fetchInfoOrUpdate,
} = require("../Controller/infoController")

const router = express.Router();

router.post("/info", fetchInfoOrUpdate);

module.exports = router;