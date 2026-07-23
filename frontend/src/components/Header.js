import React from "react";
import {Link} from "react-router-dom";
import SearchBox from "./SearchBox";
import './style/header-style.css'
import nyse_stocks from "../text/nyse_stocks";
import MarketStatus from "./Dashboard/MarketStatus";
import "../index.css"

const Header = () => {

    return (
        <nav className="bg-black-steel">
            <div className=" py-3 flex header-container items-center flex-wrap gap-4">
                <MarketStatus/>

                <Link className="header-compare-link" to="/dash/compare">Compare Stocks</Link>

                <SearchBox suggestions={nyse_stocks}/>
            </div>
        </nav>
    )
}

export default Header
