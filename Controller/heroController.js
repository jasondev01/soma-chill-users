const heroModel = require("../Models/heroModel"); 
const axios = require('axios');
const cron = require('node-cron');
const infoModel = require("../Models/infoModel");

const fetchAndUpdate = async (req, res) => {
    const baseUrl = process.env.ANIME_URL;
    try {
        const response = await axios.get(`${baseUrl}/popular?page=1&perPage=10`);
        const popularData = response.data.data;

        let heroArray = []
        for (const animeData of popularData) {
            const infoResponse = await axios.get(`${baseUrl}/anime/${animeData.slug}`);
            heroArray.push(infoResponse.data);
        }

        await Promise.all(heroArray.map(async (item) => {
            const existingHero = await heroModel.findOne({ 'slug': item.slug });

            if (!existingHero) {
                await heroModel.create(item);
            } else {
                await heroModel.findOneAndUpdate(
                    { _id: existingHero._id },
                    item,
                    { new: true }
                );
            }
        }));
        res.status(200).json("Updated")

        await Promise.all(heroArray.map(async (item) => {
            const existingAnimeInfo = await infoModel.findOne({ 'slug': item.slug });

            if (!existingAnimeInfo) {
                await infoModel.create(item);
            } else {
                await infoModel.findByIdAndUpdate(
                    { _id: existingAnimeInfo._id },
                    item,
                    { new: true }
                );
            }
        }));
        
        console.log('Hero Data updated successfully.');
    } catch (error) {
        // res.status(500).json("An error occured while updating, please try again later.")
        console.log('Error updating data:', error);
    }
};

const fetchAndUpdateServer = async () => {
    const baseUrl = process.env.ANIME_URL;
    try {
        const response = await axios.get(`${baseUrl}/popular?page=1&perPage=15`);
        const popularData = response.data.data;

        let heroArray = []
        for (const animeData of popularData) {
            const infoResponse = await axios.get(`${baseUrl}/anime/${animeData.slug}`);
            heroArray.push(infoResponse.data);
        }

        for (const item of heroArray) {
            const existingAnime = await heroModel.findOne({
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
                await heroModel.create(item); 
            } else {
                await heroModel.findOneAndUpdate(
                    { _id: existingAnime._id },
                    item,
                    { new: true }
                );

                await infoModel.findByIdAndUpdate(
                    { _id: existingAnimeInfo._id },
                    item,
                    { new: true }
                )
            }
        }
        console.log('Hero Data updated successfully.');
    } catch (error) {
        console.log('Error updating data:', error);
    }
};

// fetch every 1.5hours
cron.schedule('30 */1 * * *', () => {
    fetchAndUpdateServer();
});

const getHero = async (req, res) => {
    const { restSecret } = req.body;
    if (restSecret !== process.env.REST_SECRET) return res.status(500).json({ 'message': 'Unauthorized' });
    try {
        const animes = await heroModel.find(); 
        if (animes.length === 0) return res.status(200).json({ data:[] })

        res.status(200).json({
            status: 200,
            data: animes
        });
    } catch(error) {
        console.log(error)
        res.status(500).json(error); 
    }
}

module.exports = { 
    fetchAndUpdate,
    getHero
};