const express = require('express');
const router = express.Router();
const request = require("request");
const alpha_api_key = process.env.ALPHA_API_KEY;

const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${alpha_api_key}`;


// route regex for '/' or '/index' or '/index.html'
router.get('^/$|/index(.html)?/', (req, res) => {

    request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request'}
    }, (err, res) => {
        if (err) {
            console.log('Error:', err);
        } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
        } else {

        }
    });
    res.send(data);


});

module.exports = router;

