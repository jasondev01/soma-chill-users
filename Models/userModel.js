const mongoose = require("mongoose");

// schema to save documents
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
    bookmarked: {
        type: [{
            title: String,
            slug: String,
            image: String,
            currentEpisode: Number,
        }],
        default: [],
    },
    watched: {
        type: [{
            title: String,
            slug: String,
            image: String,
            episodes: [{
                id: String,
                number: Number
            }]
        }],
        default: []
    },
    profile: {
        type: {
            image: String,
            wallpaper: String,
            username: String,
            nickname: String,
            toggleNews: Boolean
        }
    }
}, {
    timestamps: true,
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;