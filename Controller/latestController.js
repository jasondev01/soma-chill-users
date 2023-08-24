const latestModel = require("../Models/latestModel"); 
const axios = require('axios');
const cron = require('node-cron');

const fetchAndUpdate = async () => {
    const baseUrl = process.env.ANIME_URL;
    try {
        // fetch
        const response = await axios.get(`${baseUrl}/recent?page=1&perPage=30`);
        console.log(response.data.data)

        // loop through the data and update/create instances in the database
        for (const animeData of response.data.data) {
            const existingAnime = await latestModel.findOne({
                $or: [
                    { 'anime.slug': animeData.anime.slug },
                    { 'anime.anilistId': animeData.anime.anilistId },
                    { 'anime.id': animeData.anime.id },
                    { 'animeId': animeData.animeId },
                ],
            });

            if (!existingAnime) {
                await latestModel.create(animeData); // create a new document if no match is found
            } else {
                // update the existing document with changes
                await latestModel.findOneAndUpdate(
                    { _id: existingAnime._id },
                    animeData,
                    { new: true }
                );
            }
        }

        console.log('Latest Data updated successfully.');
    } catch (error) {
        console.log('Error updating data:', error);
    }
};

// fetch every hour
cron.schedule('0 */1 * * *', () => {
    fetchAndUpdate();
});

const getLatest = async (req, res) => {
    try {
        const animes = await latestModel.find();
        res.status(200).json(animes);
    } catch(error) {
        console.log(error)
        res.status(500).json(error); 
    }
}

module.exports = { 
    fetchAndUpdate,
    getLatest
};