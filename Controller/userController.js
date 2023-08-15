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
            return res.status(400).json("Password must be 8 characters long, have an uppercase, a number, and a special character"); // validates password
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
        let user = await userModel.findOne({ email }).populate('bookmarked').populate('watched').populate('profile'); // find the email
        if (!user) {
            return res.status(400).json("Invalid email or password"); // checks if there is a user with that email else error
        }
        const isValidPassword = await bcrypt.compare(password, user.password); // making variable to compare the passwords from database and requested
        if (!isValidPassword) {
            return res.status(400).json("Invalid email or password");  // checks if the password is the same as in the database with that email
        }
        const token = createToken(user._id); // creates a jsonwebtoken
        res.status(200).json({_id: user._id, name: user.name, email, bookmarked: user.bookmarked, watched: user.watched, profile: user.profile, token});
    } catch(error) {
        console.log(error)
        res.status(500).json(error); // sends error so that the server wont crush
    }
};

const findUser = async (req, res) => {
    const userId = req.params.userId; // paramater from request (get)
    try {
        const user = await userModel.findById(userId).populate('bookmarked').populate('watched').populate('profile'); // finds user by id
        res.status(200).json(user);
    } catch(error) {
        console.log(error)
        res.status(500).json(error); // sends error so that the server wont crush
    }
}

const getUsers = async (req, res) => {
    const { userId, email, secretKey } = req.body;
    try {
        if (userId !== process.env.ADMIN_ID || email !== process.env.ADMIN_EMAIL || secretKey !== process.env.ADMIN_KEY) {
            return res.status(500).json({
                status: 500, 
                message: 'Unauthorized',
            });
        }
        const users = await userModel.find(); // gets all the users
        res.status(200).json(users);
    } catch(error) {
        console.log(error)
        res.status(500).json(error); // sends error so that the server wont crush
    }
}

const addBookmark = async (req, res) => {
    const { userId, slug, title, currentEpisode, image } = req.body;
  
    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // check if the bookmarked resource belongs to the user
        if (user._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        // create a new bookmark object with the provided data
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
    const { userId, title, slug, image, episodeId, episodeNumber } = req.body;

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // check if naa na sa wathced list
        const existingWatchedItem = user.watched.find(item => item.slug === slug);

        if (existingWatchedItem) {
            // check if ang episode kay existing na
            const existingEpisode = existingWatchedItem.episodes.find(episode => episode.id === episodeId);
            
            if (!existingEpisode) {
                // episode with same id doesn't exist, add it to episodes array
                existingWatchedItem.episodes.push({ 
                    id: episodeId, 
                    number: episodeNumber 
                });
            }
        } else {
            // anime doesn't exist in watched list, create a new watched item
            const newWatchedItem = {
                title,
                slug,
                image,
                episodes: [{ 
                    id: episodeId, 
                    number: episodeNumber 
                }]
            };
            user.watched.push(newWatchedItem);
        }

        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to add watched item", error });
    }
};

const removeWatchedItem = async (req, res) => {
    const { userId, watchedItemId } = req.body;

    try {
        const user = await userModel.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    watched: { _id: watchedItemId }
                }
            },
            {
                new: true
            }
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to remove watched item", error });
    }
};

const updateProfile = async (req, res) => {
    const { userId, image, wallpaper, nickname, username, toggleNews } = req.body;

    try {
        const updatedProfileData = {
            image: image,
            wallpaper: wallpaper,
            nickname: nickname,
            username: username,
            toggleNews: toggleNews
        };

        const user = await userModel.findByIdAndUpdate(
            userId, 
            { 
                $set: { 
                    profile: updatedProfileData 
                } 
            },
            { 
                new: true 
            }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating the profile' });
    }
};

const getUsersCount = async (req, res) => {
    const { userId, email, secretKey } = req.body
    try {
        if (userId !== process.env.ADMIN_ID || email !== process.env.ADMIN_EMAIL || secretKey !== process.env.ADMIN_KEY) {
            return res.status(500).json({
                status: 500, 
                message: 'Unauthorized',
            });
        }

        const count = await userModel.countDocuments();
        return res.status(200).json({
            status: 200,
            message: 'Authorized: Welcome Dev!', 
            count 
    });
    } catch (error) {
        console.error('Error fetching user count:', error);
        return res.status(500).json({ 
            status: 500, 
            message: 'An error occurred while tallying the users',
            error
    });
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
    updateProfile,
    getUsersCount,
};