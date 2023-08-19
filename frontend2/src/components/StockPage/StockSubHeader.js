import React from 'react';
import {formatNumber} from "./StockStatistics";
import websites from "../../text/stocks_websites";
import '../style/stock-page-subheader-style.css'

const StockSubHeader = ({ stockData }) => {

    const findWebsite = (ticker) => {
        for (let item of websites){
            if (item.ticker === ticker){
                return item.website
            }
        }
    }

    const data = stockData.summary

    return (

        <div className="container-grid grid-cols-3 gap-4 rounded-3xl mx-10 my-4 p-2 text-white bg-black-steel ">

            <div className="col-span-1 flex justify-start items-center p-2">
                <img src={`https://logo.clearbit.com/${findWebsite(data.Symbol)}?size=145`} className="rounded-xl" alt="logo" />
            </div>

            <div className="col-span-1 mt-2">
                <h1 className="text-3xl mb-2"> <span className="flex justify-center">{data.Name} ({data.Symbol})</span></h1>
                <hr />
                <h4 className="flex mt-2 flex-wrap"><span className="font-semibold">Sector:</span> <span className="ml-auto">{data.Sector.charAt(0).toUpperCase() + data.Sector.slice(1).toLowerCase()}</span> </h4>
                <h4 className="flex flex-wrap mt-1"><span className="font-semibold">Industry:</span> <span className="ml-auto">{data.Industry.charAt(0).toUpperCase() + data.Industry.slice(1).toLowerCase()}</span></h4>
                <h4 className="flex flex-wrap mt-1"><span className="font-semibold">Market Capitalization:</span><span className="ml-auto">${formatNumber(data.MarketCapitalization * (10**-9)) } B</span></h4>
            </div>

            <div className="col-span-1">

            </div>

        </div>
    );
};


export default StockSubHeader;