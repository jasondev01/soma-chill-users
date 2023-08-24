const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
    airedAt: Date,
    createdAt: Date,
    description: String,
    id: String,
    image: String,
    number: Number,
    sources: [
        {
            id: String,
            target: String,
        },
    ],
    title: String,
  });
  
const titleSchema = new mongoose.Schema({
    native: String,
    romaji: String,
    english: String,
    userPreferred: String,
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
    season: String,
    slug: String,
    status: String,
    title: titleSchema,
    year: Number,
});
  
const heroModel = mongoose.model('Hero', animeSchema);

module.exports = heroModel;