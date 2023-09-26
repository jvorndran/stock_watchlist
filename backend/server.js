require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3500;
console.log(process.env.NODE_ENV);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

connectDB();

app.use(express.json());

//where to find static files
app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'));

app.use('/users', require('./routes/userRoutes'));

app.use('/dash', require('./routes/dashRoute'));

app.use('/auth', require('./routes/authRoutes'));

app.use('/api', require('./routes/apiRoutes'))


app.post('/watchlist', asyncHandler(async (req, res) => {

        const { stockTicker } = req.body;

        const token = req.headers.authorization?.split(' ')[1]; // Extract the JWT from the Authorization header

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            const { username } = decodedToken.UserInfo;

            // Add the stock ticker to the user's watchlist in the database using their username

            await User.findOneAndUpdate(
                { username },
                { $addToSet: { watchlist: stockTicker } },
                { upsert: true }
            )

            res.status(200).json({ message: 'Stock added to watchlist' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    })
);



// Handles 404s
app.all('*', (req, res) =>{
    res.status(404);
    if (req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')){
        res.json({message: '404 Not Found'});
    } else {
        res.type('txt').send('404 Not Found');
    }
});




mongoose.connection.once('open', () =>{
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});


mongoose.connection.on('error', err => {
   console.log(err);
});






