const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')
const StockPriceData = require('./models/StockPriceData')
require('dotenv').config()
const yahooFinance = require('yahoo-finance2').default;

connectDB()

async function fetchPriceData(symbols) {

    for (const symbol of symbols){
        try{

            const today = new Date().toISOString().split('T')[0];

            const queryOptions = { period1: '2022-01-01', period2: today };

            const data = await yahooFinance.historical(symbol, queryOptions)

            stockPriceData = [];

            for (const entry of data){
                const { date: entryDate, open, high, low, close, volume } = entry;

                stockPriceData.push({
                    date: entryDate,
                    open: open,
                    high: high,
                    low: low,
                    close: close,
                    volume: volume
                });

            }

            await StockPriceData.create({
                symbol,
                dates: stockPriceData.map((item)=> item.date),
                opens: stockPriceData.map((item)=> item.open),
                highs: stockPriceData.map((item)=> item.high),
                lows: stockPriceData.map((item)=> item.low),
                closes: stockPriceData.map((item)=> item.close),
                volumes: stockPriceData.map((item)=> item.volume)
            })
            console.log(`Stock price data for ${symbol} saved`)

        } catch (e){
            console.error(e)
        }
    }
}

const symbols = ['QQQ', 'SPY', 'DIA', 'IWM']

fetchPriceData(symbols).then(() =>{
    mongoose.connection.close()
})



