const express = require('express');
const router = express.Router();
const User = require("../models/User");
const StockPriceData = require("../models/StockPriceData");
const jwt = require("jsonwebtoken");

router.post('/signup', (req, res) => {
    const { name, username, password } = req.body;

    // Create a new user instance
    const newUser = new User({ name, username, password });

    // Save the user to the database
    newUser
        .save()
        .then(() => {
            res.status(200).json({ message: 'User registered successfully' });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while saving the user' });
        });
});


router.get('/indices', async (req, res) => {
    try{
        const symbols = ['QQQ', 'SPY', 'DIA', 'IWM']
        const data = await StockPriceData.find({symbol: { $in: symbols}})

        res.json(data)

    }catch (error){
        console.error("Error fetching price data", error)
        res.status(500).json({ error: 'Server error' })
    }

})


router.get('/watchlist', (req, res) => {

    try {
        const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header

        // Verify the JWT token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }


            const { username } = decodedToken.UserInfo;

            // Retrieve user's watchlist from the database
            const user = await User.findOne({ username });


            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Return the watchlist as the response

            res.status(200).json({ watchlist: user.watchlist });

        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }


});


module.exports = router;