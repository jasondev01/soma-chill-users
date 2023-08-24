const mongoose = require('mongoose');

const titleSchema = new mongoose.Schema({
    english: String,
    native: String,
    romaji: String,
    userPreferred: String,
});

const animeSchema = new mongoose.Schema({
    anilistId: Number,
    averageScore: Number,
    countryOfOrigin: String,
    coverImage: String,
    currentEpisode: Number,
    description: String,
    format: String,
    id: String,
    slug: String,
    title: titleSchema,
    year: Number,
});

const popularModel = mongoose.model('Popular', animeSchema);

module.exports = popularModel;