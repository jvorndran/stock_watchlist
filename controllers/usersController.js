const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// Encrypts Passwords
const bcrypt = require('bcrypt');


// @desc Get all users
// @route GET /users
// @access Private

const getAllUsers = asyncHandler(async (req, res) => {
    // .lean() gives us minimal data like a JSON
    const users = await User.find().select('-password').lean();

    if (!users){
        return res.status(400).json({message: 'No users found'})
    }
    res.json(users)
})

// @desc create new user
// @route POST /users
// @access Private

const createNewUser = asyncHandler(async (req, res) => {
    const { name, username, password } = req.body

    //confirm data
    if (!username || !password){
        return res.status(400).json({message: 'All fields are required'})
    }

    //check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate){
        return res.status(409).json({message: 'Duplicate username'})
    }


    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = { name, username, "password": hashedPwd, watchlist: []}

    const user = await User.create(userObject)

    if (user){
        res.status(201).json({message: `New user ${username} created`})
    }
    else {
        res.status(400).json({message: 'Invalid user data received'})
    }

})

// @desc update a user
// @route PATCH /users
// @access Private

const updateUser = asyncHandler(async (req, res) => {
    const { username } = req.body;
    const { ticker } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user){
            return res.status(404).json({ message: "User not found"});
        }

        user.watchlist.push(ticker);

        await user.save();

        res.status(200).json({message: `Tickers added to user ${username}`});
    } catch (err){
        res.status(500).json({message: `Error updating user ${username}`, err});
    }

});

// @desc delete a user
// @route DELETE /users
// @access Private

const deleteUser = asyncHandler(async (req, res) => {

})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}


