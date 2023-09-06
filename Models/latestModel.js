const mongoose = require('mongoose');

// Define the Episode Source Schema
const episodeSourceSchema = new mongoose.Schema({
    id: String,
    priority: Number,
    subtitle: Boolean,
    url: String,
    website: String,
});

// Define the Main Schema
const dataSchema = new mongoose.Schema({
    airedAt: Date,
    createdAt: Date,
    updatedAt: Date,
    anime: {
        anilistId: Number,
        averageScore: Number,
        countryOfOrigin: String,
        coverImage: String,
        currentEpisode: Number,
        description: String,
        genre: [String],
        id: String,
        next: String,
        popularity: Number,
        season: String,
        seasonInt: Number,
        slug: String,
        status: String,
        synonyms: [String],
        title: {
            english: String,
            native: String,
            romaji: String,
            userPreferred: String,
        },
        year: Number,
    },
    animeId: String,
    id: String,
    image: String,
    number: Number,
    sources: [episodeSourceSchema],
});

// Create the model
const latestModel = mongoose.model('Latest', dataSchema);

module.exports = latestModel;