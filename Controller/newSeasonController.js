const newSeasonModel = require("../Models/newSeasonModel"); 
const infoModel = require("../Models/infoModel")
const axios = require('axios');
const cron = require('node-cron');
const latestModel = require("../Models/latestModel");
require("dotenv").config(); 

const fetchSeasonAndUpdate = async (req, res) => {
    const baseUrl = process.env.ANIME_URL;
    // console.log(baseUrl)
    try {
        // console.log('New Season Updating..')
        // fetch 
        const response = await latestModel.find();
        
        for (const item of response) {
            const info = await axios.get(`${baseUrl}/anime/${item.anime.slug}`);

            if (info.data.countryOfOrigin !== 'CN') {
                const existingAnime = await newSeasonModel.findOne({
                    $or: [
                        { 'slug': info.data.slug },
                        { 'anilistId': info.data.anilistId },
                        { 'id': info.data.id },
                    ],
                });

                const existingAnimeInfo = await infoModel.findOne({
                    $or: [
                        { 'slug': info.data.slug },
                        { 'anilistId': info.data.anilistId },
                        { 'id': info.data.id },
                    ],
                })

                if (!existingAnime || !existingAnimeInfo) {
                    await newSeasonModel.create(info.data); // create a new document if no match is found
                    await infoModel.create(info.data)
                } else {
                    // update the existing document with changes
                    await newSeasonModel.findOneAndUpdate(
                        { _id: existingAnime._id },
                        info.data,
                        { new: true }
                    );

                    await infoModel.findByIdAndUpdate(
                        { _id: existingAnimeInfo._id },
                        info.data,
                        { new: true }
                    )
                }
            }
        }

        res.status(200).json("Updated")
        console.log('New Season Data updated successfully.');
    } catch (error) {
        // res.status(500).json("An error occured while updating, please try again later.")
        console.log('Error updating data:', error);
    }
};

const updateOneItem = async (req, res) => {
    const baseUrl = process.env.ANIME_URL;
    const { slug } = req.body;
    try {
        const info = await axios.get(`${baseUrl}/anime/${slug}`);
        const existingAnime = await newSeasonModel.findOne({ 'slug': info.data.slug });
        const existingAnimeInfo = await infoModel.findOne({ 'slug': info.data.slug });

        if (!existingAnime || !existingAnimeInfo) {
            await newSeasonModel.create(info.data); 
            await infoModel.create(info.data)
        } else {
            await newSeasonModel.findOneAndUpdate(
                { _id: existingAnime._id },
                info.data,
                { new: true }
            );

            await infoModel.findByIdAndUpdate(
                { _id: existingAnimeInfo._id },
                info.data,
                { new: true }
            )
        }
        res.status(200).json({ 
            message: 'Anime item updated successfully', 
        });
    } catch (error) {
        console.log('updateOneItem', error)
        res.status(500).json({ error: 'An error occurred' });
    }
}

const getNewSeason = async (req, res) => {
    const { restSecret } = req.body;
    if (restSecret !== process.env.REST_SECRET) return res.status(500).json({ 'message': 'Unauthorized' });
    try {
        const animes = await newSeasonModel.find(); 
        if (animes.length === 0) return res.status(200).json({ data:[] })
        res.status(200).json({
            status: 200,
            data: animes
        });
    } catch(error) {
        console.log(error)
        console.log(error)
        res.status(500).json({
            status: 500,
            message: 'An error occured while retrieving data' 
        }); 
    }
}

// fetch every 2hours
// cron.schedule('10 */2 * * *', () => {
//     fetchAndUpdate();
// });

module.exports = { 
    fetchSeasonAndUpdate,
    getNewSeason,
    updateOneItem,
};