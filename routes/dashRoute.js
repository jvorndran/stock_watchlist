const express = require('express');
const router = express.Router();
const path = require('path');
const request = require("request");
const axios = require('axios');


const alpha_api_key = process.env.ALPHA_API_KEY;

// route regex for '/' or '/index' or '/index.html'
router.get('/', (req, res) => {
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${alpha_api_key}`;


    request.get(
        {
            url: url,
            json: true,
            headers: { 'User-Agent': 'request' }
        },
        (err, response, data) => {
            if (err) {
                console.log('Error:', err);
                res.status(500).json({ error: 'An error occurred while fetching the data' });
            } else if (response.statusCode !== 200) {
                console.log('Status:', response.statusCode);
                res.status(response.statusCode).json({ error: 'An error occurred while fetching the data' });
            } else {
                // data is successfully parsed as a JSON object:


                console.log(data)
                res.send(data);
            }
        }
    );

    //res.send(data)
});



router.get('/:stock_ticker', async (req, res) => {

    const stockTicker = req.params.stock_ticker;

    console.log(stockTicker)

    const urlNews = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${stockTicker}&apikey=${alpha_api_key}`;

    const urlSummary = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockTicker}&apikey=${alpha_api_key}`;

    console.log(urlNews)
    console.log(urlSummary)

    try {
        const [newsResponse, summaryResponse] = await Promise.all([
            axios.get(urlNews),
            axios.get(urlSummary),
        ]);

        const news = newsResponse.data;
        const summary = summaryResponse.data;
        console.log(news)

        console.log(summary)

        res.send({ summary, news });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching stock data' });
    }
});


module.exports = router;