const popularModel = require("../Models/popularModel"); 
const axios = require('axios');
const cron = require('node-cron');

const fetchAndUpdate = async (req, res) => {
    const baseUrl = process.env.ANIME_URL;
    // const { admin } = req.body;
    try {
        // if ( admin !== process.env.ADMIN_EMAIL && admin !== process.env.SUB_EMAIL) return res.status(500).json('Unauthorized');
        console.log('Popular Updating..')
        // fetch
        const response = await axios.get(`${baseUrl}/popular?page=1&perPage=30`);

        // loop through the data and update/create instances in the database
        for (const animeData of response.data.data) {
            const existingAnime = await popularModel.findOne({
                $or: [
                    { 'slug': animeData.slug },
                    { 'anilistId': animeData.anilistId },
                    { 'id': animeData.id },
                ],
            });

            if (!existingAnime) {
                // create a new document if no match is found
                await popularModel.create(animeData);
            } else {
                // update the existing document with changes
                await popularModel.findOneAndUpdate(
                    { _id: existingAnime._id },
                    animeData,
                    { new: true }
                );
            }
        }
        res.status(200).json("Updated");
        console.log('Popular Data updated successfully.');
    } catch (error) {
        // res.status(500).json("An error occured while updating, please try again later.")
        console.log('Error updating data:', error);
    }
};

const fetchAndUpdateServer = async () => {
    const baseUrl = process.env.ANIME_URL;
    try {
        const response = await axios.get(`${baseUrl}/popular?page=1&perPage=30`);

        for (const animeData of response.data.data) {
            const existingAnime = await popularModel.findOne({
                $or: [
                    { 'slug': animeData.slug },
                    { 'anilistId': animeData.anilistId },
                    { 'id': animeData.id },
                ],
            });

            if (!existingAnime) {
                await popularModel.create(animeData);
            } else {
                await popularModel.findOneAndUpdate(
                    { _id: existingAnime._id },
                    animeData,
                    { new: true }
                );
            }
        }
        console.log('Popular Data updated successfully.');
    } catch (error) {
        console.log('Error updating data:', error);
    }
};

// fetch every 1hour
cron.schedule('1 */1 * * *', () => {
    fetchAndUpdateServer();
});

const getPopular = async (req, res) => {
    const { restSecret } = req.body;
    if (restSecret !== process.env.REST_SECRET) return res.status(500).json({ 'message': 'Unauthorized' });
    try {
        const animes = await popularModel.find(); 
        res.status(200).json(animes);
    } catch(error) {
        console.log(error)
        res.status(500).json(error); 
    }
}

module.exports = { 
    fetchAndUpdate,
    getPopular
};