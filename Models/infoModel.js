const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
    airedAt: Date,
    description: String,
    id: String,
    image: String,
    number: Number,
    sources: [
        {
            id: String,
            target: String
        }
    ],
    title: String,
});

const relationsSchema = new mongoose.Schema({
    animeId: String,
    id: String,
    type: String,
    anime: {
        id: String,
        slug: String,
        averageScore: Number,
        coverImage: String,
        currentEpisode: Number,
        format: String,
        status: String,
        title: {
            english: String,
            native: String,
            romaji: String,
            userPreferred: String
        },
    }
});

const animeSchema = new mongoose.Schema({
    anilistId: Number,
    averageScore: Number,
    bannerImage: String,
    countryOfOrigin: String,
    coverImage: String,
    currentEpisode: Number,
    description: String,
    episodes: [episodeSchema],
    format: String,
    genre: [String],
    id: String,
    lastEpisodeUpdate: Date,
    next: Date,
    popularity: Number,
    relations: [relationsSchema],
    season: String,
    slug: String,
    status: String,
    synonyms: [String],
    title: {
        english: String,
        native: String,
        romaji: String,
        userPreferred: String
    },
    year: Number,
});

const infoModel = mongoose.model('Info', animeSchema);

module.exports = infoModel;
