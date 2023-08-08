const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY; // access the jwt_secret_key from .env

    return jwt.sign({ _id }, jwtkey, { expiresIn: "3days" })
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await userModel.findOne({email}); // find the same emaill
        
        if(user) {
            return res.status(400).json("User with the given email already exist"); // if email already taken by a user
        }
        if(!name || !email || !password) {
            return res.status(400).json("All fields are requried"); // validates the inputs
        }
        if(!validator.isEmail(email)) {
            return res.status(400).json("Email must be a valid email"); // validates emaill
        }
        if(!validator.isStrongPassword(password)) {
            return res.status(400).json("Password must be a strong password"); // validates emaill
        }
        if (name.length < 3 ) {
            return res.status(400).json("Name must be three characters or longer")
        }
        user = new userModel({name, email, password}); // if the above condition is success, then proceed to post new User

        const salt = await bcrypt.genSalt(10); // makes a hash with 10 letters
        user.password = await bcrypt.hash(user.password, salt); // hashes the password
        await user.save(); // saves the user to the database 

        const token = createToken(user._id); // creates a token
        res.status(200).json({_id: user._id, name, email, token}); 
    } catch(error) {
        console.log(error);
        res.status(500).json(error); // sends error so that the server wont crush
    }
    
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await userModel.findOne({ email }).populate('bookmarked').populate('watched'); // find the email
        if (!user) {
            return res.status(400).json("Invalid email or password"); // checks if there is a user with that email else error
        }
        const isValidPassword = await bcrypt.compare(password, user.password); // making variable to compare the passwords from database and requested
        if (!isValidPassword) {
            return res.status(400).json("Invalid email or password");  // checks if the password is the same as in the database with that email
        }
        const token = createToken(user._id); // creates a jsonwebtoken
        res.status(200).json({_id: user._id, name: user.name, email, bookmarked: user.bookmarked, token});
    } catch(error) {
        console.log(error)
        res.status(500).json(error); // sends error so that the server wont crush
    }
};

const findUser = async (req, res) => {
    const userId = req.params.userId; // paramater from request (get)
    try {
        const user = await userModel.findById(userId).populate('bookmarked').populate('watched'); // finds user by id
        res.status(200).json(user);
    } catch(error) {
        console.log(error)
        res.status(500).json(error); // sends error so that the server wont crush
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await userModel.find(); // gets all the users
        res.status(200).json(users);
    } catch(error) {
        console.log(error)
        res.status(500).json(error); // sends error so that the server wont crush
    }
}

const addBookmark = async (req, res) => {
    const { userId, slug, title, currentEpisode, currentEpisodeId, image } = req.body;
  
    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create a new bookmark object with the provided data
        const newBookmark = {
            slug,
            title,
            image,
            currentEpisode,
        };

        user.bookmarked.push(newBookmark);
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to add bookmark", error });
    }
};
  
const removeBookmark = async (req, res) => {
    const { userId, slug } = req.body; 

    try {
        const user = await userModel.findByIdAndUpdate(
            userId,
            { 
                $pull: { 
                    bookmarked: { slug } 
                } 
            },
            { 
                new: true 
            }
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to remove bookmark", error });
    }
};

const addWatchedItem = async (req, res) => {
    const { userId, watchedItemData } = req.body;

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.watched.push(watchedItemData);
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to add watched item", error });
    }
};

const removeWatchedItem = async (req, res) => {
    const { userId, watchedItemData } = req.body;

    try {
        const user = await userModel.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    watched: watchedItemData
                }
            }, // Remove the watchedItemData from watched array
            {
                new: true
            }
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to remove watched item", error });
    }
};

const addWatchedEpisode = async (req, res) => {
    const { userId, watchedItemId, episodeData } = req.body;

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the watched item by its ID
        const watchedItem = user.watched.find(item => item.id === watchedItemId);

        if (!watchedItem) {
            return res.status(404).json({ message: "Watched item not found" });
        }

        // Update the episodes array of the watched item with the new episode data
        watchedItem.episodes.push(episodeData);

        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to add watched episode", error });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    findUser, 
    getUsers, 
    addBookmark, 
    removeBookmark,
    addWatchedItem,
    removeWatchedItem,
    addWatchedEpisode
};