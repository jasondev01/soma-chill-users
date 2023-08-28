const popularModel = require("../Models/popularModel"); 
const axios = require('axios');
const cron = require('node-cron');

const fetchAndUpdate = async () => {
    const baseUrl = process.env.ANIME_URL;
    try {
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

        console.log('Popular Data updated successfully.');
    } catch (error) {
        console.log('Error updating data:', error);
    }
};

// fetch every 1hour
cron.schedule('0 */1 * * *', () => {
    fetchAndUpdate();
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