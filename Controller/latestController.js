const latestModel = require("../Models/latestModel"); 
const axios = require('axios');
const cron = require('node-cron')

const fetchAndUpdate = async (req, res) => {
    const baseUrl = process.env.ANIME_URL;
    // const { admin } = req.body;
    try {
        // if ( admin !== process.env.ADMIN_EMAIL && admin !== process.env.SUB_EMAIL) return res.status(500).json('Unauthorized');
        const response = await axios.get(`${baseUrl}/recent?page=1&perPage=100`);
        const latestArray = response.data.data;

        latestArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        for (const animeData of latestArray) {
            if (animeData.anime.countryOfOrigin !== 'CN') {
                const existingAnime = await latestModel.findOne({ 'animeId': animeData.animeId });
    
                if (!existingAnime) {
                    await latestModel.create(animeData); 
                } else {
                    await latestModel.findOneAndUpdate(
                        { _id: existingAnime._id },
                        animeData,
                        { new: true }
                    );
                }
            }
        }
        res.status(200).json("Updated")
        console.log('Latest Updated')
    } catch (error) {
        // res.status(500).json("An error occured while updating, please try again later.")
        console.log('Error updating data:', error);
    }
};

const fetchAndUpdateServer = async () => {
    const baseUrl = process.env.ANIME_URL;
    try {
        const response = await axios.get(`${baseUrl}/recent?page=1&perPage=100`);
        const latestArray = response.data.data;

        const sortLatest = [...latestArray].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        for (const animeData of sortLatest) {
            if (animeData.anime.countryOfOrigin !== 'CN') {
                const existingAnime = await latestModel.findOne({
                    $or: [
                        { 'anime.slug': animeData.anime.slug },
                        { 'anime.anilistId': animeData.anime.anilistId },
                        { 'anime.id': animeData.anime.id },
                        { 'animeId': animeData.animeId },
                    ],
                });
    
                if (!existingAnime) {
                    await latestModel.create(animeData); 
                } else {
                    await latestModel.findOneAndUpdate(
                        { _id: existingAnime._id },
                        animeData,
                        { new: true }
                    );
                }
            }
        }
        console.log('Latest Updated')
    } catch (error) {
        console.log('Error updating data:', error);
    }
};

// fetch every 1hour
cron.schedule('0 */1 * * *', () => {
    fetchAndUpdateServer();
});

const getLatest = async (req, res) => {
    const { restSecret } = req.body;
    if (restSecret !== process.env.REST_SECRET) return res.status(500).json({ 'message': 'Unauthorized' });
    try {
        const animes = await latestModel.find();
        if (animes.length === 0) return res.status(200).json({ data:[] })

        const sortDesc = [...animes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        res.status(200).json({
            status: 200,
            data: sortDesc
        });

    } catch(error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: 'An error occured while retrieving data'
        }); 
    }
}

module.exports = { 
    fetchAndUpdate,
    getLatest
};