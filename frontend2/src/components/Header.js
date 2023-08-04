import React from "react";
import SearchBox from "./SearchBox";
import nas_stocks from '../text/nas_stocks'
import nyse_stocks from "../text/nyse_stocks";
import MarketStatus from "./MarketStatus";
import "../index.css"

const Header = () => {

    return (

        <nav className="bg-black-steel">
            <div className="py-4 flex justify-between items-center">

                <MarketStatus />

                <div className="flex space-x-10">
                    <div className="flex items-center space-x-2">

                    </div>
                </div>

                <SearchBox style={searchStyle} suggestions={nyse_stocks}/>

            </div>
        </nav>

    )
}


const searchStyle = {
    width: '10vw',
    padding: '1vw',
};

export default Header
