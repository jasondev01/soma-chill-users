const mongoose = require('mongoose');
  
const titleSchema = new mongoose.Schema({
    native: String,
    romaji: String,
    english: String,
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
    genre: [String],
    id: String,
    next: Date,
    season: String,
    slug: String,
    status: String,
    title: titleSchema,
    year: Number,
});
  
const newSeasonModel = mongoose.model('NewSeason', animeSchema);

module.exports = newSeasonModel;