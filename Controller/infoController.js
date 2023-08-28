const infoModel = require("../Models/infoModel"); 
const axios = require('axios');

const fetchInfoOrUpdate = async (req, res) => {
    const baseUrl = process.env.ANIME_URL;
    const { slug } = req.body;
    try {
        const existingAnime = await infoModel.findOne({ slug });

        if (!existingAnime) {
            const response = await axios.get(`${baseUrl}/anime/${slug}`);

            const createDocument = await infoModel.create(response.data);
            console.log('Info Data created successfully')
            res.status(200).json(createDocument);
        } else {
            const existingAnime = await infoModel.findOne({ slug });
            res.status(200).json({ data: existingAnime});

            const response = await axios.get(`${baseUrl}/anime/${slug}`);
            await infoModel.findOneAndUpdate(
                { 'slug': slug }, // find by using slug
                response.data, // data
                { new: true }
            );

            console.log('Info Data updated sucessfully')

        }
    } catch (error) {
        console.log('Error updating data: Error');
    }
};

module.exports = { 
    fetchInfoOrUpdate
};