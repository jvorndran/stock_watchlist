const mongoose = require('mongoose')
const connectDB = require('../config/dbConn')

const StockPriceDataSchema = new mongoose.Schema ({
    symbol: {type: String, required: true},
    dates: [{type: Date, required: true}],
    opens: [{type: Number, required: true}],
    highs: [{type: Number, required: true}],
    lows: [{type: Number, required: true}],
    closes: [{type: Number, required: true}],
    volumes: [{type: Number, required: true}]
})

module.exports = mongoose.model('StockPriceData', StockPriceDataSchema)