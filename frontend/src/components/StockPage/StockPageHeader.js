import React from "react";
import SearchBox from "../SearchBox";
import AddToWatchlist from "./AddToWatchlist";
import '../../index.css';
import nyse_stocks from "../../text/nyse_stocks";

const StockPageHeader = ({ stockData }) => {


    return (
        <nav className="bg-black-steel bg-gradient-to-b">
            <div className="py-4 flex justify-between items-center flex-wrap gap-4">

                <AddToWatchlist stockTicker={stockData.summary.Symbol}/>


                <SearchBox style={searchStyle} suggestions={nyse_stocks}/>

            </div>
        </nav>
    )
}


const searchStyle = {
    width: '200px',
    padding: '5px',
};

export default StockPageHeader
