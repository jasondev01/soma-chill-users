const infoModel = require("../Models/infoModel"); 
const axios = require('axios');

const fetchAndUpdateAndGet = async (req, res) => {
    const baseUrl = process.env.ANIME_URL;
    const { slug } = req.body;
    try {
        const response = await axios.get(`${baseUrl}/anime/${slug}`);
        console.log(response.data)

        const existingAnime = await infoModel.findOne({ 
            $or: [
                { 'slug': response.data.slug },
                { 'id' : response.data.id},
                { 'anilistId': response.data.anilistId },
            ] 
        });
        if (!existingAnime) {
            const createDocument = await infoModel.create(response.data);
            console.log('Document is created successfully')
            return res.status(200).json(createDocument);
        } else {
            const updateDocument = await infoModel.findOneAndUpdate(
                { _id: existingAnime._id },
                response.data,
                { new: true }
            );
            return res.status(200).json({
                'status': 200,
                'data': updateDocument
            });
        }
    } catch (error) {
        console.log('Error updating data:', error);
    }
};

module.exports = { 
    fetchAndUpdateAndGet,
};