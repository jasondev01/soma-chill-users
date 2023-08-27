const express = require("express");
const { 
    registerUser, 
    loginUser, 
    // findUser, 
    getUsers, 
    addBookmark,
    removeBookmark,
    addWatchedItem,
    removeWatchedItem,
    updateProfile,
    getUsersCount,
    // getCountUsers,
    removeAllWatchedItems,
} = require("../Controller/userController")

// mini app or router
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.get("/find/:userId", findUser);
router.get("/", getUsers);
// router.get("/", getCountUsers); -> simpler
router.post("/add-bookmark", addBookmark); 
router.post("/remove-bookmark", removeBookmark); 
router.post("/add-watched", addWatchedItem); 
router.post("/remove-watched", removeWatchedItem);
router.post("/update-profile", updateProfile); 
router.post("/user-count", getUsersCount);
router.delete("/delete-watched-list", removeAllWatchedItems);

module.exports = router;