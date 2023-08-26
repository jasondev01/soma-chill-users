const newSeasonModel = require("../Models/newSeasonModel"); 
const axios = require('axios');
const cron = require('node-cron');

const fetchAndUpdate = async () => {
    const baseUrl = process.env.ANIME_URL;
    try {
        // fetch 
        const response = await axios.get(`${baseUrl}/recent?page=1&perPage=100`);

        let newSeasonArray = []
        // Loop through the latest data
        for (const item of response.data.data) {
            const infoResponse = await axios.get(`${baseUrl}/anime/${item.anime.slug}`);
            newSeasonArray.push(infoResponse.data);
        }

        for (const item of newSeasonArray) {
            if (item.countryOfOrigin !== 'CN') {
                const existingAnime = await newSeasonModel.findOne({
                    $or: [
                        { 'slug': item.slug },
                        { 'anilistId': item.anilistId },
                        { 'id': item.id },
                    ],
                });
    
                if (!existingAnime) {
                    await newSeasonModel.create(item); // create a new document if no match is found
                } else {
                    // update the existing document with changes
                    await newSeasonModel.findOneAndUpdate(
                        { _id: existingAnime._id },
                        item,
                        { new: true }
                    );
                }
            }
        }

        console.log('Data updated successfully.');
    } catch (error) {
        console.log('Error updating data:', error);
    }
};

// fetch every 1hours
cron.schedule('0 */1 * * *', () => {
    fetchAndUpdate();
});

const getNewSeason = async (req, res) => {
    try {
        const animes = await newSeasonModel.find(); 
        res.status(200).json(animes);
    } catch(error) {
        console.log(error)
        res.status(500).json(error); 
    }
}

module.exports = { 
    fetchAndUpdate,
    getNewSeason
};