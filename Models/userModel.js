const mongoose = require("mongoose");

// schema to save documents

const episodeSchema = new mongoose.Schema({
    id: String,
    number: Number,
    watchedAt: Date,
});

const watchedItemSchema = new mongoose.Schema({
    title: String,
    slug: String,
    image: String,
    episodes: [episodeSchema],
    updatedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

const bookmarkedSchema = new mongoose.Schema({
    title: String,
    slug: String,
    image: String,
    currentEpisode: Number,
})

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 200,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024,
    },
    bookmarked: [bookmarkedSchema],
    watched: [watchedItemSchema],
    profile: {
        image: String,
        wallpaper: String,
        username: String,
        nickname: String,
        toggleNews: Boolean
    },
    username: {
        type: String,
        required: false,
        minlength: 3,
        maxlength: 30,
        unique: true,
    },
    totalWatched: { type: Number, default: null},
}, {
    timestamps: true,
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;