import React from 'react';
import {formatNumber} from "./StockStatistics";
import websites from "../../text/stocks_websites";

const StockSubHeader = ({ stockData }) => {
    // Access the stock data and display relevant information

    const findWebsite = (ticker) => {
        for (let item of websites){
            if (item.ticker === ticker){
                return item.website
            }
        }
    }

    const data = stockData.summary

    return (

        <div className="grid-cols-3 gap-4 rounded-3xl mx-10 my-4 p-2 text-white bg-black-steel" style={container}>

            <div className="col-span-1 flex justify-start items-center p-2">
                <img src={`https://logo.clearbit.com/${findWebsite(data.Symbol)}?size=145`} className="rounded-xl" alt="logo" />
            </div>

            <div className="col-span-1">
                <h1 className="text-3xl"> <span className="flex justify-center">{data.Name} ({data.Symbol})</span></h1>
                <hr />
                <br />
                <h4 className="flex">Sector <span className="ml-auto">{data.Sector.charAt(0).toUpperCase() + data.Sector.slice(1).toLowerCase()}</span> </h4>
                <h4 className="flex flex-wrap">Industry <span className="ml-auto">{data.Industry.charAt(0).toUpperCase() + data.Industry.slice(1).toLowerCase()}</span></h4>
                <h4 className="flex">Market Capitalization <span className="ml-auto">${formatNumber(data.MarketCapitalization * (10**-9)) } B</span></h4>
            </div>

            <div className="col-span-1">

            </div>

        </div>
    );
};

const container = {
    display: "grid",
}

export default StockSubHeader;