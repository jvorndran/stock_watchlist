const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    watchlist:{
        type: [String],
        default: []
    },
    watchlistNotes: {
        type: [{
            ticker: { type: String, required: true },
            note: { type: String, required: true, maxlength: 500 },
            updatedAt: { type: Date, default: Date.now }
        }],
        default: []
    }
});

module.exports = mongoose.model('User', userSchema);
