const newSeasonModel = require("../Models/newSeasonModel"); 
const infoModel = require("../Models/infoModel")
const axios = require('axios');
const cron = require('node-cron');

const fetchAndUpdate = async (req, res) => {
    const baseUrl = process.env.ANIME_URL;
    const { admin } = req.body;
    if ( admin !== process.env.ADMIN_EMAIL && admin !== process.env.SUB_EMAIL) return res.status(500).json('Unauthorized');
    try {
        // fetch 
        const response = await axios.get(`${baseUrl}/recent?page=1&perPage=100`);

        let newSeasonArray = []
        // loop through the latest data
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

                const existingAnimeInfo = await infoModel.findOne({
                    $or: [
                        { 'slug': item.slug },
                        { 'anilistId': item.anilistId },
                        { 'id': item.id },
                    ],
                })

                if (!existingAnime || !existingAnimeInfo) {
                    await infoModel.create(item)
                    await newSeasonModel.create(item); // create a new document if no match is found
                } else {
                    // update the existing document with changes
                    await infoModel.findByIdAndUpdate(
                        { _id: existingAnimeInfo._id },
                        item,
                        { new: true }
                    )

                    await newSeasonModel.findOneAndUpdate(
                        { _id: existingAnime._id },
                        item,
                        { new: true }
                    );
                }
            }
        }
        res.status(200).json("Updated")
        console.log('New Season Data updated successfully.');
    } catch (error) {
        console.log('Error updating data:', error);
    }
};

// fetch every 2hours
cron.schedule('20 */2 * * *', () => {
    fetchAndUpdate();
});

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

module.exports = { 
    fetchAndUpdate,
    getNewSeason
};